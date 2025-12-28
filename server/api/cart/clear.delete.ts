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

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require authenticated user
    const currentUser = requireUser(event);

    // Get user's cart
    const cart = await prisma.carts.findFirst({
      where: { userId: currentUser.userId },
      include: {
        cart_items: {
          select: {
            id: true,
            quantity: true,
            totalPrice: true,
          },
        },
      },
    });

    if (!cart) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Cart not found",
        data: errorResponse("Cart not found", ERROR_CODES.NOT_FOUND),
      });
    }

    // Store summary before clearing
    const summary = {
      itemsRemoved: cart.cart_items.length,
      totalQuantity: cart.cart_items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      totalAmount: cart.cart_items.reduce(
        (sum, item) => sum + Number(item.totalPrice),
        0
      ),
    };

    // Clear all cart items
    await prisma.cart_items.deleteMany({
      where: { cartId: cart.id },
    });

    // Update cart timestamp
    await prisma.carts.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "CLEAR_CART",
        entityType: "USER",
        description: `User cleared cart (${summary.itemsRemoved} items removed)`,
        metadata: {
          cartId: cart.id,
          itemsRemoved: summary.itemsRemoved,
          totalQuantity: summary.totalQuantity,
          totalAmount: summary.totalAmount,
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
        cleared: true,
        summary,
      },
      "Cart cleared successfully"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'cart/clear',
      userId: (event.context as any).user?.userId,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while clearing cart",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
