import mariadb from 'mariadb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from root (assuming script is in scripts/ or root)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Testing Database Connection...');
console.log('Host:', process.env.DATABASE_HOST);
console.log('User:', process.env.DATABASE_USER);
console.log('Port:', process.env.DATABASE_PORT);
console.log('Database:', process.env.DATABASE_NAME);

async function test() {
    let conn;
    try {
        conn = await mariadb.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            port: Number(process.env.DATABASE_PORT) || 3306,
            database: process.env.DATABASE_NAME,
            connectTimeout: 5000, // 5s timeout
            allowPublicKeyRetrieval: true
        });
        console.log("✅ Success! Connected to database.");

        const rows = await conn.query("SELECT 1 as val");
        console.log("✅ Query successful:", rows);

    } catch (err) {
        console.error("❌ Connection failed!");
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);
        if (err.cause) console.error("Cause:", err.cause);
    } finally {
        if (conn) conn.end();
    }
}

test();
