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

// Zod Schema for request body
const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "CAPTURED", "SETTLED", "FAILED", "CANCELLED", "REFUNDED"]),
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

    // Get existing payment
    const existingPayment = await prisma.payments.findUnique({
      where: { id },
      include: {
        purchase_transactions: {
          select: {
            id: true,
            transactionCode: true,
            status: true,
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
        },
      },
    });

    if (!existingPayment) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Payment not found",
        data: errorResponse("Payment not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Validate status transitions
    const currentStatus = existingPayment.status;

    // Define valid status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ["CAPTURED", "SETTLED", "FAILED", "CANCELLED"],
      CAPTURED: ["SETTLED", "FAILED", "CANCELLED"],
      SETTLED: ["REFUNDED"],
      FAILED: ["PENDING"], // Allow retry
      CANCELLED: [], // Final state
      REFUNDED: [], // Final state
    };

    // Check if transition is valid
    if (!validTransitions[currentStatus]?.includes(status)) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Invalid status transition",
        data: errorResponse(
          `Cannot change payment status from ${currentStatus} to ${status}`,
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

    // Set paidAt if payment is settled
    if (status === "SETTLED" && !existingPayment.paidAt) {
      updateData.paidAt = new Date();
    }

    // Update gatewayData with admin notes
    if (reason || adminNotes) {
      updateData.gatewayData = {
        ...(existingPayment.gatewayData as any),
        adminUpdate: {
          status,
          reason: reason || null,
          adminNotes: adminNotes || null,
          updatedBy: currentUser.email,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    // Update payment
    const updatedPayment = await prisma.payments.update({
      where: { id },
      data: updateData,
      include: {
        purchase_transactions: {
          select: {
            id: true,
            transactionCode: true,
            status: true,
            totalAmount: true,
            currency: true,
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

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "UPDATE_PAYMENT_STATUS",
        entityType: "PAYMENT",
        entityId: id,
        description: `Admin changed payment status from ${currentStatus} to ${status}`,
        metadata: {
          paymentId: id,
          previousStatus: currentStatus,
          newStatus: status,
          reason: reason || null,
          adminNotes: adminNotes || null,
          amount: Number(existingPayment.amount),
          method: existingPayment.method,
          gatewayRef: existingPayment.gatewayRef,
          transactionCode: existingPayment.purchase_transactions.transactionCode,
          customerEmail: existingPayment.purchase_transactions.users.email,
        },
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    // TODO: Send notification to customer about payment status change
    // if (notifyCustomer) {
    //   await sendPaymentStatusNotification({
    //     email: existingPayment.purchase_transactions.users.email,
    //     paymentId: id,
    //     status,
    //     reason,
    //   });
    // }

    return successResponse(
      {
        payment: updatedPayment,
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
      `Payment status updated to ${status}`
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'admin/payments/status-update',
      userId: (event.context as any).user?.userId,
      paymentId: event.context.params?.id,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while updating payment status",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
