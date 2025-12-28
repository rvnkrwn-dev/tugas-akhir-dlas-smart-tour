import { z } from 'zod'
import { prisma } from '~~/server/lib/prisma'
import { requireAdmin } from '~~/server/utils/auth'
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '~~/server/utils/response'
import { rateLimit, RateLimitPresets } from '~~/server/utils/rateLimit'

const createHotspotSchema = z.object({
    sceneId: z.string().min(1),
    type: z.enum(['info', 'loket', 'navigate']),
    pitch: z.number().default(0),
    yaw: z.number().default(0),
    title: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
    productId: z.string().optional().nullable(),
    targetSceneId: z.string().optional().nullable()
})

export default defineEventHandler(async (event) => {
    await rateLimit(RateLimitPresets.API_ADMIN)(event)
    requireAdmin(event)

    const body = await readBody(event)
    const validation = createHotspotSchema.safeParse(body)

    if (!validation.success) {
        throw createError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: 'Validation Error',
            data: validation.error.issues
        })
    }

    const data = validation.data

    try {
        const hotspot = await prisma.tour_hotspots.create({
            data: {
                sceneId: data.sceneId,
                type: data.type,
                pitch: data.pitch,
                yaw: data.yaw,
                title: data.title,
                description: data.description,
                icon: data.icon,
                productId: data.productId,
                targetSceneId: data.targetSceneId
            }
        })

        setResponseStatus(event, HTTP_STATUS.CREATED)
        return successResponse(hotspot, 'Hotspot created successfully')
    } catch (error) {
        console.error('Create Hotspot Error:', error)
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: 'Failed to create hotspot'
        })
    }
})
