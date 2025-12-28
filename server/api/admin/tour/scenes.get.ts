import { z } from 'zod'
import { H3Event } from 'h3'
import { prisma } from '~~/server/lib/prisma'
import { requireAdmin } from '~~/server/utils/auth'
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS
} from '~~/server/utils/response'
import { rateLimit, RateLimitPresets } from '~~/server/utils/rateLimit'
import { logError } from '~~/server/utils/logger'

// Zod Schema for query params
const querySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    isActive: z
        .string()
        .optional()
        .transform((val) => {
            if (val === undefined || val === null || val === '') return undefined
            return val === 'true'
        }),
    sortBy: z.enum(['createdAt', 'name', 'sequence']).default('sequence'),
    sortOrder: z.enum(['asc', 'desc']).default('asc')
})

export default defineEventHandler(async (event: H3Event) => {
    // Apply rate limiting
    await rateLimit(RateLimitPresets.API_ADMIN)(event)

    try {
        // Require admin role
        const currentUser = requireAdmin(event)

        // Parse and validate query params
        const query = getQuery(event)
        const validation = querySchema.safeParse(query)

        if (!validation.success) {
            const errors = validation.error.issues.map((err: any) => ({
                field: err.path.join('.'),
                message: err.message
            }))

            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                statusMessage: 'Validation Error',
                data: errorResponse('Validation failed', ERROR_CODES.VALIDATION_ERROR, {
                    errors
                })
            })
        }

        const { page, limit, search, isActive, sortBy, sortOrder } = validation.data

        // Build where clause
        const where: any = {}

        // Search filter (name)
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } }
            ]
        }

        // Active status filter
        if (isActive !== undefined) {
            where.isActive = isActive
        }

        // Calculate pagination
        const skip = (page - 1) * limit
        const take = limit

        // Build orderBy
        const orderBy: any = {}
        orderBy[sortBy] = sortOrder

        // Fetch scenes with pagination
        const [scenes, total] = await Promise.all([
            prisma.tour_scenes.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    _count: {
                        select: {
                            hotspots: true
                        }
                    }
                }
            }),
            prisma.tour_scenes.count({ where })
        ])

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit)
        const hasNextPage = page < totalPages
        const hasPrevPage = page > 1

        return successResponse(
            {
                scenes,
                pagination: {
                    currentPage: page,
                    limit,
                    totalItems: total,
                    totalPages,
                    hasNextPage,
                    hasPrevPage
                }
            },
            'Scenes retrieved successfully'
        )
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        logError(error, {
            context: 'admin/tour/scenes/list',
            userId: (event.context as any).user?.userId
        })

        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: 'Internal server error',
            data: errorResponse(
                'An unexpected error occurred while fetching scenes',
                ERROR_CODES.INTERNAL_ERROR
            )
        })
    }
})
