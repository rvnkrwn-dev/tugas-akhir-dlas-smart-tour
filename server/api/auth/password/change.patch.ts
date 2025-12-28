import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireUser } from "~~/server/utils/auth";
import { comparePassword, hashPassword } from "~~/server/utils/password";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { deleteCache, CacheKeys } from "~~/server/utils/cache";

// Zod Schema
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
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
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Require authenticated user
    const currentUser = requireUser(event);

    // Parse and validate request body
    const body = await readBody(event);
    const validation = changePasswordSchema.safeParse(body);

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

    const { currentPassword, newPassword } = validation.data;

    // Get user with password
    const user = await prisma.users.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        password: true,
        role: true,
      },
    });

    if (!user || !user.password) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "User not found",
        data: errorResponse("User not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw createError({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        statusMessage: "Invalid password",
        data: errorResponse(
          "Current password is incorrect",
          ERROR_CODES.INVALID_CREDENTIALS,
        ),
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.users.update({
      where: { id: currentUser.userId },
      data: { password: hashedPassword },
    });

    // Invalidate all refresh tokens (force re-login on all devices)
    await prisma.refresh_tokens.deleteMany({
      where: { userId: currentUser.userId },
    });

    // Invalidate user cache to ensure fresh data in auth middleware
    await deleteCache(CacheKeys.userById(currentUser.userId));

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "PASSWORD_CHANGED",
        entityType: "USER",
        entityId: currentUser.userId,
        description: "User changed password",
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    return successResponse(
      null,
      "Password changed successfully. Please log in again",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Change password error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while changing password",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
