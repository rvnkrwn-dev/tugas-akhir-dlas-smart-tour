import { z } from "zod";
import { getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { defineAdminHandler } from "~~/server/utils/handler";

// Zod Schema for path params
const paramsSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

// Zod Schema for request body
const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "SCANNER", "CUSTOMER"]).optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  profile: z
    .object({
      firstName: z.string().min(1).max(100).optional(),
      lastName: z.string().min(1).max(100).optional(),
      phone: z.string().max(20).optional().nullable(),
      dateOfBirth: z.string().datetime().optional().nullable(),
      gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
      address: z.string().max(500).optional().nullable(),
      city: z.string().max(100).optional().nullable(),
      country: z.string().max(100).optional().nullable(),
      postalCode: z.string().max(20).optional().nullable(),
      language: z.enum(["ENGLISH", "INDONESIAN"]).optional(),
    })
    .optional(),
});

export default defineAdminHandler(async (event, currentUser) => {
  // Parse and validate path params
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
      data: errorResponse("Validation failed", ERROR_CODES.VALIDATION_ERROR, {
        errors,
      }),
    });
  }

  const { id } = paramsValidation.data;

  // Parse and validate request body
  const body = await readBody(event);
  const validation = updateUserSchema.safeParse(body);

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

  const { email, role, isActive, isEmailVerified, profile } = validation.data;

  // Check if user exists
  const existingUser = await prisma.users.findUnique({
    where: { id },
    include: {
      user_profiles: true,
    },
  });

  if (!existingUser) {
    throw createError({
      statusCode: HTTP_STATUS.NOT_FOUND,
      statusMessage: "User not found",
      data: errorResponse("User not found", ERROR_CODES.NOT_FOUND),
    });
  }

  // Prevent super admin from being modified by regular admin
  if (
    existingUser.role === "SUPER_ADMIN" &&
    currentUser.role !== "SUPER_ADMIN"
  ) {
    throw createError({
      statusCode: HTTP_STATUS.FORBIDDEN,
      statusMessage: "Forbidden",
      data: errorResponse(
        "You cannot modify a Super Admin account",
        ERROR_CODES.FORBIDDEN,
      ),
    });
  }

  // Only super admin can assign super admin role
  if (role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
    throw createError({
      statusCode: HTTP_STATUS.FORBIDDEN,
      statusMessage: "Forbidden",
      data: errorResponse(
        "Only Super Admin can assign Super Admin role",
        ERROR_CODES.FORBIDDEN,
      ),
    });
  }

  // Check if email is already taken by another user
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.users.findUnique({
      where: { email },
    });

    if (emailExists) {
      throw createError({
        statusCode: HTTP_STATUS.CONFLICT,
        statusMessage: "Email already exists",
        data: errorResponse(
          "Email is already taken by another user",
          ERROR_CODES.ALREADY_EXISTS,
        ),
      });
    }
  }

  // Prepare user update data
  const userUpdateData: any = {};
  if (email !== undefined) userUpdateData.email = email;
  if (role !== undefined) userUpdateData.role = role;
  if (isActive !== undefined) userUpdateData.isActive = isActive;
  if (isEmailVerified !== undefined)
    userUpdateData.isEmailVerified = isEmailVerified;

  // Update user and profile in a transaction
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Update user
    const user = await tx.users.update({
      where: { id },
      data: userUpdateData,
      include: {
        user_profiles: true,
      },
    });

    // Update profile if provided
    if (profile && Object.keys(profile).length > 0) {
      const profileData: any = {};
      if (profile.firstName !== undefined)
        profileData.firstName = profile.firstName;
      if (profile.lastName !== undefined)
        profileData.lastName = profile.lastName;
      if (profile.phone !== undefined) profileData.phone = profile.phone;
      if (profile.dateOfBirth !== undefined)
        profileData.dateOfBirth = profile.dateOfBirth
          ? new Date(profile.dateOfBirth)
          : null;
      if (profile.gender !== undefined) profileData.gender = profile.gender;
      if (profile.address !== undefined) profileData.address = profile.address;
      if (profile.city !== undefined) profileData.city = profile.city;
      if (profile.country !== undefined) profileData.country = profile.country;
      if (profile.postalCode !== undefined)
        profileData.postalCode = profile.postalCode;
      if (profile.language !== undefined)
        profileData.language = profile.language;

      if (user.user_profiles) {
        // Update existing profile
        await tx.user_profiles.update({
          where: { userId: id },
          data: profileData,
        });
      } else {
        // Create new profile
        await tx.user_profiles.create({
          data: {
            userId: id,
            ...profileData,
          },
        });
      }
    }

    // Get updated user with profile
    return await tx.users.findUnique({
      where: { id },
      include: {
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
          },
        },
      },
    });
  });

  // Log activity (fire and forget)
  prisma.activity_logs.create({
    data: {
      userId: currentUser.userId,
      userRole: currentUser.role,
      action: "UPDATE_USER",
      entityType: "USER",
      entityId: id,
      description: `Admin updated user ${updatedUser?.email}`,
      metadata: {
        updatedFields: Object.keys({
          ...userUpdateData,
          ...(profile || {}),
        }),
        previousRole: existingUser.role,
        newRole: role || existingUser.role,
      },
      ipAddress:
        getHeader(event, "x-forwarded-for") ||
        getHeader(event, "x-real-ip") ||
        "0.0.0.0",
      userAgent: getHeader(event, "user-agent") || null,
    },
  }).catch((err) => console.error("Failed to log activity", err));

  // Remove password from response
  const { password: _, ...userWithoutPassword } = updatedUser!;

  return successResponse(
    {
      user: userWithoutPassword,
    },
    "User updated successfully",
  );
});
