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
  status: z
    .enum([
      "PENDING",
      "PROCESSING",
      "COMPLETED",
      "FAILED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
  userId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  sortBy: z
    .enum(["createdAt", "completedAt", "totalAmount", "transactionCode"])
    .default("createdAt"),
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
    status,
    userId,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy,
    sortOrder,
  } = validation.data;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { transactionCode: { contains: search } },
      {
        users: {
          OR: [
            { email: { contains: search } },
            {
              user_profiles: {
                OR: [
                  { firstName: { contains: search } },
                  { lastName: { contains: search } },
                ],
              },
            },
          ],
        },
      },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (userId) {
    where.userId = userId;
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

  if (minAmount !== undefined || maxAmount !== undefined) {
    where.totalAmount = {};
    if (minAmount !== undefined) {
      where.totalAmount.gte = minAmount;
    }
    if (maxAmount !== undefined) {
      where.totalAmount.lte = maxAmount;
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Run queries in parallel
  const [totalTransactions, transactions] = await Promise.all([
    prisma.purchase_transactions.count({ where }),
    prisma.purchase_transactions.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        transactionCode: true,
        totalAmount: true,
        currency: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        users: {
          select: {
            id: true,
            email: true,
            user_profiles: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        _count: {
          select: {
            transaction_items: true,
            payments: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            paidAt: true,
          },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalTransactions / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Calculate summary for current page
  const pageSummary = transactions.reduce(
    (acc, txn) => {
      acc.totalAmount += Number(txn.totalAmount);
      acc.statusCount[txn.status] = (acc.statusCount[txn.status] || 0) + 1;
      return acc;
    },
    {
      totalAmount: 0,
      statusCount: {} as Record<string, number>,
    }
  );

  // Log activity (fire and forget)
  prisma.activity_logs.create({
    data: {
      userId: currentUser.userId,
      userRole: currentUser.role,
      action: "VIEW_TRANSACTIONS_LIST",
      entityType: "TRANSACTION",
      description: "Admin viewed transactions list",
      metadata: {
        filters: {
          status,
          userId,
          search,
          startDate,
          endDate,
          minAmount,
          maxAmount,
        },
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
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalTransactions,
        limit,
        hasNextPage,
        hasPrevPage,
      },
      summary: pageSummary,
    },
    "Transactions retrieved successfully"
  );
});
