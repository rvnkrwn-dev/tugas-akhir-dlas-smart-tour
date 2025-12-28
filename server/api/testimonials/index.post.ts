import { z } from 'zod'
import { prisma } from '~~/server/lib/prisma'
import { requireUser } from '~~/server/utils/auth'
import { notifyReviewSubmitted } from '~~/server/utils/notification'
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS,
} from '~~/server/utils/response'
import { rateLimit, RateLimitPresets } from '~~/server/utils/rateLimit'
import { logError } from '~~/server/utils/logger'

// Zod Schema for request body
const createTestimonialSchema = z.object({
    rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must not exceed 1000 characters'),
})

export default defineEventHandler(async (event) => {
    // Apply rate limiting
    await rateLimit(RateLimitPresets.API_GENERAL)(event)

    try {
        // Require authentication
        const currentUser = requireUser(event)

        // Parse and validate request body
        const body = await readBody(event)
        const validation = createTestimonialSchema.safeParse(body)

        if (!validation.success) {
            const errors = validation.error.issues.map((err: any) => ({
                field: err.path.join('.'),
                message: err.message,
            }))

            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                statusMessage: 'Validation Error',
                data: errorResponse('Validation failed', ERROR_CODES.VALIDATION_ERROR, {
                    errors,
                }),
            })
        }

        const { rating, comment } = validation.data

        // Get user profile for name and location
        const userProfile = await prisma.user_profiles.findUnique({
            where: { userId: currentUser.userId },
            select: {
                firstName: true,
                lastName: true,
                city: true,
            },
        })

        // Construct name from profile or use email
        const name = userProfile?.firstName && userProfile?.lastName
            ? `${userProfile.firstName} ${userProfile.lastName}`
            : currentUser.email.split('@')[0]

        const location = userProfile?.city || 'Indonesia'

        // Create testimonial (initially inactive for moderation)
        const testimonial = await prisma.testimonials.create({
            data: {
                name,
                location,
                rating,
                comment,
                status: 'PENDING',
                isPublished: false,
            },
            select: {
                id: true,
                name: true,
                location: true,
                rating: true,
                comment: true,
                status: true,
                isPublished: true,
                createdAt: true,
            },
        })

        // Log activity
        await prisma.activity_logs.create({
            data: {
                userId: currentUser.userId,
                userRole: currentUser.role,
                action: 'CREATE_TESTIMONIAL',
                entityType: 'TESTIMONIAL',
                entityId: testimonial.id,
                description: `User submitted a testimonial with rating ${rating}`,
                metadata: {
                    rating,
                    commentLength: comment.length,
                },
                ipAddress: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '0.0.0.0',
                userAgent: getHeader(event, 'user-agent') || null,
            },
        })

        // Send notification to admins
        notifyReviewSubmitted(name, location, rating).catch(err =>
            console.error('Failed to send testimonial notification:', err)
        )

        return successResponse(
            {
                testimonial,
                message: 'Testimonial submitted successfully. It will be visible after admin approval.',
            },
            'Testimonial created successfully'
        )
    } catch (error: any) {
        // If it's already a H3Error, rethrow it
        if (error.statusCode) {
            throw error
        }

        // Log unexpected errors
        logError(error, {
            context: 'testimonials/create',
            userId: (event.context as any).user?.userId,
        })

        // Return generic error
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: 'Internal server error',
            data: errorResponse(
                'An unexpected error occurred while creating testimonial',
                ERROR_CODES.INTERNAL_ERROR
            ),
        })
    }
})
