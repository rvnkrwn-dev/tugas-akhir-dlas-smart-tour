import { PrismaClient } from '~~/generated/prisma/client';
import type { Prisma } from '~~/generated/prisma/client';
import QRCode from 'qrcode';
import { uploadImageFromBase64, uploadConfig } from './uploadService';

// We can't import prisma from server/lib/prisma directly if it's not exported or if we want to pass tx
// But for now let's assume we receive the transaction client "tx" or use the global prisma

const generateUniqueTicketCode = () => {
    // Format: TKT-YYYYMMDD-RANDOM
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `TKT-${date}-${random}`;
};

/**
 * Generate tickets for a completed transaction
 */
export const generateTickets = async (
    tx: Prisma.TransactionClient,
    transactionId: string
) => {
    // 1. Get transaction items
    const transaction = await tx.purchase_transactions.findUnique({
        where: { id: transactionId },
        include: {
            transaction_items: true
        }
    });

    if (!transaction) {
        throw new Error('Transaction not found');
    }

    const tickets = [];

    // 2. Loop through items and create tickets
    // Strategy: One ticket code per transaction (group ticket) OR one ticket per item?
    // Based on schema: `tickets` table has `transactionId` @unique.
    // This implies ONE ticket record per transaction.
    // And `ticket_details` has `ticketId` and `attractionId`.
    // So it's a "Group Ticket" model where one QR code represents the whole purchase?
    // Let's check schema again.
    // `tickets` -> `qrCode` @unique
    // `ticket_details` -> quantity per attraction.
    // Yes, it seems to be one master QR code for the transaction.

    const ticketCode = generateUniqueTicketCode();

    // Generate QR Code
    // Content: The ticket code itself, or a signed JWT, or a URL to validate?
    // Usually just the code is enough if the scanner app validates against API.
    const qrCodeDataURL = await QRCode.toDataURL(ticketCode);

    // Upload QR Code to storage (optional, or store base64? Schema says string(500) for qrCode... 
    // Wait, 500 chars might be too small for a Data URL. 
    // And schema has `qrCode String @unique @db.VarChar(500)`. 
    // A data URL is long. 
    // Maybe `qrCode` field is just the "code" text, not the image URL?
    // Or maybe it stores a short URL?
    // If it's a URL, we need to upload the image.

    // Let's upload the QR image using uploadService
    const uploadedQr = await uploadImageFromBase64(
        qrCodeDataURL,
        uploadConfig.folders.temp, // or a specific 'tickets' folder if we add it
        { maxSize: 1024 * 1024 }
    );

    // Create Ticket Record
    const ticket = await tx.tickets.create({
        data: {
            transactionId: transaction.id,
            ticketCode: ticketCode,
            qrCode: uploadedQr.url, // Store the public URL
            status: 'ACTIVE',
            validFrom: new Date(), // Valid immediately
            validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Valid for 1 year by default? Or based on visitDate?
            // Actually, items have `visitDate`. If items have different visit dates, this is tricky.
            // But usually checkout is for a specific date or open date.
            // `transaction_items` has `visitDate`.
            // Let's take the earliest visitDate as validFrom and latest as validUntil?
            // Or just set validFrom = today.

            usedCount: 0,
            ticketData: {
                customerName: (transaction.customerInfo as any)?.firstName + ' ' + (transaction.customerInfo as any)?.lastName
            }
        }
    });

    // Create Ticket Details (one per attraction/type)
    for (const item of transaction.transaction_items) {
        await tx.ticket_details.create({
            data: {
                ticketId: ticket.id,
                attractionId: item.attractionId,
                ticketType: item.ticketType,
                totalQty: item.quantity,
                remainingQty: item.quantity,
                usedQty: 0,
                visitDate: item.visitDate,
                timeSlot: null // Add if needed
            }
        });
    }

    return ticket;
};

export default {
    generateTickets
};
