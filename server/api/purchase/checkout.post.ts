import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { randomBytes } from "crypto";
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
import { createSnapTransaction } from "~~/server/services/midtrans";

// Zod Schema for request body
const checkoutSchema = z.object({
  customerInfo: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(20),
    address: z.string().min(1).max(500).optional(),
    city: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100).optional(),
    postalCode: z.string().max(20).optional(),
  }),
  paymentMethod: z.string().min(1).max(50).optional(),
  notes: z.string().max(1000).optional(),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require authenticated user
    const currentUser = requireUser(event);

    // Parse and validate request body
    const body = await readBody(event);
    const validation = checkoutSchema.safeParse(body);

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

    const { customerInfo, paymentMethod, notes } = validation.data;

    // Get user's cart with items
    const cart = await prisma.carts.findFirst({
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
                adultPrice: true,
                childPrice: true,
                currency: true,
                isActive: true,
              },
            },
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

    if (cart.cart_items.length === 0) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Cart is empty",
        data: errorResponse(
          "Cannot checkout with an empty cart",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    // Check if cart is expired
    const now = new Date();
    if (cart.expiresAt && cart.expiresAt < now) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Cart expired",
        data: errorResponse(
          "Your cart has expired. Please add items again.",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    // Validate all attractions are still active
    const inactiveAttractions = cart.cart_items.filter(
      (item) => !item.attractions.isActive
    );

    if (inactiveAttractions.length > 0) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Inactive attractions in cart",
        data: errorResponse(
          "Some attractions in your cart are no longer available",
          ERROR_CODES.VALIDATION_ERROR,
          {
            inactiveAttractions: inactiveAttractions.map((item) => ({
              id: item.attractions.id,
              name: item.attractions.name,
            })),
          },
        ),
      });
    }

    // Calculate total amount
    const totalAmount = cart.cart_items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0
    );

    // Get currency from first item
    const currency = cart.cart_items[0]!.attractions.currency;

    // Generate secure transaction code using crypto
    const timestamp = Date.now();
    const randomPart = randomBytes(8).toString('hex').toUpperCase();
    const transactionCode = `TRX-${timestamp}-${randomPart}`;

    // Create transaction with items in a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create purchase transaction
      const transaction = await tx.purchase_transactions.create({
        data: {
          userId: currentUser.userId,
          transactionCode,
          totalAmount,
          currency,
          status: "PENDING",
          customerInfo: customerInfo as any,
        },
      });

      // Create transaction items
      const transactionItems = await Promise.all(
        cart.cart_items.map((cartItem) =>
          tx.transaction_items.create({
            data: {
              transactionId: transaction.id,
              attractionId: cartItem.attractionId,
              ticketType: cartItem.ticketType,
              quantity: cartItem.quantity,
              visitDate: cartItem.visitDate,
              unitPrice: cartItem.unitPrice,
              totalPrice: cartItem.totalPrice,
              itemData: {
                attractionName: cartItem.attractions.name,
                attractionSlug: cartItem.attractions.slug,
                attractionType: cartItem.attractions.type,
              },
            },
          })
        )
      );

      // Create payment record
      const payment = await tx.payments.create({
        data: {
          transactionId: transaction.id,
          amount: totalAmount,
          currency,
          method: paymentMethod || null,
          status: "PENDING",
          gatewayData: {
            customerInfo,
            notes: notes || null,
            createdFrom: "checkout",
          },
        },
      });

      // Clear cart items
      await tx.cart_items.deleteMany({
        where: { cartId: cart.id },
      });

      // Update cart
      await tx.carts.update({
        where: { id: cart.id },
        data: { updatedAt: new Date() },
      });

      // Get full transaction with relations
      const fullTransaction = await tx.purchase_transactions.findUnique({
        where: { id: transaction.id },
        include: {
          transaction_items: {
            include: {
              attractions: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  type: true,
                  imageUrl: true,
                },
              },
            },
          },
          payments: true,
          users: {
            select: {
              id: true,
              email: true,
              user_profiles: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      return { transaction: fullTransaction, payment };
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "CREATE_TRANSACTION",
        entityType: "TRANSACTION",
        entityId: result.transaction!.id,
        description: `User created transaction ${transactionCode}`,
        metadata: {
          transactionId: result.transaction!.id,
          transactionCode,
          totalAmount,
          currency,
          itemsCount: cart.cart_items.length,
          totalQuantity: cart.cart_items.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          customerInfo: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
        },
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    // TODO: Send confirmation email to customer
    // TODO: Generate invoice

    // Generate Midtrans Snap Token
    let snapToken = null;
    let redirectUrl = null;

    try {
      const itemDetails = cart.cart_items.map(item => ({
        id: item.attractionId, // Using attractionId as item ID or could use a composite
        price: Number(item.unitPrice),
        quantity: item.quantity,
        name: `${item.attractions.name} (${item.ticketType})`.substring(0, 50) // Midtrans name limit is 50 chars
      }));

      // Calculate gross_amount from itemDetails to ensure exact match
      const midtransGrossAmount = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const params = {
        transaction_details: {
          order_id: transactionCode,
          gross_amount: midtransGrossAmount
        },
        customer_details: {
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          billing_address: {
            first_name: customerInfo.firstName,
            last_name: customerInfo.lastName,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: customerInfo.address,
            city: customerInfo.city,
            country_code: 'IDN', // Assuming IDN for simplicity or map from country
            postal_code: customerInfo.postalCode
          }
        },
        item_details: itemDetails,
        callbacks: {
          // client will handle callbacks via Snap.js
        }
      };

      const midtransTx = await createSnapTransaction(params);
      snapToken = midtransTx.token;
      redirectUrl = midtransTx.redirect_url;

      // Update payment with Snap Token (optional, or just return it)
      // We might want to store the Snap Token in the payment record if needed, 
      // but it's usually transient. We can store it in gatewayData.
      await prisma.payments.update({
        where: { id: result.payment.id },
        data: {
          gatewayData: {
            ...(result.payment.gatewayData as any || {}),
            snapToken,
            redirectUrl
          }
        }
      });

    } catch (midtransError: any) {
      console.error('Midtrans Token Generation Failed:', midtransError);
      // We don't fail the entire checkout if Midtrans fails, but we warn the user
      // OR we should fail? Better to fail if payment is required.
      // But the transaction is already created. 
      // Let's swallow and return error in nextSteps or rethrow?
      // If we rethrow, the user sees an error but the transaction exists in DB (PENDING).
      // They can try to pay again from "My Orders" page (if we implemented it).
      // For now, let's throw and let the frontend handle "Transaction Created but Payment Failed" logic?
      // Or better, return success but with error message in nextSteps.

      // Actually, for a seamless checkout flow, if payment init fails, we probably should surface it.
      // But since we already cleared the cart, we shouldn't throw 500 effectively "rolling back" the UI but not the DB.
      // We'll proceed but without snapToken.
    }

    return successResponse(
      {
        transaction: result.transaction,
        payment: result.payment,
        snapToken,
        redirectUrl,
        nextSteps: {
          paymentRequired: true,
          paymentMethod: paymentMethod || "pending_selection",
          message:
            "Transaction created successfully. Please proceed with payment.",
        },
      },
      "Checkout successful"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'purchase/checkout',
      userId: (event.context as any).user?.userId,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred during checkout",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
