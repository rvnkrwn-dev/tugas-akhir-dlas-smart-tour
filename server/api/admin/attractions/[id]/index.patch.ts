/**
 * PATCH /api/admin/attractions/:id
 * Partial update attraction
 * Admin only endpoint - requires ADMIN or SUPER_ADMIN role
 *
 * Note: This endpoint handles text fields only. Image management should be done via separate endpoints.
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

// All fields are OPTIONAL for PATCH
const updateAttractionSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must not exceed 255 characters")
    .trim()
    .optional(),
  description: z.string().max(5000, "Description too long").optional(),
  shortDescription: z
    .string()
    .max(500, "Short description must not exceed 500 characters")
    .optional(),
  type: z.string().max(100, "Type must not exceed 100 characters").optional(),
  adultPrice: z.number().positive().optional(),
  childPrice: z.number().nonnegative().optional().nullable(),
  currency: z.string().length(3).optional(),
  operatingHours: z.any().optional(),
  capacity: z.number().int().positive().optional().nullable(),
  durationMinutes: z.number().int().positive().optional().nullable(),
  minAge: z.number().int().nonnegative().optional().nullable(),
  maxAge: z.number().int().nonnegative().optional().nullable(),
  isActive: z.boolean().optional(),
  priority: z.number().int().nonnegative().optional(),
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
    const validation = updateAttractionSchema.safeParse(body);

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

    // Track updated fields
    const updatedFields: string[] = [];

    // Build update data object
    const updateData: any = {};

    // Update slug if name changed
    if (data.name && data.name !== existingAttraction.name) {
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

      updateData.slug = newSlug;
      updateData.name = data.name;
      updatedFields.push("name", "slug");
    }

    // Handle other text fields
    if (data.description !== undefined) {
      updateData.description = data.description || null;
      updatedFields.push("description");
    }
    if (data.shortDescription !== undefined) {
      updateData.shortDescription = data.shortDescription || null;
      updatedFields.push("shortDescription");
    }
    if (data.type !== undefined) {
      updateData.type = data.type || null;
      updatedFields.push("type");
    }
    if (data.adultPrice !== undefined) {
      updateData.adultPrice = data.adultPrice;
      updatedFields.push("adultPrice");
    }
    if (data.childPrice !== undefined) {
      updateData.childPrice = data.childPrice;
      updatedFields.push("childPrice");
    }
    if (data.currency !== undefined) {
      updateData.currency = data.currency || "IDR";
      updatedFields.push("currency");
    }
    if (data.operatingHours !== undefined) {
      updateData.operatingHours = data.operatingHours;
      updatedFields.push("operatingHours");
    }
    if (data.capacity !== undefined) {
      updateData.capacity = data.capacity;
      updatedFields.push("capacity");
    }
    if (data.durationMinutes !== undefined) {
      updateData.durationMinutes = data.durationMinutes;
      updatedFields.push("durationMinutes");
    }
    if (data.minAge !== undefined) {
      updateData.minAge = data.minAge;
      updatedFields.push("minAge");
    }
    if (data.maxAge !== undefined) {
      updateData.maxAge = data.maxAge;
      updatedFields.push("maxAge");
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
      updatedFields.push("isActive");
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority;
      updatedFields.push("priority");
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "No Update Data",
        data: errorResponse(
          "No fields provided for update",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    // Update attraction in database
    const updatedAttraction = await prisma.attractions.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "UPDATE_ATTRACTION",
        entityType: "ATTRACTION",
        entityId: updatedAttraction.id,
        description: `Updated attraction: ${updatedAttraction.name}`,
        metadata: {
          attractionId: updatedAttraction.id,
          attractionName: updatedAttraction.name,
          updatedFields,
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
      "Attraction updated successfully",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Update attraction error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        error.message || "Failed to update attraction",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
