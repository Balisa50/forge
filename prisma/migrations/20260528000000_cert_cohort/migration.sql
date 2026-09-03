-- Add cohort name to Certificate so the artwork can display it.
-- Nullable — existing certs and solo-learner certs leave it NULL.
ALTER TABLE "Certificate" ADD COLUMN "cohort" TEXT;
