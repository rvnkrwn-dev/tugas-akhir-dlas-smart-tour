import { prisma } from '~~/server/lib/prisma'
import type { Ticket } from '~/types/virtual-tour'
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
        const query = getQuery(event)
        const sceneId = query.sceneId as string | undefined
        let attractionIds: string[] = []

        if (sceneId) {
            // Get specific scene and its hotspots
            const scene = await prisma.tour_scenes.findUnique({
                where: { id: sceneId },
                include: { hotspots: true }
            })

            if (scene) {
                attractionIds = scene.hotspots
                    .filter(h => h.type === 'loket' && h.productId)
                    .map(h => h.productId!)
            }
        } else {
            // Get all 'loket' hotspots
            const hotspots = await prisma.tour_hotspots.findMany({
                where: {
                    type: 'loket',
                    productId: { not: null }
                },
                select: { productId: true }
            })
            attractionIds = hotspots.map(h => h.productId!)
        }

        // De-duplicate IDs
        attractionIds = [...new Set(attractionIds)]

        if (attractionIds.length === 0) {
            return successResponse([], "No tickets found");
        }

        // Fetch attractions
        const attractions = await prisma.attractions.findMany({
            where: {
                OR: [
                    { id: { in: attractionIds } },
                    { slug: { in: attractionIds } }
                ],
                isActive: true
            }
        })

        // Map to Ticket interface
        const tickets: Ticket[] = []

        attractions.forEach(attraction => {
            // Add Adult Ticket
            tickets.push({
                id: `${attraction.id}-adult`,
                name: `${attraction.name} (Adult)`,
                description: `General admission for ${attraction.name}`,
                price: Number(attraction.adultPrice),
                type: 'adult',
                available: true,
                maxQuantity: 10,
                image: attraction.imageUrl || undefined
            })

            // Add Child Ticket if price exists
            if (attraction.childPrice) {
                tickets.push({
                    id: `${attraction.id}-child`,
                    name: `${attraction.name} (Child)`,
                    description: `Child admission for ${attraction.name}`,
                    price: Number(attraction.childPrice),
                    type: 'child',
                    available: true,
                    maxQuantity: 10,
                    image: attraction.imageUrl || undefined
                })
            }
        })

        return successResponse(tickets, "Tickets retrieved successfully");

    } catch (error: any) {
        // If it's already a H3Error, rethrow it
        if (error.statusCode) {
            throw error;
        }

        logError(error, {
            context: 'virtual-tour/tickets',
        })

        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: "Internal server error",
            data: errorResponse(
                "An unexpected error occurred while fetching tickets",
                ERROR_CODES.INTERNAL_ERROR
            ),
        })
    }
})
