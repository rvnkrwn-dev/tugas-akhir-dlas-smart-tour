import Redis from 'ioredis'
import { logInfo, logError, logWarn } from './logger'


/**
 * Redis client configuration and utilities
 * Provides caching functionality for improved performance
 */

/**
 * Get Redis configuration from runtime config
 */
const getRedisConfig = () => {
    const config = useRuntimeConfig();
    return {
        host: config.redisHost || 'localhost',
        port: parseInt(config.redisPort || '6379'),
        password: config.redisPassword || undefined,
        db: parseInt(config.redisDb || '0'),
        retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000)
            return delay
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
    }
}

// Create Redis client
let redisClient: Redis | null = null

/**
 * Get or create Redis client instance
 */
export const getRedisClient = async (): Promise<Redis | null> => {
    if (redisClient) {
        return redisClient
    }

    try {
        const REDIS_CONFIG = getRedisConfig()
        redisClient = new Redis(REDIS_CONFIG)

        // Connect to Redis
        await redisClient.connect()

        redisClient.on('connect', () => {
            logInfo('Redis client connected successfully', {
                host: REDIS_CONFIG.host,
                port: REDIS_CONFIG.port,
            })
        })

        redisClient.on('error', (error) => {
            logError('Redis client error', {
                error: error.message,
                stack: error.stack,
            })
        })

        redisClient.on('close', () => {
            logWarn('Redis connection closed')
        })

        return redisClient
    } catch (error: any) {
        const REDIS_CONFIG = getRedisConfig()
        logError('Failed to connect to Redis', {
            error: error.message,
            config: {
                host: REDIS_CONFIG.host,
                port: REDIS_CONFIG.port,
            },
        })
        return null
    }
}

/**
 * Cache utilities
 */

/**
 * Get value from cache
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
    try {
        const client = await getRedisClient()
        if (!client) return null

        const value = await client.get(key)
        if (!value) return null

        return JSON.parse(value) as T
    } catch (error: any) {
        logError('Cache get error', {
            key,
            error: error.message,
        })
        return null
    }
}

/**
 * Set value in cache with TTL (Time To Live)
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in seconds (default: 5 minutes)
 */
export const setCache = async (
    key: string,
    value: any,
    ttl: number = 300
): Promise<boolean> => {
    try {
        const client = await getRedisClient()
        if (!client) return false

        const serialized = JSON.stringify(value)
        await client.setex(key, ttl, serialized)

        return true
    } catch (error: any) {
        logError('Cache set error', {
            key,
            ttl,
            error: error.message,
        })
        return false
    }
}

/**
 * Delete value from cache
 */
export const deleteCache = async (key: string): Promise<boolean> => {
    try {
        const client = await getRedisClient()
        if (!client) return false

        await client.del(key)
        return true
    } catch (error: any) {
        logError('Cache delete error', {
            key,
            error: error.message,
        })
        return false
    }
}

/**
 * Delete multiple keys matching a pattern
 */
export const deleteCachePattern = async (pattern: string): Promise<number> => {
    try {
        const client = await getRedisClient()
        if (!client) return 0

        const keys = await client.keys(pattern)
        if (keys.length === 0) return 0

        await client.del(...keys)
        return keys.length
    } catch (error: any) {
        logError('Cache pattern delete error', {
            pattern,
            error: error.message,
        })
        return 0
    }
}

/**
 * Check if key exists in cache
 */
export const cacheExists = async (key: string): Promise<boolean> => {
    try {
        const client = await getRedisClient()
        if (!client) return false

        const exists = await client.exists(key)
        return exists === 1
    } catch (error: any) {
        logError('Cache exists check error', {
            key,
            error: error.message,
        })
        return false
    }
}

/**
 * Get remaining TTL for a key
 */
export const getCacheTTL = async (key: string): Promise<number> => {
    try {
        const client = await getRedisClient()
        if (!client) return -1

        return await client.ttl(key)
    } catch (error: any) {
        logError('Cache TTL check error', {
            key,
            error: error.message,
        })
        return -1
    }
}

/**
 * Cache key generators
 */
export const CacheKeys = {
    // Attractions
    attractionsList: (params?: any) => {
        const query = params ? JSON.stringify(params) : 'all'
        return `attractions:list:${query}`
    },
    attractionBySlug: (slug: string) => `attractions:slug:${slug}`,
    attractionById: (id: string) => `attractions:id:${id}`,

    // User
    userById: (id: string) => `user:${id}`,
    userByEmail: (email: string) => `user:email:${email}`,

    // Stats
    dashboardStats: () => 'stats:dashboard',
    revenueStats: (period?: string) => `stats:revenue:${period || 'all'}`,
    attractionStats: () => 'stats:attractions',
    adminDashboardOverview: () => 'admin:dashboard:overview',
}

/**
 * Cache TTL presets (in seconds)
 */
export const CacheTTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 900, // 15 minutes
    HOUR: 3600, // 1 hour
    DAY: 86400, // 24 hours
}

/**
 * Gracefully close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
    if (redisClient) {
        await redisClient.quit()
        redisClient = null
        logInfo('Redis connection closed gracefully')
    }
}

// Export Redis client for advanced usage
export { redisClient }
