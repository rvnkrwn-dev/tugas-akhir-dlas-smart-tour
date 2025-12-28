import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireUser } from "~~/server/utils/auth";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { logAuth, logError } from "~~/server/utils/logger";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Require authenticated user
    const currentUser = requireUser(event);

    // Get refresh token from cookie
    const refreshToken = getCookie(event, "refreshToken");

    // Delete all refresh tokens for this user (logout from all devices)
    await prisma.refresh_tokens.deleteMany({
      where: { userId: currentUser.userId },
    });

    // Clear refresh token cookie
    deleteCookie(event, "refreshToken");

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "USER_LOGOUT",
        entityType: "USER",
        entityId: currentUser.userId,
        description: "User logged out successfully",
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    // Log auth event
    logAuth({
      action: 'logout',
      userId: currentUser.userId,
      email: currentUser.email,
      success: true,
      ip: getHeader(event, "x-forwarded-for") || getHeader(event, "x-real-ip") || "0.0.0.0",
      userAgent: getHeader(event, "user-agent") || undefined,
    });

    return successResponse(null, "Logged out successfully");
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'auth/logout',
      userId: (event.context as any).user?.userId,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred during logout",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
