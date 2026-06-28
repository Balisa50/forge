-- Org-admin control over whether suspended mentees may appeal. Additive,
-- non-destructive: existing orgs default to true (appeals allowed).
ALTER TABLE "Organization" ADD COLUMN "allowMenteeAppeals" BOOLEAN NOT NULL DEFAULT true;
