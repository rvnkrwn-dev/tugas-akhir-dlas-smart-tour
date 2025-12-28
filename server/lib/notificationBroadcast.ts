import { EventEmitter } from 'events';

/**
 * Simple in-memory event emitter for broadcasting notifications to SSE clients
 * In production with multiple instances, use Redis pub/sub instead
 */
class NotificationBroadcaster extends EventEmitter {
    private static instance: NotificationBroadcaster;

    private constructor() {
        super();
        // Allow many listeners for multiple SSE connections
        this.setMaxListeners(1000);
    }

    static getInstance(): NotificationBroadcaster {
        if (!NotificationBroadcaster.instance) {
            NotificationBroadcaster.instance = new NotificationBroadcaster();
        }
        return NotificationBroadcaster.instance;
    }

    /**
     * Broadcast notification update to a specific user
     */
    broadcastToUser(userId: string, data: { unreadCount: number; notification?: any }) {
        this.emit(`user:${userId}`, data);
    }

    /**
     * Subscribe to notifications for a specific user
     */
    subscribe(userId: string, callback: (data: any) => void) {
        this.on(`user:${userId}`, callback);
        return () => this.off(`user:${userId}`, callback);
    }
}

export const notificationBroadcaster = NotificationBroadcaster.getInstance();