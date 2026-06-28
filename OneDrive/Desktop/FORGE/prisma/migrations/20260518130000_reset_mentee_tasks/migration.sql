-- One-time reset: existing mentees joined before the mentor-controlled
-- release model. Flip every non-verified task back to "locked" and clear
-- any stray release/deadline/closed fields so the mentor controls every
-- release from this deploy forward.
--
-- Verified tasks are preserved — mentees keep credit for work they already
-- shipped before this change.

UPDATE "Task" t
SET    status = 'locked',
       "releasedAt" = NULL,
       "releasedBy" = NULL,
       deadline = NULL,
       "closedAt" = NULL
WHERE  t.status != 'verified'
  AND  t."phaseId" IN (
         SELECT p.id
         FROM   "Phase" p
         JOIN   "Track" tr  ON tr.id = p."trackId"
         JOIN   "Roadmap" r ON r.id  = tr."roadmapId"
         JOIN   "MentorLink" ml ON ml."menteeId" = r."userId"
         WHERE  ml."isActive" = true
       );
