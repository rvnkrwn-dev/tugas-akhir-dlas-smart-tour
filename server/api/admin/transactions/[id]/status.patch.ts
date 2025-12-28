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
const updateStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
    "REFUNDED",
  ]),
  reason: z.string().min(1).max(500).optional(),
  adminNotes: z.string().max(1000).optional(),
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
    const validation = updateStatusSchema.safeParse(body);

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

    const { status, reason, adminNotes } = validation.data;

    // Get existing transaction
    const existingTransaction = await prisma.purchase_transactions.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
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
      },
    });

    if (!existingTransaction) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Transaction not found",
        data: errorResponse("Transaction not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Validate status transitions
    const currentStatus = existingTransaction.status;

    // Define valid status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ["PROCESSING", "CANCELLED", "FAILED"],
      PROCESSING: ["COMPLETED", "FAILED", "CANCELLED"],
      COMPLETED: ["REFUNDED"],
      FAILED: ["PROCESSING"], // Allow retry
      CANCELLED: [], // Final state
      REFUNDED: [], // Final state
    };

    // Check if transition is valid
    if (!validTransitions[currentStatus]?.includes(status)) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Invalid status transition",
        data: errorResponse(
          `Cannot change status from ${currentStatus} to ${status}`,
          ERROR_CODES.VALIDATION_ERROR,
          {
            currentStatus,
            requestedStatus: status,
            validTransitions: validTransitions[currentStatus] || [],
          }
        ),
      });
    }

    // Require reason for certain status changes
    if (
      ["CANCELLED", "FAILED", "REFUNDED"].includes(status) &&
      !reason &&
      !adminNotes
    ) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Reason required",
        data: errorResponse(
          `Reason or admin notes required when changing status to ${status}`,
          ERROR_CODES.VALIDATION_ERROR
        ),
      });
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set completedAt if completing transaction
    if (status === "COMPLETED" && !existingTransaction.completedAt) {
      updateData.completedAt = new Date();
    }

    // Update transaction in a transaction block
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Update transaction status
      const transaction = await tx.purchase_transactions.update({
        where: { id },
        data: updateData,
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
          payments: {
            orderBy: { createdAt: "desc" },
          },
          tickets: true,
        },
      });

      // Update payment status if needed
      if (existingTransaction.payments.length > 0) {
        const latestPayment = existingTransaction.payments[0]!;

        let newPaymentStatus: string | null = null;

        if (status === "COMPLETED") {
          newPaymentStatus = "SETTLED";
        } else if (status === "FAILED") {
          newPaymentStatus = "FAILED";
        } else if (status === "CANCELLED") {
          newPaymentStatus = "CANCELLED";
        } else if (status === "REFUNDED") {
          newPaymentStatus = "REFUNDED";
        }

        if (newPaymentStatus && latestPayment.status !== newPaymentStatus) {
          await tx.payments.update({
            where: { id: latestPayment.id },
            data: {
              status: newPaymentStatus as any,
              ...(newPaymentStatus === "SETTLED" ? { paidAt: new Date() } : {}),
            },
          });
        }
      }

      // Update ticket status if needed
      if (transaction.tickets) {
        let newTicketStatus: string | null = null;

        if (status === "CANCELLED") {
          newTicketStatus = "CANCELLED";
        } else if (status === "REFUNDED") {
          newTicketStatus = "REFUNDED";
        } else if (status === "FAILED") {
          newTicketStatus = "CANCELLED";
        }

        if (newTicketStatus) {
          await tx.tickets.update({
            where: { id: transaction.tickets.id },
            data: {
              status: newTicketStatus as any,
            },
          });
        }
      }

      return transaction;
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "UPDATE_TRANSACTION_STATUS",
        entityType: "TRANSACTION",
        entityId: id,
        description: `Admin changed transaction ${existingTransaction.transactionCode} status from ${currentStatus} to ${status}`,
        metadata: {
          transactionCode: existingTransaction.transactionCode,
          previousStatus: currentStatus,
          newStatus: status,
          reason: reason || null,
          adminNotes: adminNotes || null,
          totalAmount: Number(existingTransaction.totalAmount),
          customerEmail: existingTransaction.users.email,
        },
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    // TODO: Send notification to customer about status change
    // This can be implemented later with email service

    return successResponse(
      {
        transaction: updatedTransaction,
        statusChange: {
          from: currentStatus,
          to: status,
          reason: reason || null,
          adminNotes: adminNotes || null,
          changedBy: {
            userId: currentUser.userId,
            email: currentUser.email,
            role: currentUser.role,
          },
          changedAt: new Date(),
        },
      },
      `Transaction status updated to ${status}`
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'admin/transactions/status-update',
      userId: (event.context as any).user?.userId,
      transactionId: event.context.params?.id,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while updating transaction status",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
