/**
 * Mentor review queue.
 *
 * GET /api/mentor/reviews → list interrogations waiting for the mentor's grade
 * POST /api/mentor/reviews → grade one interrogation
 * Body: { interrogationId, scores: number[], feedback: string, passed: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";

export async function GET() {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const rows = await prisma.interrogation.findMany({
 where: {
 mode: "mentor_async",
 mentorReviewerId: session.user.id,
 mentorReviewedAt: null,
 completedAt: { not: null },
 },
 orderBy: { completedAt: "desc" },
 include: {
 checkin: {
 select: {
 id: true,
 description: true,
 evidenceType: true,
 evidenceUrl: true,
 videoUrl: true,
 evidenceData: true,
 user: { select: { id: true, name: true, email: true } },
 task: { select: { id: true, title: true } },
 },
 },
 },
 });

 // Attach the mentor's private rubric/idealAnswer for every task referenced,
 // keyed by question position. The Reviews UI uses this to show the rubric
 // side-by-side with each student answer.
 const taskIds = Array.from(new Set(rows.map((r) => r.checkin.task.id)));
 const rubricsByTask = new Map<string, { position: number; prompt: string; rubric: string | null; idealAnswer: string | null }[]>();
 if (taskIds.length > 0) {
 const questions = await prisma.mentorQuestion.findMany({
 where: { taskId: { in: taskIds }, mentorId: session.user.id, isActive: true },
 orderBy: { position: "asc" },
 select: { taskId: true, position: true, prompt: true, rubric: true, idealAnswer: true },
 });
 for (const q of questions) {
 const list = rubricsByTask.get(q.taskId) ?? [];
 list.push({ position: q.position, prompt: q.prompt, rubric: q.rubric, idealAnswer: q.idealAnswer });
 rubricsByTask.set(q.taskId, list);
 }
 }
 const reviewsWithRubrics = rows.map((r) => ({
 ...r,
 questionBank: rubricsByTask.get(r.checkin.task.id) ?? [],
 }));

 return NextResponse.json({ reviews: reviewsWithRubrics });
}

export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const mentorId = session.user.id;

 const body = await req.json().catch(() => ({}));
 const { interrogationId, scores, feedback, passed, mentorRating } = body as {
 interrogationId?: string;
 scores?: number[];
 feedback?: string;
 passed?: boolean;
 mentorRating?: number | null;
 };
 if (!interrogationId || !Array.isArray(scores) || typeof passed !== "boolean") {
 return NextResponse.json({ error: "interrogationId, scores, passed required" }, { status: 400 });
 }
 // Validate 1-5 rating (clamped). null clears; undefined leaves untouched.
 let cleanRating: number | null | undefined = undefined;
 if (mentorRating === null) cleanRating = null;
 else if (typeof mentorRating === "number" && mentorRating >= 1 && mentorRating <= 5) {
 cleanRating = Math.round(mentorRating);
 }

 const interrogation = await prisma.interrogation.findUnique({
 where: { id: interrogationId },
 include: { checkin: { include: { task: true, user: { select: { id: true, name: true } } } } },
 });
 if (!interrogation) return NextResponse.json({ error: "Not found" }, { status: 404 });
 if (interrogation.mentorReviewerId !== mentorId) {
 return NextResponse.json({ error: "Not your review" }, { status: 403 });
 }

 // Merge scores into transcript user entries (one per answered question)
 const transcript = (interrogation.transcript as Array<Record<string, unknown>>).slice();
 let scoreIdx = 0;
 for (const entry of transcript) {
 if (entry.role === "user" && typeof entry.questionNumber === "number" && scoreIdx < scores.length) {
 const s = Math.max(0, Math.min(10, Math.round(Number(scores[scoreIdx]))));
 entry.score = s;
 entry.pendingReview = false;
 scoreIdx++;
 }
 }
 const totalScore = scores.reduce((s, n) => s + Math.max(0, Math.min(10, Math.round(Number(n)))), 0);
 // No-questions case: a mentored student submitted proof of work but had no
 // questions to answer. Overall score derives from pass/fail alone, no
 // division-by-zero from `totalScore / (0 * 10)`.
 const overallScore = scores.length === 0
 ? (passed ? 10 : 0)
 : Number(((totalScore / (scores.length * 10)) * 10).toFixed(2));

 const updated = await prisma.$transaction(async (tx) => {
 const i = await tx.interrogation.update({
 where: { id: interrogationId },
 data: {
 transcript: transcript as unknown as object,
 passed,
 overallScore,
 feedback: feedback?.trim() || (passed ? "Mentor signed off." : "Mentor did not approve."),
 mentorReviewedAt: new Date(),
 },
 });
 await tx.checkin.update({
 where: { id: interrogation.checkinId },
 data: { status: passed ? "passed" : "failed" },
 });
 // Task update: status changes based on pass/fail; mentorRating is updated
 // only if the mentor sent one in this grade submission (undefined = leave
 // any prior rating alone, null = clear).
 const ratingPatch: { mentorRating?: number | null } = {};
 if (cleanRating !== undefined) ratingPatch.mentorRating = cleanRating;
 if (passed) {
 await tx.task.update({
 where: { id: interrogation.checkin.task.id },
 data: { status: "verified", verifiedAt: new Date(), ...ratingPatch },
 });
 } else {
 await tx.task.update({
 where: { id: interrogation.checkin.task.id },
 data: { status: "available", ...ratingPatch }, // let them retry
 });
 }
 return i;
 });

 void sendNotification(passed ? "mentor-action" : "mentor-action", {
 recipientId: interrogation.checkin.user.id,
 actorId: mentorId,
 taskTitle: interrogation.checkin.task.title,
 payload: { action: passed ? "verified" : "rejected" },
 });

 return NextResponse.json({ ok: true, interrogation: updated });
}
