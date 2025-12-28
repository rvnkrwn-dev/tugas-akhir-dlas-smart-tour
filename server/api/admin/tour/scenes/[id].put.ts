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

// Zod Schema for update body
const updateSceneSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    imageUrlLow: z.string().min(1).optional(),
    imageUrlHigh: z.string().min(1).optional(),
    defaultPitch: z.number().optional(),
    defaultYaw: z.number().optional(),
    hfov: z.number().optional(),
    isActive: z.boolean().optional(),
    sequence: z.number().int().optional()
})

const paramsSchema = z.object({
    id: z.string().uuid().or(z.string()) // Support both UUID and custom IDs like 'scene1'
})

export default defineEventHandler(async (event: H3Event) => {
    // Apply rate limiting
    await rateLimit(RateLimitPresets.API_ADMIN)(event)

    try {
        // Require admin role
        const currentUser = requireAdmin(event)

        // Validate Params
        const params = await getValidatedRouterParams(event, (params) => paramsSchema.safeParse(params))

        if (!params.success) {
            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                statusMessage: 'Invalid ID',
                data: errorResponse('Invalid Scene ID', ERROR_CODES.VALIDATION_ERROR)
            })
        }

        const { id } = params.data

        // Read and validate body
        const body = await readBody(event)
        const validation = updateSceneSchema.safeParse(body)

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

        // Check availability
        const existing = await prisma.tour_scenes.findUnique({ where: { id } })
        if (!existing) {
            throw createError({
                statusCode: HTTP_STATUS.NOT_FOUND,
                statusMessage: 'Not Found',
                data: errorResponse('Scene not found', ERROR_CODES.NOT_FOUND)
            })
        }

        // Update scene
        const updatedScene = await prisma.tour_scenes.update({
            where: { id },
            data: {
                ...data,
                // Handle optional nulls if needed, or rely on undefined from zod not updating
            }
        })

        return successResponse(
            updatedScene,
            'Scene updated successfully'
        )
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        logError(error, {
            context: 'admin/tour/scenes/update',
            userId: (event.context as any).user?.userId,
            sceneId: event.context.params?.id
        })

        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: 'Internal server error',
            data: errorResponse(
                'Failed to update scene',
                ERROR_CODES.INTERNAL_ERROR
            )
        })
    }
})
