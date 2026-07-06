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
import { callTheProfessor } from "./client";
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

 const userMessage = `${user.name?.split(" ")[0] ?? "The student"} just submitted work for Week ${weekNumber} without being asked to. This is a PROACTIVE review, they did not request it.

Their submission note: "${input.description}"

Inspected evidence (ground truth):
${evidenceSummary}

Speak to them directly, first person, as their mentor reaching out. Tell them what you actually see in the work: what is genuinely good, what is weak or missing, and the single most important thing to do next. Be specific to their evidence, never generic. If the work is not real or contradicts their claims, say so plainly. Keep it under 180 words.`;

 const result = await callTheProfessor({
 studentFirstName: user.name?.split(" ")[0] ?? "Student",
 trackTitle: task.phase.track.roadmap.title,
 weekNumber,
 weekTitle: task.title,
 weekBrief: task.detail,
 priorWarningCount,
 priorInteractionSummary,
 userMessage,
 maxTokens: 700,
 });

 const text = result.text.trim();
 if (!text) return;

 // Audit trail + the message that will pop on the dashboard.
 await prisma.aIMentorInteraction.create({
 data: {
 userId: input.userId,
 taskId: input.taskId,
 kind: "review",
 response: text,
 evidence: { checkinId: input.checkinId, evidenceUrl: input.evidenceUrl ?? null },
 tokensUsed: result.inputTokens + result.outputTokens,
 costUsd: result.costUsd,
 },
 });
 await prisma.notification.create({
 data: {
 userId: input.userId,
 kind: "professor-message",
 title: `The Professor reviewed your Week ${weekNumber} work`,
 body: text,
 href: "/dashboard/roadmap",
 },
 });
 } catch (err) {
 console.warn("[ai-mentor] proactive review failed:", err instanceof Error ? err.message : err);
 }
}
