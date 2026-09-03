-- Weekly implementation intentions (Gollwitzer): the learner commits to
-- WHEN, WHERE, and WHAT FIRST before a released week opens.

ALTER TABLE "Task" ADD COLUMN "intentWhen" TEXT;
ALTER TABLE "Task" ADD COLUMN "intentWhere" TEXT;
ALTER TABLE "Task" ADD COLUMN "intentFirst" TEXT;
ALTER TABLE "Task" ADD COLUMN "intentSetAt" TIMESTAMP(3);
