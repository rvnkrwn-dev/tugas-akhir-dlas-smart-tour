/**
 * Database Connection Plugin
 * This plugin runs when the Nitro server starts
 * and verifies the database connection
 */

import { prisma } from "~~/server/lib/prisma";

export default defineNitroPlugin(async (nitroApp) => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        // Optional: Log database info
        const config = useRuntimeConfig();
        console.log(`📊 Database: ${config.databaseName} @ ${config.databaseHost}:${config.databasePort}`);
    } catch (error: any) {
        console.error("❌ Database connection failed:", error.message);
        console.warn("⚠️  Server will continue but database operations will fail");
    }
});