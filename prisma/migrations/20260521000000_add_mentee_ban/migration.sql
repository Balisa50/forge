-- Mentor-controlled mentee suspension.
-- When bannedAt is set on a MentorLink, the mentee is locked out of the
-- whole app and sees a suspension letter on login. The mentor can reverse
-- it by setting bannedAt back to NULL.

ALTER TABLE "MentorLink" ADD COLUMN "bannedAt" TIMESTAMP(3);
ALTER TABLE "MentorLink" ADD COLUMN "banReason" TEXT;
