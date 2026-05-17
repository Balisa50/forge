/**
 * Mentor question bank — pre-write 3 open-ended questions per task.
 *
 * GET    /api/mentor/questions?taskId=...&menteeId=...   → list mentor's questions on task
 * POST   /api/mentor/questions                           → create one
 * PATCH  /api/mentor/questions?id=...                    → edit prompt/rubric/idealAnswer/position
 * DELETE /api/mentor/questions?id=...                    → soft-delete (isActive=false)
 *
 * Authoring is independent per (mentor, task). Two mentors of the same
 * mentee can each write their own banks; the mentee's interrogation
 * picks the first mentor's bank (sorted by created link).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertMentorOfTask(mentorId: string, taskId: string, menteeId?: string) {
  // Task must belong to a mentee linked to this mentor
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      phase: { track: { roadmap: { user: { mentees: { some: { mentorId, isActive: true, ...(menteeId ? { menteeId } : {}) } } } } } },
    },
    select: { id: true },
  });
  return !!task;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const taskId = url.searchParams.get("taskId");
  const menteeId = url.searchParams.get("menteeId") ?? undefined;
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  if (!(await assertMentorOfTask(session.user.id, taskId, menteeId))) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  const questions = await prisma.mentorQuestion.findMany({
    where: { taskId, mentorId: session.user.id, isActive: true },
    orderBy: { position: "asc" },
  });
  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { taskId, prompt, rubric, idealAnswer, menteeId } = body as { taskId?: string; prompt?: string; rubric?: string; idealAnswer?: string; menteeId?: string };
  if (!taskId || !prompt?.trim()) {
    return NextResponse.json({ error: "taskId and prompt required" }, { status: 400 });
  }
  if (!(await assertMentorOfTask(session.user.id, taskId, menteeId))) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  // Next position = current max + 1
  const last = await prisma.mentorQuestion.findFirst({
    where: { taskId, mentorId: session.user.id, isActive: true },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const question = await prisma.mentorQuestion.create({
    data: {
      taskId,
      mentorId: session.user.id,
      position: (last?.position ?? -1) + 1,
      prompt: prompt.trim(),
      rubric: rubric?.trim() || null,
      idealAnswer: idealAnswer?.trim() || null,
    },
  });

  return NextResponse.json({ question }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json().catch(() => ({}));

  const updated = await prisma.mentorQuestion.updateMany({
    where: { id, mentorId: session.user.id },
    data: {
      ...(typeof body.prompt === "string" ? { prompt: body.prompt.trim() } : {}),
      ...(typeof body.rubric === "string" ? { rubric: body.rubric.trim() || null } : {}),
      ...(typeof body.idealAnswer === "string" ? { idealAnswer: body.idealAnswer.trim() || null } : {}),
      ...(typeof body.position === "number" ? { position: body.position } : {}),
    },
  });
  return NextResponse.json({ updated: updated.count });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const updated = await prisma.mentorQuestion.updateMany({
    where: { id, mentorId: session.user.id },
    data: { isActive: false },
  });
  return NextResponse.json({ deleted: updated.count });
}
