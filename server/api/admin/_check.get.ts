import { H3Event } from "h3";
import { requireAdmin } from "~~/server/utils/auth";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Require admin role (ADMIN or SUPER_ADMIN)
    const currentUser = requireAdmin(event);

    return successResponse(
      {
        isAdmin: true,
        user: {
          userId: currentUser.userId,
          email: currentUser.email,
          role: currentUser.role,
        },
      },
      "Admin access verified",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Admin check error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred during admin verification",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
