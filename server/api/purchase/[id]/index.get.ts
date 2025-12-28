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

// Zod Schema for path params
const paramsSchema = z.object({
  id: z.string().uuid("Invalid transaction ID format"),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require authenticated user
    const currentUser = requireUser(event);

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
        transaction_items: {
          include: {
            attractions: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                imageUrl: true,
                adultPrice: true,
                childPrice: true,
                currency: true,
                operatingHours: true,
                durationMinutes: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            method: true,
            status: true,
            gatewayRef: true,
            gatewayData: true,
            paidAt: true,
            createdAt: true,
            updatedAt: true,
          },
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
                    type: true,
                  },
                },
              },
            },
          },
        },
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
    });

    if (!transaction) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Transaction not found",
        data: errorResponse("Transaction not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Verify transaction belongs to current user
    if (transaction.userId !== currentUser.userId) {
      throw createError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        statusMessage: "Forbidden",
        data: errorResponse(
          "You do not have permission to view this transaction",
          ERROR_CODES.FORBIDDEN,
        ),
      });
    }

    // Calculate summary
    const summary = {
      totalAmount: Number(transaction.totalAmount),
      currency: transaction.currency,
      status: transaction.status,
      itemsCount: transaction.transaction_items.length,
      totalQuantity: transaction.transaction_items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      uniqueAttractions: new Set(
        transaction.transaction_items.map((item) => item.attractionId)
      ).size,
      hasTicket: !!transaction.tickets,
      hasPaidPayment: transaction.payments.some((p) => p.status === "SETTLED"),
      isPending: transaction.status === "PENDING",
      isCompleted: transaction.status === "COMPLETED",
      isFailed: ["FAILED", "CANCELLED"].includes(transaction.status),
    };

    // Get payment summary
    const paymentSummary = {
      totalPaid: transaction.payments
        .filter((p) => p.status === "SETTLED")
        .reduce((sum, p) => sum + Number(p.amount), 0),
      latestPayment: transaction.payments[0] || null,
      paymentCount: transaction.payments.length,
      allSettled: transaction.payments.every((p) => p.status === "SETTLED"),
    };

    // Calculate ticket summary if exists
    let ticketSummary = null;
    if (transaction.tickets) {
      const ticketDetails = transaction.tickets.ticket_details;
      ticketSummary = {
        ticketCode: transaction.tickets.ticketCode,
        qrCode: transaction.tickets.qrCode,
        status: transaction.tickets.status,
        totalQty: ticketDetails.reduce((sum, d) => sum + d.totalQty, 0),
        usedQty: ticketDetails.reduce((sum, d) => sum + d.usedQty, 0),
        remainingQty: ticketDetails.reduce((sum, d) => sum + d.remainingQty, 0),
        visitDateFrom: transaction.tickets.visitDateFrom,
        visitDateTo: transaction.tickets.visitDateTo,
        usedCount: transaction.tickets.usedCount,
        canBeUsed:
          transaction.tickets.status === "ACTIVE" ||
          transaction.tickets.status === "PARTIALLY_USED",
      };
    }

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "VIEW_PURCHASE_DETAIL",
        entityType: "TRANSACTION",
        entityId: id,
        description: `User viewed purchase ${transaction.transactionCode}`,
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
        summary,
        paymentSummary,
        ticketSummary,
      },
      "Purchase details retrieved successfully"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'purchase/detail',
      userId: (event.context as any).user?.userId,
      transactionId: event.context.params?.id,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while fetching purchase details",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
