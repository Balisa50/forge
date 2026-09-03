-- Mentor-chosen submission requirements + video submissions.
--
-- 1. Task.submissionConfig — the mentor picks what a week's submission must
--    contain: link_or_file (default) | link_only | video_only | link_or_video |
--    link_and_video | video_and_file. NULL is read by the app as the default
--    (link_or_file), so every existing week keeps its current behaviour. We
--    still backfill the default explicitly so the column is self-describing.
--
-- 2. Checkin.videoUrl — a Google Drive / YouTube / Loom / Vimeo share link the
--    mentee submits as a video walkthrough. We store the link only; no video
--    file is ever uploaded to our servers (same rule as before). Existing
--    submissions are unaffected (videoUrl stays NULL).

ALTER TABLE "Task" ADD COLUMN "submissionConfig" JSONB;

UPDATE "Task"
   SET "submissionConfig" = '{"type": "link_or_file"}'::jsonb
 WHERE "submissionConfig" IS NULL;

ALTER TABLE "Checkin" ADD COLUMN "videoUrl" TEXT;
