/**
 * Mentor-controlled visibility flags. Every flag defaults to TRUE so the
 * absence of a setting never silently hides something. A mentor must
 * explicitly turn a section off for a given mentee.
 *
 * Server side: aggregate across all active MentorLinks for a mentee. If
 * any mentor says "show", we show. (Conservative: easier to opt OUT than IN.)
 */
export type VisibilityKey =
  | "pod"
  | "certificates"
  | "analytics"
  | "journal"
  | "leaderboard"
  | "calendar"
  | "notes";

export type VisibilityMap = Record<VisibilityKey, boolean>;

export const DEFAULT_VISIBILITY: VisibilityMap = {
  pod: true,
  certificates: true,
  analytics: true,
  journal: true,
  leaderboard: true,
  calendar: true,
  notes: true,
};

export function parseVisibility(raw: unknown): Partial<VisibilityMap> {
  if (!raw || typeof raw !== "object") return {};
  const out: Partial<VisibilityMap> = {};
  for (const key of Object.keys(DEFAULT_VISIBILITY) as VisibilityKey[]) {
    const v = (raw as Record<string, unknown>)[key];
    if (typeof v === "boolean") out[key] = v;
  }
  return out;
}

/** Merge across multiple mentor links: ANY mentor allowing a section = visible. */
export function effectiveVisibility(rawList: unknown[]): VisibilityMap {
  if (rawList.length === 0) return { ...DEFAULT_VISIBILITY };
  const result: VisibilityMap = { ...DEFAULT_VISIBILITY };
  // If at least one mentor explicitly hid a section, hide it — UNLESS another
  // mentor explicitly shows it. So: hidden only when ALL mentors hide.
  for (const key of Object.keys(DEFAULT_VISIBILITY) as VisibilityKey[]) {
    const opinions = rawList
      .map((raw) => parseVisibility(raw)[key])
      .filter((v): v is boolean => typeof v === "boolean");
    if (opinions.length === 0) continue; // no opinion, keep default (true)
    result[key] = opinions.some((v) => v === true);
  }
  return result;
}
