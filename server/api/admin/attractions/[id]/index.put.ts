/**
 * PUT /api/admin/attractions/:id
 * Full replace attraction (all required fields must be provided)
 * Admin only endpoint - requires ADMIN or SUPER_ADMIN role
 *
 * Note: This endpoint handles text fields only. Image management should be done via:
 * - PATCH /api/admin/attractions/:id/images/cover - Update cover image (imageUrl)
 * - POST /api/admin/attractions/:id/images/gallery - Add gallery images (imageUrls)
 * - DELETE /api/admin/attractions/:id/images/gallery - Remove gallery images (imageUrls)
 *
 * PUT replaces the entire resource, so all required fields must be provided.
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
import { updateSlug } from "~~/server/utils/slug";
import { sanitizeAttractionForResponse } from "~~/server/utils/attraction";

// Zod Schema for validation
const paramsSchema = z.object({
  id: z.string().uuid("Invalid attraction ID format"),
});

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

// All REQUIRED fields for PUT (full replacement)
// Optional fields are explicitly marked as .optional() or .nullable()
const replaceAttractionSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must not exceed 255 characters")
    .trim(),
  description: z
    .string()
    .max(5000, "Description too long")
    .optional()
    .nullable(),
  shortDescription: z
    .string()
    .max(500, "Short description must not exceed 500 characters")
    .optional()
    .nullable(),
  type: z
    .string()
    .max(100, "Type must not exceed 100 characters")
    .optional()
    .nullable(),
  adultPrice: z.number().positive("Adult price must be a positive number"),
  childPrice: z
    .number()
    .nonnegative("Child price must be non-negative")
    .optional()
    .nullable(),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("IDR"),
  operatingHours: z.any().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  durationMinutes: z.number().int().positive().optional().nullable(),
  minAge: z.number().int().nonnegative().optional().nullable(),
  maxAge: z.number().int().nonnegative().optional().nullable(),
  isActive: z.boolean().default(true),
  priority: z.number().int().nonnegative().default(0),
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

    // Parse request body (JSON)
    const body = await readBody(event);

    // Validate operating hours if provided
    if (body.operatingHours !== undefined && body.operatingHours !== null) {
      const hoursValidation = operatingHoursSchema.safeParse(
        body.operatingHours,
      );
      if (!hoursValidation.success) {
        const errors = hoursValidation.error.issues.map((err: any) => ({
          field: `operatingHours.${err.path.join(".")}`,
          message: err.message,
        }));

        throw createError({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          statusMessage: "Validation Error",
          data: errorResponse(
            "Invalid operating hours format",
            ERROR_CODES.VALIDATION_ERROR,
            { errors },
          ),
        });
      }
    }

    // Validate main body
    const validation = replaceAttractionSchema.safeParse(body);

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

    const data = validation.data;

    // Build replacement data object (full replacement)
    const replaceData: any = {
      name: data.name,
      description: data.description ?? null,
      shortDescription: data.shortDescription ?? null,
      type: data.type ?? null,
      adultPrice: data.adultPrice,
      childPrice: data.childPrice ?? null,
      currency: data.currency,
      operatingHours: data.operatingHours ?? null,
      capacity: data.capacity ?? null,
      durationMinutes: data.durationMinutes ?? null,
      minAge: data.minAge ?? null,
      maxAge: data.maxAge ?? null,
      isActive: data.isActive,
      priority: data.priority,
    };

    // Update slug if name changed
    if (data.name !== existingAttraction.name) {
      let newSlug = updateSlug(data.name, existingAttraction.slug);

      // Check if new slug already exists (and is not this attraction)
      const slugCheck = await prisma.attractions.findFirst({
        where: {
          slug: newSlug,
          NOT: {
            id: existingAttraction.id,
          },
        },
      });

      // If slug exists, append timestamp to make it unique
      if (slugCheck) {
        const timestamp = Date.now();
        // Force append timestamp even if updateSlug might have tried to reuse one
        // This ensures uniqueness
        newSlug = `${newSlug}-${timestamp}`;
      }

      replaceData.slug = newSlug;
    }

    // Note: imageUrl and imageUrls are NOT updated here
    // They remain unchanged and should be managed via image-specific endpoints:
    // - /api/admin/attractions/:id/images/cover (for imageUrl)
    // - /api/admin/attractions/:id/images/gallery (for imageUrls)

    // Perform full replacement in database
    const replacedAttraction = await prisma.attractions.update({
      where: { id },
      data: replaceData,
    });

    // Track all replaced fields
    const replacedFields = Object.keys(replaceData);

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "REPLACE_ATTRACTION",
        entityType: "ATTRACTION",
        entityId: replacedAttraction.id,
        description: `Fully replaced attraction: ${replacedAttraction.name}`,
        metadata: {
          attractionId: replacedAttraction.id,
          attractionName: replacedAttraction.name,
          replacedFields,
          method: "PUT",
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
      sanitizeAttractionForResponse(replacedAttraction);

    return successResponse(
      sanitizedAttraction,
      "Attraction updated successfully",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Replace attraction error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        error.message || "Failed to replace attraction",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
