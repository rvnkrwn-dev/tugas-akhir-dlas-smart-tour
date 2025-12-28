import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { logAuth, logError } from "~~/server/utils/logger";
import { sendWelcomeEmail } from "~~/server/services/emailService";

// Zod Schema
const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export default defineEventHandler(async (event: H3Event) => {
  let query: any;
  try {
    // Parse and validate query parameters
    query = getQuery(event);
    const validation = verifyEmailSchema.safeParse(query);

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

    const { token } = validation.data;

    // Find email verification record
    const verification = await prisma.email_verifications.findFirst({
      where: {
        token,
        verifiedAt: null, // Not yet verified
      },
      include: {
        users: {
          include: {
            user_profiles: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Check if verification record exists
    if (!verification) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Invalid token",
        data: errorResponse(
          "Invalid or already used verification token",
          ERROR_CODES.TOKEN_INVALID,
        ),
      });
    }

    // Check if token is expired
    if (new Date() > verification.expiresAt) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Token expired",
        data: errorResponse(
          "Verification token has expired. Please request a new one",
          ERROR_CODES.TOKEN_EXPIRED,
        ),
      });
    }

    // Update user email verification status
    const user = await prisma.users.update({
      where: { id: verification.userId },
      data: { isEmailVerified: true },
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
            avatarUrl: true,
          },
        },
      },
    });

    // Mark verification as used
    await prisma.email_verifications.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });

    // Send welcome email
    const userName =
      verification.users.user_profiles?.firstName ??
      verification.users.email.split("@")[0];
    await sendWelcomeEmail(verification.users.email, userName ?? "");

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "EMAIL_VERIFIED",
        entityType: "USER",
        entityId: user.id,
        description: "User email verified successfully",
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    // Log auth event
    logAuth({
      action: 'email_verify',
      userId: verification.userId,
      email: verification.users.email,
      success: true,
      ip: getHeader(event, "x-forwarded-for") || getHeader(event, "x-real-ip") || "0.0.0.0",
      userAgent: getHeader(event, "user-agent") || undefined,
    });

    return successResponse(
      null,
      "Email verified successfully. You can now log in to your account",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'auth/verify-email',
      token: query?.token,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred during email verification",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
