/**
 * Add Certificate.signature column. Idempotent.
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Adding Certificate.signature column...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Certificate"
      ADD COLUMN IF NOT EXISTS "signature" TEXT;
  `);
  console.log("✓ Certificate.signature ready.");
}

main()
  .catch((e) => { console.error("Migration failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
