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

    // Get or create user's cart
    let cart = await prisma.carts.findFirst({
      where: { userId: currentUser.userId },
      include: {
        cart_items: {
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
                isActive: true,
                capacity: true,
                operatingHours: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // If cart doesn't exist, create one
    if (!cart) {
      cart = await prisma.carts.create({
        data: {
          userId: currentUser.userId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
        include: {
          cart_items: {
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
                  isActive: true,
                  capacity: true,
                  operatingHours: true,
                },
              },
            },
          },
        },
      });
    }

    // Check if cart is expired
    const now = new Date();
    const isExpired = cart.expiresAt && cart.expiresAt < now;

    // If expired, clear cart items atomically
    if (isExpired && cart.cart_items.length > 0) {
      cart = await prisma.$transaction(async (tx) => {
        // Clear items
        await tx.cart_items.deleteMany({
          where: { cartId: cart!.id },
        });

        // Update expiration and get refreshed cart
        const updatedCart = await tx.carts.update({
          where: { id: cart!.id },
          data: { expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
          include: {
            cart_items: {
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
                    isActive: true,
                    capacity: true,
                    operatingHours: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        });

        return updatedCart;
      });
    }

    // Calculate cart summary
    const summary = cart!.cart_items.reduce(
      (acc, item) => {
        acc.totalItems += item.quantity;
        acc.subtotal += Number(item.totalPrice);
        acc.uniqueAttractions += 1;

        // Check for inactive attractions
        if (!item.attractions.isActive) {
          acc.hasInactiveItems = true;
        }

        return acc;
      },
      {
        totalItems: 0,
        subtotal: 0,
        uniqueAttractions: 0,
        hasInactiveItems: false,
      }
    );

    // Calculate time remaining
    const timeRemaining = cart!.expiresAt
      ? Math.max(0, cart!.expiresAt.getTime() - now.getTime())
      : null;

    const minutesRemaining = timeRemaining
      ? Math.floor(timeRemaining / 1000 / 60)
      : null;

    return successResponse(
      {
        cart: cart!,
        summary: {
          ...summary,
          currency: cart!.cart_items[0]?.attractions.currency || "IDR",
          isEmpty: cart!.cart_items.length === 0,
        },
        expiration: {
          expiresAt: cart!.expiresAt,
          isExpired,
          minutesRemaining,
        },
      },
      "Cart retrieved successfully"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'cart/get',
      userId: (event.context as any).user?.userId,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while fetching cart",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
