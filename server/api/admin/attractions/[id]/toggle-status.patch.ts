/**
 * PATCH /api/admin/attractions/:id/toggle-status
 * Toggle attraction active status
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
import { sanitizeAttractionForResponse } from "~~/server/utils/attraction";

// Zod Schema
const paramsSchema = z.object({
  id: z.string().uuid("Invalid attraction ID format"),
});

const toggleStatusSchema = z.object({
  isActive: z.boolean(),
});

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Check authentication and admin role
    const currentUser = requireAdmin(event);

    // Get and validate attraction ID from params
    const params = event.context.params;
    const paramsValidation = paramsSchema.safeParse(params);

    if (!paramsValidation.success) {
      const errors = paramsValidation.error.issues.map((err: any) => ({
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

    const { id } = paramsValidation.data;

    // Parse and validate request body
    const body = await readBody(event);
    const validation = toggleStatusSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Validation Error",
        data: errorResponse(
          "Invalid request data",
          ERROR_CODES.VALIDATION_ERROR,
          { errors },
        ),
      });
    }

    const { isActive } = validation.data;

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

    // Check if status is already the same
    if (existingAttraction.isActive === isActive) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "No Change",
        data: errorResponse(
          `Attraction is already ${isActive ? "active" : "inactive"}`,
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    // Update attraction status
    const updatedAttraction = await prisma.attractions.update({
      where: { id },
      data: { isActive },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: isActive ? "ACTIVATE_ATTRACTION" : "DEACTIVATE_ATTRACTION",
        entityType: "ATTRACTION",
        entityId: updatedAttraction.id,
        description: `${isActive ? "Activated" : "Deactivated"} attraction: ${updatedAttraction.name}`,
        metadata: {
          attractionId: updatedAttraction.id,
          attractionName: updatedAttraction.name,
          previousStatus: existingAttraction.isActive,
          newStatus: isActive,
        },
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    // Sanitize and return response
    const sanitizedAttraction =
      sanitizeAttractionForResponse(updatedAttraction);

    return successResponse(
      sanitizedAttraction,
      `Attraction ${isActive ? "activated" : "deactivated"} successfully`,
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Toggle attraction status error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "Failed to toggle attraction status",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
