/**
 * Builder for the "Remote Operations Professional (Virtual Assistant)" track.
 *
 *   node scripts/build-remote-ops.js
 *
 * Assembles data/roadmaps/remote-ops.json from the per-week modules in
 * scripts/remote-ops/weekNN.js (one module per week, each exports a week
 * object). The modules are the authoring source of truth; do NOT hand-edit
 * the generated JSON. Lessons serve live from the JSON, so re-running after
 * editing a week reaches enrolled students on the next deploy.
 *
 * Standard each week matches (same as the other tracks): days D0-D7, a
 * 3-question concept_check, oembed-verified on-topic videos (real watch URLs
 * only, never fabricated), lesson + swipe + exercise per day, plus the
 * week-level fields (context/topics/tasks/project/outputs/mastery_questions/
 * ai_assist/pre_flight/common_mistakes/debug_help/stretch/resources).
 *
 * Recurring client persona: Ama Mensah, founder of "Kola", an Accra-based
 * e-commerce startup that sells handmade West African goods across the region.
 * The student is Ama's remote operations assistant. Portfolio = 10 projects.
 */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "remote-ops");

// Base: outline weeks (W3-13 until each gets a full module). Full per-week
// modules (weekNN.js) OVERRIDE the outline by week number, so the track always
// has all 13 weeks and deepens safely as full modules are added.
const byNum = {};
for (const w of require(path.join(dir, "_outlines.js"))) byNum[w.number] = w;
const files = fs
  .readdirSync(dir)
  .filter((f) => /^week\d+\.js$/.test(f))
  .sort();
for (const f of files) {
  const w = require(path.join(dir, f));
  byNum[w.number] = w; // full module wins
}

const weeks = Object.values(byNum).sort((a, b) => a.number - b.number);

const roadmap = {
  slug: "remote-ops",
  title: "Remote Operations Professional (Virtual Assistant)",
  total_weeks: 13,
  weeks,
};

const out = path.join(process.cwd(), "data", "roadmaps", "remote-ops.json");
fs.writeFileSync(out, JSON.stringify(roadmap, null, 2));
JSON.parse(fs.readFileSync(out, "utf8")); // validate round-trip

const authored = weeks.filter((w) => Array.isArray(w.days) && w.days.length).length;
const lessons = weeks.reduce(
  (n, w) => n + (w.days || []).reduce((m, d) => m + (d.items || []).filter((i) => i.kind === "lesson").length, 0),
  0,
);
const vids = weeks.reduce(
  (n, w) => n + (w.days || []).reduce((m, d) => m + (d.items || []).filter((i) => i.kind === "video").length, 0),
  0,
);
console.log(`wrote ${out}`);
console.log(`weeks: ${weeks.length} (modules: ${files.length}) | with days: ${authored} | lessons: ${lessons} | videos: ${vids}`);
console.log(`phases: ${new Set(weeks.map((w) => w.phase)).size}`);
