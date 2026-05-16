// Usage: npx tsx scripts/delete-user.mts <email>
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx scripts/delete-user.mts <email>");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not found in .env.local or .env");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

try {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    console.log(`No user found with email ${email}`);
  } else {
    console.log(`Found user ${existing.id} (${email}). Deleting...`);
    const result = await prisma.user.deleteMany({ where: { email } });
    console.log(`Deleted ${result.count} user(s) and all cascaded data.`);
  }
} catch (e) {
  console.error("Error:", e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
