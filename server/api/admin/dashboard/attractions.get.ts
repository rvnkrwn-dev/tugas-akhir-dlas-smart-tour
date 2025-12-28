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
import { defineAdminHandler } from "~~/server/utils/handler";

const querySchema = z.object({
    period: z.enum(["7d", "30d", "90d", "1y", "all"]).default("30d"),
});

const toNumber = (val: unknown, fallback = 0): number => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === "bigint") return Number(val);
    if (typeof val === "number") return Number.isFinite(val) ? val : fallback;
    if (typeof val === "string") {
        const n = Number(val);
        return Number.isFinite(n) ? n : fallback;
    }

    // Prisma Decimal guard
    if (typeof val === "object") {
        // @ts-expect-error runtime guard
        if (typeof val?.toNumber === "function") return val.toNumber();
        if (typeof val?.toString === "function") {
            const n = Number(val.toString());
            return Number.isFinite(n) ? n : fallback;
        }
    }

    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
};

function getStartDate(period: "7d" | "30d" | "90d" | "1y" | "all"): Date | undefined {
    const now = new Date();
    switch (period) {
        case "7d":
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "30d":
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case "90d":
            return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case "1y":
            return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        case "all":
            return undefined;
    }
}

export default defineAdminHandler(async (event, currentUser) => {
    // Parse query params
    const query = getQuery(event);
    const validation = querySchema.safeParse(query);

    if (!validation.success) {
        const errors = validation.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
        }));

        throw createError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            statusMessage: "Validation Error",
            data: errorResponse("Validation failed", ERROR_CODES.VALIDATION_ERROR, { errors }),
        });
    }

    const { period } = validation.data;
    const startDate = getStartDate(period);

    const dateFilter = startDate ? { gte: startDate } : undefined;

    // Dipakai di raw SQL (pt.createdAt filter)
    const dateQueryFragment = startDate
        ? Prisma.sql`AND pt.createdAt >= ${startDate}`
        : Prisma.empty;

    // ===== ATTRACTIONS OVERVIEW =====
    const [totalAttractions, activeAttractions, inactiveAttractions] = await Promise.all([
        prisma.attractions.count(),
        prisma.attractions.count({ where: { isActive: true } }),
        prisma.attractions.count({ where: { isActive: false } }),
    ]);

    // ===== ATTRACTIONS BY TYPE =====
    const attractionsByType = await prisma.attractions.groupBy({
        by: ["type"],
        _count: { id: true },
        where: { isActive: true },
    });

    const activeCount = toNumber(activeAttractions);

    const typeDistribution = attractionsByType.map((item) => {
        const count = toNumber(item._count.id);
        return {
            type: item.type || "UNKNOWN",
            count,
            percentage: activeCount > 0 ? Number(((count / activeCount) * 100).toFixed(2)) : 0,
        };
    });

    // ===== TOP PERFORMING ATTRACTIONS BY REVENUE =====
    // FIX: CAST SUM(quantity) supaya tidak BigInt
    const topByRevenue = await prisma.$queryRaw<
        Array<{
            attractionId: string;
            attractionName: string;
            type: string | null;
            revenue: unknown;
            ticketsSold: unknown;
        }>
    >(Prisma.sql`
      SELECT
        a.id as attractionId,
        a.name as attractionName,
        a.type,
        SUM(ti.totalPrice) as revenue,
        CAST(SUM(ti.quantity) AS UNSIGNED) as ticketsSold
      FROM transaction_items ti
      INNER JOIN attractions a ON ti.attractionId = a.id
      INNER JOIN purchase_transactions pt ON ti.transactionId = pt.id
      WHERE pt.status = 'COMPLETED'
        ${dateQueryFragment}
      GROUP BY a.id, a.name, a.type
      ORDER BY revenue DESC
      LIMIT 10
    `);

    const topRevenueAttractions = topByRevenue.map((item) => ({
        id: item.attractionId,
        name: item.attractionName,
        type: item.type || "UNKNOWN",
        revenue: toNumber(item.revenue),
        ticketsSold: toNumber(item.ticketsSold),
    }));

    // ===== TOP PERFORMING ATTRACTIONS BY TICKETS SOLD =====
    const topByTickets = await prisma.$queryRaw<
        Array<{
            attractionId: string;
            attractionName: string;
            type: string | null;
            ticketsSold: unknown;
            revenue: unknown;
        }>
    >(Prisma.sql`
      SELECT
        a.id as attractionId,
        a.name as attractionName,
        a.type,
        CAST(SUM(ti.quantity) AS UNSIGNED) as ticketsSold,
        SUM(ti.totalPrice) as revenue
      FROM transaction_items ti
      INNER JOIN attractions a ON ti.attractionId = a.id
      INNER JOIN purchase_transactions pt ON ti.transactionId = pt.id
      WHERE pt.status = 'COMPLETED'
        ${dateQueryFragment}
      GROUP BY a.id, a.name, a.type
      ORDER BY ticketsSold DESC
      LIMIT 10
    `);

    const topTicketAttractions = topByTickets.map((item) => ({
        id: item.attractionId,
        name: item.attractionName,
        type: item.type || "UNKNOWN",
        ticketsSold: toNumber(item.ticketsSold),
        revenue: toNumber(item.revenue),
    }));

    // ===== LEAST PERFORMING ATTRACTIONS =====
    const leastPerforming = await prisma.$queryRaw<
        Array<{
            attractionId: string;
            attractionName: string;
            type: string | null;
            ticketsSold: unknown;
            revenue: unknown;
        }>
    >(Prisma.sql`
      SELECT
        a.id as attractionId,
        a.name as attractionName,
        a.type,
        CAST(COALESCE(SUM(ti.quantity), 0) AS UNSIGNED) as ticketsSold,
        COALESCE(SUM(ti.totalPrice), 0) as revenue
      FROM attractions a
      LEFT JOIN transaction_items ti ON a.id = ti.attractionId
        AND EXISTS (
          SELECT 1 FROM purchase_transactions pt
          WHERE pt.id = ti.transactionId
            AND pt.status = 'COMPLETED'
            ${dateQueryFragment}
        )
      WHERE a.isActive = true
      GROUP BY a.id, a.name, a.type
      ORDER BY ticketsSold ASC, revenue ASC
      LIMIT 10
    `);

    const leastPerformingAttractions = leastPerforming.map((item) => ({
        id: item.attractionId,
        name: item.attractionName,
        type: item.type || "UNKNOWN",
        ticketsSold: toNumber(item.ticketsSold),
        revenue: toNumber(item.revenue),
    }));

    // ===== ATTRACTIONS WITH NO SALES =====
    const rawAttractionsWithNoSales = await prisma.attractions.findMany({
        where: {
            isActive: true,
            transaction_items: {
                none: {
                    purchase_transactions: {
                        status: "COMPLETED",
                        ...(dateFilter ? { createdAt: dateFilter } : {}),
                    },
                },
            },
        },
        select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            adultPrice: true,
            childPrice: true,
            createdAt: true,
        },
        take: 10,
    });

    const attractionsWithNoSales = rawAttractionsWithNoSales.map((attr) => ({
        ...attr,
        adultPrice: toNumber(attr.adultPrice),
        childPrice: attr.childPrice ? toNumber(attr.childPrice) : null,
    }));

    // ===== AVERAGE TICKET PRICE BY ATTRACTION =====
    // FIX: HAVING jangan pakai alias -> pakai SUM(ti.quantity) > 0
    const avgPriceByAttraction = await prisma.$queryRaw<
        Array<{
            attractionId: string;
            attractionName: string;
            avgPrice: unknown;
            ticketsSold: unknown;
        }>
    >(Prisma.sql`
      SELECT
        a.id as attractionId,
        a.name as attractionName,
        AVG(ti.unitPrice) as avgPrice,
        CAST(SUM(ti.quantity) AS UNSIGNED) as ticketsSold
      FROM transaction_items ti
      INNER JOIN attractions a ON ti.attractionId = a.id
      INNER JOIN purchase_transactions pt ON ti.transactionId = pt.id
      WHERE pt.status = 'COMPLETED'
        ${dateQueryFragment}
      GROUP BY a.id, a.name
      HAVING SUM(ti.quantity) > 0
      ORDER BY ticketsSold DESC
      LIMIT 20
    `);

    const priceAnalysis = avgPriceByAttraction.map((item) => {
        const avgPrice = toNumber(item.avgPrice);
        const ticketsSold = toNumber(item.ticketsSold);
        return {
            id: item.attractionId,
            name: item.attractionName,
            averagePrice: avgPrice,
            ticketsSold,
            totalRevenue: avgPrice * ticketsSold,
        };
    });

    // ===== TICKET TYPE DISTRIBUTION PER ATTRACTION =====
    // groupBy Prisma aman karena quantity Int, tapi tetap convert output
    const ticketTypeDistribution = await prisma.transaction_items.groupBy({
        by: ["attractionId", "ticketType"],
        _sum: { quantity: true, totalPrice: true },
        where: {
            purchase_transactions: {
                status: "COMPLETED",
                ...(dateFilter ? { createdAt: dateFilter } : {}),
            },
        },
    });

    const ticketTypeByAttraction = ticketTypeDistribution.reduce((acc, item) => {
        if (!acc[item.attractionId]) acc[item.attractionId] = [];
        acc[item.attractionId]!.push({
            type: item.ticketType,
            quantity: toNumber(item._sum.quantity),
            revenue: toNumber(item._sum.totalPrice),
        });
        return acc;
    }, {} as Record<string, Array<{ type: string; quantity: number; revenue: number }>>);

    // Top 5 attractions with ticket type breakdown
    const topAttractionsWithTypes = await Promise.all(
        topByRevenue.slice(0, 5).map(async (item) => {
            const attraction = await prisma.attractions.findUnique({
                where: { id: item.attractionId },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    adultPrice: true,
                    childPrice: true,
                },
            });

            const safeAttraction = attraction
                ? {
                    ...attraction,
                    adultPrice: toNumber(attraction.adultPrice),
                    childPrice: attraction.childPrice ? toNumber(attraction.childPrice) : null,
                }
                : null;

            return {
                attraction: safeAttraction,
                ticketTypes: ticketTypeByAttraction[item.attractionId] || [],
                totalRevenue: toNumber(item.revenue),
                totalTicketsSold: toNumber(item.ticketsSold),
            };
        })
    );

    // ===== CAPACITY UTILIZATION =====
    // FIX: CAST capacity + SUM quantity supaya tidak BigInt
    const capacityUtilization = await prisma.$queryRaw<
        Array<{
            attractionId: string;
            attractionName: string;
            capacity: unknown;
            ticketsSold: unknown;
        }>
    >(Prisma.sql`
      SELECT
        a.id as attractionId,
        a.name as attractionName,
        CAST(a.capacity AS UNSIGNED) as capacity,
        CAST(COALESCE(SUM(ti.quantity), 0) AS UNSIGNED) as ticketsSold
      FROM attractions a
      LEFT JOIN transaction_items ti ON a.id = ti.attractionId
        AND EXISTS (
          SELECT 1 FROM purchase_transactions pt
          WHERE pt.id = ti.transactionId
            AND pt.status = 'COMPLETED'
            ${dateQueryFragment}
        )
      WHERE a.isActive = true AND a.capacity IS NOT NULL
      GROUP BY a.id, a.name, a.capacity
      ORDER BY a.capacity DESC
      LIMIT 20
    `);

    const utilizationAnalysis = capacityUtilization.map((item) => {
        const utilizationRate = toNumber(item.ticketsSold) > 0 && toNumber(item.capacity) > 0
            ? (toNumber(item.ticketsSold) / toNumber(item.capacity)) * 100
            : 0;

        return {
            id: item.attractionId,
            name: item.attractionName,
            capacity: toNumber(item.capacity),
            ticketsSold: toNumber(item.ticketsSold),
            utilizationRate: Number(utilizationRate.toFixed(2)),
        };
    });

    // ===== TOTAL METRICS (dari topByRevenue) =====
    const totalRevenue = topByRevenue.reduce((sum, item) => sum + toNumber(item.revenue), 0);
    const totalTicketsSold = topByRevenue.reduce(
        (sum, item) => sum + toNumber(item.ticketsSold),
        0
    );

    return successResponse(
        {
            overview: {
                totalAttractions: toNumber(totalAttractions),
                activeAttractions: toNumber(activeAttractions),
                inactiveAttractions: toNumber(inactiveAttractions),
                activePercentage:
                    totalAttractions > 0
                        ? Number(((toNumber(activeAttractions) / toNumber(totalAttractions)) * 100).toFixed(2))
                        : 0,
                totalRevenue,
                totalTicketsSold,
            },
            typeDistribution,
            topPerformers: {
                byRevenue: topRevenueAttractions,
                byTickets: topTicketAttractions,
                withTicketTypes: topAttractionsWithTypes,
            },
            leastPerforming: leastPerformingAttractions,
            noSales: attractionsWithNoSales,
            priceAnalysis,
            capacityUtilization: utilizationAnalysis,
            period,
        },
        "Attractions statistics retrieved successfully"
    );
});
