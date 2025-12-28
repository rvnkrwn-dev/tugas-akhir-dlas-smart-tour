import { z } from 'zod'
import { prisma } from '~~/server/lib/prisma'
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS,
} from '~~/server/utils/response'
import { rateLimit, RateLimitPresets } from '~~/server/utils/rateLimit'
import { logError } from '~~/server/utils/logger'
import { notifyNewInboxMessage } from '~~/server/utils/notification'

// Zod Schema for request body
const createInboxSchema = z.object({
    fullName: z.string().min(3, 'Full name is required').max(255),
    email: z.string().email('Invalid email address').max(320),
    phone: z.string().min(9, 'Invalid phone number').max(20),
    subject: z.string().min(5, 'Subject is required').max(255),
    message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export default defineEventHandler(async (event) => {
    // Apply rate limiting
    await rateLimit(RateLimitPresets.API_GENERAL)(event)

    try {
        // Parse and validate request body
        const body = await readBody(event)
        const validation = createInboxSchema.safeParse(body)

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

        const { fullName, email, phone, subject, message } = validation.data

        // Create inbox message
        const inboxMessage = await prisma.inbox.create({
            data: {
                fullName,
                email,
                phone,
                subject,
                message,
                isRead: false,
            },
        })

        // Notify admins asynchronously
        notifyNewInboxMessage(fullName, email, subject, inboxMessage.id).catch((err) => {
            console.error('[Inbox Notification Error]:', err)
        })

        return successResponse(
            null,
            'Message sent successfully'
        )
    } catch (error: any) {
        // If it's already a H3Error, rethrow it
        if (error.statusCode) {
            throw error
        }

        // Log unexpected errors
        logError(error, {
            context: 'inbox/create',
        })

        // Return generic error
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: 'Internal server error',
            data: errorResponse(
                'An unexpected error occurred while sending message',
                ERROR_CODES.INTERNAL_ERROR
            ),
        })
    }
})
