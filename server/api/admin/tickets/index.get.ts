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

// Zod Schema for query params
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
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
  userId: z.string().uuid().optional(),
  transactionId: z.string().uuid().optional(),
  attractionId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z
    .enum(["createdAt", "visitDateFrom", "ticketCode", "usedCount"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require admin role
    const currentUser = requireAdmin(event);

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

    const {
      page,
      limit,
      search,
      status,
      userId,
      transactionId,
      attractionId,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = validation.data;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { ticketCode: { contains: search } },
        { qrCode: { contains: search } },
        {
          purchase_transactions: {
            OR: [
              { transactionCode: { contains: search } },
              {
                users: {
                  OR: [
                    { email: { contains: search } },
                    {
                      user_profiles: {
                        OR: [
                          { firstName: { contains: search } },
                          { lastName: { contains: search } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (transactionId) {
      where.transactionId = transactionId;
    }

    if (userId) {
      where.purchase_transactions = {
        userId,
      };
    }

    if (attractionId) {
      where.ticket_details = {
        some: {
          attractionId,
        },
      };
    }

    if (startDate || endDate) {
      where.visitDateFrom = {};
      if (startDate) {
        where.visitDateFrom.gte = new Date(startDate);
      }
      if (endDate) {
        where.visitDateFrom.lte = new Date(endDate);
      }
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
      select: {
        id: true,
        ticketCode: true,
        qrCode: true,
        visitDateFrom: true,
        visitDateTo: true,
        status: true,
        validFrom: true,
        validUntil: true,
        usedAt: true,
        usedCount: true,
        createdAt: true,
        updatedAt: true,
        purchase_transactions: {
          select: {
            id: true,
            transactionCode: true,
            totalAmount: true,
            currency: true,
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
        ticket_details: {
          select: {
            id: true,
            attractionId: true,
            ticketType: true,
            totalQty: true,
            usedQty: true,
            remainingQty: true,
            visitDate: true,
            timeSlot: true,
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
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalTickets / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Calculate summary for current page
    const pageSummary = tickets.reduce(
      (acc, ticket) => {
        acc.statusCount[ticket.status] = (acc.statusCount[ticket.status] || 0) + 1;
        acc.totalUsedCount += ticket.usedCount;
        const totalQty = ticket.ticket_details.reduce(
          (sum, detail) => sum + detail.totalQty,
          0
        );
        acc.totalTicketQty += totalQty;
        return acc;
      },
      {
        statusCount: {} as Record<string, number>,
        totalUsedCount: 0,
        totalTicketQty: 0,
      }
    );

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "VIEW_TICKETS_LIST",
        entityType: "TICKET",
        description: "Admin viewed tickets list",
        metadata: {
          filters: {
            status,
            userId,
            transactionId,
            attractionId,
            search,
            startDate,
            endDate,
          },
          page,
          limit,
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
        tickets,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalTickets,
          limit,
          hasNextPage,
          hasPrevPage,
        },
        summary: pageSummary,
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
      context: 'admin/tickets/list',
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
