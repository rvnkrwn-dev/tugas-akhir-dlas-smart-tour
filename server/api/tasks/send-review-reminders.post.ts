import { prisma } from "~~/server/lib/prisma";
import * as crypto from 'node:crypto';
import { sendReviewReminderEmail } from "~~/server/services/emailService";
import { logError } from "~~/server/utils/logger";
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS,
} from "~~/server/utils/response";

import { requireAdmin } from "~~/server/utils/auth";
// ... imports

export default defineEventHandler(async (event) => {
    // 1. Authenticate Request (CRON_SECRET OR ADMIN)
    const authHeader = getHeader(event, "authorization");
    const cronSecret = process.env.CRON_SECRET || "local-cron-secret";

    const token = authHeader?.replace("Bearer ", "");
    const isCron = token === cronSecret;

    if (!isCron) {
        // If not cron, check if it's an admin user
        try {
            requireAdmin(event);
        } catch (e) {
            throw createError({
                statusCode: HTTP_STATUS.UNAUTHORIZED,
                statusMessage: "Unauthorized",
                data: errorResponse("Invalid access", ERROR_CODES.UNAUTHORIZED),
            });
        }
    }

    try {
        const body = await readBody(event).catch(() => ({}));
        const targetEmail = body?.targetEmail;

        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const dayBeforeYesterday = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        const whereClause: any = {};

        if (targetEmail) {
            console.log(`[Review Reminder] Force mode for: ${targetEmail}`);
            // Force Mode: Allow active/used tickets, strict on email
            whereClause.purchase_transactions = {
                users: {
                    email: targetEmail
                }
            };
            // Relaxed status for manual invites
            whereClause.status = {
                in: ["FULLY_USED", "PARTIALLY_USED", "ACTIVE"]
            };
        } else {
            // Batch Mode: Strict 24-48h window and FULLY_USED
            console.log(`[Review Reminder] Batch mode: ${dayBeforeYesterday.toISOString()} to ${yesterday.toISOString()}`);

            whereClause.status = "FULLY_USED";
            whereClause.usedAt = {
                gte: dayBeforeYesterday,
                lte: yesterday,
            };
        }

        const tickets = await prisma.tickets.findMany({
            where: whereClause,
            include: {
                purchase_transactions: {
                    include: {
                        users: {
                            include: {
                                user_profiles: true
                            }
                        }
                    }
                }
            }
        });

        console.log(`[Review Reminder] Found ${tickets.length} potential tickets used between ${dayBeforeYesterday.toISOString()} and ${yesterday.toISOString()}`);

        let sentCount = 0;
        let errorsCount = 0;

        // 4. Process each ticket
        for (const ticket of tickets) {
            // Check if reminder already sent (double check JSON)
            const ticketData = ticket.ticketData as Record<string, any> || {};

            // If manual mode (targetEmail present), we allow resending. 
            // Otherwise (Cron mode), we skip if already sent.
            if (ticketData.reminderSent && !targetEmail) {
                console.log(`[Review Reminder] Skipping ticket ${ticket.ticketCode} - already sent`);
                continue;
            }

            // In manual mode, we might want to pick just ONE ticket to send the invite for, 
            // rather than spamming for every single past ticket.
            // But for now, let's just process the first one that works and break? 
            // Or maybe the user wants to be invited for a specific recent trip.
            // Let's send for ALL valid tickets? 
            // No, if I have 6 tickets in history, I don't want 6 emails.
            // Strategy: In manual mode, if we find MULTIPLE tickets, maybe we should only send ONE email for the most recent one?

            // Refinement: If targetEmail is set, and we have multiple tickets, 
            // let's only proceed if we haven't sent a manual email in this batch yet?
            if (targetEmail && sentCount > 0) {
                console.log(`[Review Reminder] Skipping ticket ${ticket.ticketCode} - already sent one for this batch`);
                continue;
            }

            const user = ticket.purchase_transactions?.users;
            if (!user) continue;

            const email = user.email;
            // Use profile name or fallback to part of email
            const name = user.user_profiles?.firstName
                ? `${user.user_profiles.firstName} ${user.user_profiles.lastName || ''}`.trim()
                : email.split('@')[0];

            console.log(`[Review Reminder] Sending to ${email} for ticket ${ticket.ticketCode}`);

            // Generate Token
            const token = crypto.randomUUID();

            // Create Placeholder Testimonial
            const userCity = user.user_profiles?.city || 'Indonesia';
            await prisma.testimonials.create({
                data: {
                    name,
                    token,
                    status: 'PENDING',
                    isCompleted: false,
                    isPublished: false,
                    location: userCity
                }
            });

            // Send Email with token
            const sent = await sendReviewReminderEmail(email, name, token);

            if (sent) {
                sentCount++;
                // 5. Update Ticket to mark sent
                await prisma.tickets.update({
                    where: { id: ticket.id },
                    data: {
                        ticketData: {
                            ...ticketData,
                            reminderSent: true,
                            reminderSentAt: new Date().toISOString()
                        }
                    }
                });
            } else {
                errorsCount++;
            }
        }

        if (tickets.length === 0 && targetEmail) {
            // Diagnostic: Why no tickets?
            const user = await prisma.users.findUnique({
                where: { email: targetEmail }
            });

            if (!user) {
                throw createError({
                    statusCode: HTTP_STATUS.NOT_FOUND,
                    statusMessage: "Pengguna tidak ditemukan",
                    data: errorResponse(`Pengguna dengan email ${targetEmail} tidak ditemukan dalam database.`, ERROR_CODES.NOT_FOUND)
                });
            }

            const allTicketsCount = await prisma.tickets.count({
                where: {
                    purchase_transactions: {
                        userId: user.id
                    }
                }
            });

            if (allTicketsCount === 0) {
                throw createError({
                    statusCode: HTTP_STATUS.NOT_FOUND,
                    statusMessage: "Tidak ada tiket ditemukan",
                    data: errorResponse(`Pengguna ditemukan (${user.email}), tetapi belum pernah membeli tiket.`, ERROR_CODES.NOT_FOUND)
                });
            }

            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                statusMessage: "Tidak ada tiket yang memenuhi syarat",
                data: errorResponse(`Pengguna memiliki ${allTicketsCount} tiket, tetapi tidak ada yang memenuhi syarat untuk diulas (harus AKTIF, TERPAKAI SEBAGIAN, atau TERPAKAI SEMUA).`, ERROR_CODES.VALIDATION_ERROR)
            });
        }

        return successResponse(
            {
                processed: tickets.length,
                sent: sentCount,
                errors: errorsCount
            },
            `Review reminders processed. Sent: ${sentCount}`
        );

    } catch (error: any) {
        logError(error, { context: "tasks/send-review-reminders" });
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: "Internal Server Error",
            data: errorResponse(error.message, ERROR_CODES.INTERNAL_ERROR),
        });
    }
});
