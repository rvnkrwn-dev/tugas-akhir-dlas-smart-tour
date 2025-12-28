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
  id: z.string().uuid("Invalid activity log ID format"),
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

  // Get activity log with full details
  const log = await prisma.activity_logs.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          role: true,
          user_profiles: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
              city: true,
              country: true,
            },
          },
        },
      },
    },
  });

  if (!log) {
    throw createError({
      statusCode: HTTP_STATUS.NOT_FOUND,
      statusMessage: "Activity log not found",
      data: errorResponse("Activity log not found", ERROR_CODES.NOT_FOUND),
    });
  }

  // Get related logs (same entity)
  let relatedLogs: any[] = [];
  if (log.entityType && log.entityId) {
    relatedLogs = await prisma.activity_logs.findMany({
      where: {
        entityType: log.entityType,
        entityId: log.entityId,
        id: { not: id },
      },
      select: {
        id: true,
        action: true,
        description: true,
        createdAt: true,
        users: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });
  }

  // Get user's recent activity
  let userRecentActivity: any[] = [];
  if (log.userId) {
    userRecentActivity = await prisma.activity_logs.findMany({
      where: {
        userId: log.userId,
        id: { not: id },
      },
      select: {
        id: true,
        action: true,
        entityType: true,
        description: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });
  }

  // Parse metadata if it's JSON
  let parsedMetadata = null;
  if (log.metadata) {
    try {
      parsedMetadata =
        typeof log.metadata === "string"
          ? JSON.parse(log.metadata)
          : log.metadata;
    } catch (e) {
      parsedMetadata = log.metadata;
    }
  }

  // Get entity details if available
  let entityDetails = null;
  if (log.entityType && log.entityId) {
    switch (log.entityType) {
      case "USER":
        entityDetails = await prisma.users.findUnique({
          where: { id: log.entityId },
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            user_profiles: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });
        break;
      case "TRANSACTION":
        entityDetails = await prisma.purchase_transactions.findUnique({
          where: { id: log.entityId },
          select: {
            id: true,
            transactionCode: true,
            totalAmount: true,
            status: true,
          },
        });
        break;
      case "TICKET":
        entityDetails = await prisma.tickets.findUnique({
          where: { id: log.entityId },
          select: {
            id: true,
            ticketCode: true,
            status: true,
          },
        });
        break;
      case "PAYMENT":
        entityDetails = await prisma.payments.findUnique({
          where: { id: log.entityId },
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
          },
        });
        break;
      case "ATTRACTION":
        entityDetails = await prisma.attractions.findUnique({
          where: { id: log.entityId },
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        });
        break;
    }
  }

  return successResponse(
    {
      log: {
        ...log,
        metadata: parsedMetadata,
      },
      entityDetails,
      relatedLogs,
      userRecentActivity,
    },
    "Activity log details retrieved successfully"
  );
});
