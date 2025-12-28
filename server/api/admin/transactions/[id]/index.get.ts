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

// Zod Schema for path params
const paramsSchema = z.object({
  id: z.string().uuid("Invalid transaction ID format"),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require admin role
    const currentUser = requireAdmin(event);

    // Parse and validate path params
    const params = event.context.params;
    const validation = paramsSchema.safeParse(params);

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

    const { id } = validation.data;

    // Get transaction with full details
    const transaction = await prisma.purchase_transactions.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            user_profiles: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                city: true,
                country: true,
              },
            },
          },
        },
        transaction_items: {
          include: {
            attractions: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
                type: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
        tickets: {
          include: {
            ticket_details: {
              include: {
                attractions: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Transaction not found",
        data: errorResponse("Transaction not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Calculate additional statistics
    const itemsSummary = transaction.transaction_items.reduce(
      (acc, item) => {
        acc.totalItems += item.quantity;
        acc.uniqueAttractions += 1;
        return acc;
      },
      {
        totalItems: 0,
        uniqueAttractions: 0,
      }
    );

    // Get user's other transactions
    const userOtherTransactions = await prisma.purchase_transactions.findMany({
      where: {
        userId: transaction.userId,
        id: { not: id },
        status: "COMPLETED",
      },
      select: {
        id: true,
        transactionCode: true,
        totalAmount: true,
        currency: true,
        status: true,
        createdAt: true,
        completedAt: true,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get activity logs related to this transaction
    const activityLogs = await prisma.activity_logs.findMany({
      where: {
        entityType: "TRANSACTION",
        entityId: id,
      },
      select: {
        id: true,
        action: true,
        description: true,
        metadata: true,
        createdAt: true,
        users: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Calculate payment summary
    const paymentSummary = {
      totalPaid: transaction.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      ),
      latestPayment: transaction.payments[0] || null,
      paymentCount: transaction.payments.length,
      allSettled: transaction.payments.every((p) => p.status === "SETTLED"),
    };

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "VIEW_TRANSACTION_DETAIL",
        entityType: "TRANSACTION",
        entityId: id,
        description: `Admin viewed transaction ${transaction.transactionCode}`,
        metadata: {
          transactionCode: transaction.transactionCode,
          status: transaction.status,
          totalAmount: Number(transaction.totalAmount),
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
        transaction,
        summary: {
          ...itemsSummary,
          totalAmount: Number(transaction.totalAmount),
          currency: transaction.currency,
          status: transaction.status,
          hasTicket: !!transaction.tickets,
          ticketCode: transaction.tickets?.ticketCode || null,
        },
        paymentSummary,
        userOtherTransactions,
        activityLogs,
      },
      "Transaction details retrieved successfully"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'admin/transactions/detail',
      userId: (event.context as any).user?.userId,
      transactionId: event.context.params?.id,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while fetching transaction details",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
