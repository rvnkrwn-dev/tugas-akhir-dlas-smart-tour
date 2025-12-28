import mariadb from 'mariadb';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
    console.log('🔄 Testing MariaDB Connection Pool...');

    const pool = mariadb.createPool({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        connectionLimit: 10,
        acquireTimeout: 10000,
        idleTimeout: 60000,
        minimumIdle: 2,
        resetAfterUse: true,
        allowPublicKeyRetrieval: true, // Fix for RSA public key error
    });

    console.log('✅ Pool created. Initial stats:', {
        total: pool.totalConnections(),
        active: pool.activeConnections(),
        idle: pool.idleConnections()
    });

    try {
        // 1. Test direct pool connection
        console.log('1️⃣ Testing Direct Pool Connection...');
        const conn = await pool.getConnection();
        console.log('   ✅ Direct connection acquired');
        await conn.query('SELECT 1');
        console.log('   ✅ Query executed');
        conn.release();
        console.log('   ✅ Connection released');

        // 2. Test Prisma Adapter
        console.log('2️⃣ Testing Prisma Adapter...');
        const adapter = new PrismaMariaDb(pool as any);
        const prisma = new PrismaClient({ adapter });

        console.log('   🔄 Connecting via Prisma...');
        await prisma.$connect();
        console.log('   ✅ Prisma connected');

        console.log('   🔄 Running query via Prisma...');
        const count = await prisma.users.count();
        console.log(`   ✅ Query success! User count: ${count}`);

        await prisma.$disconnect();
        console.log('   ✅ Prisma disconnected');

    } catch (error) {
        console.error('❌ Connection failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
        console.log('✅ Pool closed');
    }
}

main();
