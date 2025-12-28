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

    // Get total transactions count
    const totalTransactions = await prisma.purchase_transactions.count({
      where: dateFilter ? { createdAt: dateFilter } : undefined,
    });

    // Get transactions by status
    const transactionsByStatus = await prisma.purchase_transactions.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
      where: dateFilter ? { createdAt: dateFilter } : undefined,
    });

    // Format status statistics
    const statusStats = transactionsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = {
          count: item._count.id,
          revenue: Number(item._sum.totalAmount || 0),
        };
        return acc;
      },
      {} as Record<string, { count: number; revenue: number }>
    );

    // Get total revenue (completed transactions)
    const revenueStats = await prisma.purchase_transactions.aggregate({
      _sum: {
        totalAmount: true,
      },
      _avg: {
        totalAmount: true,
      },
      _count: true,
      where: {
        status: "COMPLETED",
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    });

    // Get pending amount
    const pendingStats = await prisma.purchase_transactions.aggregate({
      _sum: {
        totalAmount: true,
      },
      _count: true,
      where: {
        status: { in: ["PENDING", "PROCESSING"] },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    });

    // Get refunded amount
    const refundedStats = await prisma.purchase_transactions.aggregate({
      _sum: {
        totalAmount: true,
      },
      _count: true,
      where: {
        status: "REFUNDED",
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    });

    // Get failed transactions
    const failedStats = await prisma.purchase_transactions.aggregate({
      _count: true,
      where: {
        status: { in: ["FAILED", "CANCELLED"] },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    });

    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await prisma.purchase_transactions.aggregate({
      _count: true,
      _sum: {
        totalAmount: true,
      },
      where: {
        createdAt: { gte: today },
        status: "COMPLETED",
      },
    });

    // Get yesterday's transactions for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayTransactions = await prisma.purchase_transactions.aggregate({
      _count: true,
      _sum: {
        totalAmount: true,
      },
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
        status: "COMPLETED",
      },
    });

    // Get revenue trend by day (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const revenueTrend = await prisma.$queryRaw<
      Array<{ date: string; count: bigint; total: number }>
    >`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count,
        SUM(totalAmount) as total
      FROM purchase_transactions
      WHERE createdAt >= ${thirtyDaysAgo}
        AND status = 'COMPLETED'
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;

    // Convert BigInt to Number for JSON serialization
    const revenueTrendFormatted = revenueTrend.map((item) => ({
      date: item.date,
      count: Number(item.count),
      total: Number(item.total),
    }));

    // Get top customers by transaction count
    const topCustomers = await prisma.purchase_transactions.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
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

    // Get customer details for top customers
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
          transactionCount: customer._count.id,
          totalSpent: Number(customer._sum.totalAmount || 0),
        };
      })
    );

    // Get payment method statistics
    const paymentMethodStats = await prisma.payments.groupBy({
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

    const paymentMethods = paymentMethodStats.map((item) => ({
      method: item.method || "UNKNOWN",
      count: item._count.id,
      totalAmount: Number(item._sum.amount || 0),
    }));

    // Calculate conversion rate
    const totalAttempts = totalTransactions;
    const successfulTransactions = statusStats.COMPLETED?.count || 0;
    const conversionRate =
      totalAttempts > 0
        ? Number(((successfulTransactions / totalAttempts) * 100).toFixed(2))
        : 0;

    // Calculate growth
    const todayRevenue = Number(todayTransactions._sum.totalAmount || 0);
    const yesterdayRevenue = Number(
      yesterdayTransactions._sum.totalAmount || 0
    );
    const revenueGrowth =
      yesterdayRevenue > 0
        ? Number(
          (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(
            2
          )
        )
        : 0;

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "VIEW_TRANSACTION_STATISTICS",
        entityType: "TRANSACTION",
        description: "Admin viewed transaction statistics",
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
          totalTransactions,
          completedTransactions: statusStats.COMPLETED?.count || 0,
          pendingTransactions: pendingStats._count || 0,
          failedTransactions: failedStats._count || 0,
          refundedTransactions: refundedStats._count || 0,
          totalRevenue: Number(revenueStats._sum.totalAmount || 0),
          averageOrderValue: Number(revenueStats._avg.totalAmount || 0),
          pendingAmount: Number(pendingStats._sum.totalAmount || 0),
          refundedAmount: Number(refundedStats._sum.totalAmount || 0),
        },
        byStatus: statusStats,
        today: {
          transactions: todayTransactions._count,
          revenue: todayRevenue,
          revenueGrowth,
        },
        metrics: {
          conversionRate,
          successRate:
            totalTransactions > 0
              ? Number(
                ((successfulTransactions / totalTransactions) * 100).toFixed(2)
              )
              : 0,
          failureRate:
            totalTransactions > 0
              ? Number(
                (((failedStats._count || 0) / totalTransactions) * 100).toFixed(
                  2
                )
              )
              : 0,
        },
        revenueTrend: revenueTrendFormatted,
        topCustomers: topCustomersWithDetails,
        paymentMethods,
        period,
      },
      "Transaction statistics retrieved successfully"
    );
});
