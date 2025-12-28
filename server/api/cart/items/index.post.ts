import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireUser } from "~~/server/utils/auth";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { rateLimit, RateLimitPresets } from "~~/server/utils/rateLimit";
import { logError } from "~~/server/utils/logger";

// Business rules
const MAX_CART_QUANTITY = 50;

// Zod Schema for request body
const addToCartSchema = z.object({
  attractionId: z.string().uuid("Invalid attraction ID"),
  ticketType: z.enum(["adult", "child"]).default("adult"),
  quantity: z.coerce.number().int().min(1).max(20),
  visitDate: z.string().datetime(),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require authenticated user
    const currentUser = requireUser(event);

    // Parse and validate request body
    const body = await readBody(event);
    const validation = addToCartSchema.safeParse(body);

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

    const { attractionId, ticketType, quantity, visitDate } = validation.data;

    // Validate visit date is not in the past
    const visitDateTime = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (visitDateTime < today) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Invalid visit date",
        data: errorResponse(
          "Visit date cannot be in the past",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    // Get attraction details
    const attraction = await prisma.attractions.findUnique({
      where: { id: attractionId },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        adultPrice: true,
        childPrice: true,
        currency: true,
        isActive: true,
        capacity: true,
      },
    });

    if (!attraction) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Attraction not found",
        data: errorResponse("Attraction not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Check if attraction is active
    if (!attraction.isActive) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Attraction not available",
        data: errorResponse(
          "This attraction is currently not available",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    // Get unit price based on ticket type
    const unitPrice =
      ticketType === "adult"
        ? Number(attraction.adultPrice)
        : Number(attraction.childPrice || attraction.adultPrice);

    // Calculate total price
    const totalPrice = unitPrice * quantity;

    // Get or create user's cart
    let cart = await prisma.carts.findFirst({
      where: { userId: currentUser.userId },
    });

    if (!cart) {
      cart = await prisma.carts.create({
        data: {
          userId: currentUser.userId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cart_items.findFirst({
      where: {
        cartId: cart.id,
        attractionId,
        ticketType,
        visitDate: visitDateTime,
      },
    });

    let cartItem;

    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity;
      const newTotalPrice = unitPrice * newQuantity;

      cartItem = await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          totalPrice: newTotalPrice,
          updatedAt: new Date(),
        },
        include: {
          attractions: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              imageUrl: true,
              adultPrice: true,
              childPrice: true,
              currency: true,
            },
          },
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cart_items.create({
        data: {
          cartId: cart.id,
          attractionId,
          ticketType,
          quantity,
          visitDate: visitDateTime,
          unitPrice,
          totalPrice,
        },
        include: {
          attractions: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              imageUrl: true,
              adultPrice: true,
              childPrice: true,
              currency: true,
            },
          },
        },
      });
    }

    // Update cart expiration
    await prisma.carts.update({
      where: { id: cart.id },
      data: {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    });

    // Get updated cart summary
    const cartItems = await prisma.cart_items.findMany({
      where: { cartId: cart.id },
    });

    const cartSummary = cartItems.reduce(
      (acc, item) => {
        acc.totalItems += item.quantity;
        acc.subtotal += Number(item.totalPrice);
        return acc;
      },
      { totalItems: 0, subtotal: 0 },
    );

    // Validate total cart quantity doesn't exceed limit
    if (cartSummary.totalItems > MAX_CART_QUANTITY) {
      // Rollback the addition by deleting/updating the item
      if (existingItem) {
        // Restore previous quantity
        await prisma.cart_items.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity,
            totalPrice: existingItem.totalPrice,
          },
        });
      } else {
        // Delete newly created item
        await prisma.cart_items.delete({
          where: { id: cartItem.id },
        });
      }

      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Cart limit exceeded",
        data: errorResponse(
          `Cart cannot contain more than ${MAX_CART_QUANTITY} items total. Current: ${cartSummary.totalItems}`,
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "ADD_TO_CART",
        entityType: "ATTRACTION",
        entityId: attractionId,
        description: `User added ${quantity} ${ticketType} ticket(s) for ${attraction.name} to cart`,
        metadata: {
          attractionId,
          attractionName: attraction.name,
          ticketType,
          quantity,
          visitDate: visitDateTime.toISOString(),
          unitPrice,
          totalPrice,
          isUpdate: !!existingItem,
        },
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    return successResponse(
      {
        cartItem,
        cartSummary,
        message: existingItem
          ? "Cart item quantity updated"
          : "Item added to cart successfully",
      },
      existingItem ? "Cart updated successfully" : "Added to cart successfully",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'cart/add-item',
      userId: (event.context as any).user?.userId,
      attractionId: (await readBody(event).catch(() => ({})))?.attractionId,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while adding item to cart",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
