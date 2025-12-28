import { prisma } from "~~/server/lib/prisma";
import { notificationBroadcaster } from "~~/server/lib/notificationBroadcast";

export enum users_role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN'
}

type NotificationType = 'REVIEW_SUBMITTED' | 'REVIEW_REQUEST_SENT' | 'CRITICAL_ERROR' | 'SYSTEM_ALERT' | 'INBOX';

interface CreateNotificationOptions {
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    userId?: string; // null = broadcast to all admins
}

// ... existing code ...

/**
 * Create notification for new inbox message
 */
export async function notifyNewInboxMessage(fullName: string, email: string, subject: string, messageId: string) {
    return notifyAllAdmins({
        type: 'INBOX',
        title: 'Pesan Baru',
        message: `Pesan baru dari ${fullName} (${email}): ${subject}`,
        metadata: { fullName, email, subject, messageId, action: 'inbox_received' },
    });
}

/**
 * Create a notification and broadcast to SSE clients
 */
export async function createNotification(options: CreateNotificationOptions) {
    try {
        const notification = await prisma.notification.create({
            data: {
                type: options.type,
                title: options.title,
                message: options.message,
                metadata: options.metadata || undefined,
                userId: options.userId || null,
            },
        });

        // Broadcast to SSE clients
        if (notification.userId) {
            // Get updated unread count for this user
            const unreadCount = await prisma.notification.count({
                where: {
                    AND: [
                        { OR: [{ userId: notification.userId }, { userId: null }] },
                        { isRead: false },
                    ],
                },
            });
            notificationBroadcaster.broadcastToUser(notification.userId, {
                unreadCount,
                notification,
            });
        }

        return notification;
    } catch (error) {
        console.error("[Create Notification Error]:", error);
        return null;
    }
}

/**
 * Create notification for all admin users
 */
export async function notifyAllAdmins(options: Omit<CreateNotificationOptions, 'userId'>) {
    try {
        const admins = await prisma.users.findMany({
            where: {
                role: { in: [users_role.ADMIN, users_role.SUPER_ADMIN] },
                isActive: true
            },
            select: { id: true },
        });

        console.log(`[Notify] Found ${admins.length} admins to notify`);

        if (admins.length === 0) {
            console.warn("[Notify] No active admins found, creating broadcast notification");
            // Create a broadcast notification (userId = null) if no admins found
            return [await createNotification(options)];
        }

        const notifications = await Promise.all(
            admins.map(admin =>
                createNotification({
                    ...options,
                    userId: admin.id,
                })
            )
        );

        return notifications.filter(Boolean);
    } catch (error) {
        console.error("[Notify All Admins Error]:", error);
        return [];
    }
}

/**
 * Create review submitted notification
 */
export async function notifyReviewSubmitted(reviewerName: string, company: string, rating: number) {
    return notifyAllAdmins({
        type: 'REVIEW_SUBMITTED',
        title: 'Review Baru',
        message: `${reviewerName} dari ${company} memberikan review dengan rating ${rating} bintang`,
        metadata: { reviewerName, company, rating },
    });
}

/**
 * Create review request sent notification
 */
export async function notifyReviewRequestSent(adminName: string, recipientEmail: string, recipientName: string) {
    return notifyAllAdmins({
        type: 'REVIEW_REQUEST_SENT',
        title: 'Permintaan Review Dikirim',
        message: `${adminName} mengirim permintaan review ke ${recipientName} (${recipientEmail})`,
        metadata: { adminName, recipientEmail, recipientName },
    });
}

/**
 * Create critical error notification
 */
export async function notifyCriticalError(source: string, errorMessage: string) {
    return notifyAllAdmins({
        type: 'CRITICAL_ERROR',
        title: 'Error Kritis',
        message: `Error pada ${source}: ${errorMessage}`,
        metadata: { source, errorMessage },
    });
}

/**
 * Create system alert notification
 */
export async function notifySystemAlert(title: string, message: string, metadata?: Record<string, any>) {
    return notifyAllAdmins({
        type: 'SYSTEM_ALERT',
        title,
        message,
        metadata,
    });
}

/**
 * Create notification for new user registration (public)
 */
export async function notifyUserRegistered(userName: string, email: string) {
    return notifyAllAdmins({
        type: 'SYSTEM_ALERT',
        title: 'Pengguna Baru Mendaftar',
        message: `${userName} (${email}) telah mendaftar ke sistem`,
        metadata: { userName, email, action: 'register' },
    });
}

/**
 * Create notification for admin-created user
 */
export async function notifyUserCreated(adminName: string, userName: string, email: string) {
    return notifyAllAdmins({
        type: 'SYSTEM_ALERT',
        title: 'Pengguna Baru Ditambahkan',
        message: `${adminName} menambahkan pengguna baru: ${userName} (${email})`,
        metadata: { adminName, userName, email, action: 'admin_create' },
    });
}