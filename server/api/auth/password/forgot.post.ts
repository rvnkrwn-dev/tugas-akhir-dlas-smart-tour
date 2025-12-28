import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
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
import { sendPasswordResetEmail } from "~~/server/services/emailService";
import { rateLimit, RateLimitPresets } from "~~/server/utils/rateLimit";
import { logAuth, logError } from "~~/server/utils/logger";

// Zod Schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim(),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting: 3 attempts per hour
  await rateLimit(RateLimitPresets.AUTH_PASSWORD_RESET)(event);

  let body: any;
  try {
    // Parse and validate request body
    body = await readBody(event);
    const validation = forgotPasswordSchema.safeParse(body);

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

    const { email } = validation.data;

    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        user_profiles: {
          select: {
            firstName: true,
          },
        },
      },
    });

    // Don't reveal if user exists or not for security
    // Always return success message
    if (!user) {
      return successResponse(
        null,
        "If the email exists in our system, a password reset link will be sent",
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return successResponse(
        null,
        "If the email exists in our system, a password reset link will be sent",
      );
    }

    // Check for recent password reset requests (rate limiting)
    const recentReset = await prisma.password_resets.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (recentReset) {
      throw createError({
        statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
        statusMessage: "Too many requests",
        data: errorResponse(
          "Please wait a few minutes before requesting another password reset",
          ERROR_CODES.TOO_MANY_REQUESTS,
        ),
      });
    }

    // Generate password reset token
    const resetToken = generateRandomToken();
    const tokenExpiry = generateTokenExpiry(60); // 1 hour

    // Create password reset record
    await prisma.password_resets.create({
      data: {
        email,
        token: resetToken,
        userId: user.id,
        expiresAt: tokenExpiry,
      },
    });

    // Send password reset email
    const userName = user.user_profiles?.firstName ?? user.email.split("@")[0];
    const emailSent = await sendPasswordResetEmail(
      user.email,
      userName ?? "",
      resetToken,
    );

    if (!emailSent) {
      console.error("Failed to send password reset email to:", user.email);
      throw createError({
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        statusMessage: "Email sending failed",
        data: errorResponse(
          "Failed to send password reset email. Please try again later",
          ERROR_CODES.EXTERNAL_API_ERROR,
        ),
      });
    }

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "PASSWORD_RESET_REQUESTED",
        entityType: "USER",
        entityId: user.id,
        description: "User requested password reset",
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    // Log auth event
    logAuth({
      action: 'password_reset',
      userId: user.id,
      email: user.email,
      success: true,
      ip: getHeader(event, "x-forwarded-for") || getHeader(event, "x-real-ip") || "0.0.0.0",
      userAgent: getHeader(event, "user-agent") || undefined,
    });

    return successResponse(
      null,
      "If the email exists in our system, a password reset link will be sent",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'auth/forgot-password',
      email: body?.email,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while processing password reset request",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
