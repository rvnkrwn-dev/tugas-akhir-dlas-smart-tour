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

const paramsSchema = z.object({
    id: z.string()
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

        // Fetch scene with hotspots and their associated attractions
        const scene = await prisma.tour_scenes.findUnique({
            where: { id },
            include: {
                hotspots: {
                    include: {
                        attraction: true,
                        targetScene: {
                            select: {
                                id: true,
                                name: true,
                                sequence: true
                            }
                        }
                    }
                }
            }
        })

        if (!scene) {
            throw createError({
                statusCode: HTTP_STATUS.NOT_FOUND,
                statusMessage: 'Not Found',
                data: errorResponse('Scene not found', ERROR_CODES.NOT_FOUND)
            })
        }

        return successResponse(
            scene,
            'Scene retrieved successfully'
        )
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        logError(error, {
            context: 'admin/tour/scenes/get',
            userId: (event.context as any).user?.userId,
            sceneId: event.context.params?.id
        })

        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: 'Internal server error',
            data: errorResponse(
                'Failed to retrieve scene',
                ERROR_CODES.INTERNAL_ERROR
            )
        })
    }
})
