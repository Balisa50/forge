-- Mentor display name: the persona name mentees see, so a mentor can keep
-- personal channels (WhatsApp etc) separate from in-app mentoring.
ALTER TABLE "User" ADD COLUMN "mentorDisplayName" TEXT;

-- Learning applications: people apply via /apply, a mentor reviews + approves.
CREATE TABLE "MentorApplication" (
  "id"             TEXT NOT NULL PRIMARY KEY,
  "applicantName"  TEXT NOT NULL,
  "applicantEmail" TEXT NOT NULL,
  "trackSlug"      TEXT,
  "motivation"     TEXT NOT NULL,
  "commitment"     TEXT,
  "status"         TEXT NOT NULL DEFAULT 'pending',
  "reviewedById"   TEXT,
  "inviteCode"     TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt"     TIMESTAMP(3)
);

CREATE INDEX "MentorApplication_status_createdAt_idx"
  ON "MentorApplication"("status", "createdAt");
