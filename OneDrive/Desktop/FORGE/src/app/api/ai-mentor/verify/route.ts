/**
 * POST /api/ai-mentor/verify
 *
 * Solo learner submits a completed week. The Professor reads their mastery
 * answers + fetches any GitHub repo URL they linked + (later) inspects
 * uploaded artefacts. Returns one of: verified / needs_work / rejected.
 *
 * Currently DORMANT - returns 501 unless AI_MENTOR_ENABLED=true env var is
 * set AND ANTHROPIC_API_KEY is configured. Build is in place so we can
 * activate by flipping a Vercel env var when keys are funded.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiMentorEnabled, AI_MENTOR_DISABLED_RESPONSE } from "@/lib/ai-mentor/feature-flag";
import { verifyWithTheProfessor } from "@/lib/ai-mentor/client";
import { inspectGithubRepo, formatInspectionForProfessor } from "@/lib/ai-mentor/github-inspector";
import { inspectLiveUrl, formatUrlInspectionForProfessor } from "@/lib/ai-mentor/url-fetcher";
import { checkBudget } from "@/lib/ai-mentor/budget";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Dormant gate - everything below this line is unreachable until the
  // operator flips AI_MENTOR_ENABLED=true and provides ANTHROPIC_API_KEY.
  if (!aiMentorEnabled({ userId: session.user.id })) {
    return NextResponse.json(AI_MENTOR_DISABLED_RESPONSE, { status: 501 });
  }

  // Budget guardrail BEFORE any expensive API call
  const budget = await checkBudget(session.user.id);
  if (!budget.withinBudget) {
    return NextResponse.json(
      { error: "budget_exhausted", message: budget.reason, budget },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const taskId: string | undefined = body.taskId;
  const masteryAnswers: string[] = Array.isArray(body.masteryAnswers) ? body.masteryAnswers : [];
  const githubUrl: string | undefined = body.githubUrl;
  const liveUrl: string | undefined = body.liveUrl;
  const additionalEvidence: string = body.additionalEvidence ?? "";

  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }
  if (masteryAnswers.length === 0) {
    return NextResponse.json({ error: "masteryAnswers required" }, { status: 400 });
  }

  // Load the task + roadmap + user + the student's check-in history for this
  // task. The check-ins ARE part of what THE PROFESSOR is conscious of - it
  // sees what the student claimed they did, day by day, not just the final
  // mastery answers.
  const [task, user, checkins] = await Promise.all([
    prisma.task.findFirst({
      where: { id: taskId, phase: { track: { roadmap: { userId: session.user.id } } } },
      select: {
        id: true,
        title: true,
        detail: true,
        phase: { select: { track: { select: { roadmap: { select: { title: true } } } } } },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    }),
    prisma.checkin.findMany({
      where: { userId: session.user.id, taskId },
      orderBy: { createdAt: "asc" },
      select: { description: true, evidenceUrl: true, evidenceType: true, createdAt: true },
    }),
  ]);

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Parse week number from title ("Week 5: ...")
  const weekNumberMatch = task.title.match(/^Week\s+(\d+)/i);
  const weekNumber = weekNumberMatch ? parseInt(weekNumberMatch[1], 10) : 0;

  // Compute prior warning count on THIS task for THIS user
  const priorInteractions = await prisma.aIMentorInteraction.findMany({
    where: { userId: session.user.id, taskId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { kind: true, verdict: true, response: true, warningCount: true, createdAt: true },
  });
  const priorWarningCount =
    priorInteractions.find((p) => p.warningCount > 0)?.warningCount ?? 0;
  const priorInteractionSummary = priorInteractions
    .slice(0, 3)
    .map((p) => `[${p.kind} - ${p.verdict ?? "n/a"} - ${p.createdAt.toISOString()}]: ${p.response.slice(0, 200)}...`)
    .join("\n");

  // Inspect submitted evidence BEFORE handing to The Professor. This is the
  // bit that makes FORGE different from every other AI tutor: we actually
  // FETCH and INSPECT the artefacts, then hand the inspection to Claude
  // as ground truth - so it cannot be fooled by lies about what's in a repo.
  const evidenceSections: string[] = [];
  if (githubUrl) {
    try {
      const insp = await inspectGithubRepo(githubUrl);
      evidenceSections.push(formatInspectionForProfessor(insp));
    } catch (e) {
      evidenceSections.push(`GitHub inspection FAILED: ${(e as Error).message}`);
    }
  } else {
    evidenceSections.push("No GitHub URL provided.");
  }
  if (liveUrl) {
    try {
      const insp = await inspectLiveUrl(liveUrl);
      evidenceSections.push(formatUrlInspectionForProfessor(insp));
    } catch (e) {
      evidenceSections.push(`Live URL inspection FAILED: ${(e as Error).message}`);
    }
  }
  if (additionalEvidence) evidenceSections.push(`Additional evidence: ${additionalEvidence}`);

  // THE PROFESSOR's consciousness of the week: every check-in the student
  // logged. This lets it cross-check the final submission against what the
  // student claimed day by day - and catch contradictions.
  if (checkins.length > 0) {
    const checkinLog = checkins
      .map((c, i) => `Check-in ${i + 1} (${c.createdAt.toISOString().slice(0, 10)}): ${c.description}${c.evidenceUrl ? ` [evidence: ${c.evidenceUrl}]` : ""}`)
      .join("\n");
    evidenceSections.push(`The student's check-in log for this week (what they claimed they did, day by day):\n${checkinLog}`);
  } else {
    evidenceSections.push("The student logged NO check-ins for this week. They are submitting it cold. Note this.");
  }
  const evidenceSummary = evidenceSections.join("\n\n---\n\n");

  // Call The Professor
  let verifyResult;
  try {
    verifyResult = await verifyWithTheProfessor({
      studentFirstName: user.name?.split(" ")[0] ?? "Student",
      trackTitle: task.phase.track.roadmap.title,
      weekNumber,
      weekTitle: task.title,
      weekBrief: task.detail,
      priorWarningCount,
      priorInteractionSummary: priorInteractionSummary || undefined,
      userMessage: `${user.name?.split(" ")[0] ?? "The student"} has submitted Week ${weekNumber} for verification. Inspect their evidence, check each mastery answer for shallowness or discrepancies against the evidence, and return your verdict.`,
      masteryAnswers,
      evidenceSummary,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "professor_call_failed", message: (e as Error).message },
      { status: 502 },
    );
  }

  // Log the interaction
  await prisma.aIMentorInteraction.create({
    data: {
      userId: session.user.id,
      taskId,
      kind: "verification",
      response: verifyResult.result.feedback,
      verdict: verifyResult.result.verdict,
      warningCount: verifyResult.result.raise_warning ? priorWarningCount + 1 : priorWarningCount,
      evidence: { githubUrl, masteryAnswerCount: masteryAnswers.length, additionalEvidence },
      tokensUsed: verifyResult.raw.inputTokens + verifyResult.raw.outputTokens,
      costUsd: verifyResult.raw.costUsd,
    },
  });

  // If verified, also mark the task as verified in the main task table
  if (verifyResult.result.verdict === "verified") {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: "verified", verifiedAt: new Date() },
    });
  }

  return NextResponse.json({
    verdict: verifyResult.result.verdict,
    feedback: verifyResult.result.feedback,
    question_checks: verifyResult.result.question_checks,
    praised: verifyResult.result.praised,
    next_step: verifyResult.result.next_step,
  });
}
