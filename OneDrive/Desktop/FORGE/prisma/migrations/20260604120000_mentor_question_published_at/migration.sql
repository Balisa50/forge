-- MentorQuestion.publishedAt — draft/publish gate for the "Send Questions to
-- Student" button. NULL = draft (mentor-only). A timestamp = published. The
-- student-facing queries filter publishedAt IS NOT NULL so drafts never leak.
--
-- Existing questions are backfilled to createdAt so anything authored before
-- this change stays visible to students it was already sent to (preserves
-- backward compatibility).

ALTER TABLE "MentorQuestion" ADD COLUMN "publishedAt" TIMESTAMP(3);

UPDATE "MentorQuestion"
   SET "publishedAt" = "createdAt"
 WHERE "publishedAt" IS NULL
   AND "isActive" = TRUE;

CREATE INDEX "MentorQuestion_taskId_publishedAt_idx"
  ON "MentorQuestion" ("taskId", "publishedAt");
