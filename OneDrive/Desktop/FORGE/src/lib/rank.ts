/**
 * THE FORGE — Rank & Probation System
 *
 * Ranks are earned through consistent performance. They represent your
 * commitment and skill level inside The Forge.
 *
 * RANKS (ascending):
 *   Ember     → Starting rank. Everyone begins here.
 *   Iron      → 7-day streak + 3 passed sessions
 *   Steel     → 21-day streak + 70% pass rate (min 10 sessions)
 *   Titanium  → 50-day streak + 80% pass rate (min 25 sessions)
 *   Diamond   → 100-day streak + 90% pass rate (min 50 sessions)
 *
 * PROBATION (the punishment that motivates, not destroys):
 *   Triggered when a user:
 *     - Fails 3 interrogations consecutively
 *     - Misses 3 deadlines in a row
 *
 *   While on probation:
 *     - Rank is FROZEN (can't advance)
 *     - Dashboard shows probation status visually (amber warning)
 *     - Profile badge changes to probation indicator
 *     - Grace days are LOCKED (can't use them)
 *     - Must pass 2 consecutive sessions to exit probation
 *
 *   Probation does NOT:
 *     - Wipe progress
 *     - Delete data
 *     - Lock them out of the app
 *     - Take money or features they paid for
 */

export type ForgeRank = "ember" | "iron" | "steel" | "titanium" | "diamond";

export const RANK_ORDER: ForgeRank[] = ["ember", "iron", "steel", "titanium", "diamond"];

export const RANK_CONFIG: Record<ForgeRank, {
  label: string;
  color: string;
  glow: string;
  emoji: string;
  minStreak: number;
  minSessions: number;
  minPassRate: number;
  description: string;
}> = {
  ember: {
    label: "EMBER",
    color: "#ff6b35",
    glow: "rgba(255,107,53,0.3)",
    emoji: "🔥",
    minStreak: 0,
    minSessions: 0,
    minPassRate: 0,
    description: "The spark. Everyone starts here.",
  },
  iron: {
    label: "IRON",
    color: "#94a3b8",
    glow: "rgba(148,163,184,0.3)",
    emoji: "⚔️",
    minStreak: 7,
    minSessions: 3,
    minPassRate: 0.5,
    description: "You showed up. Now prove you can stay.",
  },
  steel: {
    label: "STEEL",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.3)",
    emoji: "🛡️",
    minStreak: 21,
    minSessions: 10,
    minPassRate: 0.7,
    description: "Consistent. Disciplined. Getting dangerous.",
  },
  titanium: {
    label: "TITANIUM",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.3)",
    emoji: "⚡",
    minStreak: 50,
    minSessions: 25,
    minPassRate: 0.8,
    description: "Elite. The Professor respects you. Barely.",
  },
  diamond: {
    label: "DIAMOND",
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.4)",
    emoji: "💎",
    minStreak: 100,
    minSessions: 50,
    minPassRate: 0.9,
    description: "Unbreakable. You are The Forge.",
  },
};

/** Calculate what rank a user qualifies for based on their stats */
export function calculateEligibleRank(stats: {
  currentStreak: number;
  totalSessions: number;
  passedSessions: number;
}): ForgeRank {
  const passRate = stats.totalSessions > 0
    ? stats.passedSessions / stats.totalSessions
    : 0;

  // Check from highest to lowest
  for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
    const rank = RANK_ORDER[i];
    const config = RANK_CONFIG[rank];
    if (
      stats.currentStreak >= config.minStreak &&
      stats.totalSessions >= config.minSessions &&
      passRate >= config.minPassRate
    ) {
      return rank;
    }
  }
  return "ember";
}

/** Check if a rank is higher than another */
export function isHigherRank(a: ForgeRank, b: ForgeRank): boolean {
  return RANK_ORDER.indexOf(a) > RANK_ORDER.indexOf(b);
}

/** Get the next rank above current */
export function getNextRank(current: ForgeRank): ForgeRank | null {
  const idx = RANK_ORDER.indexOf(current);
  return idx < RANK_ORDER.length - 1 ? RANK_ORDER[idx + 1] : null;
}

/** Calculate progress toward next rank (0-100) */
export function getRankProgress(current: ForgeRank, stats: {
  currentStreak: number;
  totalSessions: number;
  passedSessions: number;
}): { streakPct: number; sessionsPct: number; passRatePct: number; overall: number } | null {
  const next = getNextRank(current);
  if (!next) return null;

  const config = RANK_CONFIG[next];
  const passRate = stats.totalSessions > 0 ? stats.passedSessions / stats.totalSessions : 0;

  const streakPct = Math.min(100, (stats.currentStreak / config.minStreak) * 100);
  const sessionsPct = Math.min(100, (stats.totalSessions / config.minSessions) * 100);
  const passRatePct = Math.min(100, (passRate / config.minPassRate) * 100);
  const overall = Math.round((streakPct + sessionsPct + passRatePct) / 3);

  return { streakPct: Math.round(streakPct), sessionsPct: Math.round(sessionsPct), passRatePct: Math.round(passRatePct), overall };
}

/**
 * Probation check — should the user enter probation?
 * Called after each failed interrogation or missed deadline.
 */
export function shouldEnterProbation(consecutiveFails: number): boolean {
  return consecutiveFails >= 3;
}

/**
 * Probation exit check — can the user leave probation?
 * Called after each passed interrogation while on probation.
 */
export function canExitProbation(probationStreak: number): boolean {
  return probationStreak >= 2;
}

/** Calculate days remaining until target date */
export function getDaysRemaining(targetDate: Date | null): number | null {
  if (!targetDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Calculate recommended daily pace based on remaining tasks and deadline */
export function getRecommendedPace(remainingTasks: number, daysRemaining: number | null): string | null {
  if (!daysRemaining || daysRemaining <= 0) return "Deadline passed — catch up now";
  if (remainingTasks <= 0) return null;

  const tasksPerDay = remainingTasks / daysRemaining;
  if (tasksPerDay <= 0.5) return "Ahead of schedule";
  if (tasksPerDay <= 1) return `~1 task per day to finish on time`;
  if (tasksPerDay <= 2) return `${tasksPerDay.toFixed(1)} tasks/day — pick up the pace`;
  return `${tasksPerDay.toFixed(1)} tasks/day — falling behind`;
}
