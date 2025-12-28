import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { requireScanner } from "~~/server/utils/auth";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { rateLimit, RateLimitPresets } from "~~/server/utils/rateLimit";
import { logError } from "~~/server/utils/logger";

// Zod Schema for request body
const validateSchema = z.object({
  qrCode: z.string().min(1, "QR code is required"),
  attractionId: z.string().uuid("Invalid attraction ID").optional(),
});

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting
  await rateLimit(RateLimitPresets.API_GENERAL)(event);

  try {
    // Require scanner role
    const currentUser = requireScanner(event);

    // Parse and validate request body
    const body = await readBody(event);
    const validation = validateSchema.safeParse(body);

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

    const { qrCode, attractionId } = validation.data;

    // Find ticket by QR code
    const ticket = await prisma.tickets.findUnique({
      where: { qrCode },
      include: {
        purchase_transactions: {
          select: {
            id: true,
            transactionCode: true,
            status: true,
            users: {
              select: {
                email: true,
                user_profiles: {
                  select: {
                    firstName: true,
                    lastName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        ticket_details: {
          include: {
            attractions: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw createError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        statusMessage: "Invalid QR code",
        data: errorResponse(
          "Ticket not found with the provided QR code",
          ERROR_CODES.NOT_FOUND
        ),
      });
    }

    // Calculate summary
    const summary = ticket.ticket_details.reduce(
      (acc, detail) => {
        acc.totalQty += detail.totalQty;
        acc.usedQty += detail.usedQty;
        acc.remainingQty += detail.remainingQty;
        return acc;
      },
      {
        totalQty: 0,
        usedQty: 0,
        remainingQty: 0,
      }
    );

    // Validation checks
    const now = new Date();
    const validationResult: any = {
      isValid: false,
      canBeUsed: false,
      errors: [] as string[],
      warnings: [] as string[],
    };

    // Check ticket status
    if (ticket.status === "CANCELLED") {
      validationResult.errors.push("Ticket has been cancelled");
    } else if (ticket.status === "REFUNDED") {
      validationResult.errors.push("Ticket has been refunded");
    } else if (ticket.status === "EXPIRED") {
      validationResult.errors.push("Ticket has expired");
    } else if (ticket.status === "FULLY_USED") {
      validationResult.errors.push("All tickets have been fully used");
    }

    // Check transaction status
    if (ticket.purchase_transactions.status !== "COMPLETED") {
      validationResult.errors.push(
        `Transaction is not completed (status: ${ticket.purchase_transactions.status})`
      );
    }

    // Check validity dates
    if (ticket.validFrom && ticket.validFrom > now) {
      validationResult.errors.push(
        `Ticket is not yet valid (valid from: ${ticket.validFrom.toISOString()})`
      );
    }

    if (ticket.validUntil && ticket.validUntil < now) {
      validationResult.errors.push(
        `Ticket validity has expired (expired on: ${ticket.validUntil.toISOString()})`
      );
    }

    // Check remaining quantity
    if (summary.remainingQty === 0) {
      validationResult.errors.push("No remaining tickets to use");
    }

    // Check visit date
    if (ticket.visitDateFrom) {
      const visitDate = new Date(ticket.visitDateFrom);
      visitDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (visitDate > today) {
        validationResult.warnings.push(
          `Ticket is for a future date: ${ticket.visitDateFrom.toISOString().split("T")[0]}`
        );
      }

      if (ticket.visitDateTo) {
        const visitDateTo = new Date(ticket.visitDateTo);
        visitDateTo.setHours(23, 59, 59, 999);

        if (now > visitDateTo) {
          validationResult.errors.push(
            `Visit date range has passed (valid until: ${ticket.visitDateTo.toISOString().split("T")[0]})`
          );
        }
      }
    }

    // Check if ticket is for specific attraction
    if (attractionId) {
      const ticketDetail = ticket.ticket_details.find(
        (detail) => detail.attractionId === attractionId
      );

      if (!ticketDetail) {
        validationResult.errors.push(
          "This ticket is not valid for the specified attraction"
        );
      } else if (ticketDetail.remainingQty === 0) {
        validationResult.errors.push(
          "All tickets for this attraction have been used"
        );
      } else {
        validationResult.attractionDetail = {
          id: ticketDetail.attractionId,
          name: ticketDetail.attractions.name,
          ticketType: ticketDetail.ticketType,
          totalQty: ticketDetail.totalQty,
          usedQty: ticketDetail.usedQty,
          remainingQty: ticketDetail.remainingQty,
          visitDate: ticketDetail.visitDate,
          timeSlot: ticketDetail.timeSlot,
        };
      }
    }

    // Determine if valid
    validationResult.isValid =
      validationResult.errors.length === 0 &&
      (ticket.status === "ACTIVE" || ticket.status === "PARTIALLY_USED");
    validationResult.canBeUsed = validationResult.isValid;

    // Set validation message
    if (validationResult.isValid) {
      validationResult.message = "Ticket is valid and can be used";
    } else {
      validationResult.message = validationResult.errors.join(", ");
    }

    // Log validation activity
    await prisma.activity_logs.create({
      data: {
        userId: currentUser.userId,
        userRole: currentUser.role,
        action: "VALIDATE_TICKET",
        entityType: "TICKET",
        entityId: ticket.id,
        description: `Scanner validated ticket ${ticket.ticketCode} - ${validationResult.isValid ? "VALID" : "INVALID"
          }`,
        metadata: {
          ticketCode: ticket.ticketCode,
          qrCode,
          attractionId: attractionId || null,
          isValid: validationResult.isValid,
          canBeUsed: validationResult.canBeUsed,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          status: ticket.status,
          transactionStatus: ticket.purchase_transactions.status,
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
        ticket: {
          id: ticket.id,
          ticketCode: ticket.ticketCode,
          status: ticket.status,
          visitDateFrom: ticket.visitDateFrom,
          visitDateTo: ticket.visitDateTo,
          validFrom: ticket.validFrom,
          validUntil: ticket.validUntil,
          usedCount: ticket.usedCount,
          usedAt: ticket.usedAt,
        },
        customer: {
          email: ticket.purchase_transactions.users.email,
          name: ticket.purchase_transactions.users.user_profiles
            ? `${ticket.purchase_transactions.users.user_profiles.firstName || ""} ${ticket.purchase_transactions.users.user_profiles.lastName || ""}`.trim()
            : null,
          phone:
            ticket.purchase_transactions.users.user_profiles?.phone || null,
        },
        summary: {
          ...summary,
          usedCount: ticket.usedCount,
          usagePercentage:
            summary.totalQty > 0
              ? Number(((summary.usedQty / summary.totalQty) * 100).toFixed(2))
              : 0,
        },
        attractions: ticket.ticket_details.map((detail) => ({
          id: detail.attractionId,
          name: detail.attractions.name,
          slug: detail.attractions.slug,
          type: detail.attractions.type,
          ticketType: detail.ticketType,
          totalQty: detail.totalQty,
          usedQty: detail.usedQty,
          remainingQty: detail.remainingQty,
          visitDate: detail.visitDate,
          timeSlot: detail.timeSlot,
        })),
        validation: validationResult,
      },
      validationResult.isValid
        ? "Ticket validated successfully"
        : "Ticket validation failed"
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    logError(error, {
      context: 'scanner/validate-ticket',
      userId: (event.context as any).user?.userId,
      qrCode: (await readBody(event).catch(() => ({})))?.qrCode,
    });

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while validating ticket",
        ERROR_CODES.INTERNAL_ERROR
      ),
    });
  }
});
