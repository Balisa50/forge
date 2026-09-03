/**
 * Add User.isCodeOnly + User.recoveryToken (unique). Idempotent.
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Adding User.isCodeOnly + User.recoveryToken...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "isCodeOnly" BOOLEAN NOT NULL DEFAULT false;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "recoveryToken" TEXT;
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_recoveryToken_key" ON "User"("recoveryToken");`,
  );
  console.log("✓ Recovery columns ready.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
