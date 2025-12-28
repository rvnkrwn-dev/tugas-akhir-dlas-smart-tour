import { prisma } from '~~/server/lib/prisma'
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS,
} from '~~/server/utils/response'
import { rateLimit, RateLimitPresets } from '~~/server/utils/rateLimit'
import { logError } from '~~/server/utils/logger'

export default defineEventHandler(async (event) => {
    // Apply rate limiting
    await rateLimit(RateLimitPresets.API_GENERAL)(event)

    try {
        const query = getQuery(event)
        const limit = parseInt(query.limit as string) || 6

        const testimonials = await prisma.testimonials.findMany({
            where: {
                isPublished: true,
                status: 'APPROVED'
            },
            orderBy: [
                { createdAt: 'desc' },
            ],
            take: limit,
            select: {
                id: true,
                name: true,
                location: true,
                rating: true,
                comment: true,
                avatarColor: true,
                createdAt: true,
            },
        })

        return successResponse(testimonials, 'Testimonials retrieved successfully')
    } catch (error: any) {
        // If it's already a H3Error, rethrow it
        if (error.statusCode) throw error
        
        logError(error, { context: 'testimonials/list' })
        
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: 'Internal Server Error',
            data: errorResponse(
                'Failed to fetch testimonials',
                ERROR_CODES.INTERNAL_ERROR
            ),
        })
    }
})
