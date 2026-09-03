/**
 * Proactive review — THE PROFESSOR speaks first.
 *
 * The AI mentor is not a chatbot you have to summon. The moment a solo learner
 * ships real work (a check-in carrying a GitHub repo or a live URL), this runs
 * in the background, inspects what they actually built, and drops a message
 * from The Professor onto their dashboard — unprompted.
 *
 * Fire-and-forget: called from the check-in route via next/after so it never
 * blocks the learner's response, and it never throws (all errors are swallowed
 * and logged). Cost is guarded by the shared budget check.
 */

import { prisma } from "@/lib/prisma";
import { aiMentorEnabled } from "./feature-flag";
import { checkBudget } from "./budget";
import { callTheProfessor, generateDefenceQuestions } from "./client";
import { inspectGithubRepo, formatInspectionForProfessor } from "./github-inspector";
import { inspectLiveUrl, formatUrlInspectionForProfessor } from "./url-fetcher";

interface ReviewInput {
 userId: string;
 taskId: string;
 checkinId: string;
 description: string;
 evidenceUrl?: string | null;
 videoUrl?: string | null;
}

const isGithub = (u?: string | null) => !!u && /github\.com/i.test(u);
const isHttp = (u?: string | null) => !!u && /^https?:\/\//i.test(u);

export async function runProactiveReview(input: ReviewInput): Promise<void> {
 try {
 if (!aiMentorEnabled({ userId: input.userId })) return;

 // The Professor only reviews SOLO learners. If a human mentor is on this
 // learner, their submission goes to that mentor's review queue — don't
 // touch it (and don't overwrite their mentor_async interrogation).
 const humanMentor = await prisma.mentorLink.findFirst({
 where: { menteeId: input.userId, isActive: true },
 select: { id: true },
 });
 if (humanMentor) return;

 // Cost guardrail — silently skip if the learner is over budget.
 const budget = await checkBudget(input.userId);
 if (!budget.withinBudget) return;

 const [task, user, checkins, prior] = await Promise.all([
 prisma.task.findFirst({
 where: { id: input.taskId, phase: { track: { roadmap: { userId: input.userId } } } },
 select: {
 title: true,
 detail: true,
 phase: { select: { track: { select: { roadmap: { select: { title: true } } } } } },
 },
 }),
 prisma.user.findUnique({ where: { id: input.userId }, select: { name: true } }),
 prisma.checkin.findMany({
 where: { userId: input.userId, taskId: input.taskId },
 orderBy: { createdAt: "asc" },
 take: 14,
 select: { description: true, evidenceUrl: true, createdAt: true },
 }),
 prisma.aIMentorInteraction.findMany({
 where: { userId: input.userId, taskId: input.taskId },
 orderBy: { createdAt: "desc" },
 take: 3,
 select: { kind: true, verdict: true, response: true, warningCount: true, createdAt: true },
 }),
 ]);
 if (!task || !user) return;

 const weekMatch = task.title.match(/^Week\s+(\d+)/i);
 const weekNumber = weekMatch ? parseInt(weekMatch[1], 10) : 0;
 const priorWarningCount = prior.find((p) => p.warningCount > 0)?.warningCount ?? 0;
 const priorInteractionSummary =
 prior
 .map((p) => `[${p.kind}${p.verdict ? " - " + p.verdict : ""}]: ${p.response.slice(0, 180)}...`)
 .join("\n") || undefined;

 // Inspect the artefacts the learner actually shipped, ground truth The
 // Professor cannot be lied to about.
 const evidence: string[] = [];
 const primary = input.evidenceUrl || input.videoUrl || undefined;
 if (isGithub(primary)) {
 try { evidence.push(formatInspectionForProfessor(await inspectGithubRepo(primary!))); }
 catch (e) { evidence.push(`GitHub inspection failed: ${(e as Error).message}`); }
 } else if (isHttp(primary)) {
 try { evidence.push(formatUrlInspectionForProfessor(await inspectLiveUrl(primary!))); }
 catch (e) { evidence.push(`Live URL inspection failed: ${(e as Error).message}`); }
 }
 if (checkins.length > 0) {
 evidence.push(
 "Check-in log for this week (what they claimed, day by day):\n" +
 checkins
 .map((c, i) => `Check-in ${i + 1} (${c.createdAt.toISOString().slice(0, 10)}): ${c.description}${c.evidenceUrl ? ` [${c.evidenceUrl}]` : ""}`)
 .join("\n"),
 );
 }
 const evidenceSummary = evidence.join("\n\n---\n\n") || "No inspectable artefact was attached.";

 const first = user.name?.split(" ")[0] ?? "Student";

 // Read the work and, in one call, react + generate the defence questions.
 const gen = await generateDefenceQuestions({
 studentFirstName: first,
 trackTitle: task.phase.track.roadmap.title,
 weekNumber,
 weekTitle: task.title,
 weekBrief: task.detail,
 priorWarningCount,
 priorInteractionSummary,
 userMessage: `${first} just shipped Week ${weekNumber} without being asked. Their submission note: "${input.description}". Before you sign anything off, you are going to make them defend the work.`,
 evidenceSummary,
 count: 3,
 });
 const { reaction, questions } = gen;

 // Store the questions on THIS check-in's interrogation (ai_solo defence),
 // stashing the evidence so grading later judges against exactly what was
 // reviewed. Interrogation is 1:1 with the check-in, so upsert on checkinId.
 if (questions.length > 0) {
 const transcript: Array<Record<string, unknown>> = [
 { role: "system", type: "EVIDENCE", content: evidenceSummary },
 ];
 questions.forEach((q, i) =>
 transcript.push({ role: "assistant", type: "AI_QUESTION", questionNumber: i + 1, content: q }),
 );
 await prisma.interrogation.upsert({
 where: { checkinId: input.checkinId },
 create: {
 checkinId: input.checkinId,
 mode: "ai_solo",
 isDefence: true,
 transcript: transcript as unknown as object,
 tokensUsed: gen.raw.inputTokens + gen.raw.outputTokens,
 },
 update: {
 mode: "ai_solo",
 isDefence: true,
 transcript: transcript as unknown as object,
 passed: false,
 overallScore: 0,
 feedback: null,
 completedAt: null,
 },
 });
 }

 const popup =
 questions.length > 0
 ? `${reaction ? reaction + "\n\n" : ""}I've left ${questions.length} question${questions.length === 1 ? "" : "s"} about your work on your Roadmap. Answer them to lock in this week — I want to see you can defend what you shipped.`
 : reaction || "I've looked at your submission.";

 await prisma.aIMentorInteraction.create({
 data: {
 userId: input.userId,
 taskId: input.taskId,
 kind: "review",
 response: reaction || popup,
 evidence: { checkinId: input.checkinId, evidenceUrl: input.evidenceUrl ?? null, questions },
 tokensUsed: gen.raw.inputTokens + gen.raw.outputTokens,
 costUsd: gen.raw.costUsd,
 },
 });
 await prisma.notification.create({
 data: {
 userId: input.userId,
 kind: "professor-message",
 title:
 questions.length > 0
 ? `The Professor has ${questions.length} question${questions.length === 1 ? "" : "s"} about your Week ${weekNumber} work`
 : `The Professor reviewed your Week ${weekNumber} work`,
 body: popup,
 href: "/dashboard/roadmap",
 },
 });
 } catch (err) {
 console.warn("[ai-mentor] proactive review failed:", err instanceof Error ? err.message : err);
 }
}

const IDLE_DAYS = 3;
const DAY_MS = 86_400_000;

/**
 * Idle nudge — THE PROFESSOR notices you went quiet.
 *
 * Called (fire-and-forget, via next/after) from the dashboard layout on load.
 * If the learner has an active roadmap, has checked in before, but has now gone
 * silent for IDLE_DAYS+, The Professor speaks first: names the silence and gives
 * them one concrete thing to do. Guarded so it fires at most once per IDLE_DAYS
 * and never for a brand-new learner who simply hasn't started.
 */
export async function maybeIdleNudge(userId: string): Promise<void> {
 try {
 if (!aiMentorEnabled({ userId })) return;

 // Already spoke recently? (unread review OR a prior nudge) → stay quiet.
 const recent = await prisma.notification.findFirst({
 where: {
 userId,
 kind: "professor-message",
 createdAt: { gt: new Date(Date.now() - IDLE_DAYS * DAY_MS) },
 },
 select: { id: true },
 });
 if (recent) return;

 const roadmap = await prisma.roadmap.findFirst({
 where: { userId, isActive: true },
 select: { title: true },
 });
 if (!roadmap) return;

 // Only nudge someone who STARTED and went quiet — not a brand-new signup.
 const lastCheckin = await prisma.checkin.findFirst({
 where: { userId },
 orderBy: { createdAt: "desc" },
 select: { createdAt: true },
 });
 if (!lastCheckin) return;
 const idleMs = Date.now() - lastCheckin.createdAt.getTime();
 if (idleMs < IDLE_DAYS * DAY_MS) return;

 const budget = await checkBudget(userId);
 if (!budget.withinBudget) return;

 const [task, user] = await Promise.all([
 prisma.task.findFirst({
 where: {
 phase: { track: { roadmap: { userId, isActive: true } } },
 releasedAt: { not: null },
 OR: [{ status: "available" }, { status: "in_progress" }, { status: "pending_verification" }],
 },
 orderBy: { releasedAt: "desc" },
 select: {
 title: true,
 detail: true,
 phase: { select: { track: { select: { roadmap: { select: { title: true } } } } } },
 },
 }),
 prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
 ]);
 if (!user) return;

 const days = Math.floor(idleMs / DAY_MS);
 const first = user.name?.split(" ")[0] ?? "Student";
 const weekMatch = task?.title.match(/^Week\s+(\d+)/i);
 const weekNumber = weekMatch ? parseInt(weekMatch[1], 10) : 0;

 const userMessage = `${first} has gone quiet — no check-in for ${days} days${task ? `, part-way through ${task.title}` : ""}. They just opened the app. Speak first, as the mentor who noticed the silence. Be direct, not preachy: name the gap, remind them briefly why this matters, and give them ONE concrete, small thing to do right now to get moving again today. Under 120 words.`;

 const result = await callTheProfessor({
 studentFirstName: first,
 trackTitle: task?.phase.track.roadmap.title ?? roadmap.title,
 weekNumber,
 weekTitle: task?.title ?? "(no active week)",
 weekBrief: task?.detail,
 priorWarningCount: 0,
 userMessage,
 maxTokens: 450,
 });
 const text = result.text.trim();
 if (!text) return;

 await prisma.aIMentorInteraction.create({
 data: {
 userId,
 taskId: null,
 kind: "nudge",
 response: text,
 tokensUsed: result.inputTokens + result.outputTokens,
 costUsd: result.costUsd,
 },
 });
 await prisma.notification.create({
 data: {
 userId,
 kind: "professor-message",
 title: `${days} days quiet — a word from The Professor`,
 body: text,
 href: "/dashboard/roadmap",
 },
 });
 } catch (err) {
 console.warn("[ai-mentor] idle nudge failed:", err instanceof Error ? err.message : err);
 }
}
