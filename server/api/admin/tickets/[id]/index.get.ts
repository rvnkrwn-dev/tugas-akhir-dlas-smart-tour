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
  id: z.string().uuid("Invalid ticket ID format"),
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

    const { id } = validation.data;

    // Get ticket with full details
    const ticket = await prisma.tickets.findUnique({
      where: { id },
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
                    city: true,
                    country: true,
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
                adultPrice: true,
                childPrice: true,
                operatingHours: true,
                durationMinutes: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!ticket) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Ticket not found",
        data: errorResponse("Ticket not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Calculate ticket summary
    const ticketSummary = ticket.ticket_details.reduce(
      (acc, detail) => {
        acc.totalQty += detail.totalQty;
        acc.usedQty += detail.usedQty;
        acc.remainingQty += detail.remainingQty;
        acc.uniqueAttractions += 1;
        return acc;
      },
      {
        totalQty: 0,
        usedQty: 0,
        remainingQty: 0,
        uniqueAttractions: 0,
      }
    );

    // Check ticket validity
    const now = new Date();
    const isValid =
      ticket.status === "ACTIVE" || ticket.status === "PARTIALLY_USED";
    const isExpired = ticket.validUntil ? ticket.validUntil < now : false;
    const isNotYetValid = ticket.validFrom ? ticket.validFrom > now : false;
    const canBeUsed =
      isValid && !isExpired && !isNotYetValid && ticketSummary.remainingQty > 0;

    // Get usage history from activity logs
    const usageHistory = await prisma.activity_logs.findMany({
      where: {
        entityType: "TICKET",
        entityId: id,
        action: { in: ["USE_TICKET", "VALIDATE_TICKET", "SCAN_TICKET"] },
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
      take: 50,
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "VIEW_TICKET_DETAIL",
        entityType: "TICKET",
        entityId: id,
        description: `${currentUser.role} viewed ticket ${ticket.ticketCode}`,
        metadata: {
          ticketCode: ticket.ticketCode,
          status: ticket.status,
          usedCount: ticket.usedCount,
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
          ...ticketSummary,
          usedCount: ticket.usedCount,
          usagePercentage:
            ticketSummary.totalQty > 0
              ? Number(
                ((ticketSummary.usedQty / ticketSummary.totalQty) * 100).toFixed(
                  2
                )
              )
              : 0,
        },
        validity: {
          isValid,
          isExpired,
          isNotYetValid,
          canBeUsed,
          status: ticket.status,
          validFrom: ticket.validFrom,
          validUntil: ticket.validUntil,
        },
        usageHistory,
      },
      "Ticket details retrieved successfully"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'admin/tickets/detail',
      userId: (event.context as any).user?.userId,
      ticketId: event.context.params?.id,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while fetching ticket details",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
