-- LearningProgress: per-item check marks on /learn/[slug]/[week]. Previously
-- stored only in localStorage so the server couldn't gate submissions. Now
-- every link-click and radio-tick is persisted server-side, which lets
-- /api/checkins refuse submissions for weeks the mentee hasn't worked through.
CREATE TABLE "LearningProgress" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "userId"      TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "week"        INTEGER NOT NULL,
  "itemKey"     TEXT NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LearningProgress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- One row per (user, slug, week, item) — toggling a checkbox is upsert/delete.
CREATE UNIQUE INDEX "LearningProgress_userId_slug_week_itemKey_key"
  ON "LearningProgress"("userId", "slug", "week", "itemKey");

-- Lookup-by-week is the hot path (fetching all done items for the current week).
CREATE INDEX "LearningProgress_userId_slug_week_idx"
  ON "LearningProgress"("userId", "slug", "week");

-- Soft-delete column on MentorComment so a mentee can clear notes from THEIR
-- inbox without destroying the mentor's audit trail.
ALTER TABLE "MentorComment" ADD COLUMN "hiddenByMentee" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "MentorComment_menteeId_hiddenByMentee_idx"
  ON "MentorComment"("menteeId", "hiddenByMentee");
