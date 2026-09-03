/**
 * v3 migration: MentorInvite table — pairing codes mentors generate so
 * learners can connect to them. Idempotent.
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Creating MentorInvite table...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "MentorInvite" (
      "id"          TEXT NOT NULL,
      "code"        TEXT NOT NULL,
      "mentorId"    TEXT NOT NULL,
      "roadmapSlug" TEXT,
      "label"       TEXT,
      "maxUses"     INTEGER,
      "usesCount"   INTEGER NOT NULL DEFAULT 0,
      "expiresAt"   TIMESTAMP(3),
      "isActive"    BOOLEAN NOT NULL DEFAULT true,
      "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "MentorInvite_pkey" PRIMARY KEY ("id")
    );
  `);

  console.log("Adding unique + indexes + FK...");
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "MentorInvite_code_key" ON "MentorInvite"("code");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "MentorInvite_mentorId_isActive_idx" ON "MentorInvite"("mentorId", "isActive");`,
  );
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MentorInvite_mentorId_fkey') THEN
        ALTER TABLE "MentorInvite"
          ADD CONSTRAINT "MentorInvite_mentorId_fkey"
          FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END$$;
  `);

  console.log("✓ MentorInvite ready.");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
