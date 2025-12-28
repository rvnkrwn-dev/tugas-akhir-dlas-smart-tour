import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireAdmin } from "~~/server/utils/auth";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { rateLimit, RateLimitPresets } from "~~/server/utils/rateLimit";
import { logError } from "~~/server/utils/logger";

// Zod Schema for query params
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z
    .enum(["PENDING", "CAPTURED", "SETTLED", "FAILED", "CANCELLED", "REFUNDED"])
    .optional(),
  method: z.string().optional(),
  transactionId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  sortBy: z
    .enum(["createdAt", "paidAt", "amount", "status"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require admin role
    const currentUser = requireAdmin(event);

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
      method,
      transactionId,
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
        { gatewayRef: { contains: search } },
        {
          purchase_transactions: {
            OR: [
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
            ],
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (method) {
      where.method = { contains: method };
    }

    if (transactionId) {
      where.transactionId = transactionId;
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
      where.amount = {};
      if (minAmount !== undefined) {
        where.amount.gte = minAmount;
      }
      if (maxAmount !== undefined) {
        where.amount.lte = maxAmount;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalPayments = await prisma.payments.count({ where });

    // Get payments
    const payments = await prisma.payments.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        transactionId: true,
        amount: true,
        currency: true,
        method: true,
        status: true,
        gatewayRef: true,
        paidAt: true,
        createdAt: true,
        updatedAt: true,
        purchase_transactions: {
          select: {
            id: true,
            transactionCode: true,
            totalAmount: true,
            status: true,
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
          },
        },
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalPayments / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Calculate summary for current page
    const pageSummary = payments.reduce(
      (acc, payment) => {
        acc.totalAmount += Number(payment.amount);
        acc.statusCount[payment.status] =
          (acc.statusCount[payment.status] || 0) + 1;
        if (payment.method) {
          acc.methodCount[payment.method] =
            (acc.methodCount[payment.method] || 0) + 1;
        }
        return acc;
      },
      {
        totalAmount: 0,
        statusCount: {} as Record<string, number>,
        methodCount: {} as Record<string, number>,
      }
    );

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "VIEW_PAYMENTS_LIST",
        entityType: "PAYMENT",
        description: "Admin viewed payments list",
        metadata: {
          filters: {
            status,
            method,
            transactionId,
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
    });

    return successResponse(
      {
        payments,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalPayments,
          limit,
          hasNextPage,
          hasPrevPage,
        },
        summary: pageSummary,
      },
      "Payments retrieved successfully"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'admin/payments/list',
      userId: (event.context as any).user?.userId,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while fetching payments",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
