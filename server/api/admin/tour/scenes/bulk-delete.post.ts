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

const bodySchema = z.object({
    sceneIds: z.array(z.string()).min(1, 'At least one scene ID is required')
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

        // Validate Body
        const body = await readValidatedBody(event, (body) => bodySchema.safeParse(body))

        if (!body.success) {
            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                statusMessage: 'Invalid request body',
                data: errorResponse('Invalid scene IDs', ERROR_CODES.VALIDATION_ERROR, body.error.issues)
            })
        }

        const { sceneIds } = body.data

        // Get all scenes to delete (with their images and hotspots)
        const scenesToDelete = await prisma.tour_scenes.findMany({
            where: {
                id: { in: sceneIds }
            },
            include: {
                hotspots: true
            }
        })

        if (scenesToDelete.length === 0) {
            throw createError({
                statusCode: HTTP_STATUS.NOT_FOUND,
                statusMessage: 'Not Found',
                data: errorResponse('No scenes found with provided IDs', ERROR_CODES.NOT_FOUND)
            })
        }

        // Collect all image files to delete
        const deletePromises: Promise<void>[] = []

        for (const scene of scenesToDelete) {
            // Delete low resolution image
            if (scene.imageUrlLow) {
                deletePromises.push(deleteImageFile(scene.imageUrlLow))
            }

            // Delete high resolution image (if different from low)
            if (scene.imageUrlHigh && scene.imageUrlHigh !== scene.imageUrlLow) {
                deletePromises.push(deleteImageFile(scene.imageUrlHigh))
            }
        }

        // Wait for all image deletions to complete (but don't fail if they error)
        await Promise.allSettled(deletePromises)

        // Delete all scenes from database
        // Cascading delete is handled by database/Prisma schema for hotspots
        const deleteResult = await prisma.tour_scenes.deleteMany({
            where: {
                id: { in: sceneIds }
            }
        })

        const totalHotspots = scenesToDelete.reduce((sum, scene) => sum + scene.hotspots.length, 0)

        console.log(`Bulk delete: ${deleteResult.count} scenes deleted with ${totalHotspots} hotspots`)

        return successResponse(
            {
                deletedCount: deleteResult.count,
                deletedScenes: scenesToDelete.map(s => ({ id: s.id, name: s.name }))
            },
            `Successfully deleted ${deleteResult.count} scene(s)`
        )
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        logError(error, {
            context: 'admin/tour/scenes/bulk-delete',
            userId: (event.context as any).user?.userId
        })

        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: 'Internal server error',
            data: errorResponse(
                'Failed to delete scenes',
                ERROR_CODES.INTERNAL_ERROR
            )
        })
    }
})
