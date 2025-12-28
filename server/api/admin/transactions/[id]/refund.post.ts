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

// Zod Schema for request body
const refundSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters").max(1000),
  refundAmount: z.coerce.number().positive().optional(),
  refundMethod: z.enum(["FULL", "PARTIAL"]).default("FULL"),
  adminNotes: z.string().max(1000).optional(),
  notifyCustomer: z.boolean().default(true),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require admin role
    const currentUser = requireAdmin(event);

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
    const validation = refundSchema.safeParse(body);

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

    const { reason, refundAmount, refundMethod, adminNotes, notifyCustomer } =
      validation.data;

    // Get existing transaction
    const existingTransaction = await prisma.purchase_transactions.findUnique({
      where: { id },
      include: {
        payments: {
          where: { status: "SETTLED" },
          orderBy: { createdAt: "desc" },
        },
        tickets: true,
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
        transaction_items: true,
      },
    });

    if (!existingTransaction) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Transaction not found",
        data: errorResponse("Transaction not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Validate transaction can be refunded
    if (existingTransaction.status === "REFUNDED") {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Already refunded",
        data: errorResponse(
          "This transaction has already been refunded",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    if (existingTransaction.status !== "COMPLETED") {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Cannot refund transaction",
        data: errorResponse(
          "Only completed transactions can be refunded",
          ERROR_CODES.VALIDATION_ERROR,
          {
            currentStatus: existingTransaction.status,
          },
        ),
      });
    }

    // Check if payment exists
    if (existingTransaction.payments.length === 0) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "No payment found",
        data: errorResponse(
          "No settled payment found for this transaction",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    const totalTransactionAmount = Number(existingTransaction.totalAmount);
    const latestPayment = existingTransaction.payments[0]!;
    const totalPaidAmount = Number(latestPayment.amount);

    // Validate refund amount for partial refund
    let actualRefundAmount = totalTransactionAmount;

    if (refundMethod === "PARTIAL") {
      if (!refundAmount) {
        throw createError({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          statusMessage: "Refund amount required",
          data: errorResponse(
            "Refund amount is required for partial refund",
            ERROR_CODES.VALIDATION_ERROR,
          ),
        });
      }

      if (refundAmount > totalPaidAmount) {
        throw createError({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          statusMessage: "Invalid refund amount",
          data: errorResponse(
            "Refund amount cannot exceed paid amount",
            ERROR_CODES.VALIDATION_ERROR,
            {
              requestedAmount: refundAmount,
              paidAmount: totalPaidAmount,
            },
          ),
        });
      }

      actualRefundAmount = refundAmount;
    }

    // Process refund in transaction
    const refundResult = await prisma.$transaction(async (tx) => {
      // Calculate ticket usage if tickets exist
      if (existingTransaction.tickets) {
        const ticketId = existingTransaction.tickets.id;
        const ticketDetails = await tx.ticket_details.findMany({
          where: { ticketId },
        });

        const totalUsedQty = ticketDetails.reduce((sum, detail) => sum + detail.usedQty, 0);

        // Validation: Cannot full refund if tickets used
        if (refundMethod === "FULL" && totalUsedQty > 0) {
          throw createError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            statusMessage: "Cannot full refund used tickets",
            data: errorResponse(
              "Cannot process full refund because some tickets have already been used.",
              ERROR_CODES.VALIDATION_ERROR,
              {
                totalUsedQty,
              }
            ),
          });
        }
      }

      // Update transaction status to REFUNDED
      const updatedTransaction = await tx.purchase_transactions.update({
        where: { id },
        data: {
          status: "REFUNDED",
          updatedAt: new Date(),
        },
        include: {
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
          transaction_items: {
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
          payments: true,
          tickets: true,
        },
      });

      // Update payment status to REFUNDED
      await tx.payments.update({
        where: { id: latestPayment.id },
        data: {
          status: "REFUNDED",
          updatedAt: new Date(),
          gatewayData: {
            ...(latestPayment.gatewayData as any),
            refund: {
              amount: actualRefundAmount,
              reason,
              processedAt: new Date().toISOString(),
              processedBy: currentUser.email,
              method: refundMethod,
            },
          },
        },
      });

      // Update ticket status ONLY if FULL refund
      if (updatedTransaction.tickets && refundMethod === "FULL") {
        await tx.tickets.update({
          where: { id: updatedTransaction.tickets.id },
          data: {
            status: "REFUNDED",
            updatedAt: new Date(),
          },
        });
      }

      return updatedTransaction;
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "REFUND_TRANSACTION",
        entityType: "TRANSACTION",
        entityId: id,
        description: `Admin processed ${refundMethod.toLowerCase()} refund for transaction ${existingTransaction.transactionCode}`,
        metadata: {
          transactionCode: existingTransaction.transactionCode,
          previousStatus: existingTransaction.status,
          refundAmount: actualRefundAmount,
          refundMethod,
          reason,
          adminNotes: adminNotes || null,
          customerEmail: existingTransaction.users.email,
          paymentId: latestPayment.id,
          paymentMethod: latestPayment.method,
        },
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    // TODO: Integrate with actual payment gateway to process refund
    // This should call the payment gateway API to process the refund
    // Example: Midtrans, Xendit, etc.

    // TODO: Send notification to customer if notifyCustomer is true
    // if (notifyCustomer) {
    //   await sendRefundNotification({
    //     email: existingTransaction.users.email,
    //     transactionCode: existingTransaction.transactionCode,
    //     refundAmount: actualRefundAmount,
    //     reason,
    //   });
    // }

    return successResponse(
      {
        transaction: refundResult,
        refundDetails: {
          refundAmount: actualRefundAmount,
          refundMethod,
          originalAmount: totalTransactionAmount,
          reason,
          adminNotes: adminNotes || null,
          processedBy: {
            userId: currentUser.userId,
            email: currentUser.email,
            role: currentUser.role,
          },
          processedAt: new Date(),
          paymentId: latestPayment.id,
          paymentMethod: latestPayment.method,
          customerNotified: notifyCustomer,
        },
      },
      "Refund processed successfully",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'admin/transactions/refund',
      userId: (event.context as any).user?.userId,
      transactionId: event.context.params?.id,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while processing refund",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
