import { defineEventHandler, getHeader } from 'h3'
import { logRequest } from '~~/server/utils/logger'

/**
 * Request logging middleware
 * Logs all HTTP requests with timing information
 */
export default defineEventHandler((event) => {
    const startTime = Date.now()

    // Get request info
    const method = event.node.req.method || 'GET'
    const url = event.node.req.url || '/'

    // Trust proxy headers only in production behind reverse proxy
    const trustProxy = process.env.NODE_ENV === 'production'
    const ip = trustProxy
        ? (getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
            getHeader(event, 'x-real-ip') ||
            event.node.req.socket.remoteAddress ||
            '0.0.0.0')
        : (event.node.req.socket.remoteAddress || '0.0.0.0')

    const userAgent = getHeader(event, 'user-agent') || undefined

    // Get user ID if authenticated
    const userId = event.context.user?.userId

    // Log after response is sent
    const finishHandler = () => {
        const responseTime = Date.now() - startTime
        const statusCode = event.node.res.statusCode

        // Only log API requests
        if (url.startsWith('/api')) {
            try {
                logRequest({
                    method,
                    url,
                    statusCode,
                    responseTime,
                    ip,
                    userAgent,
                    userId,
                })
            } catch (error) {
                // Don't crash the response if logging fails
                console.error('Logging error:', error);
            }
        }

        // Clean up listener to prevent memory leak
        event.node.res.removeListener('finish', finishHandler);
    }

    event.node.res.on('finish', finishHandler)
})
