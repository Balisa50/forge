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
  "ai-automation": "⚡",
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
        ({ "ai-engineering": 0, "ml-engineering": 1, "ai-automation": 2, "full-stack-web": 3, "mobile-engineering": 4, "devops-cloud": 5, "cybersecurity": 6 }[s] ?? 99);
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
  if (week.topics && week.topics.length) {
    lines.push("TOPICS TO STUDY");
    week.topics.forEach((t) => lines.push(`- ${clean(t)}`));
    lines.push("");
  }
  if (week.tasks && week.tasks.length) {
    lines.push("TASKS AND DELIVERABLES");
    week.tasks.forEach((t, i) => lines.push(`${i + 1}. ${clean(t)}`));
    lines.push("");
  }
  if (week.project) {
    lines.push("REAL-WORLD PROJECT");
    lines.push(clean(week.project));
    lines.push("");
  }
  // Pre-flight - predict-before-you-look prompts. Highest-ROI analyst habit:
  // catch your assumptions before the data does.
  const preFlight = (week as { pre_flight?: string }).pre_flight;
  if (preFlight) {
    lines.push("BEFORE YOU TOUCH ANY CODE");
    lines.push(clean(preFlight));
    lines.push("");
  }
  // Common mistakes - reduces "I'm stupid, I'm quitting" by normalising the
  // exact shapes of error beginners reliably hit.
  const mistakes = (week as { common_mistakes?: string[] }).common_mistakes;
  if (mistakes?.length) {
    lines.push("COMMON MISTAKES THIS WEEK");
    mistakes.forEach((m) => lines.push(`- ${clean(m)}`));
    lines.push("");
  }
  // Debug help - mentor voice on how to read THIS week's errors calmly.
  const debug = (week as { debug_help?: string }).debug_help;
  if (debug) {
    lines.push("WHEN THINGS BREAK");
    lines.push(clean(debug));
    lines.push("");
  }
  // AI assist - threaded through every week. Tells the student EXACTLY how to
  // use Cursor / Claude / ChatGPT on THIS week's work. No more "AI is a one-week
  // module" - it's a permanent part of the workflow.
  const aiAssist = (week as { ai_assist?: string }).ai_assist;
  if (aiAssist) {
    lines.push("AI ASSIST");
    lines.push(clean(aiAssist));
    lines.push("");
  }
  // Stretch - optional challenges for students finishing early.
  const stretch = (week as { stretch?: string[] }).stretch;
  if (stretch?.length) {
    lines.push("IF YOU FINISH EARLY");
    stretch.forEach((s) => lines.push(`- ${clean(s)}`));
    lines.push("");
  }
  // Stakeholder moment - who reads this week's deliverable, what they want,
  // how to handle the conversation. Recurring beat for analyst weeks.
  const stakeholder = (week as { stakeholder_moment?: string }).stakeholder_moment;
  if (stakeholder) {
    lines.push("WHO READS THIS");
    lines.push(clean(stakeholder));
    lines.push("");
  }
  // Combined mastery check list: forces the student to open the tool and DO things.
  // Theory-style `questions` are no longer rendered separately - any meaningful
  // checks should live inside `exercises` (or `mastery_questions` once weeks are
  // rewritten). `questions` remains in the JSON for backwards-compat but is
  // intentionally not shown anymore.
  const mastery = week.mastery_questions?.length ? week.mastery_questions : week.exercises;
  if (mastery && mastery.length) {
    lines.push("MASTERY CHECKPOINTS");
    mastery.forEach((e, i) => lines.push(`${i + 1}. ${clean(e)}`));
  }
  return lines.join("\n").trim();
}

/** Flatten the rich resource objects into a string array the DB expects. */
export function weekToTaskResources(week: RoadmapWeek): string[] {
  return (week.resources ?? []).map((r) => {
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
  return week.outputs && week.outputs.length
    ? "Demonstrable outputs: " + week.outputs.map(clean).join(" · ")
    : "Submit a write-up demonstrating you completed the week's work.";
}

export type { Roadmap, RoadmapWeek };
