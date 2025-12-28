/**
 * Redis Connection Plugin
 * This plugin runs when the Nitro server starts
 * and verifies the Redis connection
 */

import { getRedisClient } from "~~/server/utils/cache";

export default defineNitroPlugin(async (nitroApp) => {
    try {
        const config = useRuntimeConfig();

        // Check if Redis is configured
        if (!config.redisHost) {
            console.log("ℹ️  Redis not configured - caching disabled");
            return;
        }

        // Test Redis connection
        const client = await getRedisClient();

        if (client) {
            // Test with a ping
            await client.ping();
            console.log("✅ Redis connected successfully");
            console.log(`📦 Redis: ${config.redisHost}:${config.redisPort} (DB: ${config.redisDb || 0})`);
        } else {
            console.warn("⚠️  Redis connection failed - caching disabled");
        }
    } catch (error: any) {
        console.error("❌ Redis connection error:", error.message);
        console.warn("⚠️  Server will continue but caching will be disabled");
    }
});
