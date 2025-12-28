import { H3Event } from "h3";
import { prisma } from "~~/server/lib/prisma";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { logError } from "~~/server/utils/logger";

export default defineEventHandler(async (event: H3Event) => {
  const user = event.context.user;
   if (!user || !['ADMIN', 'SUPER_ADMIN', 'SCANNER'].includes(user.role)) {
    throw createError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        statusMessage: "Forbidden",
        data: errorResponse("Insufficient permissions", ERROR_CODES.FORBIDDEN)
    });
  }

  try {
    const page = parseInt(getQuery(event).page as string) || 1;
    const limit = parseInt(getQuery(event).limit as string) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        prisma.activity_logs.findMany({
            where: {
                userId: user.id,
                action: "TICKET_REDEEM"
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip,
            // We store metadata JSON, we might want to parse it on frontend.
        }),
        prisma.activity_logs.count({
            where: {
                userId: user.id,
                action: "TICKET_REDEEM"
            }
        })
    ]);

    return successResponse({
        logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }, "History retrieved");

  } catch (error: any) {
    logError(error, { context: "scanner/history" });
    return errorResponse("Internal Server Error", ERROR_CODES.INTERNAL_ERROR, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});
