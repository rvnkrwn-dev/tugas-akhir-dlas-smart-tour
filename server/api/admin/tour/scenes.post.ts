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

// Zod Schema for request body
const createSceneSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().optional(),
    imageUrlLow: z.string().min(1, 'Low quality image URL is required'),
    imageUrlHigh: z.string().min(1, 'High quality image URL is required'),
    defaultPitch: z.number().default(0),
    defaultYaw: z.number().default(0),
    hfov: z.number().default(100),
    isActive: z.boolean().default(true),
    sequence: z.number().int().default(0)
})

export default defineEventHandler(async (event: H3Event) => {
    // Apply rate limiting
    await rateLimit(RateLimitPresets.API_ADMIN)(event)

    try {
        // Require admin role
        const currentUser = requireAdmin(event)

        // Read and validate body
        const body = await readBody(event)
        const validation = createSceneSchema.safeParse(body)

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

        const data = validation.data

        // Create scene
        const newScene = await prisma.tour_scenes.create({
            data: {
                name: data.name,
                description: data.description,
                imageUrlLow: data.imageUrlLow,
                imageUrlHigh: data.imageUrlHigh,
                defaultPitch: data.defaultPitch,
                defaultYaw: data.defaultYaw,
                hfov: data.hfov,
                isActive: data.isActive,
                sequence: data.sequence
            }
        })

        setResponseStatus(event, HTTP_STATUS.CREATED)

        return successResponse(
            newScene,
            'Scene created successfully'
        )
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        logError(error, {
            context: 'admin/tour/scenes/create',
            userId: (event.context as any).user?.userId
        })

        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: 'Internal server error',
            data: errorResponse(
                'Failed to create scene',
                ERROR_CODES.INTERNAL_ERROR
            )
        })
    }
})
