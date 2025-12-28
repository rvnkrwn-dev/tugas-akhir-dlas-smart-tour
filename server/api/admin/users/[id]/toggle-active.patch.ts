import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireAdmin } from "~~/server/utils/auth";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { rateLimit, RateLimitPresets } from "~~/server/utils/rateLimit";
import { logError } from "~~/server/utils/logger";

// Zod Schema for path params
const paramsSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require admin role
    const currentUser = requireAdmin(event);

    // Parse and validate path params
    const params = event.context.params;
    const validation = paramsSchema.safeParse(params);

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

    const { id } = validation.data;

    // Prevent self-toggle
    if (id === currentUser.userId) {
      throw createError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        statusMessage: "Forbidden",
        data: errorResponse(
          "You cannot toggle your own account status",
          ERROR_CODES.FORBIDDEN,
        ),
      });
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!existingUser) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "User not found",
        data: errorResponse("User not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Prevent super admin from being modified by regular admin
    if (
      existingUser.role === "SUPER_ADMIN" &&
      currentUser.role !== "SUPER_ADMIN"
    ) {
      throw createError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        statusMessage: "Forbidden",
        data: errorResponse(
          "You cannot modify a Super Admin account",
          ERROR_CODES.FORBIDDEN,
        ),
      });
    }

    // Toggle isActive status
    const newActiveStatus = !existingUser.isActive;

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        isActive: newActiveStatus,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        user_profiles: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            city: true,
            country: true,
          },
        },
      },
    });

    // If deactivating user, invalidate all refresh tokens
    if (!newActiveStatus) {
      await prisma.refresh_tokens.deleteMany({
        where: { userId: id },
      });
    }

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: newActiveStatus ? "ACTIVATE_USER" : "DEACTIVATE_USER",
        entityType: "USER",
        entityId: id,
        description: `User ${existingUser.email} ${newActiveStatus ? "activated" : "deactivated"}`,
        metadata: {
          previousStatus: existingUser.isActive,
          newStatus: newActiveStatus,
          targetUserEmail: existingUser.email,
          targetUserRole: existingUser.role,
        },
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    return successResponse(
      {
        user: updatedUser,
        previousStatus: existingUser.isActive,
        newStatus: newActiveStatus,
      },
      `User ${newActiveStatus ? "activated" : "deactivated"} successfully`,
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'admin/users/toggle-active',
      userId: (event.context as any).user?.userId,
      targetUserId: event.context.params?.id,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while toggling user status",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
