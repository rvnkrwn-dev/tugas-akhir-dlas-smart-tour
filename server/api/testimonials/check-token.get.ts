import { z } from 'zod'
import { prisma } from '~~/server/lib/prisma'
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS,
} from '~~/server/utils/response'
import { rateLimit, RateLimitPresets } from '~~/server/utils/rateLimit'

const querySchema = z.object({
    token: z.string().min(1, 'Token is required'),
})

export default defineEventHandler(async (event) => {
    // Apply rate limiting (lighter limit for status checks)
    await rateLimit(RateLimitPresets.API_GENERAL)(event)

    const query = getQuery(event)
    const validation = querySchema.safeParse(query)

    if (!validation.success) {
        throw createError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            statusMessage: 'Token Required',
            data: errorResponse('Token is required', ERROR_CODES.VALIDATION_ERROR),
        })
    }

    const { token } = validation.data

    try {
        const testimonial = await prisma.testimonials.findFirst({
            where: { token: token },
            select: {
                id: true,
                name: true,
                isCompleted: true,
                status: true
            }
        })

        if (!testimonial) {
            throw createError({
                statusCode: HTTP_STATUS.NOT_FOUND,
                statusMessage: 'Invalid Token',
                data: errorResponse('Testimonial token not found', ERROR_CODES.NOT_FOUND),
            })
        }

        return successResponse(
            { testimonial },
            'Token valid'
        )

    } catch (error: any) {
        if (error.statusCode) throw error
        
        logError(error, { context: 'testimonials/check-token' })
        
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: 'Internal Server Error',
            data: errorResponse(error.message, ERROR_CODES.INTERNAL_ERROR),
        })
    }
})
