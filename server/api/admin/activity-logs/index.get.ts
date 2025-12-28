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
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  userId: z.string().uuid().optional(),
  userRole: z
    .enum(["SUPER_ADMIN", "ADMIN", "SCANNER", "CUSTOMER"])
    .optional(),
  action: z.string().optional(),
  entityType: z
    .enum(["USER", "TRANSACTION", "TICKET", "PAYMENT", "ATTRACTION"])
    .optional(),
  entityId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  ipAddress: z.string().optional(),
  sortBy: z.enum(["createdAt", "action", "userId"]).default("createdAt"),
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
    userId,
    userRole,
    action,
    entityType,
    entityId,
    startDate,
    endDate,
    ipAddress,
    sortBy,
    sortOrder,
  } = validation.data;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { action: { contains: search } },
      { description: { contains: search } },
      { entityType: { contains: search } },
      { ipAddress: { contains: search } },
      {
        users: {
          email: { contains: search },
        },
      },
    ];
  }

  if (userId) {
    where.userId = userId;
  }

  if (userRole) {
    where.userRole = userRole;
  }

  if (action) {
    where.action = { contains: action };
  }

  if (entityType) {
    where.entityType = entityType;
  }

  if (entityId) {
    where.entityId = entityId;
  }

  if (ipAddress) {
    where.ipAddress = { contains: ipAddress };
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count
  const totalLogs = await prisma.activity_logs.count({ where });

  // Get activity logs
  const logs = await prisma.activity_logs.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    select: {
      id: true,
      userId: true,
      userRole: true,
      action: true,
      entityType: true,
      entityId: true,
      description: true,
      metadata: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
      users: {
        select: {
          id: true,
          email: true,
          user_profiles: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalLogs / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Calculate summary for current page
  const pageSummary = logs.reduce(
    (acc, log) => {
      acc.actionCount[log.action] = (acc.actionCount[log.action] || 0) + 1;
      if (log.entityType) {
        acc.entityTypeCount[log.entityType] =
          (acc.entityTypeCount[log.entityType] || 0) + 1;
      }
      if (log.userRole) {
        acc.userRoleCount[log.userRole] =
          (acc.userRoleCount[log.userRole] || 0) + 1;
      }
      return acc;
    },
    {
      actionCount: {} as Record<string, number>,
      entityTypeCount: {} as Record<string, number>,
      userRoleCount: {} as Record<string, number>,
    }
  );

  return successResponse(
    {
      logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalLogs,
        limit,
        hasNextPage,
        hasPrevPage,
      },
      summary: pageSummary,
    },
    "Activity logs retrieved successfully"
  );
});
