import { z } from 'zod'
import { prisma } from '~~/server/lib/prisma'
import { requireAdmin } from '~~/server/utils/auth'
import { successResponse, HTTP_STATUS } from '~~/server/utils/response'
import { rateLimit, RateLimitPresets } from '~~/server/utils/rateLimit'

const updateHotspotSchema = z.object({
    type: z.enum(['info', 'loket', 'navigate']).optional(),
    pitch: z.number().optional(),
    yaw: z.number().optional(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    productId: z.string().optional().nullable(),
    targetSceneId: z.string().optional().nullable()
})

export default defineEventHandler(async (event) => {
    await rateLimit(RateLimitPresets.API_ADMIN)(event)
    requireAdmin(event)

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const validation = updateHotspotSchema.safeParse(body)

    if (!validation.success) {
        throw createError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: 'Validation Error'
        })
    }

    try {
        const hotspot = await prisma.tour_hotspots.update({
            where: { id },
            data: validation.data
        })

        return successResponse(hotspot, 'Hotspot updated successfully')
    } catch (error) {
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: 'Failed to update hotspot'
        })
    }
})
