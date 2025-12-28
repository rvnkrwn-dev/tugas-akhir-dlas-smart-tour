/**
 * DELETE /api/admin/attractions/:id
 * Delete attraction (soft delete by setting isActive to false)
 * Admin only endpoint - requires ADMIN or SUPER_ADMIN role
 */

import { z } from "zod";
import { H3Event } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireAdmin } from "~~/server/utils/auth";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";

// Zod Schema
const paramsSchema = z.object({
  id: z.string().uuid("Invalid attraction ID format"),
});

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Check authentication and admin role
    const currentUser = requireAdmin(event);

    // Get and validate attraction ID from params
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
        data: errorResponse(
          "Invalid attraction ID",
          ERROR_CODES.VALIDATION_ERROR,
          { errors },
        ),
      });
    }

    const { id } = validation.data;

    // Check if attraction exists
    const existingAttraction = await prisma.attractions.findUnique({
      where: { id },
    });

    if (!existingAttraction) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Not Found",
        data: errorResponse("Attraction not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Check if attraction is already inactive
    if (!existingAttraction.isActive) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Already Inactive",
        data: errorResponse(
          "Attraction is already inactive",
          ERROR_CODES.ALREADY_EXISTS,
        ),
      });
    }

    // Soft delete by setting isActive to false
    const deletedAttraction = await prisma.attractions.update({
      where: { id },
      data: { isActive: false },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "DELETE_ATTRACTION",
        entityType: "ATTRACTION",
        entityId: deletedAttraction.id,
        description: `Deleted (deactivated) attraction: ${deletedAttraction.name}`,
        metadata: {
          attractionId: deletedAttraction.id,
          attractionName: deletedAttraction.name,
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
        id: deletedAttraction.id,
        name: deletedAttraction.name,
        isActive: deletedAttraction.isActive,
      },
      "Attraction deleted successfully",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Delete attraction error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "Failed to delete attraction",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
