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
    where: { taskId, isActive: true },
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

  // Refuse to double-submit: if an unreviewed mentor_async interrogation
  // already exists for this task + user, return it instead of creating another.
  const existing = await prisma.checkin.findFirst({
    where: { userId, taskId },
    orderBy: { createdAt: "desc" },
    include: { interrogation: true },
  });
  if (existing?.interrogation && !existing.interrogation.mentorReviewedAt) {
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

  // Transactionally: create a placeholder Checkin + Interrogation. The
  // Checkin is necessary because Interrogation.checkinId is @unique non-null;
  // its evidenceType "review_answers" lets the UI tell it apart from a
  // proof-of-work check-in if it ever needs to.
  const result = await prisma.$transaction(async (tx) => {
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
