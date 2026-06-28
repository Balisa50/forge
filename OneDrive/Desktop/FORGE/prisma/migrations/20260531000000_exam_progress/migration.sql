-- ExamProgress: account-backed mastery + spaced-repetition state for the
-- actuary exam paths (/learn/exam/[slug]). Previously localStorage-only, so a
-- student's progress was per-device and lost on a cache clear or device switch.
-- Now persisted per user so it survives and syncs across devices; localStorage
-- stays as an offline/instant cache. Purely additive — one new table.
CREATE TABLE "ExamProgress" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "userId"     TEXT NOT NULL,
  "slug"       TEXT NOT NULL,
  "conceptId"  TEXT NOT NULL,
  "status"     TEXT NOT NULL DEFAULT 'not-started',
  "best"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "attempts"   INTEGER NOT NULL DEFAULT 0,
  "box"        INTEGER NOT NULL DEFAULT 0,
  "dueAt"      TIMESTAMP(3),
  "masteredAt" TIMESTAMP(3),
  "lastSeen"   TIMESTAMP(3),
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExamProgress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- One row per (user, path, concept) — every write is an upsert on this key.
CREATE UNIQUE INDEX "ExamProgress_userId_slug_conceptId_key"
  ON "ExamProgress"("userId", "slug", "conceptId");

-- Hot path: load all of a user's progress for one exam path.
CREATE INDEX "ExamProgress_userId_slug_idx"
  ON "ExamProgress"("userId", "slug");
