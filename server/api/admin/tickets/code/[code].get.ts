import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireAdmin, isScanner } from "~~/server/utils/auth";
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
  code: z.string().min(1, "Ticket code is required"),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require admin or scanner role
    let currentUser;
    try {
      currentUser = requireAdmin(event);
    } catch {
      // If not admin, check if scanner
      if (!isScanner(event)) {
        throw createError({
          statusCode: HTTP_STATUS.FORBIDDEN,
          statusMessage: "Forbidden",
          data: errorResponse(
            "Admin or Scanner role required",
            ERROR_CODES.FORBIDDEN
          ),
        });
      }
      currentUser = event.context.user!;
    }

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

    const { code } = validation.data;

    // Get ticket by code
    const ticket = await prisma.tickets.findUnique({
      where: { ticketCode: code },
      include: {
        purchase_transactions: {
          select: {
            id: true,
            transactionCode: true,
            totalAmount: true,
            currency: true,
            status: true,
            createdAt: true,
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
          },
        },
        ticket_details: {
          include: {
            attractions: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                imageUrl: true,
                operatingHours: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Ticket not found",
        data: errorResponse(
          "Ticket not found with the provided code",
          ERROR_CODES.NOT_FOUND
        ),
      });
    }

    // Calculate summary
    const summary = ticket.ticket_details.reduce(
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

    // Check validity
    const now = new Date();
    const isValid =
      ticket.status === "ACTIVE" || ticket.status === "PARTIALLY_USED";
    const isExpired = ticket.validUntil ? ticket.validUntil < now : false;
    const isNotYetValid = ticket.validFrom ? ticket.validFrom > now : false;
    const canBeUsed =
      isValid && !isExpired && !isNotYetValid && summary.remainingQty > 0;

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "VIEW_TICKET_BY_CODE",
        entityType: "TICKET",
        entityId: ticket.id,
        description: `${currentUser.role} searched for ticket ${code}`,
        metadata: {
          ticketCode: code,
          status: ticket.status,
          canBeUsed,
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
        ticket,
        summary: {
          ...summary,
          usedCount: ticket.usedCount,
          usagePercentage:
            summary.totalQty > 0
              ? Number(((summary.usedQty / summary.totalQty) * 100).toFixed(2))
              : 0,
        },
        validity: {
          isValid,
          isExpired,
          isNotYetValid,
          canBeUsed,
          message: canBeUsed
            ? "Ticket is valid and can be used"
            : isExpired
              ? "Ticket has expired"
              : isNotYetValid
                ? "Ticket is not yet valid"
                : summary.remainingQty === 0
                  ? "All tickets have been used"
                  : "Ticket cannot be used",
        },
      },
      "Ticket found successfully"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'admin/tickets/by-code',
      userId: (event.context as any).user?.userId,
      code: event.context.params?.code,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while fetching ticket",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
