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
import { unlink } from 'fs/promises'
import { join } from 'path'

const paramsSchema = z.object({
    id: z.string()
})

/**
 * Helper function to delete image file from filesystem
 */
async function deleteImageFile(imageUrl: string) {
    try {
        // Only delete if it's a local file (starts with /images/)
        if (imageUrl.startsWith('/images/')) {
            const publicDir = join(process.cwd(), 'public')
            const filePath = join(publicDir, imageUrl)
            await unlink(filePath)
            console.log(`Deleted image file: ${filePath}`)
        }
    } catch (error: any) {
        // Log but don't throw - file might already be deleted or not exist
        console.warn(`Failed to delete image file ${imageUrl}:`, error.message)
    }
}

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

        // Check availability and get scene data
        const existing = await prisma.tour_scenes.findUnique({
            where: { id },
            include: {
                hotspots: true // Include hotspots to log deletion
            }
        })

        if (!existing) {
            throw createError({
                statusCode: HTTP_STATUS.NOT_FOUND,
                statusMessage: 'Not Found',
                data: errorResponse('Scene not found', ERROR_CODES.NOT_FOUND)
            })
        }

        // Delete image files before deleting database record
        const deletePromises: Promise<void>[] = []

        // Delete low resolution image
        if (existing.imageUrlLow) {
            deletePromises.push(deleteImageFile(existing.imageUrlLow))
        }

        // Delete high resolution image (if different from low)
        if (existing.imageUrlHigh && existing.imageUrlHigh !== existing.imageUrlLow) {
            deletePromises.push(deleteImageFile(existing.imageUrlHigh))
        }

        // Wait for all image deletions to complete (but don't fail if they error)
        await Promise.allSettled(deletePromises)

        // Delete scene from database
        // Cascading delete is handled by database/Prisma schema for hotspots
        await prisma.tour_scenes.delete({
            where: { id }
        })

        console.log(`Scene deleted: ${existing.name} (ID: ${id}) with ${existing.hotspots.length} hotspots`)

        return successResponse(
            null,
            'Scene deleted successfully'
        )
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        logError(error, {
            context: 'admin/tour/scenes/delete',
            userId: (event.context as any).user?.userId,
            sceneId: event.context.params?.id
        })

        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: 'Internal server error',
            data: errorResponse(
                'Failed to delete scene',
                ERROR_CODES.INTERNAL_ERROR
            )
        })
    }
})
