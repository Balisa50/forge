-- The Forge Pact: a binding written commitment every learner signs before
-- they can begin. The psychological anchor of FORGE accountability.

CREATE TABLE "ForgePact" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "why"       TEXT NOT NULL,
  "stake"     TEXT NOT NULL,
  "identity"  TEXT NOT NULL,
  "signature" TEXT NOT NULL,
  "signedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ForgePact_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ForgePact_userId_key" ON "ForgePact"("userId");
