/**
 * Roadmap data loader.
 *
 * Reads structured JSON from /data/roadmaps/{slug}.json (extracted by
 * scripts/parse_roadmaps.py from the LaTeX source roadmaps). This keeps the
 * heavy curriculum data out of the database during the migration phase —
 * the JSON is the source of truth, the DB later layers user progress on
 * top of it.
 */

import fs from "fs";
import path from "path";

export interface RoadmapResource {
  label: string;
  url: string;
  note: string;
}

/** Item inside a single day of a week. The richer interface that
 *  replaces the wall-of-text "topics" list. */
export type DayItemKind = "video" | "reading" | "exercise" | "reflection" | "widget" | "lesson" | "swipe";

/** Reference to an interactive concept widget. The heavy HTML/JS lives in the
 *  server-side registry (src/lib/conceptWidgets); JSON only points at it by
 *  `id` and passes small params. Keeps the roadmap files readable and lets one
 *  widget serve many weeks. */
export interface ConceptWidgetRef {
  /** Registry key — see src/lib/conceptWidgets/index.ts */
  id: string;
  /** Optional tuning params forwarded into the widget's html() builder. */
  params?: Record<string, string | number | boolean>;
  /** One-line caption shown under the "Interactive" chip. */
  caption?: string;
}

/** One swipe retention card. The student reads the claim, swipes RIGHT if they
 *  think it's true / YES, LEFT if false / NO. On answer the card reveals whether
 *  they were right plus a tiny live "simulation" of the concept (sim). Reusable
 *  across every track — the data lives in the roadmap JSON. */
export interface SwipeCard {
  /** The claim/question about the concept just taught. */
  prompt: string;
  /** true = the claim is correct (swipe right ✓); false = swipe left ✗. */
  answer: boolean;
  /** Shown when the learner answers correctly. */
  whenRight: string;
  /** Shown when the learner answers wrong. */
  whenWrong: string;
  /** Optional tiny code/output snippet rendered as the live result on reveal. */
  sim?: string;
}

export interface DayItem {
  kind: DayItemKind;
  title: string;
  url?: string;              // for video + reading
  duration_min?: number;     // for video
  creator?: string;          // for video — channel/author
  why?: string;              // one-line "why this matters"
  body?: string;             // for exercise + reflection + lesson — the prose
  widget?: ConceptWidgetRef; // for kind === "widget" — the interactive sim
  cards?: SwipeCard[];       // for kind === "swipe" — retention swipe cards
}

export interface RoadmapDay {
  number: number;            // 1-7 within the week
  title: string;             // "What is an AI Engineer?"
  summary?: string;          // 1 line tucked under the day card
  items: DayItem[];          // 1-4 cards per day
}

/** A single concept check question — short multiple-choice prompt shown
 *  at the start of a week as a low-stakes warm-up. */
export interface ConceptCheckQuestion {
  /** The prompt itself. */
  q: string;
  /** 2–4 answer choices. */
  choices: string[];
  /** Zero-indexed position of the correct answer. */
  correct: number;
  /** Optional 1-line debrief shown after the learner answers. */
  explain?: string;
}

export interface RoadmapWeek {
  number: number;
  title: string;
  phase: string;
  commitment_hours: string;
  context: string;
  /** Optional visual-first concept primer — short markdown explanation
   *  rendered as a card at the top of the week, BEFORE the day list.
   *  Pair with concept_image_url for the illustration above the text. */
  concept_primer?: string;
  concept_image_url?: string;
  /** Optional interactive concept widget shown at the top of the week, under
   *  the primer. The living simulation that makes the concept click —
   *  e.g. a regression slider, a DataFrame inspector, a k-means stepper. */
  concept_widget?: ConceptWidgetRef;
  /** Optional 3-question warm-up at the start of the week. Low stakes,
   *  not graded — just flags confusion before it becomes dropout. */
  concept_check?: ConceptCheckQuestion[];
  /** NEW: optional day-by-day breakdown. When present, the UI defaults to
   *  the day-by-day view. When absent, falls back to the Overview tab. */
  days?: RoadmapDay[];
  /** All "long-form" sections below are optional because the newer
   *  day-only roadmaps (e.g. AI Automation) omit them entirely and rely on
   *  the day stream alone. The /learn pages must handle them being absent. */
  topics?: string[];
  tasks?: string[];
  project?: string;
  resources?: RoadmapResource[];
  questions?: string[];
  exercises?: string[];
  outputs?: string[];
  /** 10 hands-on mastery checkpoints, hand-curated per week. Optional on the
   *  type for backward-compat; in practice every shipped week now has them. */
  mastery_questions?: string[];
  /** How to use AI tooling on this specific week's work. */
  ai_assist?: string;
  /** Who reads this week's deliverable + what they want (deliverable weeks). */
  stakeholder_moment?: string;
  /** Things to do BEFORE writing any code - predictions, hypotheses, pen+paper
   *  guesses the student checks at the end of the week. The single highest-ROI
   *  habit in analysis. */
  pre_flight?: string;
  /** Mistakes beginners reliably make this week - listed so they recognise the
   *  shape of the error when it happens to them, instead of feeling stupid. */
  common_mistakes?: string[];
  /** Mentor-voice paragraph on how to read errors / debug calmly THIS week.
   *  Reduces the panic spiral that makes beginners quit. */
  debug_help?: string;
  /** Optional stretch challenges for students who finish early and want to
   *  push further without skipping ahead. */
  stretch?: string[];
}

export interface Roadmap {
  slug: string;
  title: string;
  total_weeks: number;
  weeks: RoadmapWeek[];
}

const DATA_DIR = path.join(process.cwd(), "data", "roadmaps");

const META: Record<string, { tagline: string; outcome: string; gradient: string }> = {
  "ai-engineering": {
    tagline: "Zero to shipping AI products — LLMs, RAG, agents, evals, observability, deployment",
    outcome: "Ship a real AI product to a public URL with auth, evals, observability, and real users",
    gradient: "from-fuchsia-500 via-purple-500 to-violet-600",
  },
  "ml-engineering": {
    tagline: "From NumPy to PyTorch to MLOps — train, serve, monitor real models",
    outcome: "Train, version, deploy and monitor a production model with full eval + drift detection",
    gradient: "from-violet-500 via-indigo-500 to-blue-600",
  },
  "full-stack-web": {
    tagline: "From HTML first principles to a paid-customer SaaS",
    outcome: "Ship a real SaaS at a custom domain — auth, Stripe, observability, real revenue",
    gradient: "from-cyan-500 via-blue-500 to-sky-600",
  },
  "mobile-engineering": {
    tagline: "From React Native fundamentals to App Store + Play Store",
    outcome: "Ship one mobile app to both stores with real users and real retention data",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-600",
  },
  "devops-cloud": {
    tagline: "From Linux to Kubernetes to a full production stack on AWS",
    outcome: "Build the entire production stack for one app — Terraform, K8s, GitOps, observability, SLOs",
    gradient: "from-orange-500 via-red-500 to-rose-600",
  },
  "cybersecurity": {
    tagline: "From OWASP Top 10 to published CVE or bug bounty",
    outcome: "Earn a real security artifact — bug bounty, CVE, red team report, or detection contribution",
    gradient: "from-lime-500 via-emerald-500 to-teal-600",
  },
  "data-science": {
    tagline: "From Python first principles to a deployed ML model with a portfolio",
    outcome: "Ship a capstone that uses real-world data, statistical reasoning, and a deployed model",
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
  },
  "data-analysis": {
    tagline: "From spreadsheets to SQL to dashboards that decision-makers act on",
    outcome: "Become the person whose analysis the team trusts to call shipping decisions",
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
  },
  "bi-analytics": {
    tagline: "From clean data models to BI dashboards that drive million-dollar decisions",
    outcome: "Own the analytics layer for a whole business unit — Power BI, modelling, automation",
    gradient: "from-amber-500 via-orange-500 to-rose-600",
  },
};

export const ROADMAP_META = META;

/** Strip the auto-generated " (Enriched)" suffix from a title. */
function cleanTitle(t: string): string {
  return (t || "").replace(/\s*\(enriched\)\s*$/i, "").trim();
}

/**
 * Load the roadmap students should see. Prefers the ENRICHED build
 * ({slug}-enriched.json — Day 0, on-topic videos, concept checks, zero-cost paths)
 * and falls back to {slug}.json. Gold tracks (data-science/analysis/engineering)
 * already store enriched content in {slug}.json, so they are unaffected.
 *
 * Normalizes the enriched file's internal slug/title back to the canonical ones and
 * keeps the human-written title from the raw file when available.
 */
export function loadRoadmap(slug: string): Roadmap | null {
  const enriched = path.join(DATA_DIR, `${slug}-enriched.json`);
  const plain = path.join(DATA_DIR, `${slug}.json`);
  const file = fs.existsSync(enriched) ? enriched : (fs.existsSync(plain) ? plain : null);
  if (!file) return null;

  let roadmap: Roadmap;
  try {
    roadmap = JSON.parse(fs.readFileSync(file, "utf-8")) as Roadmap;
  } catch {
    return null;
  }
  if (!Array.isArray(roadmap.weeks)) return null; // not a roadmap file

  roadmap.slug = slug; // enriched files carry a "-enriched" slug internally
  roadmap.title = cleanTitle(roadmap.title);

  // When serving the enriched build, MERGE in the raw week's task-detail fields
  // (topics, tasks, project, outputs, resources, mastery_questions, ...). The
  // enriched week wins (its days/concept_check/context are the student experience);
  // the raw fields only fill gaps so task generation keeps its richness — no regression.
  if (file === enriched && fs.existsSync(plain)) {
    try {
      const raw = JSON.parse(fs.readFileSync(plain, "utf-8")) as Roadmap;
      if (raw.title) roadmap.title = cleanTitle(raw.title);
      const rawByNum = new Map<number, RoadmapWeek>();
      (raw.weeks ?? []).forEach((w) => rawByNum.set(w.number, w));
      roadmap.weeks = roadmap.weeks.map((ew) => {
        const rw = rawByNum.get(ew.number);
        return rw ? ({ ...rw, ...ew } as RoadmapWeek) : ew;
      });
    } catch {
      /* keep enriched-only on any raw parse error */
    }
  }
  return roadmap;
}

/** Canonical track order for the developer preview. */
export const PREVIEW_SLUGS = [
  "data-science", "data-analysis", "ai-engineering", "ml-engineering",
  "devops-cloud", "full-stack-web", "mobile-engineering", "cybersecurity",
  "bi-analytics", "ai-automation", "data-engineering",
];

/**
 * Preview loader (dev mode only): prefers the ENRICHED file ({slug}-enriched.json)
 * so the developer previews the fully-built experience. Also reports whether the
 * LIVE student route (loadRoadmap -> {slug}.json) is actually serving that enriched
 * content, surfacing any "built but not deployed" gap.
 */
export function loadPreviewRoadmap(slug: string):
  { roadmap: Roadmap; source: string; liveServesEnriched: boolean } | null {
  const enriched = path.join(DATA_DIR, `${slug}-enriched.json`);
  const plain = path.join(DATA_DIR, `${slug}.json`);
  let file: string, source: string;
  if (fs.existsSync(enriched)) { file = enriched; source = `${slug}-enriched.json`; }
  else if (fs.existsSync(plain)) { file = plain; source = `${slug}.json`; }
  else return null;
  const roadmap = JSON.parse(fs.readFileSync(file, "utf-8")) as Roadmap;
  roadmap.slug = slug; // normalize (enriched files carry a "-enriched" slug internally)
  roadmap.title = cleanTitle(roadmap.title);
  // If no -enriched file exists, {slug}.json IS the enriched content (gold tracks).
  const liveServesEnriched = !fs.existsSync(enriched);
  return { roadmap, source, liveServesEnriched };
}

export function loadAllRoadmaps(): Roadmap[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  // Load ONE roadmap per canonical track (enriched preferred), via loadRoadmap.
  // This avoids double-listing raw/enriched twins and never parses sidecar JSON
  // (.video-cache.json, paid_services_report.json, etc.) as roadmaps.
  return PREVIEW_SLUGS
    .map((slug) => loadRoadmap(slug))
    .filter((r): r is Roadmap => r !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getPhaseGroups(weeks: RoadmapWeek[]): { phase: string; weeks: RoadmapWeek[] }[] {
  const map = new Map<string, RoadmapWeek[]>();
  for (const w of weeks) {
    const key = w.phase || "Unphased";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(w);
  }
  // Preserve order of first appearance
  const order: string[] = [];
  for (const w of weeks) {
    const k = w.phase || "Unphased";
    if (!order.includes(k)) order.push(k);
  }
  return order.map((p) => ({ phase: p, weeks: map.get(p)! }));
}
