/**
 * Add Interrogation.mode + mentorReviewerId + mentorReviewedAt columns.
 * Create MentorQuestion table. Idempotent.
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Adding Interrogation.mode + review columns...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Interrogation"
      ADD COLUMN IF NOT EXISTS "mode" TEXT NOT NULL DEFAULT 'ai_solo';
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Interrogation"
      ADD COLUMN IF NOT EXISTS "mentorReviewerId" TEXT;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Interrogation"
      ADD COLUMN IF NOT EXISTS "mentorReviewedAt" TIMESTAMP(3);
  `);

  console.log("Creating MentorQuestion table...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "MentorQuestion" (
      "id"          TEXT NOT NULL,
      "taskId"      TEXT NOT NULL,
      "mentorId"    TEXT NOT NULL,
      "position"    INTEGER NOT NULL DEFAULT 0,
      "prompt"      TEXT NOT NULL,
      "rubric"      TEXT,
      "idealAnswer" TEXT,
      "isActive"    BOOLEAN NOT NULL DEFAULT true,
      "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"   TIMESTAMP(3) NOT NULL,
      CONSTRAINT "MentorQuestion_pkey" PRIMARY KEY ("id")
    );
  `);

  console.log("Adding FK + indexes...");
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MentorQuestion_taskId_fkey') THEN
        ALTER TABLE "MentorQuestion"
          ADD CONSTRAINT "MentorQuestion_taskId_fkey"
          FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MentorQuestion_mentorId_fkey') THEN
        ALTER TABLE "MentorQuestion"
          ADD CONSTRAINT "MentorQuestion_mentorId_fkey"
          FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END$$;
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "MentorQuestion_taskId_mentorId_isActive_idx" ON "MentorQuestion"("taskId", "mentorId", "isActive");`,
  );

  console.log("✓ MentorQuestion + Interrogation.mode ready.");
}

main()
  .catch((e) => { console.error("Migration failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
