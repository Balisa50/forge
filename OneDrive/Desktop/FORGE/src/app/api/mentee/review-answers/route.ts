/**
 * POST /api/mentee/review-answers
 *
 * Inline submission of answers to mentor questions, directly from the
 * Mentor Review section on the student's week page — no detour through the
 * daily check-in flow.
 *
 * Body: { taskId, answers: [{ questionId, answer }] }
 *
 * Behaviour:
 *   - Validates the user owns the task.
 *   - Requires that every active mentor question has a non-empty answer.
 *   - Creates a lightweight Checkin row (evidenceType: "review_answers",
 *     description: "Answers submitted for mentor review") to act as the
 *     required parent for the Interrogation. The check-in is NOT graded
 *     automatically; status starts at "passed" only as a placeholder — the
 *     student-facing pill is derived from the Interrogation review state.
 *   - Creates the Interrogation in mentor_async mode with the answers in
 *     transcript so the mentor's Pending Reviews queue picks it up.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const taskId: string | undefined = body.taskId;
  const incoming = Array.isArray(body.answers) ? body.answers : [];
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  // Task must belong to this mentee.
  const task = await prisma.task.findFirst({
    where: { id: taskId, phase: { track: { roadmap: { userId } } } },
    select: { id: true, title: true, phase: { select: { track: { select: { id: true, roadmapId: true } } } } },
  });
  if (!task) return NextResponse.json({ error: "Task not yours" }, { status: 403 });

  // Pull the active mentor questions.
  const questions = await prisma.mentorQuestion.findMany({
    // Only published (sent) questions count toward the answer requirement.
    where: { taskId, isActive: true, publishedAt: { not: null } },
    orderBy: { position: "asc" },
  });
  if (questions.length === 0) {
    return NextResponse.json({ error: "No mentor questions to answer" }, { status: 400 });
  }

  // Normalise incoming answers by questionId.
  const answerById = new Map<string, string>();
  for (const a of incoming) {
    if (typeof a?.questionId === "string" && typeof a?.answer === "string") {
      answerById.set(a.questionId, a.answer.trim());
    }
  }
  const missing = questions.filter((q) => !(answerById.get(q.id) ?? "").length);
  if (missing.length > 0) {
    return NextResponse.json({ error: "Answer every question before submitting." }, { status: 400 });
  }

  // ── ONE ROW PER (USER, TASK) ────────────────────────────────────────
  // We do NOT create a new Checkin row on every submission. If one already
  // exists for this (user, task), we UPDATE it in place — the Checkin is
  // the student's slot for this week, full stop. attemptNum tracks how
  // many times they've resubmitted.
  //
  // Block re-submit only in one specific case: the prior submission is sitting
  // in the mentor's queue, awaiting first review, AND the mentor has not
  // touched it (no reopen). Otherwise (reopen invited resubmission, OR no
  // prior submission, OR prior was rejected) — let the student submit.
  const existing = await prisma.checkin.findFirst({
    where: { userId, taskId },
    orderBy: { createdAt: "desc" },
    include: { interrogation: true },
  });

  const awaitingFirstReview =
    !!existing?.interrogation &&
    !existing.interrogation.mentorReviewedAt &&
    existing.status !== "failed"; // status="failed" means mentor reopened — invited resubmission
  if (awaitingFirstReview) {
    return NextResponse.json(
      { error: "You've already submitted answers — your mentor is reviewing them.", kind: "already-submitted" },
      { status: 409 },
    );
  }

  // Build the transcript laid out as alternating MENTOR_AUTHORED + user pairs.
  const transcript: Array<Record<string, unknown>> = [];
  questions.forEach((q, i) => {
    transcript.push({
      role: "assistant",
      type: "MENTOR_AUTHORED",
      questionNumber: i + 1,
      content: JSON.stringify({ question: q.prompt }),
    });
    transcript.push({
      role: "user",
      questionNumber: i + 1,
      content: answerById.get(q.id) ?? "",
      pendingReview: true,
    });
  });

  // Transactionally: either UPDATE the existing Checkin + Interrogation
  // (resubmission after reopen / rejection) or CREATE both fresh (first
  // submission). The Checkin is the authoritative slot for this (user, task).
  const result = await prisma.$transaction(async (tx) => {
    if (existing) {
      // Resubmit path: bump attemptNum, reset placeholder status, swap
      // transcript on the existing interrogation. If the interrogation
      // somehow doesn't exist (legacy row), create it now.
      const checkin = await tx.checkin.update({
        where: { id: existing.id },
        data: {
          status: "passed", // placeholder — pill derives from interrogation
          attemptNum: existing.attemptNum + 1,
          description: "Answers submitted for mentor review.",
        },
      });
      let interrogation;
      if (existing.interrogation) {
        interrogation = await tx.interrogation.update({
          where: { id: existing.interrogation.id },
          data: {
            transcript: transcript as unknown as object,
            mentorReviewedAt: null,
            passed: false,
            overallScore: 0,
            feedback: null,
            completedAt: new Date(),
            mentorReviewerId: questions[0].mentorId,
          },
        });
      } else {
        interrogation = await tx.interrogation.create({
          data: {
            checkinId: checkin.id,
            mode: "mentor_async",
            isDefence: true,
            mentorReviewerId: questions[0].mentorId,
            transcript: transcript as unknown as object,
            completedAt: new Date(),
          },
        });
      }
      return { checkin, interrogation };
    }

    // First-ever submission path.
    const checkin = await tx.checkin.create({
      data: {
        userId,
        roadmapId: task.phase.track.roadmapId,
        trackId: task.phase.track.id,
        taskId,
        description: "Answers submitted for mentor review.",
        evidenceType: "review_answers",
        evidenceUrl: null,
        evidenceData: undefined,
        status: "passed", // placeholder — display pill derives from interrogation
      },
    });
    const interrogation = await tx.interrogation.create({
      data: {
        checkinId: checkin.id,
        mode: "mentor_async",
        isDefence: true,
        mentorReviewerId: questions[0].mentorId,
        transcript: transcript as unknown as object,
        completedAt: new Date(),
      },
    });
    return { checkin, interrogation };
  });

  // Best-effort notify the mentor — never let a notification failure break
  // the response.
  void sendNotification("mentee-replied", {
    recipientId: questions[0].mentorId,
    actorId: userId,
    taskTitle: task.title,
    payload: { body: "Answers submitted for review." },
  });

  return NextResponse.json({ ok: true, interrogationId: result.interrogation.id });
}
