/**
 * PATCH /api/mentor/tasks/:id
 *   Body: {
 *     action: "release" | "extend" | "close" | "unlock" | "verify" | "reopen",
 *     menteeId: string,
 *     deadlineAt?: string  // ISO date — required for release & extend
 *   }
 *
 * Mentor-controlled lifecycle of a mentee's week. New flow (May 2026):
 *
 *   locked  --(release w/ deadline)-->  available  --(deadline hit OR close)-->  closed
 *      ^                                     |                                       |
 *      |                                     v                                       v
 *      +---------(reopen)---------- verified <--(verify)--+    (extend)-->  available again
 *
 *   - release  → mark week available + set releasedAt + deadlineAt
 *   - extend   → push deadlineAt forward (clears closedAt if set)
 *   - close    → manually close before deadline (sets closedAt = now)
 *   - verify   → sign off as done (status=verified)
 *   - reopen   → flip verified back to available (clears verifiedAt + closedAt)
 *   - unlock   → legacy: bypass prerequisite chain (no deadline)
 *
 * Each action is logged as a MentorComment with kind="action_log".
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";

type Action = "release" | "extend" | "close" | "unlock" | "verify" | "reopen";
const ALLOWED: Action[] = ["release", "extend", "close", "unlock", "verify", "reopen"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mentorId = session.user.id;
  const { id: taskId } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body.action as Action | undefined;
  const menteeId = body.menteeId as string | undefined;
  const deadlineRaw = body.deadlineAt as string | undefined;
  const customNote = (body.note as string | undefined)?.trim();
  const depthRatingRaw = body.depthRating;
  // 1–5 mentor rating, only meaningful on "verify". Clamp + accept null.
  let depthRating: number | null = null;
  if (action === "verify" && typeof depthRatingRaw === "number") {
    const n = Math.round(depthRatingRaw);
    if (n >= 1 && n <= 5) depthRating = n;
  }

  if (!action || !ALLOWED.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  if (!menteeId) {
    return NextResponse.json({ error: "menteeId required" }, { status: 400 });
  }

  // Parse deadline for release/extend
  let deadlineAt: Date | null = null;
  if (action === "release" || action === "extend") {
    if (!deadlineRaw) {
      return NextResponse.json({ error: "deadlineAt required for release/extend" }, { status: 400 });
    }
    const parsed = new Date(deadlineRaw);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid deadlineAt" }, { status: 400 });
    }
    if (parsed.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Deadline must be in the future" }, { status: 400 });
    }
    deadlineAt = parsed;
  }

  // Verify mentor → mentee link
  const link = await prisma.mentorLink.findFirst({
    where: { mentorId, menteeId, isActive: true },
  });
  if (!link) {
    return NextResponse.json({ error: "Not your mentee" }, { status: 403 });
  }

  // Verify the task belongs to this mentee's roadmap
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      phase: { track: { roadmap: { userId: menteeId } } },
    },
    select: { id: true, status: true, title: true, deadline: true, closedAt: true },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not in mentee's roadmap" }, { status: 400 });
  }

  // Compute updates per action
  type Updates = {
    status?: "available" | "verified";
    deadline?: Date | null;
    releasedAt?: Date | null;
    releasedBy?: string | null;
    closedAt?: Date | null;
    verifiedAt?: Date | null;
    mentorRating?: number | null;
  };
  let updates: Updates = {};
  let note = "";

  switch (action) {
    case "release":
      updates = {
        status: "available",
        deadline: deadlineAt,
        releasedAt: new Date(),
        releasedBy: mentorId,
        closedAt: null,
      };
      note = `Mentor released this week. Deadline ${deadlineAt!.toLocaleDateString()} — get it done before then.`;
      break;
    case "extend":
      updates = { deadline: deadlineAt, closedAt: null };
      // If it was closed and we extend, also re-open it
      if (task.closedAt) updates.status = "available";
      note = `Mentor extended the deadline to ${deadlineAt!.toLocaleDateString()}.`;
      break;
    case "close":
      updates = { closedAt: new Date() };
      note = "Mentor closed this week. You can't access it until they reopen or extend.";
      break;
    case "unlock":
      updates = { status: "available", closedAt: null };
      note = "Mentor unlocked this week early — you're ready, go.";
      break;
    case "verify":
      updates = { status: "verified", verifiedAt: new Date(), closedAt: null };
      if (depthRating !== null) updates.mentorRating = depthRating;
      note = depthRating !== null
        ? `Mentor signed off on your work for this week. Verified · depth ${depthRating}/5.`
        : "Mentor signed off on your work for this week. Verified.";
      break;
    case "reopen":
      updates = { status: "available", verifiedAt: null, closedAt: null };
      note = "Mentor reopened this week — take another pass.";
      break;
  }

  // ── REOPEN: reset the existing Checkin's Interrogation so the SAME row
  // returns to the mentor's queue instead of the next student submission
  // creating a duplicate. This is the data-layer half of "one entry per
  // student per week". The prior transcript (questions + answers + scores)
  // stays intact for audit; only the review verdict is cleared.
  if (action === "reopen") {
    const latest = await prisma.checkin.findFirst({
      where: { userId: menteeId, taskId },
      orderBy: { createdAt: "desc" },
      include: { interrogation: true },
    });
    if (latest?.interrogation) {
      await prisma.interrogation.update({
        where: { id: latest.interrogation.id },
        data: {
          mentorReviewedAt: null,
          passed: false,
          feedback: "Reopened by mentor — make revisions and resubmit.",
        },
      });
      // The Checkin status itself flips back so the Journal pill no longer
      // shows the green "passed" placeholder; the journal entry derives
      // "NEEDS REVISION" from interrogation.passed=false + reviewed=false.
      await prisma.checkin.update({
        where: { id: latest.id },
        data: { status: "failed" },
      });
    }
  }

  // CLEAN SLATE ON SIGN-OFF: when a week is verified, archive its previously
  // pinned notes from the mentee's Notes page so they start the next week
  // fresh. The week's own thread keeps the full history for the record, and the
  // sign-off note written just below stays visible as the final word.
  if (action === "verify") {
    await prisma.mentorComment.updateMany({
      where: { taskId, menteeId, kind: "note", hiddenByMentee: false },
      data: { hiddenByMentee: true },
    });
  }

  // Apply atomically + log
  // If mentor provided a custom note, write it as a separate "note" comment
  // alongside the auto action_log so it's visually distinct on the mentee's
  // dashboard.
  const txOps: Promise<unknown>[] = [];
  const updatedPromise = prisma.task.update({
    where: { id: taskId },
    data: updates,
    select: {
      id: true, status: true, deadline: true, releasedAt: true,
      releasedBy: true, closedAt: true, verifiedAt: true,
    },
  });
  txOps.push(updatedPromise);
  txOps.push(prisma.mentorComment.create({
    data: {
      taskId, mentorId, menteeId,
      body: note,
      authorRole: "mentor",
      kind: "action_log",
    },
  }));
  if (customNote) {
    txOps.push(prisma.mentorComment.create({
      data: {
        taskId, mentorId, menteeId,
        body: customNote,
        authorRole: "mentor",
        kind: "note",
      },
    }));
  }
  const results = await prisma.$transaction(txOps as never);
  const updated = results[0];

  void sendNotification("mentor-action", {
    recipientId: menteeId,
    actorId: mentorId,
    taskTitle: task.title,
    payload: { action, deadlineAt: deadlineAt?.toISOString() ?? null },
  });

  return NextResponse.json({ task: updated, action });
}
