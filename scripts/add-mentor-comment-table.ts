/**
 * One-off migration: add the MentorComment table to the production DB.
 *
 * Uses the same Prisma adapter the app uses at runtime so we don't need
 * to fight with `prisma db push` / `prisma migrate` here. Safe to run
 * multiple times — every statement is guarded by IF NOT EXISTS.
 *
 *   DATABASE_URL=... npx tsx scripts/add-mentor-comment-table.ts
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Creating MentorComment table if missing...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "MentorComment" (
      "id"         TEXT NOT NULL,
      "taskId"     TEXT NOT NULL,
      "mentorId"   TEXT NOT NULL,
      "menteeId"   TEXT NOT NULL,
      "body"       TEXT NOT NULL,
      "readAt"     TIMESTAMP(3),
      "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"  TIMESTAMP(3) NOT NULL,
      CONSTRAINT "MentorComment_pkey" PRIMARY KEY ("id")
    );
  `);

  // FKs
  console.log("Adding foreign keys (idempotent)...");
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MentorComment_taskId_fkey') THEN
        ALTER TABLE "MentorComment"
          ADD CONSTRAINT "MentorComment_taskId_fkey"
          FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MentorComment_mentorId_fkey') THEN
        ALTER TABLE "MentorComment"
          ADD CONSTRAINT "MentorComment_mentorId_fkey"
          FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MentorComment_menteeId_fkey') THEN
        ALTER TABLE "MentorComment"
          ADD CONSTRAINT "MentorComment_menteeId_fkey"
          FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END$$;
  `);

  console.log("Creating indexes...");
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "MentorComment_menteeId_taskId_idx" ON "MentorComment"("menteeId", "taskId");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "MentorComment_mentorId_menteeId_idx" ON "MentorComment"("mentorId", "menteeId");`,
  );

  console.log("✓ MentorComment migration complete.");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
