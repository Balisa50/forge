// Usage: npx tsx scripts/wipe-sessions.mts
// Deletes ALL sessions — forces everyone to re-login.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

try {
  const result = await prisma.session.deleteMany({});
  console.log(`Deleted ${result.count} session(s).`);
} catch (e) {
  console.error("Error:", e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
