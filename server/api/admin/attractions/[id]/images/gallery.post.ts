/**
 * POST /api/admin/attractions/:id/images/gallery
 * Bulk upload gallery images (append to imageUrls array)
 * Admin only endpoint - requires ADMIN or SUPER_ADMIN role
 *
 * Accepts multipart/form-data with:
 * - File fields: images[] (multiple files, required)
 * - Maximum 10 images per request
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
  uploadMultipleImagesFromBuffers,
  isCloudinaryConfigured,
} from "~~/server/services/cloudinaryService";

// Zod Schema for validation
const paramsSchema = z.object({
  id: z.string().uuid("Invalid attraction ID format"),
});

// Constants
const MAX_IMAGES_PER_REQUEST = 10;
const MAX_GALLERY_SIZE = 20;

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

    // Extract image files
    const imageFiles: Buffer[] = [];

    for (const part of formData) {
      if (part.name === "images" && part.data && part.filename) {
        imageFiles.push(part.data);
      }
    }

    // Validate image files
    if (imageFiles.length === 0) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Bad Request",
        data: errorResponse(
          "No image files provided. Use field name 'images' for multiple files",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    if (imageFiles.length > MAX_IMAGES_PER_REQUEST) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Bad Request",
        data: errorResponse(
          `Maximum ${MAX_IMAGES_PER_REQUEST} images allowed per request`,
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    // Check existing gallery size
    const existingGallery = (attraction.imageUrls as string[]) || [];
    const newTotalSize = existingGallery.length + imageFiles.length;

    if (newTotalSize > MAX_GALLERY_SIZE) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Bad Request",
        data: errorResponse(
          `Gallery limit exceeded. Maximum ${MAX_GALLERY_SIZE} images allowed. Current: ${existingGallery.length}, Uploading: ${imageFiles.length}`,
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
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

    // Upload images to Cloudinary
    const uploadResults = await uploadMultipleImagesFromBuffers(imageFiles, {
      folder: "dlas-smart-tour/attractions",
      tags: ["attraction", "gallery"],
    });

    const newImageUrls = uploadResults.map((result) => result.secureUrl);

    // Combine with existing gallery
    const updatedGallery = [...existingGallery, ...newImageUrls];

    // Update database
    const updatedAttraction = await prisma.attractions.update({
      where: { id },
      data: { imageUrls: updatedGallery as any },
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
        action: "BULK_UPLOAD_GALLERY",
        entityType: "ATTRACTION",
        entityId: attraction.id,
        description: `Uploaded ${newImageUrls.length} gallery images for attraction: ${attraction.name}`,
        metadata: {
          attractionId: attraction.id,
          attractionName: attraction.name,
          uploadedCount: newImageUrls.length,
          newImageUrls,
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
        uploadedCount: newImageUrls.length,
        totalGalleryImages: updatedGallery.length,
      },
      `Successfully uploaded ${newImageUrls.length} gallery images`,
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Bulk upload gallery images error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal Server Error",
      data: errorResponse(
        error.message || "Failed to upload gallery images",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
