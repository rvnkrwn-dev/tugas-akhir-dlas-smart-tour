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

// Zod Schema for path params
const paramsSchema = z.object({
  id: z.string().uuid("Invalid cart item ID format"),
});

// Zod Schema for request body
const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(20),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require authenticated user
    const currentUser = requireUser(event);

    // Parse and validate path params
    const params = event.context.params;
    const paramsValidation = paramsSchema.safeParse(params);

    if (!paramsValidation.success) {
      const errors = paramsValidation.error.issues.map((err: any) => ({
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

    const { id } = paramsValidation.data;

    // Parse and validate request body
    const body = await readBody(event);
    const validation = updateCartItemSchema.safeParse(body);

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

    const { quantity } = validation.data;

    // Get cart item
    const cartItem = await prisma.cart_items.findUnique({
      where: { id },
      include: {
        carts: {
          select: {
            id: true,
            userId: true,
          },
        },
        attractions: {
          select: {
            id: true,
            name: true,
            slug: true,
            adultPrice: true,
            childPrice: true,
            isActive: true,
          },
        },
      },
    });

    if (!cartItem) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Cart item not found",
        data: errorResponse("Cart item not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Verify cart belongs to current user
    if (cartItem.carts.userId !== currentUser.userId) {
      throw createError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        statusMessage: "Forbidden",
        data: errorResponse(
          "You do not have permission to update this cart item",
          ERROR_CODES.FORBIDDEN
        ),
      });
    }

    // Check if attraction is still active
    if (!cartItem.attractions.isActive) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Attraction not available",
        data: errorResponse(
          "This attraction is no longer available",
          ERROR_CODES.VALIDATION_ERROR
        ),
      });
    }

    // Calculate new total price
    const newTotalPrice = Number(cartItem.unitPrice) * quantity;

    // Update cart item
    const updatedCartItem = await prisma.cart_items.update({
      where: { id },
      data: {
        quantity,
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

    // Update cart timestamp
    await prisma.carts.update({
      where: { id: cartItem.cartId },
      data: { updatedAt: new Date() },
    });

    // Get updated cart summary
    const cartItems = await prisma.cart_items.findMany({
      where: { cartId: cartItem.cartId },
    });

    const cartSummary = cartItems.reduce(
      (acc, item) => {
        acc.totalItems += item.quantity;
        acc.subtotal += Number(item.totalPrice);
        return acc;
      },
      { totalItems: 0, subtotal: 0 }
    );

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "UPDATE_CART_ITEM",
        entityType: "ATTRACTION",
        entityId: cartItem.attractionId,
        description: `User updated cart item quantity to ${quantity} for ${cartItem.attractions.name}`,
        metadata: {
          cartItemId: id,
          attractionId: cartItem.attractionId,
          attractionName: cartItem.attractions.name,
          previousQuantity: cartItem.quantity,
          newQuantity: quantity,
          ticketType: cartItem.ticketType,
          previousTotalPrice: Number(cartItem.totalPrice),
          newTotalPrice,
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
        cartItem: updatedCartItem,
        cartSummary,
      },
      "Cart item updated successfully"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'cart/update-item',
      userId: (event.context as any).user?.userId,
      cartItemId: event.context.params?.id,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while updating cart item",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
