import { getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { defineAdminHandler } from "~~/server/utils/handler";
import {
    successResponse,
    errorResponse,
    ERROR_CODES,
    HTTP_STATUS,
} from "~~/server/utils/response";

export default defineAdminHandler(async (event, currentUser) => {
    const id = event.context.params?.id;

    if (!id) {
        throw createError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            statusMessage: "ID is required",
            data: errorResponse("ID is required", ERROR_CODES.VALIDATION_ERROR),
        });
    }

    // Check if exists
    const message = await prisma.inbox.findUnique({
        where: { id },
    });

    if (!message) {
        throw createError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            statusMessage: "Message not found",
            data: errorResponse("Message not found", ERROR_CODES.NOT_FOUND),
        });
    }

    // Delete
    await prisma.inbox.delete({
        where: { id },
    });

    // Log activity
    prisma.activity_logs.create({
        data: {
            userId: currentUser.userId,
            userRole: currentUser.role,
            action: "DELETE_INBOX_MESSAGE",
            entityType: "INBOX",
            entityId: id,
            description: `Admin deleted inbox message from ${message.email}`,
            metadata: { messageId: id, email: message.email },
            ipAddress:
                getHeader(event, "x-forwarded-for") ||
                getHeader(event, "x-real-ip") ||
                "0.0.0.0",
            userAgent: getHeader(event, "user-agent") || null,
        },
    }).catch((err) => console.error("Failed to log activity:", err));

    return successResponse(
        null,
        "Inbox message deleted successfully",
    );
});
