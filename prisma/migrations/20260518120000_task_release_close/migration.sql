-- Add mentor-controlled release/close fields to Task
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "releasedAt" TIMESTAMP(3);
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "releasedBy" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP(3);
