import { defineEventHandler } from 'h3'

interface RateLimitOptions {
    windowMs: number
    max: number
    message?: string
    keyGenerator?: (event: any) => string
}

/**
 * Rate limiting middleware (Disabled)
 * Database interactions caused pool timeouts, so this is now a pass-through.
 */
export const rateLimit = (options: RateLimitOptions) => {
    return defineEventHandler(async (event) => {
        // Rate limiting disabled due to connection pool issues
        return
    })
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
    // Strict limits for authentication endpoints
    AUTH_LOGIN: {
        windowMs: 15 * 60 * 1000,
        max: 1000,
        message: 'Too many login attempts. Please try again in 15 minutes.',
    },

    AUTH_REGISTER: {
        windowMs: 60 * 60 * 1000,
        max: 50,
        message: 'Too many registration attempts. Please try again later.',
    },

    AUTH_PASSWORD_RESET: {
        windowMs: 60 * 60 * 1000,
        max: 50,
        message: 'Too many password reset requests. Please try again later.',
    },

    AUTH_VERIFY_EMAIL: {
        windowMs: 60 * 60 * 1000,
        max: 100,
        message: 'Too many verification attempts. Please try again later.',
    },

    AUTH_TOKEN_REFRESH: {
        windowMs: 60 * 1000,
        max: 1000,
        message: 'Too many token refresh requests. Please slow down.',
    },

    API_GENERAL: {
        windowMs: 1 * 60 * 1000,
        max: 1000,
        message: 'Too many requests. Please slow down.',
    },

    API_ADMIN: {
        windowMs: 1 * 60 * 1000,
        max: 2000,
        message: 'Too many admin requests. Please slow down.',
    },

    FILE_UPLOAD: {
        windowMs: 60 * 60 * 1000,
        max: 50,
        message: 'Too many file uploads. Please try again later.',
    },
}

/**
 * Clear rate limit for a specific key
 */
export const clearRateLimit = async (key: string): Promise<void> => {
    return
}

/**
 * Get current request count for a key
 */
export const getRateLimitInfo = async (key: string) => {
    return {
        count: 0,
        oldestRequest: null,
    }
}
