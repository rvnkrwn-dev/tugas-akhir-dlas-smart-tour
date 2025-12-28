/**
 * PATCH /api/admin/attractions/:id/images/cover
 * Update/Replace cover image (imageUrl) for attraction
 * Admin only endpoint - requires ADMIN or SUPER_ADMIN role
 *
 * Accepts multipart/form-data with:
 * - File field: image (required, single file)
 * - OR text field: removeCover (boolean) to remove cover image
 */

import { z } from "zod";
import { H3Event } from "h3";
import { requireAdmin } from "~~/server/utils/auth";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { prisma } from "~~/server/lib/prisma";
import {
  uploadImageFromBuffer,
  deleteImage,
  extractPublicId,
  isCloudinaryConfigured,
} from "~~/server/services/cloudinaryService";

// Zod Schema for validation
const paramsSchema = z.object({
  id: z.string().uuid("Invalid attraction ID format"),
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

    // Check if attraction exists
    const attraction = await prisma.attractions.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    });

    if (!attraction) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Not Found",
        data: errorResponse("Attraction not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Parse multipart form data
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Bad Request",
        data: errorResponse(
          "No form data provided",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    // Parse form data
    let imageFile: Buffer | undefined;
    let removeCover = false;

    for (const part of formData) {
      if (part.name === "image" && part.data && part.filename) {
        imageFile = part.data;
      } else if (part.name === "removeCover" && part.data && !part.filename) {
        const value = part.data.toString("utf-8");
        removeCover = value === "true" || value === "1";
      }
    }

    // Check Cloudinary configuration
    if (!isCloudinaryConfigured()) {
      throw createError({
        statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
        statusMessage: "Service Unavailable",
        data: errorResponse(
          "Image upload service is not configured",
          ERROR_CODES.INTERNAL_ERROR,
        ),
      });
    }

    let newImageUrl: string | null = null;
    let action = "";

    // Handle remove cover
    if (removeCover) {
      if (!attraction.imageUrl) {
        throw createError({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          statusMessage: "Bad Request",
          data: errorResponse(
            "Attraction has no cover image to remove",
            ERROR_CODES.VALIDATION_ERROR,
          ),
        });
      }

      // Delete old cover image from Cloudinary
      const publicId = extractPublicId(attraction.imageUrl);
      if (publicId) {
        await deleteImage(publicId).catch((err) =>
          console.warn("Failed to delete old cover image:", err),
        );
      }

      newImageUrl = null;
      action = "removed";
    }
    // Handle upload new cover
    else if (imageFile) {
      // Delete old cover image if exists
      if (attraction.imageUrl) {
        const publicId = extractPublicId(attraction.imageUrl);
        if (publicId) {
          await deleteImage(publicId).catch((err) =>
            console.warn("Failed to delete old cover image:", err),
          );
        }
      }

      // Upload new cover image
      const uploadResult = await uploadImageFromBuffer(imageFile, {
        folder: "dlas-smart-tour/attractions",
        tags: ["attraction", "cover"],
      });

      newImageUrl = uploadResult.secureUrl;
      action = attraction.imageUrl ? "replaced" : "uploaded";
    } else {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Bad Request",
        data: errorResponse(
          "Either provide an image file or set removeCover to true",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    // Update database
    const updatedAttraction = await prisma.attractions.update({
      where: { id },
      data: { imageUrl: newImageUrl },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "UPDATE_ATTRACTION_COVER",
        entityType: "ATTRACTION",
        entityId: attraction.id,
        description: `${action === "removed" ? "Removed" : action === "replaced" ? "Replaced" : "Uploaded"} cover image for attraction: ${attraction.name}`,
        metadata: {
          attractionId: attraction.id,
          attractionName: attraction.name,
          action,
          oldImageUrl: attraction.imageUrl,
          newImageUrl,
        },
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    return successResponse(
      updatedAttraction,
      `Cover image ${action} successfully`,
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Update cover image error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal Server Error",
      data: errorResponse(
        error.message || "Failed to update cover image",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
