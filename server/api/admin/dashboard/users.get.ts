import { prisma } from "~~/server/lib/prisma";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { defineAdminHandler } from "~~/server/utils/handler";
import { getHeader } from "h3";
import { Prisma } from "~~/generated/prisma/client";

export default defineAdminHandler(async (event, currentUser) => {
    // Get total users count
    const totalUsers = await prisma.users.count();

    // Get active users count
    const activeUsers = await prisma.users.count({
        where: { isActive: true },
    });

    // Get inactive users count
    const inactiveUsers = await prisma.users.count({
        where: { isActive: false },
    });

    // Get verified users count
    const verifiedUsers = await prisma.users.count({
        where: { isEmailVerified: true },
    });

    // Get unverified users count
    const unverifiedUsers = await prisma.users.count({
        where: { isEmailVerified: false },
    });

    // Get users by role
    const usersByRole = await prisma.users.groupBy({
        by: ["role"],
        _count: {
            id: true,
        },
    });

    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await prisma.users.count({
        where: {
            createdAt: {
                gte: thirtyDaysAgo,
            },
        },
    });

    // Get new users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsersLast7Days = await prisma.users.count({
        where: {
            createdAt: {
                gte: sevenDaysAgo,
            },
        },
    });

    // Get users who logged in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const loggedInToday = await prisma.users.count({
        where: {
            lastLoginAt: {
                gte: today,
            },
        },
    });

    // Get users who logged in last 7 days
    const loggedInLast7Days = await prisma.users.count({
        where: {
            lastLoginAt: {
                gte: sevenDaysAgo,
            },
        },
    });

    // Get users who never logged in
    const neverLoggedIn = await prisma.users.count({
        where: {
            lastLoginAt: null,
        },
    });

    // Get users with purchases
    const usersWithPurchases = await prisma.users.count({
        where: {
            purchase_transactions: {
                some: {
                    status: "COMPLETED",
                },
            },
        },
    });

    // Get user growth by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const usersByMonth = await prisma.$queryRaw<
        Array<{ month: string; count: bigint }>
    >`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as count
      FROM users
      WHERE createdAt >= ${sixMonthsAgo}
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC
    `;

    // Convert BigInt to Number for JSON serialization
    const userGrowth = usersByMonth.map((item) => ({
        month: item.month,
        count: Number(item.count),
    }));

    // Format role statistics
    const roleStatistics = usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.id;
        return acc;
    }, {} as Record<string, number>);

    // Log activity
    await prisma.activity_logs.create({
        data: {
            userId: currentUser.userId,
            userRole: currentUser.role,
            action: "VIEW_USER_STATISTICS",
            entityType: "USER",
            description: "Admin viewed user statistics",
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
                totalUsers,
                activeUsers,
                inactiveUsers,
                verifiedUsers,
                unverifiedUsers,
                usersWithPurchases,
            },
            byRole: roleStatistics,
            newUsers: {
                last7Days: newUsersLast7Days,
                last30Days: newUsersLast30Days,
            },
            loginActivity: {
                loggedInToday,
                loggedInLast7Days,
                neverLoggedIn,
            },
            growth: userGrowth,
            percentages: {
                activePercentage:
                    totalUsers > 0
                        ? Number(((activeUsers / totalUsers) * 100).toFixed(2))
                        : 0,
                verifiedPercentage:
                    totalUsers > 0
                        ? Number(((verifiedUsers / totalUsers) * 100).toFixed(2))
                        : 0,
                withPurchasesPercentage:
                    totalUsers > 0
                        ? Number(((usersWithPurchases / totalUsers) * 100).toFixed(2))
                        : 0,
            },
        },
        "User statistics retrieved successfully",
    );
});
