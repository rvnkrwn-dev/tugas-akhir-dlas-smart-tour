
import { H3Event } from 'h3'
import { requireAdmin, UserContext } from '~~/server/utils/auth'
import { rateLimit, RateLimitPresets } from '~~/server/utils/rateLimit'
import { logError } from '~~/server/utils/logger'
import { HTTP_STATUS, ERROR_CODES, errorResponse } from '~~/server/utils/response'

// Infer the type of preset key if not exported, or just use string/enum
type RateLimitPreset = keyof typeof RateLimitPresets

interface AdminHandlerOptions {
    rateLimit?: RateLimitPreset
    requireSuperAdmin?: boolean
}

/**
 * Wrapper for admin API handlers
 * Handles authentication, rate limiting, and error handling automatically
 */
export const defineAdminHandler = <T>(
    handler: (event: H3Event, user: UserContext) => Promise<T>,
    options: AdminHandlerOptions = {}
) => {
    return defineEventHandler(async (event: H3Event) => {
        // 1. Apply rate limiting (default to API_GENERAL if not specified)
        const presetKey = options.rateLimit || 'API_GENERAL'
        const presetOptions = RateLimitPresets[presetKey as keyof typeof RateLimitPresets]
        await rateLimit(presetOptions)(event)

        try {
            // 2. Auth check
            const user = requireAdmin(event)

            // 3. Optional Super Admin check
            if (options.requireSuperAdmin && user.role !== 'SUPER_ADMIN') {
                throw createError({
                    statusCode: HTTP_STATUS.FORBIDDEN,
                    statusMessage: 'Forbidden',
                    data: errorResponse(
                        'Super Admin role required',
                        ERROR_CODES.FORBIDDEN
                    )
                })
            }

            // 4. Run handler
            return await handler(event, user)
        } catch (error: any) {
            // If it's already a H3Error, rethrow it
            if (error.statusCode) {
                throw error
            }

            // 5. Default Error Handling
            // Log unexpected errors
            logError(error, {
                context: 'admin-handler',
                path: event.path,
                method: event.method,
                userId: (event.context as any).user?.userId,
            })

            // Return generic error
            throw createError({
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                statusMessage: 'Internal server error',
                data: errorResponse(
                    'An unexpected error occurred',
                    ERROR_CODES.INTERNAL_ERROR
                )
            })
        }
    })
}
