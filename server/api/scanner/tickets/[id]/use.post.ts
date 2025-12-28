import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireScanner } from "~~/server/utils/auth";
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
  id: z.string().uuid("Invalid ticket ID format"),
});

// Zod Schema for request body
const useTicketSchema = z.object({
  attractionId: z.string().uuid("Invalid attraction ID"),
  quantity: z.coerce.number().int().min(1).default(1),
  notes: z.string().max(500).optional(),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require scanner role
    const currentUser = requireScanner(event);

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
    const validation = useTicketSchema.safeParse(body);

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

    const { attractionId, quantity, notes } = validation.data;

    // Check for idempotency key to prevent duplicate usage
    const idempotencyKey = getHeader(event, 'x-idempotency-key');

    if (idempotencyKey) {
      // Check if this usage already happened (simple approach)
      const recentUsages = await prisma.activity_logs.findMany({
        where: {
          action: 'USE_TICKET',
          entityId: id,
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      // Check if any recent usage has the same idempotency key
      const existingUsage = recentUsages.find(log =>
        log.metadata &&
        typeof log.metadata === 'object' &&
        (log.metadata as any).idempotencyKey === idempotencyKey
      );

      if (existingUsage && existingUsage.metadata) {
        // Return the previous result
        const previousResult = (existingUsage.metadata as any).result;
        if (previousResult) {
          return successResponse(
            previousResult,
            "Ticket already used (idempotent)"
          );
        }
      }
    }

    // Get ticket with details
    const existingTicket = await prisma.tickets.findUnique({
      where: { id },
      include: {
        ticket_details: {
          where: {
            attractionId,
          },
        },
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

    if (!existingTicket) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Ticket not found",
        data: errorResponse("Ticket not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Check if ticket detail exists for this attraction
    if (existingTicket.ticket_details.length === 0) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Invalid attraction",
        data: errorResponse(
          "This ticket is not valid for the specified attraction",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    const ticketDetail = existingTicket.ticket_details[0]!;

    // Validate ticket can be used
    const now = new Date();

    // Check ticket status
    if (
      existingTicket.status !== "ACTIVE" &&
      existingTicket.status !== "PARTIALLY_USED"
    ) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Cannot use ticket",
        data: errorResponse(
          `Ticket cannot be used (status: ${existingTicket.status})`,
          ERROR_CODES.VALIDATION_ERROR,
          {
            currentStatus: existingTicket.status,
          },
        ),
      });
    }

    // Check transaction status
    if (existingTicket.purchase_transactions.status !== "COMPLETED") {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Transaction not completed",
        data: errorResponse(
          "Transaction must be completed before using ticket",
          ERROR_CODES.VALIDATION_ERROR,
          {
            transactionStatus: existingTicket.purchase_transactions.status,
          },
        ),
      });
    }

    // Check validity dates
    if (existingTicket.validFrom && existingTicket.validFrom > now) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Ticket not yet valid",
        data: errorResponse(
          `Ticket is not yet valid (valid from: ${existingTicket.validFrom.toISOString()})`,
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    if (existingTicket.validUntil && existingTicket.validUntil < now) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Ticket expired",
        data: errorResponse(
          `Ticket has expired (expired on: ${existingTicket.validUntil.toISOString()})`,
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    // Check remaining quantity
    if (ticketDetail.remainingQty < quantity) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Insufficient tickets",
        data: errorResponse(
          `Not enough remaining tickets (available: ${ticketDetail.remainingQty}, requested: ${quantity})`,
          ERROR_CODES.VALIDATION_ERROR,
          {
            remainingQty: ticketDetail.remainingQty,
            requestedQty: quantity,
          },
        ),
      });
    }

    // Use ticket in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update ticket detail
      const updatedTicketDetail = await tx.ticket_details.update({
        where: { id: ticketDetail.id },
        data: {
          usedQty: ticketDetail.usedQty + quantity,
          remainingQty: ticketDetail.remainingQty - quantity,
          updatedAt: new Date(),
        },
      });

      // Get all ticket details to calculate total remaining
      const allTicketDetails = await tx.ticket_details.findMany({
        where: { ticketId: id },
      });

      const totalRemaining = allTicketDetails.reduce(
        (sum, detail) =>
          sum +
          (detail.id === ticketDetail.id
            ? updatedTicketDetail.remainingQty
            : detail.remainingQty),
        0
      );

      // Determine new ticket status
      let newStatus = existingTicket.status;
      if (totalRemaining === 0) {
        newStatus = "FULLY_USED";
      } else if (existingTicket.status === "ACTIVE") {
        newStatus = "PARTIALLY_USED";
      }

      // Update ticket
      const updatedTicket = await tx.tickets.update({
        where: { id },
        data: {
          status: newStatus,
          usedCount: existingTicket.usedCount + quantity,
          usedAt: new Date(),
          updatedAt: new Date(),
        },
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
                      phone: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return updatedTicket;
    });

    // Get attraction details
    const attraction = await prisma.attractions.findUnique({
      where: { id: attractionId },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
      },
    });

    // Calculate summary first for activity log
    const summary = result.ticket_details.reduce(
      (acc, detail) => {
        acc.totalQty += detail.totalQty;
        acc.usedQty += detail.usedQty;
        acc.remainingQty += detail.remainingQty;
        return acc;
      },
      {
        totalQty: 0,
        usedQty: 0,
        remainingQty: 0,
      }
    );

    const responseData = {
      ticket: result,
      usage: {
        attractionId,
        attractionName: attraction?.name || null,
        quantityUsed: quantity,
        previousRemainingQty: ticketDetail.remainingQty,
        newRemainingQty: ticketDetail.remainingQty - quantity,
        previousStatus: existingTicket.status,
        newStatus: result.status,
        usedAt: result.usedAt,
        usedBy: {
          userId: currentUser.userId,
          email: currentUser.email,
          role: currentUser.role,
        },
        notes: notes || null,
      },
      summary: {
        ...summary,
        totalUsedCount: result.usedCount,
        usagePercentage:
          summary.totalQty > 0
            ? Number(((summary.usedQty / summary.totalQty) * 100).toFixed(2))
            : 0,
      },
    };

    // Log activity with result for idempotency
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "USE_TICKET",
        entityType: "TICKET",
        entityId: id,
        description: `Scanner used ${quantity} ticket(s) for ${attraction?.name || "attraction"}`,
        metadata: {
          ticketCode: result.ticketCode,
          attractionId,
          attractionName: attraction?.name || null,
          quantity,
          notes: notes || null,
          previousStatus: existingTicket.status,
          newStatus: result.status,
          previousUsedCount: existingTicket.usedCount,
          newUsedCount: result.usedCount,
          previousRemainingQty: ticketDetail.remainingQty,
          newRemainingQty: ticketDetail.remainingQty - quantity,
          customerEmail: result.purchase_transactions.users.email,
          transactionCode: result.purchase_transactions.transactionCode,
          idempotencyKey: idempotencyKey || null,
          result: responseData, // Store result for idempotency
        },
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    return successResponse(
      responseData,
      `Ticket used successfully (${quantity} ticket${quantity > 1 ? "s" : ""})`
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'scanner/use-ticket',
      userId: (event.context as any).user?.userId,
      ticketId: event.context.params?.id,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while using ticket",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
