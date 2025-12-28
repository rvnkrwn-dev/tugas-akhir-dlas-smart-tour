import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { hashPassword } from "~~/server/utils/password";
import {
  generateRandomToken,
  generateTokenExpiry,
} from "~~/server/utils/token";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { sendVerificationEmail } from "~~/server/services/emailService";
import { rateLimit, RateLimitPresets } from "~~/server/utils/rateLimit";
import { passwordSchema, emailSchema, phoneSchema } from "~~/server/utils/validation";
import { logAuth, logError } from "~~/server/utils/logger";

// Zod Schema with enhanced validation
const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z
    .string()
    .max(100, "First name must not exceed 100 characters")
    .trim()
    .optional(),
  lastName: z
    .string()
    .max(100, "Last name must not exceed 100 characters")
    .trim()
    .optional(),
  phone: phoneSchema,
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting: 3 registrations per hour
  await rateLimit(RateLimitPresets.AUTH_REGISTER)(event);

  let body: any;
  try {
    // Parse and validate request body
    body = await readBody(event);
    const validation = registerSchema.safeParse(body);

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

    const { email, password, firstName, lastName, phone } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createError({
        statusCode: HTTP_STATUS.CONFLICT,
        statusMessage: "Email already registered",
        data: errorResponse(
          "Email already registered",
          ERROR_CODES.ALREADY_EXISTS,
        ),
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateRandomToken();
    const tokenExpiry = generateTokenExpiry(60); // 1 hour

    // Create user with profile and email verification token
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        role: "CUSTOMER",
        isActive: true,
        isEmailVerified: false,
        user_profiles: {
          create: {
            firstName: firstName || null,
            lastName: lastName || null,
            phone: phone || null,
          },
        },
        email_verifications: {
          create: {
            email,
            token: verificationToken,
            expiresAt: tokenExpiry,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        user_profiles: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Send verification email
    const userName = user.user_profiles?.firstName ?? user.email.split("@")[0];
    const emailSent = await sendVerificationEmail(
      user.email,
      userName ?? "",
      verificationToken,
    );

    if (!emailSent) {
      console.error("Failed to send verification email to:", user.email);
      // Don't throw error - user is created, they can resend verification later
    }

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "USER_REGISTERED",
        entityType: "USER",
        entityId: user.id,
        description: "User registered successfully",
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    // Log auth event
    logAuth({
      action: 'register',
      userId: user.id,
      email: user.email,
      success: true,
      ip: getHeader(event, "x-forwarded-for") || getHeader(event, "x-real-ip") || "0.0.0.0",
      userAgent: getHeader(event, "user-agent") || undefined,
    });

    return successResponse(
      {
        user,
        emailSent,
      },
      "Registration successful. Please check your email to verify your account.",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'auth/register',
      email: body?.email,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred during registration",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
