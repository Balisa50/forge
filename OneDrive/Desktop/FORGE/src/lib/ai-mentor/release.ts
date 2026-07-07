/**
 * The Professor releases the next week.
 *
 * Progression is the AI's job for a solo learner: when they PASS a week's viva,
 * the next locked week unlocks with a short personal note. Fire-and-forget from
 * the defence route via next/after; never throws. If over budget, still releases
 * the week, just with a plain note (no LLM call).
 */

import { prisma } from "@/lib/prisma";
import { checkBudget } from "./budget";
import { callTheProfessor } from "./client";

export async function releaseNextWeek(userId: string): Promise<{ weekTitle: string } | null> {
 try {
 // Next locked, unreleased week on the active roadmap.
 const nextTask = await prisma.task.findFirst({
 where: {
 phase: { track: { roadmap: { userId, isActive: true } } },
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
 if (!nextTask) return null; // nothing left to release

 const weekMatch = nextTask.title.match(/^Week\s+(\d+)/i);
 const weekNumber = weekMatch ? parseInt(weekMatch[1], 10) : 0;

 // Personal release note (skip the LLM call if over budget).
 let note = `Week ${weekNumber} is open. You earned it by defending the last one — keep the standard exactly this high.`;
 let tokens = 0;
 let costUsd = 0;
 const budget = await checkBudget(userId);
 if (budget.withinBudget) {
 try {
 const [user, verified] = await Promise.all([
 prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
 prisma.task.findMany({
 where: { phase: { track: { roadmap: { userId, isActive: true } } }, status: "verified" },
 orderBy: { verifiedAt: "desc" },
 take: 3,
 select: { title: true },
 }),
 ]);
 const first = user?.name?.split(" ")[0] ?? "Student";
 const priorSummary =
 verified.length === 0
 ? "This is their first week with you."
 : `Recently verified: ${verified.map((t) => t.title).join("; ")}`;
 const result = await callTheProfessor({
 studentFirstName: first,
 trackTitle: nextTask.phase.track.roadmap.title,
 weekNumber,
 weekTitle: nextTask.title,
 weekBrief: nextTask.detail,
 priorWarningCount: 0,
 priorInteractionSummary: priorSummary,
 userMessage: `Write a 2-sentence personal note for ${first} as you release Week ${weekNumber}. Reference something specific from their prior work, and set the bar for this week. Prose only, no bullet points, not effusive.`,
 maxTokens: 250,
 });
 if (result.text.trim()) note = result.text.trim();
 tokens = result.inputTokens + result.outputTokens;
 costUsd = result.costUsd;
 } catch {
 /* keep the plain note */
 }
 }

 const deadline = new Date(Date.now() + 7 * 86_400_000);
 await prisma.$transaction([
 prisma.task.update({
 where: { id: nextTask.id },
 data: {
 status: "available",
 releasedAt: new Date(),
 releasedBy: userId, // the AI releases on the learner's behalf
 deadline,
 closedAt: null,
 },
 }),
 prisma.aIMentorInteraction.create({
 data: {
 userId,
 taskId: nextTask.id,
 kind: "release",
 response: note,
 evidence: { weekTitle: nextTask.title },
 tokensUsed: tokens,
 costUsd,
 },
 }),
 prisma.notification.create({
 data: {
 userId,
 kind: "professor-message",
 title: `Week ${weekNumber} unlocked`,
 body: note,
 href: "/dashboard/roadmap",
 },
 }),
 ]);

 return { weekTitle: nextTask.title };
 } catch (err) {
 console.warn("[ai-mentor] release next week failed:", err instanceof Error ? err.message : err);
 return null;
 }
}
