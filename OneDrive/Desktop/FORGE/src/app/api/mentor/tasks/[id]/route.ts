/**
 * PATCH /api/mentor/tasks/:id
 *   Body: { action: "unlock" | "verify" | "reopen", menteeId: string }
 *
 * Mentor super-powers on a mentee's task:
 *   - "unlock"  — set status from locked → available (mentor decided they're ready, skip prerequisites)
 *   - "verify"  — set status → verified (mentor signs off on the work, bypasses AI interrogation)
 *   - "reopen"  — set verified/failed → available (let the mentee redo it)
 *
 * Only the mentee's active mentor can call this. Each action is logged
 * as an automatic MentorComment so there's a paper trail.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Action = "unlock" | "verify" | "reopen";
const ALLOWED: Action[] = ["unlock", "verify", "reopen"];

const STATUS_FOR_ACTION: Record<Action, "available" | "verified"> = {
  unlock: "available",
  verify: "verified",
  reopen: "available",
};

const NOTE_FOR_ACTION: Record<Action, string> = {
  unlock: "Mentor unlocked this week early — you're ready, go.",
  verify: "Mentor signed off on your work for this week. Verified without interrogation.",
  reopen: "Mentor reopened this week — take another pass.",
};

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

  if (!action || !ALLOWED.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  if (!menteeId) {
    return NextResponse.json({ error: "menteeId required" }, { status: 400 });
  }

  // Verify mentor link
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
    select: { id: true, status: true },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not in mentee's roadmap" }, { status: 400 });
  }

  const newStatus = STATUS_FOR_ACTION[action];

  // Apply the status change + automatic note in one transaction.
  const [updated] = await prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        ...(newStatus === "verified" ? { verifiedAt: new Date() } : {}),
        ...(action === "reopen" ? { verifiedAt: null } : {}),
      },
      select: { id: true, status: true, verifiedAt: true },
    }),
    prisma.mentorComment.create({
      data: {
        taskId,
        mentorId,
        menteeId,
        body: NOTE_FOR_ACTION[action],
      },
    }),
  ]);

  return NextResponse.json({ task: updated, action });
}
