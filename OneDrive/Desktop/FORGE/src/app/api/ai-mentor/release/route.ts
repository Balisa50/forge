/**
 * POST /api/ai-mentor/release
 *
 * Releases the next unreleased week for a Solo learner under AI Mentor.
 * The Professor writes a 2-sentence personal note that references the
 * student's prior verified work.
 *
 * DORMANT until AI_MENTOR_ENABLED=true.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiMentorEnabled, AI_MENTOR_DISABLED_RESPONSE } from "@/lib/ai-mentor/feature-flag";
import { callTheProfessor } from "@/lib/ai-mentor/client";

export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!aiMentorEnabled({ userId: session.user.id })) {
    return NextResponse.json(AI_MENTOR_DISABLED_RESPONSE, { status: 501 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Find the next locked + unreleased task on the user's active roadmap
  const nextTask = await prisma.task.findFirst({
    where: {
      phase: { track: { roadmap: { userId: session.user.id, isActive: true } } },
      status: "locked",
      releasedAt: null,
    },
    orderBy: [{ phase: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    select: {
      id: true,
      title: true,
      detail: true,
      phase: { select: { track: { select: { roadmap: { select: { title: true } } } } } },
    },
  });

  if (!nextTask) {
    return NextResponse.json({ error: "No locked weeks left to release" }, { status: 404 });
  }

  const weekNumberMatch = nextTask.title.match(/^Week\s+(\d+)/i);
  const weekNumber = weekNumberMatch ? parseInt(weekNumberMatch[1], 10) : 0;

  // Get prior verified work summary for the personal note
  const verifiedTasks = await prisma.task.findMany({
    where: {
      phase: { track: { roadmap: { userId: session.user.id, isActive: true } } },
      status: "verified",
    },
    orderBy: { verifiedAt: "desc" },
    take: 3,
    select: { title: true },
  });
  const priorSummary =
    verifiedTasks.length === 0
      ? "This is their first week with you."
      : `Recently verified: ${verifiedTasks.map((t) => t.title).join("; ")}`;

  let result;
  try {
    result = await callTheProfessor({
      studentFirstName: user.name?.split(" ")[0] ?? "Student",
      trackTitle: nextTask.phase.track.roadmap.title,
      weekNumber,
      weekTitle: nextTask.title,
      weekBrief: nextTask.detail,
      priorWarningCount: 0,
      priorInteractionSummary: priorSummary,
      userMessage: `Write a 2-sentence personal release note for ${user.name?.split(" ")[0] ?? "this student"} as you release Week ${weekNumber}. Reference something specific from their prior work. Set expectations for this week's bar. No bullet points - prose only. Do not be effusive.`,
      maxTokens: 250,
    });
  } catch (e) {
    return NextResponse.json({ error: "professor_call_failed", message: (e as Error).message }, { status: 502 });
  }

  // Release the task + log the interaction
  const deadline = new Date(Date.now() + 7 * 86_400_000); // default 7 days
  await prisma.$transaction([
    prisma.task.update({
      where: { id: nextTask.id },
      data: {
        status: "available",
        releasedAt: new Date(),
        releasedBy: session.user.id, // AI Mentor releases on the user's behalf
        deadline,
        closedAt: null,
      },
    }),
    prisma.aIMentorInteraction.create({
      data: {
        userId: session.user.id,
        taskId: nextTask.id,
        kind: "release",
        response: result.text,
        evidence: { weekTitle: nextTask.title },
        tokensUsed: result.inputTokens + result.outputTokens,
        costUsd: result.costUsd,
      },
    }),
  ]);

  return NextResponse.json({
    releasedTaskId: nextTask.id,
    weekTitle: nextTask.title,
    note: result.text,
    deadline: deadline.toISOString(),
  });
}
