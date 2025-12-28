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

// Zod Schema for query params
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "SCANNER", "CUSTOMER"]).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      return val === "true";
    }),
  isEmailVerified: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      return val === "true";
    }),
  sortBy: z.enum(["createdAt", "lastLoginAt", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export default defineAdminHandler(async (event, currentUser) => {
  // Parse and validate query params
  const query = getQuery(event);
  const validation = querySchema.safeParse(query);

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

  const {
    page,
    limit,
    search,
    role,
    isActive,
    isEmailVerified,
    sortBy,
    sortOrder,
  } = validation.data;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: search } },
      {
        user_profiles: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        },
      },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (isEmailVerified !== undefined) {
    where.isEmailVerified = isEmailVerified;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Run queries in parallel for performance
  const [totalUsers, users] = await Promise.all([
    prisma.users.count({ where }),
    prisma.users.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
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
            city: true,
            country: true,
          },
        },
        _count: {
          select: {
            purchase_transactions: true,
            activity_logs: true,
          },
        },
      },
    }),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalUsers / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Log activity (fire and forget)
  prisma.activity_logs.create({
    data: {
      userId: currentUser.userId,
      userRole: currentUser.role,
      action: "VIEW_USERS_LIST",
      entityType: "USER",
      description: "Admin viewed users list",
      metadata: {
        filters: { role, isActive, isEmailVerified, search },
        page,
        limit,
      },
      ipAddress:
        getHeader(event, "x-forwarded-for") ||
        getHeader(event, "x-real-ip") ||
        "0.0.0.0",
      userAgent: getHeader(event, "user-agent") || null,
    },
  }).catch((err) => console.error("Failed to log activity:", err));

  return successResponse(
    {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    },
    "Users retrieved successfully",
  );
});
