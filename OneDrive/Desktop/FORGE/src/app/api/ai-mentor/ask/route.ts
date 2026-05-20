/**
 * POST /api/ai-mentor/ask
 *
 * Solo learner asks The Professor a question (about their current week,
 * a concept, their own code). Returns a single response from the persona.
 *
 * DORMANT until AI_MENTOR_ENABLED=true.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiMentorEnabled, AI_MENTOR_DISABLED_RESPONSE } from "@/lib/ai-mentor/feature-flag";
import { callTheProfessor } from "@/lib/ai-mentor/client";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!aiMentorEnabled({ userId: session.user.id })) {
    return NextResponse.json(AI_MENTOR_DISABLED_RESPONSE, { status: 501 });
  }

  const body = await req.json().catch(() => ({}));
  const question: string = (body.question ?? "").toString().trim();
  const taskId: string | undefined = body.taskId; // optional - which week is the question about

  if (!question || question.length < 5) {
    return NextResponse.json({ error: "Question too short" }, { status: 400 });
  }
  // Cap to prevent abuse of API costs
  if (question.length > 4000) {
    return NextResponse.json({ error: "Question too long (max 4000 chars)" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let taskContext: { title: string; detail: string; trackTitle: string } | null = null;
  if (taskId) {
    const t = await prisma.task.findFirst({
      where: { id: taskId, phase: { track: { roadmap: { userId: session.user.id } } } },
      select: {
        title: true,
        detail: true,
        phase: { select: { track: { select: { roadmap: { select: { title: true } } } } } },
      },
    });
    if (t) taskContext = { title: t.title, detail: t.detail, trackTitle: t.phase.track.roadmap.title };
  }

  // Find current active week if no taskId given
  if (!taskContext) {
    const active = await prisma.task.findFirst({
      where: {
        phase: { track: { roadmap: { userId: session.user.id, isActive: true } } },
        OR: [{ status: "available" }, { status: "in_progress" }, { status: "pending_verification" }],
        releasedAt: { not: null },
      },
      orderBy: { releasedAt: "desc" },
      select: {
        title: true,
        detail: true,
        phase: { select: { track: { select: { roadmap: { select: { title: true } } } } } },
      },
    });
    if (active) taskContext = { title: active.title, detail: active.detail, trackTitle: active.phase.track.roadmap.title };
  }

  const weekNumberMatch = taskContext?.title.match(/^Week\s+(\d+)/i);
  const weekNumber = weekNumberMatch ? parseInt(weekNumberMatch[1], 10) : 0;

  let result;
  try {
    result = await callTheProfessor({
      studentFirstName: user.name?.split(" ")[0] ?? "Student",
      trackTitle: taskContext?.trackTitle ?? "(no active track)",
      weekNumber,
      weekTitle: taskContext?.title ?? "(no current week)",
      weekBrief: taskContext?.detail,
      priorWarningCount: 0,
      userMessage: question,
      maxTokens: 1000,
    });
  } catch (e) {
    return NextResponse.json({ error: "professor_call_failed", message: (e as Error).message }, { status: 502 });
  }

  await prisma.aIMentorInteraction.create({
    data: {
      userId: session.user.id,
      taskId: taskId ?? null,
      kind: "question",
      response: result.text,
      evidence: { question },
      tokensUsed: result.inputTokens + result.outputTokens,
      costUsd: result.costUsd,
    },
  });

  return NextResponse.json({ response: result.text });
}
