import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
    pool: Pool;
    adapter: PrismaPg;
    prisma: PrismaClient;
};

// Cache all components together to avoid connection pool inconsistencies during hot reload
const pool = globalForPrisma.pool || new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = globalForPrisma.adapter || new PrismaPg(pool);
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
    globalForPrisma.adapter = adapter;
    globalForPrisma.prisma = prisma;
}

export default prisma;