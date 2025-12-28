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

// Zod Schema for path params
const paramsSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

export default defineAdminHandler(async (event, currentUser) => {
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

  // Get user with full details
  const user = await prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      user_profiles: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          dateOfBirth: true,
          gender: true,
          address: true,
          city: true,
          country: true,
          postalCode: true,
          language: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      _count: {
        select: {
          purchase_transactions: true,
          activity_logs: true,
          carts: true,
          refresh_tokens: true,
        },
      },
    },
  });

  if (!user) {
    throw createError({
      statusCode: HTTP_STATUS.NOT_FOUND,
      statusMessage: "User not found",
      data: errorResponse("User not found", ERROR_CODES.NOT_FOUND),
    });
  }

  // Get user's recent transactions
  const recentTransactions = await prisma.purchase_transactions.findMany({
    where: { userId: id },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      transactionCode: true,
      totalAmount: true,
      currency: true,
      status: true,
      createdAt: true,
      completedAt: true,
    },
  });

  // Get user's recent activity logs
  const recentActivities = await prisma.activity_logs.findMany({
    where: { userId: id },
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      action: true,
      entityType: true,
      description: true,
      ipAddress: true,
      createdAt: true,
    },
  });

  // Calculate statistics
  const transactionStats = await prisma.purchase_transactions.aggregate({
    where: { userId: id, status: "COMPLETED" },
    _sum: {
      totalAmount: true,
    },
    _count: true,
  });

  // Log activity (fire and forget)
  prisma.activity_logs.create({
    data: {
      userId: currentUser.userId,
      userRole: currentUser.role,
      action: "VIEW_USER_DETAIL",
      entityType: "USER",
      entityId: id,
      description: `Admin viewed details of user ${user.email}`,
      ipAddress:
        getHeader(event, "x-forwarded-for") ||
        getHeader(event, "x-real-ip") ||
        "0.0.0.0",
      userAgent: getHeader(event, "user-agent") || null,
    },
  }).catch((err) => console.error("Failed to log activity", err));

  return successResponse(
    {
      user,
      recentTransactions,
      recentActivities,
      statistics: {
        totalTransactions: transactionStats._count,
        totalSpent: transactionStats._sum.totalAmount || 0,
        totalActivities: user._count.activity_logs,
      },
    },
    "User details retrieved successfully",
  );
});
