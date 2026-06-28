-- AI Mentor interaction log. Every release / verification / question / warning
-- from THE PROFESSOR persona is stored so the AI has memory across sessions
-- and we can audit and budget API costs.
--
-- This table is only written to when AI_MENTOR_ENABLED=true env var is set
-- AND ANTHROPIC_API_KEY is configured. Until then the table sits empty.

CREATE TABLE "AIMentorInteraction" (
  "id"           TEXT NOT NULL PRIMARY KEY,
  "userId"       TEXT NOT NULL,
  "taskId"       TEXT,
  "kind"         TEXT NOT NULL,
  "response"     TEXT NOT NULL,
  "verdict"      TEXT,
  "warningCount" INTEGER NOT NULL DEFAULT 0,
  "evidence"     JSONB,
  "tokensUsed"   INTEGER,
  "costUsd"      DOUBLE PRECISION,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AIMentorInteraction_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AIMentorInteraction_taskId_fkey" FOREIGN KEY ("taskId")
    REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "AIMentorInteraction_userId_taskId_idx"
  ON "AIMentorInteraction"("userId", "taskId");

CREATE INDEX "AIMentorInteraction_userId_createdAt_idx"
  ON "AIMentorInteraction"("userId", "createdAt");
