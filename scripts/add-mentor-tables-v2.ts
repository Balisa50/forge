/**
 * v2 migration:
 *   - Extend MentorComment with authorRole + kind columns
 *   - Create MentorResource table for mentor-granted extra resources
 *
 * Safe to re-run. Idempotent.
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Extending MentorComment with authorRole + kind...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "MentorComment"
      ADD COLUMN IF NOT EXISTS "authorRole" TEXT NOT NULL DEFAULT 'mentor';
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "MentorComment"
      ADD COLUMN IF NOT EXISTS "kind" TEXT NOT NULL DEFAULT 'note';
  `);

  console.log("Creating MentorResource table...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "MentorResource" (
      "id"        TEXT NOT NULL,
      "taskId"    TEXT NOT NULL,
      "mentorId"  TEXT NOT NULL,
      "menteeId"  TEXT NOT NULL,
      "title"     TEXT NOT NULL,
      "url"       TEXT NOT NULL,
      "note"      TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "MentorResource_pkey" PRIMARY KEY ("id")
    );
  `);

  console.log("Adding foreign keys...");
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MentorResource_taskId_fkey') THEN
        ALTER TABLE "MentorResource"
          ADD CONSTRAINT "MentorResource_taskId_fkey"
          FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MentorResource_mentorId_fkey') THEN
        ALTER TABLE "MentorResource"
          ADD CONSTRAINT "MentorResource_mentorId_fkey"
          FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MentorResource_menteeId_fkey') THEN
        ALTER TABLE "MentorResource"
          ADD CONSTRAINT "MentorResource_menteeId_fkey"
          FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END$$;
  `);

  console.log("Indexes...");
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "MentorResource_menteeId_taskId_idx" ON "MentorResource"("menteeId", "taskId");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "MentorResource_mentorId_menteeId_idx" ON "MentorResource"("mentorId", "menteeId");`,
  );

  console.log("✓ v2 migration complete.");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
