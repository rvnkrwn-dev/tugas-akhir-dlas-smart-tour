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
      "ACTIVE",
      "PARTIALLY_USED",
      "FULLY_USED",
      "EXPIRED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
  upcoming: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["createdAt", "visitDateFrom", "usedCount"])
    .default("createdAt"),
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

    const { page, limit, status, upcoming, sortBy, sortOrder } =
      validation.data;

    // Build where clause
    const where: any = {
      purchase_transactions: {
        userId: currentUser.userId,
      },
    };

    if (status) {
      where.status = status;
    }

    // Filter upcoming tickets
    if (upcoming) {
      const now = new Date();
      where.visitDateFrom = {
        gte: now,
      };
      where.status = {
        in: ["ACTIVE", "PARTIALLY_USED"],
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalTickets = await prisma.tickets.count({ where });

    // Get tickets
    const tickets = await prisma.tickets.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
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

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalTickets / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Calculate summary
    const now = new Date();
    const summary = tickets.reduce(
      (acc, ticket) => {
        acc.statusCount[ticket.status] = (acc.statusCount[ticket.status] || 0) + 1;
        acc.totalTickets += 1;

        const totalQty = ticket.ticket_details.reduce(
          (sum, detail) => sum + detail.totalQty,
          0
        );
        const usedQty = ticket.ticket_details.reduce(
          (sum, detail) => sum + detail.usedQty,
          0
        );
        const remainingQty = ticket.ticket_details.reduce(
          (sum, detail) => sum + detail.remainingQty,
          0
        );

        acc.totalQuantity += totalQty;
        acc.totalUsed += usedQty;
        acc.totalRemaining += remainingQty;

        // Count upcoming tickets
        if (
          ticket.visitDateFrom &&
          ticket.visitDateFrom >= now &&
          (ticket.status === "ACTIVE" || ticket.status === "PARTIALLY_USED")
        ) {
          acc.upcomingTickets += 1;
        }

        // Count expired tickets
        if (ticket.status === "EXPIRED") {
          acc.expiredTickets += 1;
        }

        return acc;
      },
      {
        totalTickets: 0,
        totalQuantity: 0,
        totalUsed: 0,
        totalRemaining: 0,
        upcomingTickets: 0,
        expiredTickets: 0,
        statusCount: {} as Record<string, number>,
      }
    );

    // Enhance tickets with validity info
    const enhancedTickets = tickets.map((ticket) => {
      const isValid =
        ticket.status === "ACTIVE" || ticket.status === "PARTIALLY_USED";
      const isExpired = ticket.validUntil ? ticket.validUntil < now : false;
      const isNotYetValid = ticket.validFrom ? ticket.validFrom > now : false;

      const totalQty = ticket.ticket_details.reduce(
        (sum, detail) => sum + detail.totalQty,
        0
      );
      const remainingQty = ticket.ticket_details.reduce(
        (sum, detail) => sum + detail.remainingQty,
        0
      );

      const canBeUsed =
        isValid && !isExpired && !isNotYetValid && remainingQty > 0;

      return {
        ...ticket,
        validity: {
          isValid,
          isExpired,
          isNotYetValid,
          canBeUsed,
        },
      };
    });

    return successResponse(
      {
        tickets: enhancedTickets,
        pagination: {
          currentPage: page,
          totalPages,
          totalTickets,
          limit,
          hasNextPage,
          hasPrevPage,
        },
        summary,
      },
      "Tickets retrieved successfully"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'purchase/my-tickets',
      userId: (event.context as any).user?.userId,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while fetching tickets",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
