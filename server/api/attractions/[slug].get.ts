/**
 * GET /api/attractions/:slug
 * Get single attraction details by slug
 * Public endpoint - no authentication required
 */

import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import {
  sanitizeAttractionForResponse,
  checkAttractionAvailability,
} from "~~/server/utils/attraction";
import { getCache, setCache, CacheKeys, CacheTTL } from "~~/server/utils/cache";
import { rateLimit, RateLimitPresets } from "~~/server/utils/rateLimit";
import { logError } from "~~/server/utils/logger";

// Zod Schema for params
const paramsSchema = z.object({
  slug: z.string()
    .min(1, "Slug is required")
    .max(200, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting for public endpoints
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Get and validate slug from params
    const params = event.context.params;
    const validation = paramsSchema.safeParse(params);

    if (!validation.success) {
      const errors = validation.error.issues.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Validation Error",
        data: errorResponse(
          "Invalid attraction slug",
          ERROR_CODES.VALIDATION_ERROR,
          { errors },
        ),
      });
    }

    const { slug } = validation.data;

    // Try to get from cache first
    const cacheKey = CacheKeys.attractionBySlug(slug);
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return successResponse(cached, "Attraction retrieved successfully (cached)");
    }

    // Fetch attraction from database by slug
    const attraction = await prisma.attractions.findUnique({
      where: { slug },
    });

    // Check if attraction exists
    if (!attraction) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Not Found",
        data: errorResponse("Attraction not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Check availability first (before sanitizing)
    const availability = checkAttractionAvailability({
      ...attraction,
      adultPrice: Number(attraction.adultPrice),
      childPrice: attraction.childPrice ? Number(attraction.childPrice) : null,
    } as any);

    // Sanitize data for response
    const sanitizedAttraction = sanitizeAttractionForResponse(attraction);

    // Prepare response data
    const responseData = {
      ...sanitizedAttraction,
      isAvailable: availability.isAvailable,
      availabilityReason: availability.reason || null,
    };

    // Cache the result (15 minutes TTL)
    await setCache(cacheKey, responseData, CacheTTL.LONG);

    // Return response with additional availability info
    return successResponse(
      responseData,
      "Attraction retrieved successfully",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'attractions/detail',
      slug: event.context.params?.slug,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "Failed to retrieve attraction",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
