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

const checkTicketSchema = z.object({
  qrCode: z.string().min(1, "QR Code is required"),
});

export default defineEventHandler(async (event: H3Event) => {
  // 1. Auth Check (TODO: Middleware should handle this, but explicit check for role)
  // Assuming useAuth middleware or similar is protecting this route, 
  // but we should verify the user has SCANNER or ADMIN role.
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
    const validation = checkTicketSchema.safeParse(body);

    if (!validation.success) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Validation checking failed",
        data: errorResponse("Invalid QR Code", ERROR_CODES.VALIDATION_ERROR),
      });
    }

    const { qrCode } = validation.data;

    // 2. Find Ticket
    // The scanned QR content is the ticketCode (e.g. TKT-...), NOT the qrCode image URL stored in DB.
    const ticket = await prisma.tickets.findUnique({
      where: { ticketCode: qrCode },
      include: {
        ticket_details: {
          include: {
            attractions: {
                select: { name: true, type: true }
            }
          }
        },
        purchase_transactions: {
            include: {
                users: {
                    select: { email: true, id: true }
                },
                user_profiles: { // Wait, user_profiles is not directly on purchase_transactions usually, it's on users?
                    // Schema: users -> user_profiles. Transaction -> users. 
                    // So we access via users.
                } 
            }
        }
      }
    });

    if (!ticket) {
      return errorResponse("Ticket not found", ERROR_CODES.NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);
    }

    // 3. User Info
    const userEmail = ticket.purchase_transactions?.users?.email || "Guest";
    // We might want profile name if available
    const userId = ticket.purchase_transactions?.users?.id;
    let userName = "N/A";
    if (userId) {
        const profile = await prisma.user_profiles.findUnique({ where: { userId } });
        if (profile) userName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || userEmail;
    }

    // 4. Construct Response
    const responseData = {
        ticket: {
            id: ticket.id,
            code: ticket.ticketCode,
            status: ticket.status,
            validFrom: ticket.validFrom,
            validUntil: ticket.validUntil,
            visitDateFrom: ticket.visitDateFrom,
            visitDateTo: ticket.visitDateTo,
        },
        user: {
            name: userName,
            email: userEmail
        },
        items: ticket.ticket_details.map(d => ({
            id: d.id,
            attractionId: d.attractionId,
            attractionName: d.attractions.name,
            totalQty: d.totalQty,
            usedQty: d.usedQty,
            remainingQty: d.remainingQty,
            visitDate: d.visitDate,
            canRedeem: d.remainingQty > 0 && ticket.status !== 'EXPIRED' && ticket.status !== 'CANCELLED'
        }))
    };

    return successResponse(responseData, "Ticket found");

  } catch (error: any) {
    if (error.statusCode) throw error;
    logError(error, { context: "scanner/check" });
    return errorResponse("Internal Server Error", ERROR_CODES.INTERNAL_ERROR, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});
