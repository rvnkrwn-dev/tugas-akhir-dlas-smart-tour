import { getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { getCache, setCache, CacheKeys, CacheTTL } from "~~/server/utils/cache";
import { defineAdminHandler } from "~~/server/utils/handler";

// --- Types ---
interface TrendItem {
  date: string;
  total: number;
}

interface TopAttractionItem {
  attraction: {
    id: string;
    name: string;
    type: string;
  };
  ticketsSold: number;
  revenue: number;
}

interface OverviewResponse {
  revenue: {
    total: number;
    growth: number;
    trend: TrendItem[];
  };
  users: {
    total: number;
    newToday: number;
  };
  transactions: {
    completed: number;
    pending: number;
    failed: number;
    today: number;
    todayRevenue: number;
    growth: number;
    conversionRate: number;
  };
  tickets: {
    total: number;
    activePercentage: number;
  };
  attractions: {
    active: number;
    total: number;
    topAttractions: TopAttractionItem[];
  };
  payments: {
    settled: number;
    pending: number;
    failed: number;
    total: number;
    todayAmount: number;
    successRate: number;
  };
  recentActivities: any[];
}

// --- Helpers ---

// Generate an array of dates (YYYY-MM-DD) for a given range
const getDateRangeArray = (start: Date, end: Date): string[] => {
  const dates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// Fill missing dates in trend data with 0
const fillTrendData = (
  rawTrend: Array<{ date: string; total: number }>,
  startDate: Date,
  endDate: Date
): TrendItem[] => {
  const allDates = getDateRangeArray(startDate, endDate);
  const dataMap = new Map(rawTrend.map((item) => [item.date, Number(item.total)]));

  return allDates.map((date) => ({
    date,
    total: dataMap.get(date) || 0,
  }));
};

const safelyNumber = (val: any) => Number(val || 0);

export default defineAdminHandler(async (event, currentUser) => {
  // 1. Cache Check
  const cacheKey = CacheKeys.adminDashboardOverview();
  const cached = await getCache<OverviewResponse>(cacheKey);
  if (cached) {
    return successResponse(cached, "Dashboard overview retrieved (cached)");
  }

  // 2. Define Timeframes
  const now = new Date();
  // Normalize "Today" to start of day in server time
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // 30 Days Ago (Start of day)
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // Include today make it 30 days window

  // Previous 30 Days (for comparison)
  const sixtyDaysAgo = new Date(thirtyDaysAgo);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 30);

  // 3. Execute Queries in Parallel
  const [
    // REVENUE
    revenueTotalAgg,
    revCurrent30dAgg,
    revPrevious30dAgg,
    dailyRevenueRaw,

    // USERS
    usersTotal,
    usersNewToday,

    // TRANSACTIONS
    transTotalAgg,
    transCompleted,
    transPending,
    transFailed,
    transToday,
    transTodayRevAgg,
    transCurrent30d,
    transPrevious30d,

    // TICKETS
    ticketsSoldAgg,
    ticketsActiveCount,
    ticketsTotalRecords,

    // ATTRACTIONS
    attrActive,
    attrTotal,
    topAttractionsRaw,

    // PAYMENTS
    paymentsSettled,
    paymentsPending,
    paymentsFailed,
    paymentsTotal,
    paymentsTodayAgg,

    // ACTIVITIES
    recentActivities
  ] = await Promise.all([
    // REVENUE
    prisma.purchase_transactions.aggregate({
      _sum: { totalAmount: true },
      where: { status: "COMPLETED" },
    }),
    prisma.purchase_transactions.aggregate({
      _sum: { totalAmount: true },
      where: { status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.purchase_transactions.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "COMPLETED",
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    prisma.$queryRaw<Array<{ date: string; total: number }>>`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m-%d') as date,
        SUM(totalAmount) as total
      FROM purchase_transactions
      WHERE status = 'COMPLETED'
        AND createdAt >= ${thirtyDaysAgo}
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
      ORDER BY date ASC
    `,

    // USERS
    prisma.users.count(),
    prisma.users.count({ where: { createdAt: { gte: todayStart } } }),

    // TRANSACTIONS
    prisma.purchase_transactions.count(),
    prisma.purchase_transactions.count({ where: { status: "COMPLETED" } }),
    prisma.purchase_transactions.count({ where: { status: "PENDING" } }),
    prisma.purchase_transactions.count({ where: { status: "FAILED" } }),
    prisma.purchase_transactions.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.purchase_transactions.aggregate({
      _sum: { totalAmount: true },
      where: { status: "COMPLETED", createdAt: { gte: todayStart } },
    }),
    prisma.purchase_transactions.count({
      where: { createdAt: { gte: thirtyDaysAgo }, status: "COMPLETED" },
    }),
    prisma.purchase_transactions.count({
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        status: "COMPLETED",
      },
    }),

    // TICKETS
    prisma.transaction_items.aggregate({
      _sum: { quantity: true },
      where: { purchase_transactions: { status: "COMPLETED" } },
    }),
    prisma.tickets.count({ where: { status: "ACTIVE" } }),
    prisma.tickets.count(),

    // ATTRACTIONS
    prisma.attractions.count({ where: { isActive: true } }),
    prisma.attractions.count(),
    prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        type: string;
        sold: number;
        revenue: number;
      }>
    >`
      SELECT
          a.id,
          a.name,
          a.type,
          SUM(ti.quantity) as sold,
          SUM(ti.totalPrice) as revenue
      FROM transaction_items ti
      JOIN attractions a ON ti.attractionId = a.id
      JOIN purchase_transactions pt ON ti.transactionId = pt.id
      WHERE pt.status = 'COMPLETED'
      GROUP BY a.id, a.name, a.type
      ORDER BY sold DESC
      LIMIT 5
    `,

    // PAYMENTS
    prisma.payments.count({
      where: { status: { in: ["SETTLED", "CAPTURED"] } },
    }),
    prisma.payments.count({ where: { status: "PENDING" } }),
    prisma.payments.count({ where: { status: "FAILED" } }),
    prisma.payments.count(),
    prisma.payments.aggregate({
      _sum: { amount: true },
      where: {
        paidAt: { gte: todayStart },
        status: { in: ["SETTLED", "CAPTURED"] },
      },
    }),

    // ACTIVITIES
    prisma.activity_logs.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          select: { email: true, role: true },
        },
      },
    }),
  ]);

  // 4. Process & Format Data

  // Metrics: Revenue
  const totalRevenue = safelyNumber(revenueTotalAgg._sum.totalAmount);
  const revCurrent30d = safelyNumber(revCurrent30dAgg._sum.totalAmount);
  const revPrevious30d = safelyNumber(revPrevious30dAgg._sum.totalAmount);
  const revenueGrowth =
    revPrevious30d > 0
      ? ((revCurrent30d - revPrevious30d) / revPrevious30d) * 100
      : 0; // Default to 0 or 100 depending on logic, keeping 0 for now if no prev revenue

  // Fill trend data with 0s for missing dates
  const revenueTrend = fillTrendData(dailyRevenueRaw, thirtyDaysAgo, new Date()); // Use now() as end to include today

  // Metrics: Transactions
  const transTodayRevenue = safelyNumber(transTodayRevAgg._sum.totalAmount);
  const conversionRate =
    transTotalAgg > 0 ? (transCompleted / transTotalAgg) * 100 : 0;
  const transGrowth =
    transPrevious30d > 0
      ? ((transCurrent30d - transPrevious30d) / transPrevious30d) * 100
      : 0;

  // Metrics: Tickets
  const ticketsTotal = safelyNumber(ticketsSoldAgg._sum.quantity);
  const ticketsActivePercentage =
    ticketsTotalRecords > 0
      ? (ticketsActiveCount / ticketsTotalRecords) * 100
      : 0;

  // Metrics: Attractions
  const topAttractions: TopAttractionItem[] = topAttractionsRaw.map((item) => ({
    attraction: {
      id: item.id,
      name: item.name,
      type: item.type,
    },
    ticketsSold: safelyNumber(item.sold),
    revenue: safelyNumber(item.revenue),
  }));

  // Metrics: Payments
  const paymentsTodayAmount = safelyNumber(paymentsTodayAgg._sum.amount);
  const paymentsSuccessRate =
    paymentsTotal > 0 ? (paymentsSettled / paymentsTotal) * 100 : 0;

  // Construct Response
  const responseData: OverviewResponse = {
    revenue: {
      total: totalRevenue,
      growth: Number(revenueGrowth.toFixed(2)),
      trend: revenueTrend,
    },
    users: {
      total: usersTotal,
      newToday: usersNewToday,
    },
    transactions: {
      completed: transCompleted,
      pending: transPending,
      failed: transFailed,
      today: transToday,
      todayRevenue: transTodayRevenue,
      growth: Number(transGrowth.toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(2)),
    },
    tickets: {
      total: ticketsTotal,
      activePercentage: Number(ticketsActivePercentage.toFixed(2)),
    },
    attractions: {
      active: attrActive,
      total: attrTotal,
      topAttractions,
    },
    payments: {
      settled: paymentsSettled,
      pending: paymentsPending,
      failed: paymentsFailed,
      total: paymentsTotal,
      todayAmount: paymentsTodayAmount,
      successRate: Number(paymentsSuccessRate.toFixed(2)),
    },
    recentActivities,
  };

  // Cache the result
  await setCache(cacheKey, responseData, CacheTTL.SHORT);

  // Logging
  // Use setImmediate or similar if we really want non-blocking, but async/await without await is risky in servless
  // Here we await but catch error
  await prisma.activity_logs.create({
    data: {
      userId: currentUser.userId,
      userRole: currentUser.role,
      action: "VIEW_DASHBOARD",
      entityType: "SYSTEM",
      description: "Details overview dashboard viewed",
      ipAddress:
        getHeader(event, "x-forwarded-for") ||
        getHeader(event, "x-real-ip") ||
        "0.0.0.0",
    },
  }).catch((e) => console.error("Failed to log dashboard view", e));

  return successResponse(
    responseData,
    "Dashboard overview fetched successfully"
  );
});
