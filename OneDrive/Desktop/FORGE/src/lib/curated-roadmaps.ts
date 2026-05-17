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
export function weekToTaskDetail(week: RoadmapWeek): string {
  const lines: string[] = [];
  if (week.context) {
    lines.push(week.context);
    lines.push("");
  }
  if (week.topics.length) {
    lines.push("**Topics to study:**");
    week.topics.forEach((t) => lines.push(`- ${t}`));
    lines.push("");
  }
  if (week.tasks.length) {
    lines.push("**Tasks & deliverables:**");
    week.tasks.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
    lines.push("");
  }
  if (week.project) {
    lines.push("**Real-world project:**");
    lines.push(week.project);
    lines.push("");
  }
  if (week.questions.length) {
    lines.push("**Think like an expert — questions on your data:**");
    week.questions.forEach((q, i) => lines.push(`Q${i + 1}: ${q}`));
    lines.push("");
  }
  if (week.exercises.length) {
    lines.push("**Practical exercises:**");
    week.exercises.forEach((e, i) => lines.push(`${i + 1}. ${e}`));
  }
  return lines.join("\n").trim();
}

/** Flatten the rich resource objects into a string array the DB expects. */
export function weekToTaskResources(week: RoadmapWeek): string[] {
  return week.resources.map((r) => {
    if (r.url) return r.note ? `${r.label} — ${r.url} (${r.note})` : `${r.label} — ${r.url}`;
    return r.label;
  });
}

/** Build the "why" field — short punchy framing of the week. */
export function weekToTaskWhy(week: RoadmapWeek): string {
  const first = week.context.split(".")[0] || week.title;
  return first.trim() + ".";
}

/** Outputs become the "milestone" text. */
export function weekToTaskMilestone(week: RoadmapWeek): string {
  return week.outputs.length
    ? "Demonstrable outputs: " + week.outputs.join(" · ")
    : "Submit a write-up demonstrating you completed the week's work.";
}

export type { Roadmap, RoadmapWeek };
