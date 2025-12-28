import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireUser } from "~~/server/utils/auth";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Require authenticated user
    const currentUser = requireUser(event);

    // Fetch full user data with profile
    const user = await prisma.users.findUnique({
      where: { id: currentUser.userId },
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
            dateOfBirth: true,
            gender: true,
            address: true,
            city: true,
            country: true,
            postalCode: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "User not found",
        data: errorResponse("User not found", ERROR_CODES.NOT_FOUND),
      });
    }

    return successResponse(user, "User data retrieved successfully");
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Get current user error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while retrieving user data",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
