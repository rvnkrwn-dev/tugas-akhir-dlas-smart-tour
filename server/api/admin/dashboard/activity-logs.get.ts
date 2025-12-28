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

  // Get total activity logs count
  const totalLogs = await prisma.activity_logs.count({
    where: dateFilter ? { createdAt: dateFilter } : undefined,
  });

  // Get logs by action
  const logsByAction = await prisma.activity_logs.groupBy({
    by: ["action"],
    _count: {
      id: true,
    },
    where: dateFilter ? { createdAt: dateFilter } : undefined,
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 20,
  });

  const actionStats = logsByAction.map((item) => ({
    action: item.action,
    count: item._count.id,
    percentage:
      totalLogs > 0
        ? Number(((item._count.id / totalLogs) * 100).toFixed(2))
        : 0,
  }));

  // Get logs by entity type
  const logsByEntityType = await prisma.activity_logs.groupBy({
    by: ["entityType"],
    _count: {
      id: true,
    },
    where: dateFilter ? { createdAt: dateFilter } : undefined,
  });

  const entityTypeStats = logsByEntityType.reduce(
    (acc, item) => {
      if (item.entityType) {
        acc[item.entityType] = item._count.id;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Get logs by user role
  const logsByUserRole = await prisma.activity_logs.groupBy({
    by: ["userRole"],
    _count: {
      id: true,
    },
    where: dateFilter ? { createdAt: dateFilter } : undefined,
  });

  const userRoleStats = logsByUserRole.reduce(
    (acc, item) => {
      if (item.userRole) {
        acc[item.userRole] = item._count.id;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Get today's activity
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayActivity = await prisma.activity_logs.count({
    where: {
      createdAt: { gte: today },
    },
  });

  // Get yesterday's activity for comparison
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayActivity = await prisma.activity_logs.count({
    where: {
      createdAt: {
        gte: yesterday,
        lt: today,
      },
    },
  });

  // Get most active users
  const mostActiveUsers = await prisma.activity_logs.groupBy({
    by: ["userId"],
    _count: {
      id: true,
    },
    where: {
      userId: { not: null },
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 10,
  });

  // Get user details for most active users
  const topUsers = await Promise.all(
    mostActiveUsers
      .filter((item) => item.userId)
      .map(async (item) => {
        const user = await prisma.users.findUnique({
          where: { id: item.userId! },
          select: {
            id: true,
            email: true,
            role: true,
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
          activityCount: item._count.id,
        };
      })
  );

  // Get activity trend (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const activityTrend = await prisma.$queryRaw<
    Array<{ date: string; count: bigint }>
  >`
    SELECT
      DATE(createdAt) as date,
      COUNT(*) as count
    FROM activity_logs
    WHERE createdAt >= ${thirtyDaysAgo}
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `;

  // Convert BigInt to Number for JSON serialization
  const activityTrendFormatted = activityTrend.map((item) => ({
    date: item.date,
    count: Number(item.count),
  }));

  // Get hourly distribution (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const hourlyDistribution = await prisma.$queryRaw<
    Array<{ hour: number; count: bigint }>
  >`
    SELECT
      HOUR(createdAt) as hour,
      COUNT(*) as count
    FROM activity_logs
    WHERE createdAt >= ${sevenDaysAgo}
    GROUP BY HOUR(createdAt)
    ORDER BY hour ASC
  `;

  const hourlyDistributionFormatted = hourlyDistribution.map((item) => ({
    hour: `${String(item.hour).padStart(2, "0")}:00`,
    count: Number(item.count),
  }));

  // Get IP addresses with most activity
  const topIpAddresses = await prisma.activity_logs.groupBy({
    by: ["ipAddress"],
    _count: {
      id: true,
    },
    where: {
      ipAddress: { not: null },
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 10,
  });

  const ipStats = topIpAddresses.map((item) => ({
    ipAddress: item.ipAddress || "UNKNOWN",
    count: item._count.id,
  }));

  // Get failed login attempts (if tracking)
  const failedLogins = await prisma.activity_logs.count({
    where: {
      action: "USER_LOGIN_FAILED",
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
  });

  // Get security events
  const securityEvents = await prisma.activity_logs.count({
    where: {
      action: {
        in: [
          "USER_LOGIN_FAILED",
          "INVALID_TOKEN",
          "UNAUTHORIZED_ACCESS",
          "ACCOUNT_LOCKED",
        ],
      },
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
  });

  // Calculate growth
  const activityGrowth =
    yesterdayActivity > 0
      ? Number(
          (
            ((todayActivity - yesterdayActivity) / yesterdayActivity) *
            100
          ).toFixed(2)
        )
      : 0;

  // Get unique users active
  const uniqueActiveUsers = await prisma.activity_logs.groupBy({
    by: ["userId"],
    where: {
      userId: { not: null },
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
  });

  return successResponse(
    {
      overview: {
        totalLogs,
        todayActivity,
        activityGrowth,
        uniqueActiveUsers: uniqueActiveUsers.length,
        securityEvents,
        failedLogins,
      },
      byAction: actionStats,
      byEntityType: entityTypeStats,
      byUserRole: userRoleStats,
      topUsers,
      activityTrend: activityTrendFormatted,
      hourlyDistribution: hourlyDistributionFormatted,
      topIpAddresses: ipStats,
      period,
    },
    "Activity logs statistics retrieved successfully"
  );
});
