import { z } from "zod";
import { getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { defineAdminHandler } from "~~/server/utils/handler";

// Zod Schema for query params
const querySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y", "all"]).default("30d"),
});

export default defineAdminHandler(async (event, currentUser) => {
    // Parse query params
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

    const { period } = validation.data;

    // Calculate date range based on period
    let startDate: Date | undefined;
    const now = new Date();

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "all":
        startDate = undefined;
        break;
    }

    const dateFilter = startDate ? { gte: startDate } : undefined;

    // Get total tickets count
    const totalTickets = await prisma.tickets.count({
      where: dateFilter ? { createdAt: dateFilter } : undefined,
    });

    // Get tickets by status
    const ticketsByStatus = await prisma.tickets.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
      _sum: {
        usedCount: true,
      },
      where: dateFilter ? { createdAt: dateFilter } : undefined,
    });

    // Format status statistics
    const statusStats = ticketsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = {
          count: item._count.id,
          totalUsedCount: item._sum.usedCount || 0,
        };
        return acc;
      },
      {} as Record<string, { count: number; totalUsedCount: number }>
    );

    // Get active tickets count
    const activeTickets = await prisma.tickets.count({
      where: {
        status: "ACTIVE",
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    });

    // Get expired tickets count
    const expiredTickets = await prisma.tickets.count({
      where: {
        status: "EXPIRED",
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    });

    // Get used tickets (fully used or partially used)
    const usedTickets = await prisma.tickets.count({
      where: {
        status: { in: ["PARTIALLY_USED", "FULLY_USED"] },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    });

    // Get cancelled/refunded tickets
    const cancelledTickets = await prisma.tickets.count({
      where: {
        status: { in: ["CANCELLED", "REFUNDED"] },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    });

    // Get today's ticket usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUsage = await prisma.tickets.aggregate({
      _count: true,
      _sum: {
        usedCount: true,
      },
      where: {
        usedAt: { gte: today },
      },
    });

    // Get yesterday's usage for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayUsage = await prisma.tickets.aggregate({
      _count: true,
      _sum: {
        usedCount: true,
      },
      where: {
        usedAt: {
          gte: yesterday,
          lt: today,
        },
      },
    });

    // Get tickets by attraction
    const ticketsByAttraction = await prisma.ticket_details.groupBy({
      by: ["attractionId"],
      _count: {
        id: true,
      },
      _sum: {
        totalQty: true,
        usedQty: true,
        remainingQty: true,
      },
      where: dateFilter
        ? {
          tickets: {
            createdAt: dateFilter,
          },
        }
        : undefined,
      orderBy: {
        _sum: {
          totalQty: "desc",
        },
      },
      take: 10,
    });

    // Get attraction details for top attractions
    const topAttractions = await Promise.all(
      ticketsByAttraction.map(async (item) => {
        const attraction = await prisma.attractions.findUnique({
          where: { id: item.attractionId },
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            imageUrl: true,
          },
        });

        return {
          attraction,
          ticketCount: item._count.id,
          totalQty: item._sum.totalQty || 0,
          usedQty: item._sum.usedQty || 0,
          remainingQty: item._sum.remainingQty || 0,
          usageRate:
            item._sum.totalQty && item._sum.totalQty > 0
              ? Number(
                (
                  ((item._sum.usedQty || 0) / item._sum.totalQty) *
                  100
                ).toFixed(2)
              )
              : 0,
        };
      })
    );

    // Get ticket usage trend (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const usageTrend = await prisma.$queryRaw<
      Array<{ date: string; count: bigint; usedCount: bigint }>
    >`
      SELECT
        DATE(usedAt) as date,
        COUNT(DISTINCT id) as count,
        SUM(usedCount) as usedCount
      FROM tickets
      WHERE usedAt >= ${thirtyDaysAgo}
        AND usedAt IS NOT NULL
      GROUP BY DATE(usedAt)
      ORDER BY date ASC
    `;

    // Convert BigInt to Number for JSON serialization
    const usageTrendFormatted = usageTrend.map((item) => ({
      date: item.date,
      count: Number(item.count),
      usedCount: Number(item.usedCount),
    }));

    // Get ticket creation trend (last 30 days)
    const creationTrend = await prisma.$queryRaw<
      Array<{ date: string; count: bigint }>
    >`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM tickets
      WHERE createdAt >= ${thirtyDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;

    const creationTrendFormatted = creationTrend.map((item) => ({
      date: item.date,
      count: Number(item.count),
    }));

    // Get tickets expiring soon (next 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringSoon = await prisma.tickets.count({
      where: {
        status: { in: ["ACTIVE", "PARTIALLY_USED"] },
        validUntil: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
    });

    // Calculate usage metrics
    const todayUsageCount = todayUsage._sum.usedCount || 0;
    const yesterdayUsageCount = yesterdayUsage._sum.usedCount || 0;
    const usageGrowth =
      yesterdayUsageCount > 0
        ? Number(
          (
            ((todayUsageCount - yesterdayUsageCount) / yesterdayUsageCount) *
            100
          ).toFixed(2)
        )
        : 0;

    // Calculate utilization rate
    const totalTicketQty = await prisma.ticket_details.aggregate({
      _sum: {
        totalQty: true,
        usedQty: true,
      },
      where: dateFilter
        ? {
          tickets: {
            createdAt: dateFilter,
          },
        }
        : undefined,
    });

    const utilizationRate =
      totalTicketQty._sum.totalQty && totalTicketQty._sum.totalQty > 0
        ? Number(
          (
            ((totalTicketQty._sum.usedQty || 0) /
              totalTicketQty._sum.totalQty) *
            100
          ).toFixed(2)
        )
        : 0;

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "VIEW_TICKET_STATISTICS",
        entityType: "TICKET",
        description: "Admin viewed ticket statistics",
        metadata: {
          period,
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
        overview: {
          totalTickets,
          activeTickets,
          usedTickets,
          expiredTickets,
          cancelledTickets,
          expiringSoon,
          totalTicketQty: totalTicketQty._sum.totalQty || 0,
          totalUsedQty: totalTicketQty._sum.usedQty || 0,
          totalRemainingQty:
            (totalTicketQty._sum.totalQty || 0) -
            (totalTicketQty._sum.usedQty || 0),
        },
        byStatus: statusStats,
        today: {
          tickets: todayUsage._count,
          usedCount: todayUsageCount,
          usageGrowth,
        },
        metrics: {
          utilizationRate,
          activeRate:
            totalTickets > 0
              ? Number(((activeTickets / totalTickets) * 100).toFixed(2))
              : 0,
          usageRate:
            totalTickets > 0
              ? Number(((usedTickets / totalTickets) * 100).toFixed(2))
              : 0,
          cancellationRate:
            totalTickets > 0
              ? Number(((cancelledTickets / totalTickets) * 100).toFixed(2))
              : 0,
        },
        usageTrend: usageTrendFormatted,
        creationTrend: creationTrendFormatted,
        topAttractions,
        period,
      },
      "Ticket statistics retrieved successfully"
    );
});
