import { z } from "zod";
import { H3Event } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { comparePassword } from "~~/server/utils/password";
import { generateAccessToken, generateRefreshToken } from "~~/server/utils/jwt";
import { generateTokenExpiry } from "~~/server/utils/token";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { rateLimit, RateLimitPresets } from "~~/server/utils/rateLimit";
import { logAuth, logError } from "~~/server/utils/logger";
import { DUMMY_PASSWORD_HASH } from "~~/server/utils/security";

// Zod Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting: 5 attempts per 15 minutes
  await rateLimit(RateLimitPresets.AUTH_LOGIN)(event);

  let body: any

  try {
    // Parse and validate request body
    body = await readBody(event);
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Validation Error",
        data: errorResponse("Validation failed", ERROR_CODES.VALIDATION_ERROR, {
          errors,
        }),
      });
    }

    const { email, password } = validation.data;

    // Find user with profile
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        user_profiles: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            dateOfBirth: true,
            gender: true,
            address: true,
            city: true,
            country: true,
            postalCode: true,
          },
        },
      },
    });

    // Always perform password comparison to prevent timing attacks
    // Use dummy hash if user doesn't exist to maintain consistent timing
    const passwordToCompare = user?.password || DUMMY_PASSWORD_HASH;
    const isPasswordValid = await comparePassword(password, passwordToCompare);

    // Check if user exists and password is valid
    if (!user || !user.password || !isPasswordValid) {
      // Log failed login attempt
      logAuth({
        action: 'login',
        email,
        success: false,
        ip: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '0.0.0.0',
        userAgent: getHeader(event, 'user-agent') || undefined,
        error: 'Invalid credentials',
      })

      throw createError({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        statusMessage: "Invalid credentials",
        data: errorResponse(
          "Invalid email or password",
          ERROR_CODES.INVALID_CREDENTIALS,
        ),
      });
    }

    // Check if account is active
    if (!user.isActive) {
      // Log inactive account attempt
      logAuth({
        action: 'login',
        userId: user.id,
        email,
        success: false,
        ip: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '0.0.0.0',
        userAgent: getHeader(event, 'user-agent') || undefined,
        error: 'Account inactive',
      })

      throw createError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        statusMessage: "Account inactive",
        data: errorResponse(
          "Your account has been deactivated",
          ERROR_CODES.ACCOUNT_INACTIVE,
        ),
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Log unverified email attempt
      logAuth({
        action: 'login',
        userId: user.id,
        email,
        success: false,
        ip: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '0.0.0.0',
        userAgent: getHeader(event, 'user-agent') || undefined,
        error: 'Email not verified',
      })

      throw createError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        statusMessage: "Email not verified",
        data: errorResponse(
          "Please verify your email before logging in",
          ERROR_CODES.EMAIL_NOT_VERIFIED,
        ),
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in database
    const refreshTokenExpiry = generateTokenExpiry(7 * 24 * 60); // 7 days
    await prisma.refresh_tokens.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    setCookie(event, "refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: refreshTokenExpiry.getTime() - Date.now(),
      path: "/",
    });

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "USER_LOGIN",
        entityType: "USER",
        entityId: user.id,
        description: "User logged in successfully",
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Log successful login
    logAuth({
      action: 'login',
      userId: user.id,
      email: user.email,
      success: true,
      ip: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '0.0.0.0',
      userAgent: getHeader(event, 'user-agent') || undefined,
    })

    return successResponse(
      {
        user: userWithoutPassword,
        accessToken,
      },
      "Login successful",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      action: 'login',
      email: body?.email,
    })

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred during login",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
