/**
 * Generic per-week rewriter. Updates context / mastery_questions / pre_flight /
 * common_mistakes / debug_help / stretch for ONE week only. Designed to be
 * called from per-week scripts so each rewrite is reviewable in isolation.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export interface WeekRewrite {
  context?: string;
  mastery_questions?: string[];
  pre_flight?: string;
  common_mistakes?: string[];
  debug_help?: string;
  stretch?: string[];
}

export function rewriteWeek(slug: string, weekNumber: number, patch: WeekRewrite) {
  const file = resolve(process.cwd(), `data/roadmaps/${slug}.json`);
  const roadmap = JSON.parse(readFileSync(file, "utf-8"));
  const week = roadmap.weeks.find((w: { number: number }) => w.number === weekNumber);
  if (!week) throw new Error(`Week ${weekNumber} not found in ${slug}`);

  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) week[k] = v;
  }

  writeFileSync(file, JSON.stringify(roadmap, null, 2), "utf-8");
  console.log(`✓ ${slug} W${weekNumber} (${week.title}) — fields updated: ${Object.keys(patch).join(", ")}`);
}
