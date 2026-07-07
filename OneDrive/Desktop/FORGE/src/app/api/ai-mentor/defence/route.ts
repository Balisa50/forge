/**
 * The Professor's VIVA (defence).
 *
 * GET  /api/ai-mentor/defence  -> the learner's pending defence questions, if any
 *                                 (an ai_solo interrogation the Professor created
 *                                 from their submitted work, not yet answered).
 * POST /api/ai-mentor/defence  -> { interrogationId, answers[] }: grade the
 *                                 answers strictly against the actual evidence,
 *                                 pass/fail the week, notify the learner.
 *
 * The questions are anchored to the student's real code, so they can only be
 * answered by someone who did the work. Grading reuses verifyWithTheProfessor.
 */

import { NextRequest, NextResponse, after } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiMentorEnabled, AI_MENTOR_DISABLED_RESPONSE } from "@/lib/ai-mentor/feature-flag";
import { verifyWithTheProfessor } from "@/lib/ai-mentor/client";
import { checkBudget } from "@/lib/ai-mentor/budget";
import { releaseNextWeek } from "@/lib/ai-mentor/release";

// Grading is a heavy reasoning-model call; give it room.
export const maxDuration = 60;

type TItem = { role?: string; type?: string; questionNumber?: number; content?: string };

function readTranscript(t: unknown): TItem[] {
 return Array.isArray(t) ? (t as TItem[]) : [];
}
function questionsOf(t: TItem[]): { n: number; prompt: string }[] {
 return t
 .filter((x) => x.type === "AI_QUESTION" && typeof x.content === "string")
 .map((x) => ({ n: x.questionNumber ?? 0, prompt: x.content as string }));
}
function evidenceOf(t: TItem[]): string {
 return t.find((x) => x.type === "EVIDENCE")?.content ?? "";
}

export async function GET() {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ defence: null });

 const interro = await prisma.interrogation.findFirst({
 where: { mode: "ai_solo", passed: false, completedAt: null, checkin: { userId: session.user.id } },
 orderBy: { createdAt: "desc" },
 select: {
 id: true,
 transcript: true,
 checkin: { select: { task: { select: { title: true } } } },
 },
 });
 if (!interro) return NextResponse.json({ defence: null });

 const questions = questionsOf(readTranscript(interro.transcript));
 if (questions.length === 0) return NextResponse.json({ defence: null });

 return NextResponse.json({
 defence: {
 interrogationId: interro.id,
 weekTitle: interro.checkin.task?.title ?? "your submitted week",
 questions,
 },
 });
}

export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const userId = session.user.id;

 if (!aiMentorEnabled({ userId })) {
 return NextResponse.json(AI_MENTOR_DISABLED_RESPONSE, { status: 501 });
 }
 const budget = await checkBudget(userId);
 if (!budget.withinBudget) {
 return NextResponse.json({ error: "rate_limited", message: budget.reason }, { status: 429 });
 }

 const body = await req.json().catch(() => ({}));
 const interrogationId: string | undefined = body.interrogationId;
 const answers: string[] = Array.isArray(body.answers)
 ? body.answers.map((a: unknown) => (typeof a === "string" ? a : "")).map((a: string) => a.slice(0, 4000))
 : [];
 if (!interrogationId) return NextResponse.json({ error: "interrogationId required" }, { status: 400 });

 // Load the interrogation and confirm the caller owns it.
 const interro = await prisma.interrogation.findUnique({
 where: { id: interrogationId },
 select: {
 id: true,
 transcript: true,
 completedAt: true,
 checkin: {
 select: {
 userId: true,
 taskId: true,
 task: {
 select: {
 title: true,
 detail: true,
 phase: { select: { track: { select: { roadmap: { select: { title: true } } } } } },
 },
 },
 },
 },
 },
 });
 if (!interro || interro.checkin.userId !== userId) {
 return NextResponse.json({ error: "Not found" }, { status: 404 });
 }

 const t = readTranscript(interro.transcript);
 const questions = questionsOf(t);
 const evidenceSummary = evidenceOf(t);
 if (questions.length === 0) return NextResponse.json({ error: "No questions to defend" }, { status: 400 });
 if (answers.filter((a) => a.trim().length > 0).length < questions.length) {
 return NextResponse.json({ error: "Answer every question before submitting." }, { status: 400 });
 }

 const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
 const first = user?.name?.split(" ")[0] ?? "Student";
 const task = interro.checkin.task;
 const weekMatch = task?.title.match(/^Week\s+(\d+)/i);
 const weekNumber = weekMatch ? parseInt(weekMatch[1], 10) : 0;

 // Grade the defence strictly, judging the answers against the real evidence.
 let graded;
 try {
 graded = await verifyWithTheProfessor({
 studentFirstName: first,
 trackTitle: task?.phase.track.roadmap.title ?? "(track)",
 weekNumber,
 weekTitle: task?.title ?? "(week)",
 weekBrief: task?.detail,
 priorWarningCount: 0,
 userMessage: `${first} is defending Week ${weekNumber}. Below are YOUR defence questions and their answers. Grade STRICTLY and actively HUNT for answers written by an AI rather than by the student.

How to tell them apart:
- A REAL answer from someone who did the work is specific and often a little messy. It names their OWN functions, variables, numbers, files, and decisions; it references concrete things visible in the evidence; it can describe what actually broke, what they tried, why they chose what they chose FOR THIS project.
- An AI-WRITTEN answer is fluent, polished, generic, and over-structured (tidy lists, "it's important to note", textbook phrasing, hedging). It explains the CONCEPT correctly but never the student's SPECIFIC implementation, and it would read identically for any project.

If an answer is correct-sounding but does NOT tie to concrete specifics from THIS student's actual code and evidence, treat it as likely AI-generated and do NOT pass it. Reward specific, first-hand detail; fail generic fluency and anything that contradicts the evidence. Only a student who truly built this can point to their own code — one who did not will speak in generalities. Do not pass work the student cannot genuinely defend.

Questions you asked:\n${questions.map((q, i) => `Q${i + 1}: ${q.prompt}`).join("\n")}`,
 masteryAnswers: answers,
 evidenceSummary,
 });
 } catch (e) {
 return NextResponse.json({ error: "grading_failed", message: (e as Error).message }, { status: 502 });
 }

 const verdict = graded.result.verdict;
 const passed = verdict === "verified";
 const score = verdict === "verified" ? 10 : verdict === "needs_work" ? 5 : 2;

 // Append the answers + verdict to the transcript, close the interrogation.
 const finalTranscript = [
 ...t,
 ...answers.map((a, i) => ({ role: "user", type: "AI_ANSWER", questionNumber: i + 1, content: a })),
 { role: "assistant", type: "VERDICT", content: graded.result.feedback, verdict },
 ];
 await prisma.interrogation.update({
 where: { id: interro.id },
 data: {
 transcript: finalTranscript as unknown as object,
 passed,
 overallScore: score,
 feedback: graded.result.feedback,
 completedAt: new Date(),
 tokensUsed: { increment: graded.raw.inputTokens + graded.raw.outputTokens },
 },
 });

 // Move the week forward on a pass; leave it retryable otherwise.
 if (task && interro.checkin.taskId) {
 await prisma.task.update({
 where: { id: interro.checkin.taskId },
 data: passed ? { status: "verified", verifiedAt: new Date() } : { status: "available" },
 });
 }

 // On a pass, THE PROFESSOR releases the next week — but PACED: it only opens
 // now if the week's minimum duration is already up. Finish early and the work
 // is verified while the next week stays scheduled; announce tells them when.
 // Progression is the AI's job for a solo learner. Runs after the response.
 if (passed) {
 after(() => releaseNextWeek(userId, { announce: true }));
 }

 // Audit + a message that pops on the dashboard.
 await prisma.aIMentorInteraction.create({
 data: {
 userId,
 taskId: interro.checkin.taskId,
 kind: "verification",
 response: graded.result.feedback,
 verdict,
 evidence: { interrogationId: interro.id, answerCount: answers.length },
 tokensUsed: graded.raw.inputTokens + graded.raw.outputTokens,
 costUsd: graded.raw.costUsd,
 },
 });
 await prisma.notification.create({
 data: {
 userId,
 kind: "professor-message",
 title: passed
 ? `You defended Week ${weekNumber} — verified`
 : `Week ${weekNumber} defence: ${verdict === "rejected" ? "rejected" : "needs work"}`,
 body: graded.result.feedback,
 href: "/dashboard/roadmap",
 },
 });

 return NextResponse.json({
 verdict,
 passed,
 feedback: graded.result.feedback,
 next_step: graded.result.next_step,
 praised: graded.result.praised,
 });
}
