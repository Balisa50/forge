/**
 * Add MentorLink.visibility JSONB. Idempotent.
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Adding MentorLink.visibility JSONB...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "MentorLink"
      ADD COLUMN IF NOT EXISTS "visibility" JSONB;
  `);
  console.log("✓ MentorLink.visibility ready.");
}

main()
  .catch((e) => { console.error("Migration failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
