import type { Scene } from '~/types/virtual-tour'
import { prisma } from '~~/server/lib/prisma'

export default defineEventHandler(async (event): Promise<Scene | null> => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Scene ID is required'
        })
    }

    // Find scene with full hotspot data
    const scene = await prisma.tour_scenes.findUnique({
        where: { id },
        include: {
            hotspots: true
        }
    })

    if (!scene) {
        throw createError({
            statusCode: 404,
            message: `Scene not found: ${id}`
        })
    }

    // Compute adjacent scenes
    const adjacentScenes = scene.hotspots
        .map(h => h.targetSceneId)
        .filter((id): id is string => !!id)
    const uniqueAdjacent = [...new Set(adjacentScenes)]

    // Fetch related attractions (products) for 'loket' hotspots
    const productIds = scene.hotspots
        .filter(h => h.type === 'loket' && h.productId)
        .map(h => h.productId!)

    const attractions = productIds.length > 0
        ? await prisma.attractions.findMany({
            where: {
                id: { in: productIds },
                isActive: true
            }
        })
        : []

    const attractionsMap = new Map(attractions.map(a => [a.id, a]))

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
            const mappedHotspot: any = {
                id: h.id,
                type: h.type as any,
                pitch: h.pitch,
                yaw: h.yaw,
                title: h.title,
                targetSceneId: h.targetSceneId || undefined,
                productId: h.productId || undefined,
                icon: h.icon || undefined,
                description: h.description || undefined,
                tickets: []
            }

            if (h.type === 'loket' && h.productId) {
                const attraction = attractionsMap.get(h.productId)
                if (attraction) {
                    mappedHotspot.tickets = [{
                        id: attraction.id,
                        name: attraction.name,
                        description: attraction.shortDescription || attraction.description || '',
                        price: Number(attraction.adultPrice),
                        type: attraction.type || 'Standard',
                        maxQuantity: 10 // Limit for now
                    }]
                }
            }

            return mappedHotspot
        })
    }
})
