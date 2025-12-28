import { z } from "zod";
import { getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { defineAdminHandler } from "~~/server/utils/handler";

// Zod Schema for query params
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  type: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      return val === "true";
    }),
  sortBy: z
    .enum(["createdAt", "name", "adultPrice", "priority"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export default defineAdminHandler(async (event, currentUser) => {
  // Parse and validate query params
  const query = getQuery(event);
  const validation = querySchema.safeParse(query);

  if (!validation.success) {
    const errors = validation.error.issues.map((err: any) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    throw createError({
      statusCode: HTTP_STATUS.BAD_REQUEST,
      statusMessage: "Validation Error",
      data: errorResponse("Validation failed", ERROR_CODES.VALIDATION_ERROR, {
        errors,
      }),
    });
  }

  const { page, limit, search, type, isActive, sortBy, sortOrder } =
    validation.data;

  // Build where clause
  const where: any = {};

  // Search filter (name or description)
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { shortDescription: { contains: search } },
    ];
  }

  // Type filter
  if (type) {
    where.type = type;
  }

  // Active status filter
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const take = limit;

  // Build orderBy
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  // Fetch attractions with pagination
  const [attractions, total] = await Promise.all([
    prisma.attractions.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        type: true,
        adultPrice: true,
        childPrice: true,
        currency: true,
        imageUrl: true,
        imageUrls: true,
        operatingHours: true,
        capacity: true,
        durationMinutes: true,
        minAge: true,
        maxAge: true,
        isActive: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            cart_items: true,
            ticket_details: true,
            transaction_items: true,
          },
        },
      },
    }),
    prisma.attractions.count({ where }),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return successResponse(
    {
      attractions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    },
    "Attractions retrieved successfully"
  );
});
