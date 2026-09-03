/**
 * The Professor releases the next week — PACED, not on raw completion.
 *
 * A week is a week. Finishing the work in 2 days verifies the work, but it does
 * NOT shorten the week: the next one stays locked until the current week has
 * been open at least AI_MENTOR_MIN_WEEK_DAYS (default 7). So a fast learner gets
 * their credit immediately, and the next unlock still lands on schedule.
 *
 * Two things gate the next release, both required:
 *   1. The current (most-recently-released) week is VERIFIED — they passed the viva.
 *   2. That week has been open for at least the minimum week duration.
 *
 * Called fire-and-forget from next/after in two places, so it never throws:
 *   - the defence route, the moment a viva passes (announce: true) — releases now
 *     if the week's time is already up, otherwise tells them the unlock date.
 *   - the dashboard layout, on every load (announce: false) — the lazy sweep that
 *     actually opens the week the first time they return after its time is up.
 * If over budget, it still releases, just with a plain templated note.
 */

import { prisma } from "@/lib/prisma";
import { checkBudget } from "./budget";
import { callTheProfessor } from "./client";

const DAY_MS = 86_400_000;

/** Minimum days a week stays "the current week" before the next can unlock. */
export const MIN_WEEK_DAYS = Math.max(
 0,
 parseInt(process.env.AI_MENTOR_MIN_WEEK_DAYS ?? "7", 10) || 7,
);

export type ReleaseOutcome =
 | { status: "released"; weekTitle: string }
 | { status: "waiting"; unlocksAt: Date } // passed, but the week's time isn't up
 | { status: "current_not_passed" } // current week not verified yet
 | { status: "none" }; // nothing left / nothing released yet

export async function releaseNextWeek(
 userId: string,
 opts: { announce?: boolean; force?: boolean } = {},
): Promise<ReleaseOutcome> {
 try {
 // The current week = the most recently released one on the active roadmap.
 const current = await prisma.task.findFirst({
 where: {
 phase: { track: { roadmap: { userId, isActive: true } } },
 releasedAt: { not: null },
 },
 orderBy: { releasedAt: "desc" },
 select: { id: true, title: true, status: true, releasedAt: true },
 });

 // Gate 1: progression requires the current week to be PASSED (verified).
 // No verified current week → they haven't earned the next one. (force skips
 // this, e.g. a manual admin release — not used by the automated hooks.)
 if (!opts.force) {
 if (!current) return { status: "none" };
 if (current.status !== "verified") return { status: "current_not_passed" };

 // Gate 2: the week must have run its minimum course.
 const openMs = Date.now() - (current.releasedAt?.getTime() ?? 0);
 if (openMs < MIN_WEEK_DAYS * DAY_MS) {
 const unlocksAt = new Date((current.releasedAt?.getTime() ?? Date.now()) + MIN_WEEK_DAYS * DAY_MS);
 if (opts.announce) await announceWaiting(userId, current.title, unlocksAt);
 return { status: "waiting", unlocksAt };
 }
 }

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
 if (!nextTask) return { status: "none" }; // nothing left to release

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

 const deadline = new Date(Date.now() + MIN_WEEK_DAYS * DAY_MS);
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

 return { status: "released", weekTitle: nextTask.title };
 } catch (err) {
 console.warn("[ai-mentor] release next week failed:", err instanceof Error ? err.message : err);
 return { status: "none" };
 }
}

/**
 * Tell the learner their work is accepted but the next week is paced — fired
 * once, from the viva-pass path only, so it can't spam on dashboard sweeps.
 */
async function announceWaiting(userId: string, currentTitle: string, unlocksAt: Date) {
 try {
 const when = unlocksAt.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
 await prisma.notification.create({
 data: {
 userId,
 kind: "professor-message",
 title: `${currentTitle} — verified`,
 body: `Forged. Your work is accepted. But the week runs its full course: the next one opens ${when}. Rest, review, or go deeper — you don't rush the forge.`,
 href: "/dashboard/roadmap",
 },
 });
 } catch {
 /* a missed "waiting" notice is not worth failing the pass over */
 }
}
