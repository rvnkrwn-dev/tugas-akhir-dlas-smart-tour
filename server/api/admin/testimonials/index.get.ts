import { z } from "zod";
import { getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireAdmin } from "~~/server/utils/auth";
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
    status: z.enum(["APPROVED", "PENDING", "REJECTED"]).optional(),
    isPublished: z
        .string()
        .optional()
        .transform((val) => {
            if (val === undefined || val === null || val === "") return undefined;
            return val === "true";
        }),
    minRating: z.coerce.number().int().min(1).max(5).optional(),
    sortBy: z.enum(["createdAt", "rating"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export default defineEventHandler(async (event) => {
    // Auth check
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
        isPublished,
        minRating,
        sortBy,
        sortOrder,
    } = validation.data;

    // Build where clause
    const where: any = {};

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { comment: { contains: search } },
            { location: { contains: search } },
        ];
    }

    if (status) {
        where.status = status;
    }

    if (isPublished !== undefined) {
        where.isPublished = isPublished;
    }

    if (minRating) {
        where.rating = { gte: minRating };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Run queries in parallel for performance
    const [totalTestimonials, testimonials] = await Promise.all([
        prisma.testimonials.count({ where }),
        prisma.testimonials.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
        }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalTestimonials / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Log activity (fire and forget)
    prisma.activity_logs.create({
        data: {
            userId: currentUser.userId,
            userRole: currentUser.role,
            action: "VIEW_TESTIMONIALS_LIST",
            entityType: "TESTIMONIAL",
            description: "Admin viewed testimonials list",
            metadata: {
                filters: { status, isPublished, minRating, search },
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
            testimonials,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalTestimonials,
                limit,
                hasNextPage,
                hasPrevPage,
            },
        },
        "Testimonials retrieved successfully",
    );
});
