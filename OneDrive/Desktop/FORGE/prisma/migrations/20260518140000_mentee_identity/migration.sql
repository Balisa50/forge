-- ── New columns ────────────────────────────────────────────────────────
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "personalId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_personalId_key" ON "User"("personalId");

ALTER TABLE "MentorInvite" ADD COLUMN IF NOT EXISTS "expectedName" TEXT;
ALTER TABLE "MentorInvite" ADD COLUMN IF NOT EXISTS "personalIdIssued" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "MentorInvite_personalIdIssued_key" ON "MentorInvite"("personalIdIssued");
ALTER TABLE "MentorInvite" ADD COLUMN IF NOT EXISTS "consumedByUserId" TEXT;

-- ── Backfill existing mentees with auto-generated personal IDs ─────────
-- Every active mentee (active MentorLink as menteeId) gets a personalId
-- of the form FORGE-{8 random base32 chars} — collision risk negligible.
UPDATE "User" u
SET "personalId" = 'FORGE-' || substring(md5(random()::text || u.id) FROM 1 FOR 4) || '-' || substring(md5(random()::text || u.id || 'salt') FROM 1 FOR 4)
WHERE "personalId" IS NULL
  AND u.id IN (
    SELECT DISTINCT "menteeId"
    FROM "MentorLink"
    WHERE "isActive" = true
  );
