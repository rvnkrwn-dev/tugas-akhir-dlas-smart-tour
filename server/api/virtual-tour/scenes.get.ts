import type { Scene } from '~/types/virtual-tour'
import { prisma } from '~~/server/lib/prisma'
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS,
} from "~~/server/utils/response";
import { rateLimit, RateLimitPresets } from "~~/server/utils/rateLimit";
import { logError } from "~~/server/utils/logger";

export default defineEventHandler(async (event) => {
    // Apply rate limiting
    await rateLimit(RateLimitPresets.API_GENERAL)(event);

    try {
        // Fetch active scenes from DB
        const dbScenes = await prisma.tour_scenes.findMany({
            where: { isActive: true },
            include: {
                hotspots: true,
                target_hotspots: {
                    select: { sceneId: true } // to know which scenes link to this one
                }
            },
            orderBy: { sequence: 'asc' }
        })

        // 2. Fetch related products for 'loket' hotspots
        const productIds = dbScenes.flatMap(s => s.hotspots)
            .filter(h => h.type === 'loket' && h.productId)
            .map(h => h.productId!)

        const products = await prisma.attractions.findMany({
            where: {
                OR: [
                    { id: { in: productIds } },
                    { slug: { in: productIds } }
                ]
            },
            select: {
                id: true,
                slug: true,
                name: true,
                adultPrice: true,
                childPrice: true,
                imageUrl: true
            }
        })

        const productMap = new Map(products.map(p => [p.id, p]))
        const productSlugMap = new Map(products.map(p => [p.slug, p]))

        const scenes: Scene[] = dbScenes.map(scene => {
            // Calculate adjacent scenes based on hotspots pointing to other scenes
            // AND other scenes pointing to this scene
            const outgoing = scene.hotspots
                .filter(h => h.type === 'navigate' && h.targetSceneId)
                .map(h => h.targetSceneId!)

            const incoming = scene.target_hotspots.map(h => h.sceneId)

            const allAdjacent = [...outgoing, ...incoming]
            const uniqueAdjacent = [...new Set(allAdjacent)]

            return {
                id: scene.id,
                name: scene.name,
                description: scene.description || '',
                imageUrlLow: scene.imageUrlLow,
                imageUrlHigh: scene.imageUrlHigh,
                defaultYaw: scene.defaultYaw,
                defaultPitch: scene.defaultPitch,
                hfov: scene.hfov,
                sequence: scene.sequence,
                adjacentScenes: uniqueAdjacent,
                hotspots: scene.hotspots.map(h => {
                    // Attach product data if available
                    let productDetails = undefined
                    let tickets: any[] = []

                    if (h.type === 'loket' && h.productId) {
                        const p = productMap.get(h.productId) || productSlugMap.get(h.productId)
                        if (p) {
                            productDetails = {
                                id: p.id,
                                name: p.name,
                                price: Number(p.adultPrice),
                                image: p.imageUrl,
                                slug: p.slug
                            }

                            // Generate tickets
                            tickets.push({
                                id: `${p.id}-adult`,
                                productId: p.id,
                                name: `${p.name} (Adult)`,
                                description: `General admission for ${p.name}`,
                                price: Number(p.adultPrice),
                                type: 'adult',
                                available: true,
                                maxQuantity: 10,
                                image: p.imageUrl || undefined
                            })

                            if (p.childPrice) {
                                tickets.push({
                                    id: `${p.id}-child`,
                                    productId: p.id,
                                    name: `${p.name} (Child)`,
                                    description: `Child admission for ${p.name}`,
                                    price: Number(p.childPrice),
                                    type: 'child',
                                    available: true,
                                    maxQuantity: 10,
                                    image: p.imageUrl || undefined
                                })
                            }
                        }
                    }

                    return {
                        id: h.id,
                        type: h.type,
                        pitch: h.pitch,
                        yaw: h.yaw,
                        title: h.title,
                        description: h.description || undefined,
                        icon: h.icon || undefined,
                        productId: h.productId || undefined,
                        targetSceneId: h.targetSceneId || undefined,
                        product: productDetails,
                        tickets: tickets.length > 0 ? tickets : undefined
                    }
                })
            }
        })

        return successResponse(scenes, "Scenes retrieved successfully");

    } catch (error: any) {
        // If it's already a H3Error, rethrow it
        if (error.statusCode) {
            throw error;
        }

        logError(error, {
            context: 'virtual-tour/scenes',
        })

        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: "Internal server error",
            data: errorResponse(
                "An unexpected error occurred while fetching scenes",
                ERROR_CODES.INTERNAL_ERROR
            ),
        })
    }
})
