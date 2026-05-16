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

export interface RoadmapWeek {
  number: number;
  title: string;
  phase: string;
  commitment_hours: string;
  context: string;
  topics: string[];
  tasks: string[];
  project: string;
  resources: RoadmapResource[];
  questions: string[];
  exercises: string[];
  outputs: string[];
}

export interface Roadmap {
  slug: string;
  title: string;
  total_weeks: number;
  weeks: RoadmapWeek[];
}

const DATA_DIR = path.join(process.cwd(), "data", "roadmaps");

const META: Record<string, { tagline: string; outcome: string; gradient: string }> = {
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
