import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '~~/generated/prisma/client';

const config = useRuntimeConfig();

const adapter = new PrismaMariaDb({
    host: config.databaseHost,
    user: config.databaseUser,
    password: config.databasePassword,
    database: config.databaseName,
    connectionLimit: 20,
    allowPublicKeyRetrieval: true
});

const prisma = new PrismaClient({ adapter });

export { prisma }