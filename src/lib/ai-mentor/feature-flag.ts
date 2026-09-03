/**
 * Feature flag for the AI Mentor. Defaults to FALSE so the system is
 * fully dormant in production until we explicitly enable it via Vercel
 * env var AI_MENTOR_ENABLED=true.
 *
 * Granular: we can also enable for specific user IDs (whitelist) so we
 * can test with a single beta user before opening to all Solo learners.
 */

export function aiMentorEnabled(opts?: { userId?: string }): boolean {
 // Global kill switch first. If this is not "true", nothing runs.
 if (process.env.AI_MENTOR_ENABLED !== "true") return false;

 // Optional per-user whitelist via comma-separated env var.
 const whitelist = process.env.AI_MENTOR_BETA_USERS;
 if (whitelist && opts?.userId) {
 const allowed = whitelist.split(",").map((s) => s.trim()).filter(Boolean);
 if (allowed.length > 0 && !allowed.includes(opts.userId)) return false;
 }

 // Belt + braces: require the NVIDIA key to actually be present before
 // claiming we are enabled. Prevents a half-configured deploy from
 // claiming the feature is on.
 if (!process.env.NVIDIA_API_KEY) return false;

 return true;
}

/**
 * Standard 501 response when the AI Mentor is invoked but not yet enabled.
 * Use this in every AI Mentor API endpoint so callers get a consistent,
 * honest error.
 */
export const AI_MENTOR_DISABLED_RESPONSE = {
 error: "ai_mentor_disabled",
 message: "The AI Mentor is not yet active on this instance. The feature is built and waiting to be turned on by the operator.",
} as const;
