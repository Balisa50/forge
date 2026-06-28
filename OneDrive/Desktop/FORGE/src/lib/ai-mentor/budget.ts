/**
 * Per-user cost guardrails for the AI Mentor.
 *
 * Without these, a single abusive user could burn through $1000s of API
 * budget in a day. With them, every user has a daily + monthly cap, and
 * the system refuses to call Claude when over budget.
 */

import { prisma } from "@/lib/prisma";

// Default budgets - tunable via env so we can raise for testing without code change.
const DEFAULT_DAILY_USD = parseFloat(process.env.AI_MENTOR_DAILY_BUDGET_USD ?? "2.00");
const DEFAULT_MONTHLY_USD = parseFloat(process.env.AI_MENTOR_MONTHLY_BUDGET_USD ?? "30.00");

export interface BudgetStatus {
 withinBudget: boolean;
 dailySpentUsd: number;
 dailyBudgetUsd: number;
 monthlySpentUsd: number;
 monthlyBudgetUsd: number;
 reason?: string;
}

export async function checkBudget(userId: string): Promise<BudgetStatus> {
 const dayStart = new Date();
 dayStart.setHours(0, 0, 0, 0);
 const monthStart = new Date();
 monthStart.setDate(1);
 monthStart.setHours(0, 0, 0, 0);

 const [dayAgg, monthAgg] = await Promise.all([
 prisma.aIMentorInteraction.aggregate({
 where: { userId, createdAt: { gte: dayStart } },
 _sum: { costUsd: true },
 }),
 prisma.aIMentorInteraction.aggregate({
 where: { userId, createdAt: { gte: monthStart } },
 _sum: { costUsd: true },
 }),
 ]);

 const dailySpentUsd = dayAgg._sum.costUsd ?? 0;
 const monthlySpentUsd = monthAgg._sum.costUsd ?? 0;

 const status: BudgetStatus = {
 withinBudget: true,
 dailySpentUsd,
 dailyBudgetUsd: DEFAULT_DAILY_USD,
 monthlySpentUsd,
 monthlyBudgetUsd: DEFAULT_MONTHLY_USD,
 };

 if (dailySpentUsd >= DEFAULT_DAILY_USD) {
 status.withinBudget = false;
 status.reason = `Daily budget reached ($${DEFAULT_DAILY_USD.toFixed(2)}). Reset at midnight.`;
 } else if (monthlySpentUsd >= DEFAULT_MONTHLY_USD) {
 status.withinBudget = false;
 status.reason = `Monthly budget reached ($${DEFAULT_MONTHLY_USD.toFixed(2)}). Reset on the 1st.`;
 }
 return status;
}
