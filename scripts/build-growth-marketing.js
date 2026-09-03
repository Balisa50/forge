/**
 * Builder for the "Growth Marketing Professional" track.
 *
 *   node scripts/build-growth-marketing.js
 *
 * Assembles data/roadmaps/growth-marketing.json from the per-week modules in
 * scripts/growth-marketing/weekNN.js (one module per week, each exports a week
 * object). The modules are the authoring source of truth; do NOT hand-edit the
 * generated JSON. Lessons serve live from the JSON, so re-running after editing
 * a week reaches enrolled students on the next deploy.
 *
 * Standard each week matches (same as the other tracks): days D0-D7, a
 * 3-question concept_check, lesson + swipe + exercise per day, plus the
 * week-level fields (context/topics/tasks/project/outputs/mastery_questions/
 * ai_assist/pre_flight/common_mistakes/debug_help/stretch/resources).
 *
 * Project thread: grow "Adwoa's Kitchen", an Accra-based jollof-and-grills
 * SME, from zero to 10K followers/leads in 12 weeks. The student is its growth
 * marketer. Portfolio = 12 case studies, one per week.
 */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "growth-marketing");
const byNum = {};
const files = fs
  .readdirSync(dir)
  .filter((f) => /^week\d+\.js$/.test(f))
  .sort();
for (const f of files) {
  const w = require(path.join(dir, f));
  byNum[w.number] = w;
}

const weeks = Object.values(byNum).sort((a, b) => a.number - b.number);

const roadmap = {
  slug: "growth-marketing",
  title: "Growth Marketing Professional",
  total_weeks: 12,
  weeks,
};

const out = path.join(process.cwd(), "data", "roadmaps", "growth-marketing.json");
fs.writeFileSync(out, JSON.stringify(roadmap, null, 2));
JSON.parse(fs.readFileSync(out, "utf8")); // validate round-trip

const authored = weeks.filter((w) => Array.isArray(w.days) && w.days.length).length;
const lessons = weeks.reduce(
  (n, w) => n + (w.days || []).reduce((m, d) => m + (d.items || []).filter((i) => i.kind === "lesson").length, 0),
  0,
);
console.log(`wrote ${out}`);
console.log(`weeks: ${weeks.length} (modules: ${files.length}) | with days: ${authored} | lessons: ${lessons}`);
console.log(`phases: ${new Set(weeks.map((w) => w.phase)).size}`);
