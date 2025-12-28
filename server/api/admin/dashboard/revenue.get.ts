import { Prisma } from "~~/generated/prisma/client";
import { z } from "zod";
import { getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { logError } from "~~/server/utils/logger";
import { getCache, CacheKeys } from "~~/server/utils/cache";
import { defineAdminHandler } from "~~/server/utils/handler";

// Zod Schema for query params
const querySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y", "all"]).default("30d"),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
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

  const { period, groupBy } = validation.data;

  // Try to get from cache first
  const cacheKey = CacheKeys.revenueStats(`${period}-${groupBy}`);
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    return successResponse(cached, "Revenue analytics retrieved successfully (cached)");
  }

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

  // ===== REVENUE OVERVIEW =====
  const revenueOverview = await prisma.purchase_transactions.aggregate({
    _sum: { totalAmount: true },
    _avg: { totalAmount: true },
    _count: true,
    where: {
      status: "COMPLETED",
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
  });

  // ===== REVENUE BY STATUS =====
  const revenueByStatus = await prisma.purchase_transactions.groupBy({
    by: ["status"],
    _sum: { totalAmount: true },
    _count: { id: true },
    where: dateFilter ? { createdAt: dateFilter } : undefined,
  });

  const statusBreakdown = revenueByStatus.map((item) => ({
    status: item.status,
    revenue: Number(item._sum.totalAmount || 0),
    count: item._count.id,
  }));

  // ===== REVENUE TREND =====
  let revenueTrend: Array<{ period: string; revenue: number; count: number }> =
    [];

  if (groupBy === "day") {
    const dailyRevenue = await prisma.$queryRaw<
      Array<{ date: string; total: number; count: bigint }>
    >`
      SELECT
        DATE(createdAt) as date,
        SUM(totalAmount) as total,
        COUNT(*) as count
      FROM purchase_transactions
      WHERE status = 'COMPLETED'
        ${startDate ? Prisma.sql`AND createdAt >= ${startDate}` : Prisma.empty}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;

    revenueTrend = dailyRevenue.map((item) => ({
      period: item.date,
      revenue: Number(item.total),
      count: Number(item.count),
    }));
  } else if (groupBy === "week") {
    const weeklyRevenue = await prisma.$queryRaw<
      Array<{ week: string; total: number; count: bigint }>
    >`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%u') as week,
        SUM(totalAmount) as total,
        COUNT(*) as count
      FROM purchase_transactions
      WHERE status = 'COMPLETED'
        ${startDate ? Prisma.sql`AND createdAt >= ${startDate}` : Prisma.empty}
      GROUP BY DATE_FORMAT(createdAt, '%Y-%u')
      ORDER BY week ASC
    `;

    revenueTrend = weeklyRevenue.map((item) => ({
      period: item.week,
      revenue: Number(item.total),
      count: Number(item.count),
    }));
  } else if (groupBy === "month") {
    const monthlyRevenue = await prisma.$queryRaw<
      Array<{ month: string; total: number; count: bigint }>
    >`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        SUM(totalAmount) as total,
        COUNT(*) as count
      FROM purchase_transactions
      WHERE status = 'COMPLETED'
        ${startDate ? Prisma.sql`AND createdAt >= ${startDate}` : Prisma.empty}
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC
    `;

    revenueTrend = monthlyRevenue.map((item) => ({
      period: item.month,
      revenue: Number(item.total),
      count: Number(item.count),
    }));
  }

  // ===== REVENUE BY ATTRACTION TYPE =====
  const revenueByAttractionType = await prisma.$queryRaw<
    Array<{ type: string; total: number; count: bigint }>
  >`
    SELECT
      a.type,
      SUM(ti.totalPrice) as total,
      COUNT(DISTINCT ti.transactionId) as count
    FROM transaction_items ti
    INNER JOIN attractions a ON ti.attractionId = a.id
    INNER JOIN purchase_transactions pt ON ti.transactionId = pt.id
    WHERE pt.status = 'COMPLETED'
      ${startDate ? Prisma.sql`AND pt.createdAt >= ${startDate}` : Prisma.empty}
    GROUP BY a.type
    ORDER BY total DESC
  `;

  const attractionTypeBreakdown = revenueByAttractionType.map((item) => ({
    type: item.type || "UNKNOWN",
    revenue: Number(item.total),
    transactionCount: Number(item.count),
  }));

  // ===== TOP REVENUE ATTRACTIONS =====
  const topRevenueAttractions = await prisma.$queryRaw<
    Array<{
      attractionId: string;
      attractionName: string;
      total: number;
      count: bigint;
    }>
  >`
    SELECT
      a.id as attractionId,
      a.name as attractionName,
      SUM(ti.totalPrice) as total,
      COUNT(*) as count
    FROM transaction_items ti
    INNER JOIN attractions a ON ti.attractionId = a.id
    INNER JOIN purchase_transactions pt ON ti.transactionId = pt.id
    WHERE pt.status = 'COMPLETED'
      ${startDate ? Prisma.sql`AND pt.createdAt >= ${startDate}` : Prisma.empty}
    GROUP BY a.id, a.name
    ORDER BY total DESC
    LIMIT 10
  `;

  const topAttractions = topRevenueAttractions.map((item) => ({
    attractionId: item.attractionId,
    name: item.attractionName,
    revenue: Number(item.total),
    ticketsSold: Number(item.count),
  }));

  // ===== REVENUE BY TICKET TYPE =====
  const revenueByTicketType = await prisma.transaction_items.groupBy({
    by: ["ticketType"],
    _sum: { totalPrice: true },
    _count: { id: true },
    where: {
      purchase_transactions: {
        status: "COMPLETED",
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    },
  });

  const ticketTypeBreakdown = revenueByTicketType.map((item) => ({
    type: item.ticketType,
    revenue: Number(item._sum.totalPrice || 0),
    count: item._count.id,
  }));

  // ===== REVENUE BY PAYMENT METHOD =====
  const revenueByPaymentMethod = await prisma.payments.groupBy({
    by: ["method"],
    _sum: { amount: true },
    _count: { id: true },
    where: {
      status: "SETTLED",
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
  });

  const paymentMethodBreakdown = revenueByPaymentMethod.map((item) => ({
    method: item.method || "UNKNOWN",
    revenue: Number(item._sum.amount || 0),
    count: item._count.id,
  }));

  // ===== TOP CUSTOMERS BY REVENUE =====
  const topCustomers = await prisma.purchase_transactions.groupBy({
    by: ["userId"],
    _sum: { totalAmount: true },
    _count: { id: true },
    where: {
      status: "COMPLETED",
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
    orderBy: {
      _sum: {
        totalAmount: "desc",
      },
    },
    take: 10,
  });

  const topCustomersWithDetails = await Promise.all(
    topCustomers.map(async (customer) => {
      const user = await prisma.users.findUnique({
        where: { id: customer.userId },
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
      });

      return {
        user,
        totalRevenue: Number(customer._sum.totalAmount || 0),
        transactionCount: customer._count.id,
        averageOrderValue:
          customer._count.id > 0
            ? Number(
              (
                Number(customer._sum.totalAmount || 0) / customer._count.id
              ).toFixed(2)
            )
            : 0,
      };
    })
  );

  // ===== CALCULATE METRICS =====
  const totalRevenue = Number(revenueOverview._sum.totalAmount || 0);
  const averageOrderValue = Number(revenueOverview._avg.totalAmount || 0);
  const totalOrders = revenueOverview._count;

  // Get previous period for comparison
  let previousPeriodRevenue = 0;
  if (startDate) {
    const periodLength = now.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);

    const previousRevenue = await prisma.purchase_transactions.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    });

    previousPeriodRevenue = Number(previousRevenue._sum.totalAmount || 0);
  }

  const revenueGrowth =
    previousPeriodRevenue > 0
      ? Number(
        (
          ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) *
          100
        ).toFixed(2)
      )
      : 0;

  return successResponse(
    {
      overview: {
        totalRevenue,
        averageOrderValue,
        totalOrders,
        revenueGrowth,
        previousPeriodRevenue,
      },
      trend: revenueTrend,
      byStatus: statusBreakdown,
      byAttractionType: attractionTypeBreakdown,
      byTicketType: ticketTypeBreakdown,
      byPaymentMethod: paymentMethodBreakdown,
      topAttractions,
      topCustomers: topCustomersWithDetails,
      period,
      groupBy,
    },
    "Revenue analytics retrieved successfully"
  );
});
