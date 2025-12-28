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

  // Get total payments count
  const totalPayments = await prisma.payments.count({
    where: dateFilter ? { createdAt: dateFilter } : undefined,
  });

  // Get payments by status
  const paymentsByStatus = await prisma.payments.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
    _sum: {
      amount: true,
    },
    where: dateFilter ? { createdAt: dateFilter } : undefined,
  });

  // Format status statistics
  const statusStats = paymentsByStatus.reduce(
    (acc, item) => {
      acc[item.status] = {
        count: item._count.id,
        totalAmount: Number(item._sum.amount || 0),
      };
      return acc;
    },
    {} as Record<string, { count: number; totalAmount: number }>
  );

  // Get payments by method
  const paymentsByMethod = await prisma.payments.groupBy({
    by: ["method"],
    _count: {
      id: true,
    },
    _sum: {
      amount: true,
    },
    where: {
      status: "SETTLED",
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
  });

  const methodStats = paymentsByMethod.map((item) => ({
    method: item.method || "UNKNOWN",
    count: item._count.id,
    totalAmount: Number(item._sum.amount || 0),
    percentage:
      totalPayments > 0
        ? Number(((item._count.id / totalPayments) * 100).toFixed(2))
        : 0,
  }));

  // Get settled payments stats
  const settledStats = await prisma.payments.aggregate({
    _sum: {
      amount: true,
    },
    _avg: {
      amount: true,
    },
    _count: true,
    where: {
      status: "SETTLED",
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
  });

  // Get pending payments stats
  const pendingStats = await prisma.payments.aggregate({
    _sum: {
      amount: true,
    },
    _count: true,
    where: {
      status: { in: ["PENDING", "CAPTURED"] },
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
  });

  // Get failed payments stats
  const failedStats = await prisma.payments.aggregate({
    _count: true,
    where: {
      status: { in: ["FAILED", "CANCELLED"] },
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
  });

  // Get refunded payments stats
  const refundedStats = await prisma.payments.aggregate({
    _sum: {
      amount: true,
    },
    _count: true,
    where: {
      status: "REFUNDED",
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
  });

  // Get today's payments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayPayments = await prisma.payments.aggregate({
    _count: true,
    _sum: {
      amount: true,
    },
    where: {
      createdAt: { gte: today },
      status: "SETTLED",
    },
  });

  // Get yesterday's payments for comparison
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayPayments = await prisma.payments.aggregate({
    _count: true,
    _sum: {
      amount: true,
    },
    where: {
      createdAt: {
        gte: yesterday,
        lt: today,
        status: "SETTLED",
      },
    },
  });

  // Get payment trend (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const paymentTrend = await prisma.$queryRaw<
    Array<{ date: string; count: bigint; total: number }>
  >`
    SELECT
      DATE(createdAt) as date,
      COUNT(*) as count,
      SUM(amount) as total
    FROM payments
    WHERE createdAt >= ${thirtyDaysAgo}
      AND status = 'SETTLED'
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `;

  // Convert BigInt to Number for JSON serialization
  const paymentTrendFormatted = paymentTrend.map((item) => ({
    date: item.date,
    count: Number(item.count),
    total: Number(item.total),
  }));

  // Get payment processing time (average time from creation to settlement)
  const recentSettledPayments = await prisma.payments.findMany({
    where: {
      status: "SETTLED",
      paidAt: { not: null },
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
    select: {
      createdAt: true,
      paidAt: true,
    },
    take: 1000,
  });

  const processingTimes = recentSettledPayments
    .filter((p) => p.paidAt)
    .map(
      (p) =>
        (p.paidAt!.getTime() - p.createdAt.getTime()) / 1000 / 60 // in minutes
    );

  const averageProcessingTime =
    processingTimes.length > 0
      ? Number(
        (
          processingTimes.reduce((sum, time) => sum + time, 0) /
          processingTimes.length
        ).toFixed(2)
      )
      : 0;

  // Calculate growth
  const todayAmount = Number(todayPayments._sum.amount || 0);
  const yesterdayAmount = Number(yesterdayPayments._sum.amount || 0);
  const amountGrowth =
    yesterdayAmount > 0
      ? Number(
        (((todayAmount - yesterdayAmount) / yesterdayAmount) * 100).toFixed(
          2
        )
      )
      : 0;

  // Calculate success rate
  const successRate =
    totalPayments > 0
      ? Number(
        (((settledStats._count || 0) / totalPayments) * 100).toFixed(2)
      )
      : 0;

  const failureRate =
    totalPayments > 0
      ? Number(
        (((failedStats._count || 0) / totalPayments) * 100).toFixed(2)
      )
      : 0;

  // Get payment gateway distribution
  const gatewayStats = await prisma.payments.groupBy({
    by: ["method"],
    _count: {
      id: true,
    },
    where: dateFilter ? { createdAt: dateFilter } : undefined,
  });

  const gatewayDistribution = gatewayStats.map((item) => ({
    gateway: item.method || "UNKNOWN",
    count: item._count.id,
    percentage:
      totalPayments > 0
        ? Number(((item._count.id / totalPayments) * 100).toFixed(2))
        : 0,
  }));

  return successResponse(
    {
      overview: {
        totalPayments,
        settledPayments: settledStats._count || 0,
        pendingPayments: pendingStats._count || 0,
        failedPayments: failedStats._count || 0,
        refundedPayments: refundedStats._count || 0,
        totalSettled: Number(settledStats._sum.amount || 0),
        averagePayment: Number(settledStats._avg.amount || 0),
        totalPending: Number(pendingStats._sum.amount || 0),
        totalRefunded: Number(refundedStats._sum.amount || 0),
      },
      byStatus: statusStats,
      byMethod: methodStats,
      today: {
        payments: todayPayments._count,
        amount: todayAmount,
        amountGrowth,
      },
      metrics: {
        successRate,
        failureRate,
        averageProcessingTime: `${averageProcessingTime} minutes`,
        conversionRate:
          totalPayments > 0
            ? Number(
              (
                ((settledStats._count || 0) / totalPayments) *
                100
              ).toFixed(2)
            )
            : 0,
      },
      paymentTrend: paymentTrendFormatted,
      gatewayDistribution,
      period,
    },
    "Payment statistics retrieved successfully"
  );
});
