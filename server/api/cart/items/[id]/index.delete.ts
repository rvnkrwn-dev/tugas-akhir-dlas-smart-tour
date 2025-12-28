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

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require authenticated user
    const currentUser = requireUser(event);

    // Parse and validate path params
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
        data: errorResponse("Validation failed", ERROR_CODES.VALIDATION_ERROR, {
          errors,
        }),
      });
    }

    const { id } = validation.data;

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
          "You do not have permission to remove this cart item",
          ERROR_CODES.FORBIDDEN
        ),
      });
    }

    // Store info for logging before deletion
    const cartItemInfo = {
      id: cartItem.id,
      cartId: cartItem.cartId,
      attractionId: cartItem.attractionId,
      attractionName: cartItem.attractions.name,
      ticketType: cartItem.ticketType,
      quantity: cartItem.quantity,
      totalPrice: Number(cartItem.totalPrice),
    };

    // Delete cart item
    await prisma.cart_items.delete({
      where: { id },
    });

    // Update cart timestamp
    await prisma.carts.update({
      where: { id: cartItem.cartId },
      data: { updatedAt: new Date() },
    });

    // Get updated cart summary
    const remainingItems = await prisma.cart_items.findMany({
      where: { cartId: cartItem.cartId },
    });

    const cartSummary = remainingItems.reduce(
      (acc, item) => {
        acc.totalItems += item.quantity;
        acc.subtotal += Number(item.totalPrice);
        return acc;
      },
      { totalItems: 0, subtotal: 0, remainingItems: remainingItems.length }
    );

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "REMOVE_FROM_CART",
        entityType: "ATTRACTION",
        entityId: cartItemInfo.attractionId,
        description: `User removed ${cartItemInfo.quantity} ${cartItemInfo.ticketType} ticket(s) for ${cartItemInfo.attractionName} from cart`,
        metadata: {
          cartItemId: cartItemInfo.id,
          attractionId: cartItemInfo.attractionId,
          attractionName: cartItemInfo.attractionName,
          ticketType: cartItemInfo.ticketType,
          quantity: cartItemInfo.quantity,
          totalPrice: cartItemInfo.totalPrice,
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
        removedItem: cartItemInfo,
        cartSummary,
      },
      "Item removed from cart successfully"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'cart/delete-item',
      userId: (event.context as any).user?.userId,
      cartItemId: event.context.params?.id,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while removing item from cart",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
