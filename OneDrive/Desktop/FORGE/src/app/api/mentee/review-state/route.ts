/**
 * GET /api/mentee/review-state?taskId=...
 *
 * Returns everything the student's week page needs to render the
 * "Mentor Review" section in one round trip:
 *   - the mentor's questions (prompt only — rubric/idealAnswer stay private)
 *   - whether the student has already submitted answers
 *   - if reviewed: passed, perQuestionScores, overallScore, feedback,
 *     mentor's 1–5 rating, when reviewed
 *
 * The student week page renders this inline so questions never have to be
 * "hunted for" in the chat thread.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface TranscriptEntry {
  role?: string;
  type?: string;
  questionNumber?: number;
  content?: string;
  score?: number;
  pendingReview?: boolean;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const taskId = new URL(req.url).searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  // The task must belong to this mentee's own roadmap (no peeking at someone else's).
  const task = await prisma.task.findFirst({
    where: { id: taskId, phase: { track: { roadmap: { userId: session.user.id } } } },
    select: { id: true, status: true, mentorRating: true, verifiedAt: true },
  });
  if (!task) return NextResponse.json({ status: "not-found" }, { status: 404 });

  const questions = await prisma.mentorQuestion.findMany({
    // Drafts stay invisible to the student until the mentor publishes.
    where: { taskId, isActive: true, publishedAt: { not: null } },
    orderBy: { position: "asc" },
    select: { id: true, prompt: true, position: true },
  });

  // The most recent check-in for this task — if it carries an interrogation,
  // that's the student's submitted answers and (when graded) the mentor's verdict.
  const checkin = await prisma.checkin.findFirst({
    where: { taskId, userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { interrogation: true },
  });

  if (questions.length === 0) {
    // No mentor questions authored — return a minimal shape so the section
    // can render an informative empty state on the student side.
    return NextResponse.json({
      hasQuestions: false,
      questions: [],
      submitted: !!checkin,
      reviewed: false,
      taskStatus: task.status,
      mentorRating: task.mentorRating ?? null,
    });
  }

  // Extract the student's answers from the interrogation transcript so they
  // can be shown back to the student alongside the mentor's verdict.
  const transcript = (checkin?.interrogation?.transcript ?? []) as TranscriptEntry[];
  const answersByPosition = new Map<number, { content: string; score: number | null }>();
  for (const entry of transcript) {
    if (entry?.role === "user" && typeof entry.questionNumber === "number") {
      answersByPosition.set(entry.questionNumber, {
        content: String(entry.content ?? ""),
        score: typeof entry.score === "number" ? entry.score : null,
      });
    }
  }

  const interrogation = checkin?.interrogation;
  const reviewed = !!(interrogation && interrogation.mentorReviewedAt);

  return NextResponse.json({
    hasQuestions: true,
    questions: questions.map((q, i) => {
      const a = answersByPosition.get(i + 1);
      return {
        id: q.id,
        position: q.position,
        prompt: q.prompt,
        answer: a?.content ?? null,
        score: reviewed ? a?.score ?? null : null,
      };
    }),
    submitted: !!interrogation,
    reviewed,
    overallScore: reviewed ? interrogation!.overallScore : null,
    passed: reviewed ? interrogation!.passed : null,
    feedback: reviewed ? interrogation!.feedback : null,
    reviewedAt: reviewed ? interrogation!.mentorReviewedAt : null,
    mentorRating: task.mentorRating ?? null,
    taskStatus: task.status, // "verified" once passed by mentor
  });
}
