import { loadRoadmap } from "@/lib/roadmaps";
import { CURATED_ROADMAPS } from "@/lib/curated-roadmaps-client";

/**
 * Map a stored roadmap.title back to its curated slug.
 *
 * The DB stores the curriculum's OWN title at seed time (via loadRoadmap),
 * which can drift from the static CURATED_ROADMAPS[].title — e.g. the data file
 * says "DevOps & Cloud" but the client list says "DevOps and Cloud", likewise
 * "Cybersecurity Engineering" vs "Cybersecurity" and "BI Analytics" vs
 * "Business Intelligence". Matching ONLY the static list silently mis-resolved
 * those three tracks, which disabled the check-in engagement gate (a mentee
 * could submit without finishing the week). Resolve against the real loaded
 * curriculum titles (the same source used at seed), with the static titles as
 * fallback aliases. Memoized per server instance — the curriculum files are
 * static, so the map is built once.
 *
 * Server-only (pulls in the fs-backed loadRoadmap); import from API routes.
 */
let _titleToSlug: Map<string, string> | null = null;

export function curatedSlugForTitle(roadmapTitle: string): string | null {
 const norm = (s: string) => s.trim().toLowerCase();
 if (!_titleToSlug) {
 const map = new Map<string, string>();
 for (const r of CURATED_ROADMAPS) {
 map.set(norm(r.title), r.slug); // static client alias
 const c = loadRoadmap(r.slug);
 if (c?.title) map.set(norm(c.title), r.slug); // real seeded title
 }
 _titleToSlug = map;
 }
 return _titleToSlug.get(norm(roadmapTitle)) ?? null;
}
