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
export type DayItemKind = "video" | "reading" | "exercise" | "reflection";

export interface DayItem {
  kind: DayItemKind;
  title: string;
  url?: string;              // for video + reading
  duration_min?: number;     // for video
  creator?: string;          // for video — channel/author
  why?: string;              // one-line "why this matters"
  body?: string;             // for exercise + reflection — the prompt
}

export interface RoadmapDay {
  number: number;            // 1-7 within the week
  title: string;             // "What is an AI Engineer?"
  summary?: string;          // 1 line tucked under the day card
  items: DayItem[];          // 1-4 cards per day
}

export interface RoadmapWeek {
  number: number;
  title: string;
  phase: string;
  commitment_hours: string;
  context: string;
  /** NEW: optional day-by-day breakdown. When present, the UI defaults to
   *  the day-by-day view. When absent, falls back to the Overview tab. */
  days?: RoadmapDay[];
  topics: string[];
  tasks: string[];
  project: string;
  resources: RoadmapResource[];
  questions: string[];
  exercises: string[];
  outputs: string[];
  /** 10 hands-on mastery checkpoints, hand-curated per week. Optional on the
   *  type for backward-compat; in practice every shipped week now has them. */
  mastery_questions?: string[];
  /** How to use AI tooling on this specific week's work. */
  ai_assist?: string;
  /** Who reads this week's deliverable + what they want (deliverable weeks). */
  stakeholder_moment?: string;
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

export function loadRoadmap(slug: string): Roadmap | null {
  const file = path.join(DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  const text = fs.readFileSync(file, "utf-8");
  return JSON.parse(text) as Roadmap;
}

export function loadAllRoadmaps(): Roadmap[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  return files
    .map((f) => {
      const text = fs.readFileSync(path.join(DATA_DIR, f), "utf-8");
      return JSON.parse(text) as Roadmap;
    })
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
