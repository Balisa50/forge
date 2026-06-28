-- Mentor-controlled certificate release: the mentor's persona name baked
-- into the cert at issue time. Solo learners (no mentor) leave this null
-- and the cert renders "The Forge" as the issuing authority.
ALTER TABLE "Certificate" ADD COLUMN "signedBy" TEXT;

-- Which mentor released this cert. Nullable for backward compat with the
-- self-issued certs that predate this change.
ALTER TABLE "Certificate" ADD COLUMN "releasedByMentorId" TEXT;
