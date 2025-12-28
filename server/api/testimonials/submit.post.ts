import { z } from 'zod'
import { prisma } from '~~/server/lib/prisma'
import { notifyReviewSubmitted } from '~~/server/utils/notification'
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS,
} from '~~/server/utils/response'
import { rateLimit, RateLimitPresets } from '~~/server/utils/rateLimit'
import { logError } from '~~/server/utils/logger'

const submitTestimonialSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must not exceed 1000 characters'),
})

export default defineEventHandler(async (event) => {
    // Apply rate limiting
    await rateLimit(RateLimitPresets.API_GENERAL)(event)

    try {
        const body = await readBody(event)
        const validation = submitTestimonialSchema.safeParse(body)

        if (!validation.success) {
            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                statusMessage: 'Validation Error',
                data: errorResponse('Validation failed', ERROR_CODES.VALIDATION_ERROR, {
                    errors: validation.error.issues,
                }),
            })
        }

        const { token, rating, comment } = validation.data

        // Find testimonial by token
        const testimonial = await prisma.testimonials.findFirst({
            where: { token: token }
        })

        if (!testimonial) {
            throw createError({
                statusCode: HTTP_STATUS.NOT_FOUND,
                statusMessage: 'Invalid Token',
                data: errorResponse('Review token is invalid or not found', ERROR_CODES.NOT_FOUND),
            })
        }

        if (testimonial.isCompleted) {
            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                statusMessage: 'Already Submitted',
                data: errorResponse('This review has already been submitted.', ERROR_CODES.VALIDATION_ERROR),
            })
        }

        // Update testimonial
        const updated = await prisma.testimonials.update({
            where: { id: testimonial.id },
            data: {
                rating,
                comment,
                isCompleted: true,
                status: 'PENDING', // Needs approval again if updated? Or just PENDING initially
                updatedAt: new Date()
            }
        })

        // Log activity (system action since no user session might be present)
        // Note: We might not have a userId if they are guest.
        // But we know the name from the placeholder.

        // Send notification
        notifyReviewSubmitted(testimonial.name || 'Guest', testimonial.location || 'Unknown', rating).catch(console.error)

        return successResponse(
            { testimonial: updated },
            'Review submitted successfully'
        )

    } catch (error: any) {
        if (error.statusCode) throw error
        logError(error, { context: 'testimonials/submit' })
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: 'Internal Server Error',
            data: errorResponse('An unexpected error occurred', ERROR_CODES.INTERNAL_ERROR),
        })
    }
})
