/**
 * GET /api/attractions
 * List all attractions with filtering, pagination, and sorting
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
  buildAttractionWhereClause,
  buildAttractionOrderBy,
  sanitizeAttractionForResponse,
} from "~~/server/utils/attraction";
import { getCache, setCache, CacheKeys, CacheTTL } from "~~/server/utils/cache";
import { rateLimit, RateLimitPresets } from "~~/server/utils/rateLimit";
import { logError } from "~~/server/utils/logger";

// Zod Schema for query parameters
const querySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10)),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => {
      const limit = parseInt(val, 10);
      return Math.min(limit, 100); // Max 100 items per page
    }),
  search: z.string()
    .max(100, "Search query too long")
    .regex(/^[a-zA-Z0-9\s\-_]*$/, "Invalid characters in search")
    .optional(),
  type: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val === "true" || val === "1";
    }),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  sortBy: z
    .enum(["name", "price", "priority", "createdAt"])
    .optional()
    .default("priority"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting for public endpoints
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Parse and validate query parameters
    const rawQuery = getQuery(event);
    const validation = querySchema.safeParse(rawQuery);

    if (!validation.success) {
      const errors = validation.error.issues.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Validation Error",
        data: errorResponse(
          "Invalid query parameters",
          ERROR_CODES.VALIDATION_ERROR,
          { errors },
        ),
      });
    }

    const query = validation.data;

    // Generate cache key based on query parameters
    const cacheKey = CacheKeys.attractionsList(query);

    // Try to get from cache first
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return successResponse(cached, "Attractions retrieved successfully (cached)");
    }

    // Build where clause for filtering
    const filters = {
      search: query.search,
      type: query.type,
      isActive: query.isActive,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
    };

    const where = buildAttractionWhereClause(filters);

    // Build order by clause
    const orderBy = buildAttractionOrderBy(query.sortBy, query.sortOrder);

    // Calculate pagination
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [attractions, total] = await Promise.all([
      prisma.attractions.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.attractions.count({ where }),
    ]);

    // Sanitize data for response
    const sanitizedAttractions = attractions.map(sanitizeAttractionForResponse);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    // Return paginated response
    const responseData = {
      attractions: sanitizedAttractions,
      currentPage: page,
      totalPages,
      totalItems: total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      limit,
    };

    // Cache the result (5 minutes TTL)
    await setCache(cacheKey, responseData, CacheTTL.MEDIUM);

    return successResponse(
      responseData,
      "Attractions retrieved successfully",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'attractions/list',
      query: getQuery(event),
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "Failed to retrieve attractions",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
