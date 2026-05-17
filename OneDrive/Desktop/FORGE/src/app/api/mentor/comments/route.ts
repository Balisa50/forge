/**
 * POST /api/mentor/comments
 *   Body: { taskId: string, menteeId: string, body: string }
 * Mentor leaves a note on one of their mentee's tasks (one curriculum week).
 *
 * GET /api/mentor/comments?menteeId=...
 *   Returns all comments the mentor has left on that mentee, grouped by task.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const taskId: string | undefined = body.taskId;
  const menteeId: string | undefined = body.menteeId;
  const text: string | undefined = typeof body.body === "string" ? body.body.trim() : undefined;

  if (!taskId || !menteeId || !text) {
    return NextResponse.json({ error: "taskId, menteeId and body required" }, { status: 400 });
  }
  if (text.length > 4000) {
    return NextResponse.json({ error: "Comment too long" }, { status: 400 });
  }

  const mentorId = session.user.id;

  // Verify mentor link is active.
  const link = await prisma.mentorLink.findFirst({
    where: { mentorId, menteeId, isActive: true },
  });
  if (!link) {
    return NextResponse.json({ error: "Not your mentee" }, { status: 403 });
  }

  // Verify the task actually belongs to this mentee's roadmap (defence in depth).
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      phase: { track: { roadmap: { userId: menteeId } } },
    },
    select: { id: true, title: true },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not in mentee's roadmap" }, { status: 400 });
  }

  const comment = await prisma.mentorComment.create({
    data: { taskId, mentorId, menteeId, body: text, authorRole: "mentor", kind: "note" },
    select: { id: true, body: true, createdAt: true, readAt: true },
  });

  void sendNotification("mentor-left-note", {
    recipientId: menteeId,
    actorId: mentorId,
    taskTitle: task.title,
    payload: { body: text },
  });

  return NextResponse.json({ comment }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const mentorId = session.user.id;
  const url = new URL(req.url);
  const menteeId = url.searchParams.get("menteeId");
  if (!menteeId) {
    return NextResponse.json({ error: "menteeId required" }, { status: 400 });
  }

  const link = await prisma.mentorLink.findFirst({
    where: { mentorId, menteeId, isActive: true },
  });
  if (!link) {
    return NextResponse.json({ error: "Not your mentee" }, { status: 403 });
  }

  const comments = await prisma.mentorComment.findMany({
    where: { mentorId, menteeId },
    orderBy: { createdAt: "desc" },
    select: { id: true, taskId: true, body: true, createdAt: true, readAt: true },
  });
  return NextResponse.json({ comments });
}
