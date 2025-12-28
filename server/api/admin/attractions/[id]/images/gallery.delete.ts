/**
 * DELETE /api/admin/attractions/:id/images/gallery
 * Delete specific gallery image by URL or index
 * Admin only endpoint - requires ADMIN or SUPER_ADMIN role
 *
 * Accepts JSON body with:
 * - imageUrl (string): URL of the image to delete (exact match)
 * - OR imageIndex (number): Index position in the imageUrls array (0-based)
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
  deleteImage,
  extractPublicId,
} from "~~/server/services/cloudinaryService";

// Zod Schema for validation
const paramsSchema = z.object({
  id: z.string().uuid("Invalid attraction ID format"),
});

const deleteImageSchema = z
  .object({
    imageUrl: z.string().url("Invalid image URL").optional(),
    imageIndex: z
      .number()
      .int()
      .min(0, "Index must be non-negative")
      .optional(),
  })
  .refine((data) => data.imageUrl || data.imageIndex !== undefined, {
    message: "Either imageUrl or imageIndex must be provided",
  })
  .refine((data) => !(data.imageUrl && data.imageIndex !== undefined), {
    message: "Provide only imageUrl OR imageIndex, not both",
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
        imageUrls: true,
      },
    });

    if (!attraction) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Not Found",
        data: errorResponse("Attraction not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Parse request body
    const body = await readBody(event);
    const validation = deleteImageSchema.safeParse(body);

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

    const { imageUrl, imageIndex } = validation.data;

    // Get existing gallery
    const existingGallery = (attraction.imageUrls as string[]) || [];

    if (existingGallery.length === 0) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Bad Request",
        data: errorResponse(
          "Attraction has no gallery images",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    let imageToDelete: string | null = null;
    let deletedIndex: number = -1;

    // Find image by URL
    if (imageUrl) {
      const index = existingGallery.findIndex((url) => url === imageUrl);
      if (index === -1) {
        throw createError({
          statusCode: HTTP_STATUS.NOT_FOUND,
          statusMessage: "Not Found",
          data: errorResponse(
            "Image URL not found in gallery",
            ERROR_CODES.NOT_FOUND,
          ),
        });
      }
      imageToDelete = existingGallery[index] ?? null;
      deletedIndex = index;
    }
    // Find image by index
    else if (imageIndex !== undefined) {
      if (imageIndex >= existingGallery.length) {
        throw createError({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          statusMessage: "Bad Request",
          data: errorResponse(
            `Invalid image index. Gallery has ${existingGallery.length} images (index 0-${existingGallery.length - 1})`,
            ERROR_CODES.VALIDATION_ERROR,
          ),
        });
      }
      imageToDelete = existingGallery[imageIndex] ?? null;
      deletedIndex = imageIndex;
    }

    if (!imageToDelete) {
      throw createError({
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        statusMessage: "Internal Server Error",
        data: errorResponse(
          "Failed to identify image to delete",
          ERROR_CODES.INTERNAL_ERROR,
        ),
      });
    }

    // Delete image from Cloudinary
    const publicId = extractPublicId(imageToDelete);
    if (publicId) {
      await deleteImage(publicId).catch((err) =>
        console.warn("Failed to delete image from Cloudinary:", err),
      );
    }

    // Remove from gallery array
    const updatedGallery = existingGallery.filter(
      (_, index) => index !== deletedIndex,
    );

    // Update database
    const updatedAttraction = await prisma.attractions.update({
      where: { id },
      data: {
        imageUrls: updatedGallery.length > 0 ? (updatedGallery as any) : null,
      },
      select: {
        id: true,
        name: true,
        imageUrls: true,
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "DELETE_GALLERY_IMAGE",
        entityType: "ATTRACTION",
        entityId: attraction.id,
        description: `Deleted gallery image at index ${deletedIndex} for attraction: ${attraction.name}`,
        metadata: {
          attractionId: attraction.id,
          attractionName: attraction.name,
          deletedImageUrl: imageToDelete,
          deletedIndex,
          previousGallerySize: existingGallery.length,
          newGallerySize: updatedGallery.length,
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
        attraction: updatedAttraction,
        deletedImageUrl: imageToDelete,
        deletedIndex,
        remainingImages: updatedGallery.length,
      },
      "Gallery image deleted successfully",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Delete gallery image error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal Server Error",
      data: errorResponse(
        error.message || "Failed to delete gallery image",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
