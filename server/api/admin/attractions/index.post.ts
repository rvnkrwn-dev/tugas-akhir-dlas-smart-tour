/**
 * POST /api/admin/attractions
 * Create new attraction
 * Admin only endpoint - requires ADMIN or SUPER_ADMIN role
 *
 * Accepts multipart/form-data with:
 * - Text fields: name, description, adultPrice, etc.
 * - File fields: image (single main image), images (multiple gallery images)
 */

import { z } from "zod";
import { getHeader, readMultipartFormData, readBody } from "h3";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { prisma } from "~~/server/lib/prisma";
import { generateSlug } from "~~/server/utils/slug";
import { sanitizeAttractionForResponse } from "~~/server/utils/attraction";
import {
  uploadImageFromBuffer,
  uploadMultipleImagesFromBuffers,
  isCloudinaryConfigured,
} from "~~/server/services/cloudinaryService";
import { logInfo } from "~~/server/utils/logger";
import { defineAdminHandler } from "~~/server/utils/handler";

// Zod Schema for validation
const timeSlotSchema = z.object({
  open: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, "Invalid time format (HH:mm)"),
  close: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, "Invalid time format (HH:mm)"),
  isClosed: z.boolean().optional(),
  breaks: z
    .array(
      z.object({
        start: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/),
        end: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/),
      }),
    )
    .optional(),
});

const operatingHoursSchema = z
  .object({
    monday: timeSlotSchema.optional(),
    tuesday: timeSlotSchema.optional(),
    wednesday: timeSlotSchema.optional(),
    thursday: timeSlotSchema.optional(),
    friday: timeSlotSchema.optional(),
    saturday: timeSlotSchema.optional(),
    sunday: timeSlotSchema.optional(),
    holidays: timeSlotSchema.optional(),
    specialDates: z.record(z.string(), timeSlotSchema).optional(),
  })
  .optional();

// Schema for form data (all fields are strings from multipart)
const createAttractionSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must not exceed 255 characters")
    .trim(),
  description: z.string().max(5000, "Description too long").optional(),
  shortDescription: z
    .string()
    .max(500, "Short description must not exceed 500 characters")
    .optional(),
  type: z.string().max(100, "Type must not exceed 100 characters").optional(),
  adultPrice: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, "Adult price must be positive"),
  childPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : null))
    .refine(
      (val) => val === null || (!isNaN(val) && val >= 0),
      "Child price must be non-negative",
    ),
  currency: z.string().length(3).default("IDR"),
  operatingHours: z.string().optional(), // JSON string
  capacity: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : null)),
  durationMinutes: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : null)),
  minAge: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : null)),
  maxAge: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : null)),
  isActive: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val === "true" || val === "1"),
  priority: z
    .string()
    .optional()
    .default("0")
    .transform((val) => (val ? parseInt(val, 10) : 0)),
});

export default defineAdminHandler(async (event, currentUser) => {
  // Check content type
  const contentType = getHeader(event, "content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");
  const isJson = contentType.includes("application/json");

  let data: any;
  let imageFile: Buffer | undefined;
  const imageFiles: Buffer[] = [];

  if (isMultipart) {
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

    // Separate files from text fields
    const textFields: Record<string, string> = {};

    for (const part of formData) {
      if (part.name === "image" && part.data && part.filename) {
        // Main image
        imageFile = part.data;
      } else if (part.name === "images" && part.data && part.filename) {
        // Gallery images
        imageFiles.push(part.data);
      } else if (part.data && !part.filename) {
        // Text field
        textFields[part.name || ""] = part.data.toString("utf-8");
      }
    }

    // Validate text fields
    const validation = createAttractionSchema.safeParse(textFields);

    if (!validation.success) {
      const errors = validation.error.issues.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Validation Error",
        data: errorResponse(
          "Invalid attraction data",
          ERROR_CODES.VALIDATION_ERROR,
          { errors },
        ),
      });
    }

    data = validation.data;
  } else if (isJson) {
    // Parse JSON body
    const body = await readBody(event);

    // Create a simpler schema for JSON input
    const jsonSchema = z.object({
      name: z.string().min(3).max(255).trim(),
      slug: z.string().optional(),
      description: z.string().max(5000).optional().nullable(),
      shortDescription: z.string().max(500).optional().nullable(),
      type: z.string().max(100).optional().nullable(),
      adultPrice: z.number().positive(),
      childPrice: z.number().nonnegative().optional().nullable(),
      currency: z.string().length(3).default("IDR"),
      imageUrl: z.string().url().optional().nullable(),
      imageUrls: z.array(z.string().url()).optional().nullable(),
      operatingHours: z.any().optional().nullable(), // Will be validated separately if needed
      capacity: z.number().int().nonnegative().optional().nullable(),
      durationMinutes: z.number().int().nonnegative().optional().nullable(),
      minAge: z.number().int().nonnegative().optional().nullable(),
      maxAge: z.number().int().nonnegative().optional().nullable(),
      isActive: z.boolean().default(true),
      priority: z.number().int().default(0),
    });

    const validation = jsonSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Validation Error",
        data: errorResponse(
          "Invalid attraction data",
          ERROR_CODES.VALIDATION_ERROR,
          { errors },
        ),
      });
    }

    data = validation.data;
  } else {
    throw createError({
      statusCode: HTTP_STATUS.BAD_REQUEST,
      statusMessage: "Bad Request",
      data: errorResponse(
        "Content-Type must be application/json or multipart/form-data",
        ERROR_CODES.VALIDATION_ERROR,
      ),
    });
  }

  // Generate slug from name
  let slug = data.slug || generateSlug(data.name);

  // Check if slug already exists
  const existingAttraction = await prisma.attractions.findUnique({
    where: { slug },
  });

  // If slug exists, append timestamp to make it unique
  if (existingAttraction) {
    const timestamp = Date.now();
    slug = `${slug}-${timestamp}`;

    logInfo("Slug already exists, appended timestamp", {
      originalSlug: data.slug || generateSlug(data.name),
      newSlug: slug,
      timestamp,
    });
  }

  // Parse operating hours if provided (for multipart, it's a string)
  let operatingHours = null;
  if (data.operatingHours) {
    if (typeof data.operatingHours === "string") {
      try {
        operatingHours = JSON.parse(data.operatingHours);
      } catch (error: any) {
        throw createError({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          statusMessage: "Invalid Operating Hours",
          data: errorResponse(
            `Failed to parse operating hours: ${error.message}`,
            ERROR_CODES.VALIDATION_ERROR,
          ),
        });
      }
    } else {
      operatingHours = data.operatingHours;
    }
  }

  // Handle images
  let imageUrl: string | null = null;
  let imageUrls: string[] | null = null;

  // If JSON data includes imageUrl, use it directly
  if (isJson && data.imageUrl) {
    imageUrl = data.imageUrl;
  }

  // If JSON data includes imageUrls array, use it directly
  if (isJson && data.imageUrls) {
    imageUrls = data.imageUrls;
  }

  // Upload images if files provided (multipart only)
  if (imageFile || imageFiles.length > 0) {
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

    // Upload main image
    if (imageFile) {
      try {
        const result = await uploadImageFromBuffer(imageFile, {
          folder: "dlas-smart-tour/attractions",
          tags: ["attraction", "main"],
        });
        imageUrl = result.secureUrl;
      } catch (error: any) {
        console.error("Failed to upload main image:", error);
        throw createError({
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          statusMessage: "Upload Failed",
          data: errorResponse(
            `Failed to upload main image: ${error.message}`,
            ERROR_CODES.INTERNAL_ERROR,
          ),
        });
      }
    }

    // Upload gallery images
    if (imageFiles.length > 0) {
      try {
        const results = await uploadMultipleImagesFromBuffers(imageFiles, {
          folder: "dlas-smart-tour/attractions",
          tags: ["attraction", "gallery"],
        });
        imageUrls = results.map((r) => r.secureUrl);
      } catch (error: any) {
        console.error("Failed to upload gallery images:", error);
        throw createError({
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          statusMessage: "Upload Failed",
          data: errorResponse(
            `Failed to upload gallery images: ${error.message}`,
            ERROR_CODES.INTERNAL_ERROR,
          ),
        });
      }
    }
  }

  // Create attraction in database
  const attraction = await prisma.attractions.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      shortDescription: data.shortDescription || null,
      type: data.type || null,
      adultPrice: data.adultPrice,
      childPrice: data.childPrice ?? null,
      currency: data.currency,
      imageUrl: imageUrl,
      imageUrls: imageUrls ? (imageUrls as any) : null,
      operatingHours: operatingHours,
      capacity: data.capacity ?? null,
      durationMinutes: data.durationMinutes ?? null,
      minAge: data.minAge ?? null,
      maxAge: data.maxAge ?? null,
      isActive: data.isActive,
      priority: data.priority,
    },
  });
  // Log activity
  await prisma.activity_logs.create({
    data: {
      userId: currentUser.userId,
      userRole: currentUser.role,
      action: "CREATE_ATTRACTION",
      entityType: "ATTRACTION",
      entityId: attraction.id,
      description: `Created attraction: ${attraction.name}`,
      metadata: {
        attractionId: attraction.id,
        attractionName: attraction.name,
        type: attraction.type,
        price: attraction.adultPrice,
        hasMainImage: !!imageUrl,
        galleryImagesCount: imageUrls?.length || 0,
      },
      ipAddress:
        getHeader(event, "x-forwarded-for") ||
        getHeader(event, "x-real-ip") ||
        "0.0.0.0",
      userAgent: getHeader(event, "user-agent") || null,
    },
  });

  // Sanitize and return response
  const sanitizedAttraction = sanitizeAttractionForResponse(attraction);

  return successResponse(
    sanitizedAttraction,
    "Attraction created successfully",
  );
});
