import { prisma } from '~~/server/lib/prisma'
import { requireAdmin } from '~~/server/utils/auth'
import { successResponse, HTTP_STATUS } from '~~/server/utils/response'
import { rateLimit, RateLimitPresets } from '~~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
    await rateLimit(RateLimitPresets.API_ADMIN)(event)
    requireAdmin(event)

    const id = getRouterParam(event, 'id')

    try {
        await prisma.tour_hotspots.delete({
            where: { id }
        })

        return successResponse(null, 'Hotspot deleted successfully')
    } catch (error) {
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: 'Failed to delete hotspot'
        })
    }
})
