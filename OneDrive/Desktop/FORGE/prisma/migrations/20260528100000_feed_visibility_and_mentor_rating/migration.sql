-- Build Feed visibility: opt-in name display, default anonymous.
ALTER TABLE "User" ADD COLUMN "showInFeed" BOOLEAN NOT NULL DEFAULT false;

-- Mentor depth rating: collected at verification time. Powers Forge Score.
ALTER TABLE "Task" ADD COLUMN "mentorRating" INTEGER;
