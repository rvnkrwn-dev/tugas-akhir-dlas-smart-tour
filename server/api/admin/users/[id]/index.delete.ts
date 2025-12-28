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

// Zod Schema for query params
const querySchema = z.object({
  hardDelete: z.coerce.boolean().default(false),
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

  // Parse query params
  const query = getQuery(event);
  const queryValidation = querySchema.safeParse(query);

  if (!queryValidation.success) {
    const errors = queryValidation.error.issues.map((err: any) => ({
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

  const { hardDelete } = queryValidation.data;

  // Prevent self-deletion
  if (id === currentUser.userId) {
    throw createError({
      statusCode: HTTP_STATUS.FORBIDDEN,
      statusMessage: "Forbidden",
      data: errorResponse(
        "You cannot delete your own account",
        ERROR_CODES.FORBIDDEN,
      ),
    });
  }

  // Check if user exists
  const existingUser = await prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!existingUser) {
    throw createError({
      statusCode: HTTP_STATUS.NOT_FOUND,
      statusMessage: "User not found",
      data: errorResponse("User not found", ERROR_CODES.NOT_FOUND),
    });
  }

  // Prevent super admin from being deleted by regular admin
  if (
    existingUser.role === "SUPER_ADMIN" &&
    currentUser.role !== "SUPER_ADMIN"
  ) {
    throw createError({
      statusCode: HTTP_STATUS.FORBIDDEN,
      statusMessage: "Forbidden",
      data: errorResponse(
        "You cannot delete a Super Admin account",
        ERROR_CODES.FORBIDDEN,
      ),
    });
  }

  // Only super admin can hard delete
  if (hardDelete && currentUser.role !== "SUPER_ADMIN") {
    throw createError({
      statusCode: HTTP_STATUS.FORBIDDEN,
      statusMessage: "Forbidden",
      data: errorResponse(
        "Only Super Admin can permanently delete users",
        ERROR_CODES.FORBIDDEN,
      ),
    });
  }

  let result;
  let actionDescription;

  if (hardDelete) {
    // Hard delete - permanently remove user and all related data
    // Note: This will cascade delete related records based on schema relations
    await prisma.users.delete({
      where: { id },
    });

    result = {
      deleted: true,
      permanent: true,
      userId: id,
    };

    actionDescription = `User ${existingUser.email} permanently deleted`;
  } else {
    // Soft delete - just deactivate the user
    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    result = {
      deleted: false,
      deactivated: true,
      user: updatedUser,
    };

    actionDescription = `User ${existingUser.email} deactivated`;
  }

  // Log activity (fire and forget)
  prisma.activity_logs.create({
    data: {
      userId: currentUser.userId,
      userRole: currentUser.role,
      action: hardDelete ? "DELETE_USER_PERMANENT" : "DEACTIVATE_USER",
      entityType: "USER",
      entityId: id,
      description: actionDescription,
      metadata: {
        targetUserEmail: existingUser.email,
        targetUserRole: existingUser.role,
        hardDelete,
      },
      ipAddress:
        getHeader(event, "x-forwarded-for") ||
        getHeader(event, "x-real-ip") ||
        "0.0.0.0",
      userAgent: getHeader(event, "user-agent") || null,
    },
  }).catch((err) => console.error("Failed to log activity", err));

  return successResponse(
    result,
    hardDelete ? "User deleted permanently" : "User deactivated successfully",
  );
});
