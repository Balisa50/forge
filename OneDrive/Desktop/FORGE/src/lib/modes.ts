/**
 * Learning-mode feature flags.
 *
 * FORGE has two learning modes:
 *   - SOLO    : self-paced, no human mentor (AI Professor companions them)
 *   - MENTEE  : mentor-controlled weekly releases, real human accountability
 *
 * Solo mode is gated behind a flag so FORGE can launch mentor-required
 * (every learner has a human accountable to them - the core moat) and
 * switch Solo on later without a code change.
 *
 * To enable Solo mode: set SOLO_MODE_ENABLED=true on Vercel and redeploy.
 */

/** True when self-paced Solo learning is open to users. Defaults FALSE. */
export function soloModeEnabled(): boolean {
  return process.env.SOLO_MODE_ENABLED === "true";
}

/** True when the public env mirror says solo is on (for client components). */
export function soloModeEnabledClient(): boolean {
  return process.env.NEXT_PUBLIC_SOLO_MODE_ENABLED === "true";
}
