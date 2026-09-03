import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
 prisma: PrismaClient | undefined;
};

function createPrisma() {
 // node-postgres defaults to connectionTimeoutMillis: 0, which means a query
 // waits FOREVER for a free pool connection. Under load (or pooler pressure)
 // that turns a slow page into a multi-minute hang that eventually "unsticks"
 // — exactly the frozen-sign-out symptom. Fail fast instead so a stuck request
 // errors in seconds rather than stalling the whole UI.
 const adapter = new PrismaPg({
 connectionString: process.env.DATABASE_URL!,
 max: 10, // cap connections per serverless instance
 connectionTimeoutMillis: 10_000, // give up waiting for a connection after 10s
 idleTimeoutMillis: 20_000, // release idle connections so the pooler frees up
 });
 return new PrismaClient({
 adapter,
 log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
 });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
