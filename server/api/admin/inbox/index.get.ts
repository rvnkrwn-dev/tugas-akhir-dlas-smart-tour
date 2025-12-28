import { z } from "zod";
import { getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { defineAdminHandler } from "~~/server/utils/handler";
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS,
} from "~~/server/utils/response";

// Zod Schema for query params
const querySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    isRead: z
        .string()
        .optional()
        .transform((val) => {
            if (val === undefined || val === null || val === "") return undefined;
            return val === "true";
        }),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(["createdAt", "isRead", "fullName", "email"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export default defineAdminHandler(async (event, currentUser) => {
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
        isRead,
        startDate,
        endDate,
        sortBy,
        sortOrder,
    } = validation.data;

    // Build where clause
    const where: any = {};

    if (search) {
        where.OR = [
            { fullName: { contains: search } },
            { email: { contains: search } },
            { subject: { contains: search } },
            { message: { contains: search } },
        ];
    }

    if (isRead !== undefined) {
        where.isRead = isRead;
    }

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
            where.createdAt.lte = new Date(endDate);
        }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Run queries in parallel for performance
    const [totalMessages, messages, globalTotal, globalUnread] = await Promise.all([
        prisma.inbox.count({ where }),
        prisma.inbox.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
        }),
        prisma.inbox.count(),
        prisma.inbox.count({ where: { isRead: false } }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalMessages / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Log activity (fire and forget)
    prisma.activity_logs.create({
        data: {
            userId: currentUser.userId,
            userRole: currentUser.role,
            action: "VIEW_INBOX_LIST",
            entityType: "INBOX",
            description: "Admin viewed inbox messages list",
            metadata: {
                filters: { isRead, startDate, endDate, search },
                page,
                limit,
            },
            ipAddress:
                getHeader(event, "x-forwarded-for") ||
                getHeader(event, "x-real-ip") ||
                "0.0.0.0",
            userAgent: getHeader(event, "user-agent") || null,
        },
    }).catch((err) => console.error("Failed to log activity:", err));

    return successResponse(
        {
            messages,
            stats: {
                total: globalTotal,
                unread: globalUnread,
            },
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalMessages,
                limit,
                hasNextPage,
                hasPrevPage,
            },
        },
        "Inbox messages retrieved successfully",
    );
});
