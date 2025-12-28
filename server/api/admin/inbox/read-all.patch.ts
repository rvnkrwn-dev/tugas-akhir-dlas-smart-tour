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
    try {
        // Update all unread to read
        const updateResult = await prisma.inbox.updateMany({
            where: { isRead: false },
            data: { isRead: true },
        });

        // Log activity if any updated
        if (updateResult.count > 0) {
            prisma.activity_logs.create({
                data: {
                    userId: currentUser.userId,
                    userRole: currentUser.role,
                    action: "MARK_ALL_INBOX_READ",
                    entityType: "INBOX",
                    description: `Admin marked ${updateResult.count} inbox messages as read`,
                    metadata: { count: updateResult.count },
                    ipAddress:
                        getHeader(event, "x-forwarded-for") ||
                        getHeader(event, "x-real-ip") ||
                        "0.0.0.0",
                    userAgent: getHeader(event, "user-agent") || null,
                },
            }).catch((err) => console.error("Failed to log activity:", err));
        }

        return successResponse(
            { count: updateResult.count },
            `${updateResult.count} messages marked as read`,
        );
    } catch (error: any) {
        console.error("Mark all read error:", error);
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            statusMessage: "Failed to mark messages as read",
            data: errorResponse(error.message, ERROR_CODES.INTERNAL_ERROR),
        });
    }
});
