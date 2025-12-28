import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireUser } from "~~/server/utils/auth";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { deleteCache, CacheKeys } from "~~/server/utils/cache";

// Zod Schema
const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .max(100, "First name must not exceed 100 characters")
      .trim()
      .optional(),
    lastName: z
      .string()
      .max(100, "Last name must not exceed 100 characters")
      .trim()
      .optional(),
    phone: z
      .string()
      .regex(/^(\+62|62|0)[0-9]{9,12}$/, "Invalid phone number format")
      .optional()
      .or(z.literal("")),
    dateOfBirth: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date format")
      .optional()
      .or(z.literal("")),
    gender: z
      .enum(["MALE", "FEMALE", "OTHER"], {
        message: "Gender must be MALE, FEMALE, or OTHER",
      })
      .optional(),
    address: z
      .string()
      .max(500, "Address must not exceed 500 characters")
      .trim()
      .optional(),
    city: z
      .string()
      .max(100, "City must not exceed 100 characters")
      .trim()
      .optional(),
    country: z
      .string()
      .max(100, "Country must not exceed 100 characters")
      .trim()
      .optional(),
    postalCode: z
      .string()
      .regex(/^[0-9]{5}$/, "Invalid postal code format (must be 5 digits)")
      .optional()
      .or(z.literal("")),
    avatarUrl: z
      .string()
      .url("Invalid URL format")
      .max(1000, "Avatar URL must not exceed 1000 characters")
      .optional()
      .or(z.literal("")),
    language: z
      .enum(["ENGLISH", "INDONESIAN"], {
        message: "Language must be ENGLISH or INDONESIAN",
      })
      .optional(),
  })
  .strict();

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Require authenticated user
    const currentUser = requireUser(event);

    // Parse and validate request body
    const body = await readBody(event);
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Validation Error",
        data: errorResponse("Validation failed", ERROR_CODES.VALIDATION_ERROR, {
          errors,
        }),
      });
    }

    const data = validation.data;

    // Prepare update data
    const updateData: any = {};

    if (data.firstName !== undefined)
      updateData.firstName = data.firstName || null;
    if (data.lastName !== undefined)
      updateData.lastName = data.lastName || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : null;
    }
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.country !== undefined) updateData.country = data.country || null;
    if (data.postalCode !== undefined)
      updateData.postalCode = data.postalCode || null;
    if (data.avatarUrl !== undefined)
      updateData.avatarUrl = data.avatarUrl || null;
    if (data.language !== undefined) updateData.language = data.language;

    // Update or create profile
    const profile = await prisma.user_profiles.upsert({
      where: { userId: currentUser.userId },
      update: updateData,
      create: {
        userId: currentUser.userId,
        ...updateData,
      },
    });

    // Get updated user data
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
            language: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // Invalidate user cache to ensure fresh data in auth middleware
    await deleteCache(CacheKeys.userById(currentUser.userId));

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "PROFILE_UPDATED",
        entityType: "USER",
        entityId: currentUser.userId,
        description: "User updated profile information",
        metadata: { updatedFields: Object.keys(updateData) },
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    return successResponse(user, "Profile updated successfully");
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Update profile error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while updating profile",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
