/**
 * Mentor submission-requirement settings for one week (Task).
 *
 *   GET  /api/mentor/tasks/:id/submission-config
 *        → { submissionConfig: { type } }
 *
 *   PUT  /api/mentor/tasks/:id/submission-config
 *        Body: { type: SubmissionConfigType }
 *        → { submissionConfig: { type } }
 *
 * The mentor chooses what the mentee must hand in for this week: a link, a
 * video, a file, or a combination. The shape is validated against the shared
 * SUBMISSION_CONFIG types so an unknown value can never be stored.
 *
 * Auth: the caller must be the active mentor of the mentee who owns the task's
 * roadmap. (A week belongs to a mentee via phase → track → roadmap.userId.)
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  normalizeSubmissionConfig,
  SUBMISSION_CONFIG_OPTIONS,
  type SubmissionConfigType,
} from "@/lib/submission-types";

const VALID_TYPES = new Set(SUBMISSION_CONFIG_OPTIONS.map((o) => o.type));

/** Resolve the task, confirm the caller mentors its owner, return the menteeId. */
async function authorizeMentorForTask(mentorId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId },
    select: {
      id: true,
      submissionConfig: true,
      phase: { select: { track: { select: { roadmap: { select: { userId: true } } } } } },
    },
  });
  if (!task) return { error: "Task not found", status: 404 as const };

  const menteeId = task.phase.track.roadmap.userId;
  const link = await prisma.mentorLink.findFirst({
    where: { mentorId, menteeId, isActive: true },
    select: { id: true },
  });
  if (!link) return { error: "Not your mentee", status: 403 as const };

  return { task, menteeId };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: taskId } = await params;

  const res = await authorizeMentorForTask(session.user.id, taskId);
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });

  return NextResponse.json({ submissionConfig: normalizeSubmissionConfig(res.task.submissionConfig) });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: taskId } = await params;

  const res = await authorizeMentorForTask(session.user.id, taskId);
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });

  const body = await req.json().catch(() => ({}));
  const type = body.type as SubmissionConfigType | undefined;
  if (!type || !VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid submission config type" }, { status: 400 });
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { submissionConfig: { type } },
  });

  return NextResponse.json({ submissionConfig: { type } });
}
