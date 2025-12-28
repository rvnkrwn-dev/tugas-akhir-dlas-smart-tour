import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { hashPassword } from "~~/server/utils/password";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { logAuth, logError } from "~~/server/utils/logger";
import { deleteCache, CacheKeys } from "~~/server/utils/cache";

// Zod Schema
const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(255, "Password must not exceed 255 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default defineEventHandler(async (event: H3Event) => {
  let body: any;
  try {
    // Parse and validate request body
    body = await readBody(event);
    const validation = resetPasswordSchema.safeParse(body);

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

    const { token, password } = validation.data;

    // Find password reset record
    const resetRecord = await prisma.password_resets.findFirst({
      where: {
        token,
        usedAt: null, // Not yet used
      },
      include: {
        users: true,
      },
    });

    // Check if reset record exists
    if (!resetRecord) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Invalid token",
        data: errorResponse(
          "Invalid or already used password reset token",
          ERROR_CODES.TOKEN_INVALID,
        ),
      });
    }

    // Check if token is expired
    if (new Date() > resetRecord.expiresAt) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Token expired",
        data: errorResponse(
          "Password reset token has expired. Please request a new one",
          ERROR_CODES.TOKEN_EXPIRED,
        ),
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await prisma.users.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });

    // Delete token (more secure than marking as used)
    await prisma.password_resets.delete({
      where: { id: resetRecord.id },
    });

    // Invalidate all refresh tokens for this user (force re-login)
    await prisma.refresh_tokens.deleteMany({
      where: { userId: resetRecord.userId },
    });

    // Invalidate user cache to ensure fresh data
    await deleteCache(CacheKeys.userById(resetRecord.userId));

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: resetRecord.userId,
        userRole: resetRecord.users.role,
        action: "PASSWORD_RESET_COMPLETED",
        entityType: "USER",
        entityId: resetRecord.userId,
        description: "User successfully reset password",
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
      userId: resetRecord.userId,
      email: resetRecord.email,
      success: true,
      ip: getHeader(event, "x-forwarded-for") || getHeader(event, "x-real-ip") || "0.0.0.0",
      userAgent: getHeader(event, "user-agent") || undefined,
    });

    return successResponse(
      null,
      "Password reset successfully. You can now log in with your new password",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'auth/reset-password',
      token: body?.token,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while resetting password",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
