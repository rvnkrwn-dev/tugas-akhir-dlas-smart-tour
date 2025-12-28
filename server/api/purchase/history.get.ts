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
import { rateLimit, RateLimitPresets } from "~~/server/utils/rateLimit";
import { logError } from "~~/server/utils/logger";

// Zod Schema for query params
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
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
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(["createdAt", "completedAt", "totalAmount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require authenticated user
    const currentUser = requireUser(event);

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

    const { page, limit, status, startDate, endDate, sortBy, sortOrder } =
      validation.data;

    // Build where clause
    const where: any = {
      userId: currentUser.userId,
    };

    if (status) {
      where.status = status;
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
    const totalTransactions = await prisma.purchase_transactions.count({
      where,
    });

    // Get transactions
    const transactions = await prisma.purchase_transactions.findMany({
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
        customerInfo: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        transaction_items: {
          select: {
            id: true,
            attractionId: true,
            ticketType: true,
            quantity: true,
            visitDate: true,
            unitPrice: true,
            totalPrice: true,
            attractions: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                imageUrl: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            method: true,
            status: true,
            paidAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        tickets: {
          select: {
            id: true,
            ticketCode: true,
            qrCode: true,
            status: true,
            visitDateFrom: true,
            visitDateTo: true,
            usedCount: true,
          },
        },
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalTransactions / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Calculate summary
    const summary = transactions.reduce(
      (acc, txn) => {
        acc.totalSpent += Number(txn.totalAmount);
        acc.totalItems += txn.transaction_items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        acc.statusCount[txn.status] = (acc.statusCount[txn.status] || 0) + 1;
        return acc;
      },
      {
        totalSpent: 0,
        totalItems: 0,
        statusCount: {} as Record<string, number>,
      }
    );

    return successResponse(
      {
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalTransactions,
          limit,
          hasNextPage,
          hasPrevPage,
        },
        summary,
      },
      "Purchase history retrieved successfully"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'purchase/history',
      userId: (event.context as any).user?.userId,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while fetching purchase history",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
