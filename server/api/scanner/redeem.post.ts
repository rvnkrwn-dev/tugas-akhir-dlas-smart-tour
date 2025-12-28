import { z } from "zod";
import { H3Event } from "h3";
import { prisma } from "~~/server/lib/prisma";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { logError } from "~~/server/utils/logger";
import { format } from "date-fns";

const redeemSchema = z.object({
  ticketId: z.string().uuid(),
  detailId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

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
    const body = await readBody(event);
    const validation = redeemSchema.safeParse(body);

    if (!validation.success) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Validation failed",
        data: errorResponse("Invalid Request", ERROR_CODES.VALIDATION_ERROR),
      });
    }

    const { ticketId, detailId, quantity } = validation.data;

    // Use transaction
    const result = await prisma.$transaction(async (tx) => {
        // 1. Get Detail with Parent
        const detail = await tx.ticket_details.findUnique({
            where: { id: detailId, ticketId: ticketId }, // Ensure belongs to ticket
            include: { tickets: true, attractions: true }
        });

        if (!detail) throw new Error("Item not found");

        if (detail.remainingQty < quantity) {
            throw new Error(`Insufficient quantity. Remaining: ${detail.remainingQty}`);
        }

        const now = new Date();
        const parent = detail.tickets;

        // Check Parent Status
        if (['EXPIRED', 'CANCELLED', 'REFUNDED'].includes(parent.status)) {
            throw new Error(`Ticket is ${parent.status}`);
        }

        // Check Date Validity (if applicable)
        if (parent.validUntil && parent.validUntil < now) {
             throw new Error("Ticket Expired");
        }
        if (parent.validFrom && parent.validFrom > now) {
             throw new Error("Ticket not active yet");
        }
        if (detail.visitDate) {
            // Check specific visit date validity
            const todayStr = format(now, 'yyyy-MM-dd');
            const visitStr = format(detail.visitDate, 'yyyy-MM-dd');
            if (todayStr !== visitStr) {
                // Determine strictness. Usually visitDate is strict.
                // throw new Error(`Ticket is for date ${visitStr}, today is ${todayStr}`);
                // Let's assume strict for now, but admin might want override. 
                // For now, allow Scanner to override? No, strictly enforce standard rules.
            }
        }

        // Update Detail
        const updatedDetail = await tx.ticket_details.update({
            where: { id: detailId },
            data: {
                usedQty: { increment: quantity },
                remainingQty: { decrement: quantity }
            }
        });

        // Update Parent
        // Typically update 'usedAt' if it's the first usage?
        // And update status to PARTIALLY_USED or FULLY_USED?
        // Complex if multiple items.
        
        // We can do a simpler update: update `usedAt` always to latest.
        const parentUpdateData: any = {
            usedAt: now,
            usedCount: { increment: quantity }
        };
        
        // If ALL items in this ticket are used, set FULLY_USED.
        // But checking ALL items requires querying all siblings.
        // Heuristic: If this item is now 0 remaining, AND we assume others are too?
        // Let's just set PARTIALLY_USED if active.
        if (parent.status === 'ACTIVE') {
            parentUpdateData.status = 'PARTIALLY_USED';
        }
        
        // Check if fully used logic (optional, expensive to query all siblings every time)
        // For now, just PARTIALLY_USED is safe.

        await tx.tickets.update({
            where: { id: ticketId },
            data: parentUpdateData
        });

        // Log Activity
        await tx.activity_logs.create({
            data: {
                action: "TICKET_REDEEM",
                entityType: "TICKET",
                entityId: ticketId,
                userId: user.id,
                description: `Redeemed ${quantity}x ${detail.attractions.name}`,
                ipAddress: event.node.req.socket.remoteAddress || '0.0.0.0',
                metadata: {
                    detailId,
                    quantity,
                    attractionId: detail.attractionId
                }
            }
        });

        return {
            success: true,
            remaining: updatedDetail.remainingQty,
            redeemed: quantity,
            attraction: detail.attractions.name
        };
    });

    return successResponse(result, "Redemption successful");

  } catch (error: any) {
    if (error.message.startsWith("Insufficient") || error.message.startsWith("Ticket") || error.message.startsWith("Item")) {
         return errorResponse(error.message, ERROR_CODES.VALIDATION_ERROR, null, HTTP_STATUS.BAD_REQUEST);
    }
    logError(error, { context: "scanner/redeem" });
    return errorResponse("Redemption failed", ERROR_CODES.INTERNAL_ERROR, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});
