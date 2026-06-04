/**
 * POST /api/mentor/questions/publish
 *
 * "Send Questions to Student" — flips every unpublished MentorQuestion on
 * a given task (authored by this mentor) from draft -> published. Student
 * queries filter `publishedAt IS NOT NULL`, so once this runs the student
 * sees every question in the Mentor Review tab at once.
 *
 * Body: { taskId: string }
 * Returns: { sent: number, alreadyPublished: number }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const mentorId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const taskId: string | undefined = body.taskId;
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  // Authorise: caller must be a mentor of the mentee who owns this task.
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      phase: { track: { roadmap: { user: { mentees: { some: { mentorId, isActive: true } } } } } },
    },
    select: { id: true, title: true },
  });
  if (!task) return NextResponse.json({ error: "Not authorised" }, { status: 403 });

  // Count drafts before flipping (so we can return a useful number).
  const drafts = await prisma.mentorQuestion.count({
    where: { taskId, mentorId, isActive: true, publishedAt: null },
  });
  const alreadyPublished = await prisma.mentorQuestion.count({
    where: { taskId, mentorId, isActive: true, publishedAt: { not: null } },
  });

  if (drafts > 0) {
    const now = new Date();
    await prisma.mentorQuestion.updateMany({
      where: { taskId, mentorId, isActive: true, publishedAt: null },
      data: { publishedAt: now },
    });
  }

  return NextResponse.json({ sent: drafts, alreadyPublished });
}
