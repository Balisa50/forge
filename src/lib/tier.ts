/**
 * THE FORGE, Tier
 * All features are available to everyone. No paid gating.
 */

export type Tier = "free" | "pro" | "team";

const ALL_UNLOCKED = {
 maxRoadmaps: Infinity,
 graceDaysPerMonth: 5,
 respiteDaysPerMonth: 5,
 aiRoadmapGeneration: true,
 projectDefence: true,
 pdfCertificate: true,
 fullAnalytics: true,
 priorityAI: true,
 simulationQuestions: true,
 maxSimulationsPerExam: 10,
 adaptiveDifficulty: true,
 rankLeaderboard: true,
 exportProgress: true,
} as const;

export const TIER_LIMITS = {
 free: ALL_UNLOCKED,
 pro: ALL_UNLOCKED,
 team: ALL_UNLOCKED,
};

export function getTierLimits(_tier?: string) {
 return ALL_UNLOCKED;
}

export function requireTier(_userTier: string, _feature: keyof typeof ALL_UNLOCKED) {
 return { allowed: true, requiredTier: "free" };
}
