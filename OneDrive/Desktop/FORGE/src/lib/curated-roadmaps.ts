/**
 * Curated mastery-grade roadmaps that live in /data/roadmaps/{slug}.json.
 *
 * Exposed as picker entries for onboarding (and the public /learn page).
 * When a user selects one of these in onboarding, the API seeds their
 * Roadmap → Phase → Task hierarchy directly from the JSON — no AI
 * generation needed, because the content is already hand-curated.
 */

import { loadAllRoadmaps, ROADMAP_META, type Roadmap, type RoadmapWeek } from "./roadmaps";

export interface CuratedRoadmapPickerEntry {
  slug: string;
  title: string;
  tagline: string;
  outcome: string;
  weeks: number;
  phases: number;
  emoji: string;
  gradient: string;
}

const EMOJI: Record<string, string> = {
  "ai-engineering": "🤖",
  "ml-engineering": "📊",
  "full-stack-web": "🌐",
  "mobile-engineering": "📱",
  "devops-cloud": "☁️",
  "cybersecurity": "🛡️",
  "data-science": "🧪",
  "data-analysis": "📈",
  "bi-analytics": "📋",
};

export function loadCuratedRoadmaps(): CuratedRoadmapPickerEntry[] {
  return loadAllRoadmaps()
    .map((r) => {
      const meta = ROADMAP_META[r.slug];
      const phases = new Set(r.weeks.map((w) => w.phase).filter(Boolean)).size;
      return {
        slug: r.slug,
        title: r.title,
        tagline: meta?.tagline ?? r.title,
        outcome: meta?.outcome ?? "",
        weeks: r.total_weeks,
        phases,
        emoji: EMOJI[r.slug] ?? "📘",
        gradient: meta?.gradient ?? "from-cyan-500 to-blue-500",
      };
    })
    // Show in a consistent order: AI/ML/Full Stack first, then the rest
    .sort((a, b) => {
      const priority = (s: string) =>
        ({ "ai-engineering": 0, "ml-engineering": 1, "full-stack-web": 2, "mobile-engineering": 3, "devops-cloud": 4, "cybersecurity": 5 }[s] ?? 99);
      return priority(a.slug) - priority(b.slug);
    });
}

/** Parse a "20-30" hours commitment string into a single midpoint number. */
export function parseCommitmentHours(s: string): number {
  if (!s) return 8;
  const cleaned = s.replace(/–/g, "-").replace(/—/g, "-").trim();
  const match = cleaned.match(/(\d+)\s*-\s*(\d+)/);
  if (match) {
    const lo = parseInt(match[1], 10);
    const hi = parseInt(match[2], 10);
    return Math.round((lo + hi) / 2);
  }
  const single = parseInt(cleaned, 10);
  return Number.isFinite(single) ? single : 8;
}

/**
 * Compile a week from the JSON into the Task model's `detail` text.
 * Includes topics, tasks, exercises in a single readable Markdown block.
 */
/** Scrub asterisks, em-dashes, en-dashes anywhere in a rendered string. */
function clean(s: string): string {
  return s
    .replace(/\*\*/g, "")    // markdown bold
    .replace(/\*/g, "")      // any stray asterisks
    .replace(/—/g, "-")      // em-dash -> hyphen
    .replace(/–/g, "-");     // en-dash -> hyphen
}

export function weekToTaskDetail(week: RoadmapWeek): string {
  const lines: string[] = [];
  if (week.context) {
    lines.push(clean(week.context));
    lines.push("");
  }
  if (week.topics.length) {
    lines.push("TOPICS TO STUDY");
    week.topics.forEach((t) => lines.push(`- ${clean(t)}`));
    lines.push("");
  }
  if (week.tasks.length) {
    lines.push("TASKS AND DELIVERABLES");
    week.tasks.forEach((t, i) => lines.push(`${i + 1}. ${clean(t)}`));
    lines.push("");
  }
  if (week.project) {
    lines.push("REAL-WORLD PROJECT");
    lines.push(clean(week.project));
    lines.push("");
  }
  // Combined mastery check list: forces the student to open the tool and DO things.
  // Theory-style `questions` are no longer rendered separately - any meaningful
  // checks should live inside `exercises` (or `mastery_questions` once weeks are
  // rewritten). `questions` remains in the JSON for backwards-compat but is
  // intentionally not shown anymore.
  const mastery = (week as { mastery_questions?: string[] }).mastery_questions?.length
    ? (week as { mastery_questions: string[] }).mastery_questions
    : week.exercises;
  if (mastery && mastery.length) {
    lines.push("MASTERY CHECKS - prove you did the work");
    mastery.forEach((e, i) => lines.push(`${i + 1}. ${clean(e)}`));
  }
  return lines.join("\n").trim();
}

/** Flatten the rich resource objects into a string array the DB expects. */
export function weekToTaskResources(week: RoadmapWeek): string[] {
  return week.resources.map((r) => {
    const label = clean(r.label);
    const note = r.note ? clean(r.note) : undefined;
    if (r.url) return note ? `${label} - ${r.url} (${note})` : `${label} - ${r.url}`;
    return label;
  });
}

/** Build the "why" field - short punchy framing of the week. */
export function weekToTaskWhy(week: RoadmapWeek): string {
  const first = week.context.split(".")[0] || week.title;
  return clean(first.trim()) + ".";
}

/** Outputs become the "milestone" text. */
export function weekToTaskMilestone(week: RoadmapWeek): string {
  return week.outputs.length
    ? "Demonstrable outputs: " + week.outputs.map(clean).join(" · ")
    : "Submit a write-up demonstrating you completed the week's work.";
}

export type { Roadmap, RoadmapWeek };
