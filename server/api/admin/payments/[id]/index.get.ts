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
  id: z.string().uuid("Invalid payment ID format"),
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

    // Get payment with full details
    const payment = await prisma.payments.findUnique({
      where: { id },
      include: {
        purchase_transactions: {
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
                    type: true,
                    imageUrl: true,
                  },
                },
              },
            },
            tickets: {
              select: {
                id: true,
                ticketCode: true,
                qrCode: true,
                status: true,
                visitDateFrom: true,
                visitDateTo: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Payment not found",
        data: errorResponse("Payment not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Calculate processing time
    let processingTime = null;
    if (payment.paidAt) {
      const diffInMs = payment.paidAt.getTime() - payment.createdAt.getTime();
      const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
      processingTime = `${diffInMinutes} minutes`;
    }

    // Get payment history/logs
    const paymentLogs = await prisma.activity_logs.findMany({
      where: {
        entityType: "PAYMENT",
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

    // Get other payments for the same transaction
    const relatedPayments = await prisma.payments.findMany({
      where: {
        transactionId: payment.transactionId,
        id: { not: id },
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        method: true,
        status: true,
        gatewayRef: true,
        paidAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate payment summary
    const summary = {
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      method: payment.method || "UNKNOWN",
      isPaid: payment.status === "SETTLED",
      processingTime,
      hasGatewayRef: !!payment.gatewayRef,
      hasGatewayData: !!payment.gatewayData,
      transactionTotal: Number(payment.purchase_transactions.totalAmount),
      isFullPayment:
        Number(payment.amount) ===
        Number(payment.purchase_transactions.totalAmount),
    };

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "VIEW_PAYMENT_DETAIL",
        entityType: "PAYMENT",
        entityId: id,
        description: `Admin viewed payment details (ref: ${payment.gatewayRef || "N/A"})`,
        metadata: {
          paymentId: id,
          amount: Number(payment.amount),
          status: payment.status,
          method: payment.method,
          transactionCode: payment.purchase_transactions.transactionCode,
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
        payment,
        summary,
        relatedPayments,
        paymentLogs,
      },
      "Payment details retrieved successfully"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'admin/payments/detail',
      userId: (event.context as any).user?.userId,
      paymentId: event.context.params?.id,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while fetching payment details",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
