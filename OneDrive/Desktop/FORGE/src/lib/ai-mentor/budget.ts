/**
 * Usage guardrails for the AI Mentor.
 *
 * The mentor now runs on NVIDIA's FREE endpoint, so cost is $0 — the dollar
 * caps below never trip on their own. What actually needs protecting is the
 * shared NVIDIA rate limit (one key powers several apps), so the real guards
 * are COUNT-based:
 *   - per-user daily cap   (one person can't hammer it all day)
 *   - per-user burst cap   (no rapid-fire spam)
 *   - GLOBAL per-minute cap (a FORGE swarm can't starve AYAT / VANTAGE etc.)
 * All tunable via env with no code change. The dollar caps are kept as
 * belt-and-braces for any future paid model.
 */

import { prisma } from "@/lib/prisma";

// Dollar caps — dormant while cost is $0, future-proofing for a paid model.
const DAILY_USD = parseFloat(process.env.AI_MENTOR_DAILY_BUDGET_USD ?? "2.00");
const MONTHLY_USD = parseFloat(process.env.AI_MENTOR_MONTHLY_BUDGET_USD ?? "30.00");

// Count caps — the guards that actually bite on a free, rate-limited API.
const USER_DAILY_MAX = parseInt(process.env.AI_MENTOR_USER_DAILY_MAX ?? "25", 10); // per user / day
const USER_BURST_MAX = parseInt(process.env.AI_MENTOR_USER_BURST_MAX ?? "5", 10);  // per user / minute
const GLOBAL_PER_MIN = parseInt(process.env.AI_MENTOR_GLOBAL_PER_MIN ?? "15", 10); // all users / minute

export interface BudgetStatus {
 withinBudget: boolean;
 dailySpentUsd: number;
 dailyBudgetUsd: number;
 monthlySpentUsd: number;
 monthlyBudgetUsd: number;
 reason?: string;
}

export async function checkBudget(userId: string): Promise<BudgetStatus> {
 const now = Date.now();
 const dayStart = new Date();
 dayStart.setHours(0, 0, 0, 0);
 const monthStart = new Date();
 monthStart.setDate(1);
 monthStart.setHours(0, 0, 0, 0);
 const minuteAgo = new Date(now - 60_000);

 const [dayAgg, monthAgg, userDayCount, userMinCount, globalMinCount] = await Promise.all([
 prisma.aIMentorInteraction.aggregate({
 where: { userId, createdAt: { gte: dayStart } },
 _sum: { costUsd: true },
 }),
 prisma.aIMentorInteraction.aggregate({
 where: { userId, createdAt: { gte: monthStart } },
 _sum: { costUsd: true },
 }),
 prisma.aIMentorInteraction.count({ where: { userId, createdAt: { gte: dayStart } } }),
 prisma.aIMentorInteraction.count({ where: { userId, createdAt: { gte: minuteAgo } } }),
 prisma.aIMentorInteraction.count({ where: { createdAt: { gte: minuteAgo } } }),
 ]);

 const dailySpentUsd = dayAgg._sum.costUsd ?? 0;
 const monthlySpentUsd = monthAgg._sum.costUsd ?? 0;

 const status: BudgetStatus = {
 withinBudget: true,
 dailySpentUsd,
 dailyBudgetUsd: DAILY_USD,
 monthlySpentUsd,
 monthlyBudgetUsd: MONTHLY_USD,
 };

 // Count guards first — these are the live protections against exhaustion.
 if (userDayCount >= USER_DAILY_MAX) {
 status.withinBudget = false;
 status.reason = `You've reached today's limit with The Professor (${USER_DAILY_MAX} interactions). Come back tomorrow.`;
 } else if (userMinCount >= USER_BURST_MAX) {
 status.withinBudget = false;
 status.reason = "Slow down — give The Professor a minute between questions.";
 } else if (globalMinCount >= GLOBAL_PER_MIN) {
 status.withinBudget = false;
 status.reason = "The Professor is handling a lot right now. Try again in a minute.";
 } else if (dailySpentUsd >= DAILY_USD) {
 status.withinBudget = false;
 status.reason = `Daily budget reached ($${DAILY_USD.toFixed(2)}). Reset at midnight.`;
 } else if (monthlySpentUsd >= MONTHLY_USD) {
 status.withinBudget = false;
 status.reason = `Monthly budget reached ($${MONTHLY_USD.toFixed(2)}). Reset on the 1st.`;
 }
 return status;
}
