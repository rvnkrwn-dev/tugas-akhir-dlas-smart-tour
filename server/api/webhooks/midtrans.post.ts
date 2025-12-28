import { prisma } from "~~/server/lib/prisma";
import { verifyNotification } from "~~/server/services/midtrans";
import { generateTickets } from "~~/server/services/ticketService";
import { payments_status, purchase_transactions_status } from "~~/generated/prisma/client";
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS,
} from "~~/server/utils/response";
import { logError } from "~~/server/utils/logger";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        // 1. Verify notification signature
        const notification = await verifyNotification(body);
        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        console.log(`[Midtrans Webhook] Received notification for order ${orderId}: ${transactionStatus} (${fraudStatus || 'no-fraud-status'})`);

        // 2. Determine new status based on Midtrans documentation
        let paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' = 'PENDING';
        let statusDescription = '';

        switch (transactionStatus) {
            case 'capture':
            case 'settlement':
                if (fraudStatus === 'challenge') {
                    paymentStatus = 'PENDING';
                    statusDescription = 'Payment under review (fraud challenge)';
                } else if (fraudStatus === 'accept' || !fraudStatus) {
                    paymentStatus = 'PAID';
                    statusDescription = 'Payment successful';
                } else {
                    paymentStatus = 'FAILED';
                    statusDescription = 'Payment failed (fraud detection)';
                }
                break;
            case 'pending':
                paymentStatus = 'PENDING';
                statusDescription = 'Payment pending';
                break;
            case 'deny':
            case 'expire':
            case 'failure':
                paymentStatus = 'FAILED';
                statusDescription = `Payment ${transactionStatus}`;
                break;
            case 'cancel':
                paymentStatus = 'CANCELLED';
                statusDescription = 'Payment cancelled';
                break;
            default:
                paymentStatus = 'PENDING';
                statusDescription = `Unknown status: ${transactionStatus}`;
        }

        // 3. Update database
        await prisma.$transaction(async (tx) => {
            const transaction = await tx.purchase_transactions.findUnique({
                where: { transactionCode: orderId },
                include: { payments: true }
            });

            if (!transaction) {
                console.warn(`[Midtrans Webhook] Transaction not found for orderId: ${orderId}`);
                // Return success to stop Midtrans from retrying indefinitely on invalid IDs
                return;
            }

            // Map internal status to Prisma enums
            const dbPaymentStatus: payments_status =
                paymentStatus === 'PAID' ? payments_status.SETTLED :
                    paymentStatus === 'FAILED' ? payments_status.FAILED :
                        paymentStatus === 'CANCELLED' ? payments_status.CANCELLED :
                            payments_status.PENDING;

            // Map transaction status
            const dbTransactionStatus: purchase_transactions_status =
                paymentStatus === 'PAID' ? purchase_transactions_status.COMPLETED :
                    paymentStatus === 'FAILED' ? purchase_transactions_status.FAILED :
                        paymentStatus === 'CANCELLED' ? purchase_transactions_status.CANCELLED :
                            purchase_transactions_status.PENDING; // Keep as PENDING/PROCESSING

            // Only update if status changed
            if (transaction.status !== dbTransactionStatus) {
                console.log(`[Midtrans Webhook] Updating transaction ${transaction.id} status to ${dbTransactionStatus}`);

                // Update Transaction
                await tx.purchase_transactions.update({
                    where: { id: transaction.id },
                    data: {
                        status: dbTransactionStatus,
                        completedAt: paymentStatus === 'PAID' ? new Date() : undefined
                    }
                });

                // Update Payment Record
                if (transaction.payments && transaction.payments.length > 0) {
                    await tx.payments.update({
                        where: { id: transaction.payments[0].id },
                        data: {
                            status: dbPaymentStatus,
                            paidAt: paymentStatus === 'PAID' ? new Date() : undefined,
                            gatewayData: {
                                ...(transaction.payments[0].gatewayData as any || {}),
                                notification: body,
                                last_status_update: new Date().toISOString(),
                                midtrans_status: transactionStatus
                            }
                        }
                    });
                }

                // 4. Generate Tickets if PAID
                if (paymentStatus === 'PAID') {
                    // Check if tickets already exist to prevent duplicates
                    const existingTicket = await tx.tickets.findUnique({
                        where: { transactionId: transaction.id }
                    });

                    if (!existingTicket) {
                        console.log(`[Midtrans Webhook] Generating tickets for transaction ${transaction.id}`);
                        await generateTickets(tx, transaction.id);
                        console.log(`[Midtrans Webhook] Tickets generated successfully.`);
                    } else {
                        console.log(`[Midtrans Webhook] Tickets already exist for transaction ${transaction.id}, skipping generation.`);
                    }
                }
            } else {
                console.log(`[Midtrans Webhook] Transaction ${transaction.id} status unchanged (${transaction.status})`);
            }
        });

        return successResponse({ status: 'OK' }, "Webhook processed successfully");

    } catch (error: any) {
        // Log error but generally return 200 or 500 depending on if we want retry.
        // Midtrans retries on 5xx or 4xx.
        logError(error, {
            context: 'webhook/midtrans',
        });

        // Throwing 500 to trigger retry for transient errors
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: "Internal server error",
            data: errorResponse(
                "An unexpected error occurred processing webhook",
                ERROR_CODES.INTERNAL_ERROR
            ),
        });
    }
});
