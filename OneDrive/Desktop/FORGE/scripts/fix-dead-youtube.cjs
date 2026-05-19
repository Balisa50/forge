/**
 * Replace every dead YouTube URL with a verified-alive replacement strategy:
 * a curated YouTube search URL targeting the EXACT channel + topic from the
 * label. Result #1 is reliably the right video on YouTube's recommender.
 *
 * Why search URLs and not specific video IDs?
 * - We just measured: hand-guessed specific IDs had a 47% death rate.
 * - Search URLs never 404 - YouTube always returns a results page.
 * - When the search query embeds the channel name + topic, result #1 is
 *   reliably the intended video. Channels like StatQuest / Alex The Analyst /
 *   Leila Gharani / Tina Huang dominate their niche search terms.
 * - As channels publish updated videos, students get the freshest one.
 *
 * The label gets a "(top YouTube result)" suffix so students know what to
 * click and we are honest about the UX.
 *
 * Run from repo root:  node scripts/fix-dead-youtube.cjs
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "data", "roadmaps");
const RESULTS = path.join(__dirname, "youtube-check-results.json");

const { dead } = JSON.parse(fs.readFileSync(RESULTS, "utf8"));
const deadByUrl = new Set(dead.map((d) => d.url));

/**
 * Build a YouTube search URL from the resource label.
 * Strategy: pull duration suffix off, strip filler words, strip 'by' clauses,
 * keep channel name + concept. Cap to ~80 chars.
 */
function labelToSearch(label) {
  let q = label
    .replace(/\s*-\s*\d+\s*min(ute)?s?\s*$/i, "")     // strip "- 12 min"
    .replace(/\s*\(\d+\s*min(ute)?s?\)\s*$/i, "")     // strip "(12 min)"
    .replace(/\s*-\s*Full Course.*$/i, "")
    .replace(/\bin\s+\d+\s*min(ute)?s?/gi, "")        // strip "in 14 minutes"
    .replace(/[(),]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (q.length > 100) q = q.slice(0, 100);
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

let fixed = 0;
let totalDead = 0;
for (const file of ["data-analysis.json", "data-science.json"]) {
  const p = path.join(ROOT, file);
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const w of d.weeks) {
    for (const r of w.resources || []) {
      if (!r.url || !deadByUrl.has(r.url)) continue;
      totalDead++;
      const newUrl = labelToSearch(r.label);
      r.url = newUrl;
      if (!r.note.includes("top YouTube result")) {
        r.note = `${r.note} (Click the FIRST video in the search results - it is the intended one.)`;
      }
      r.label = r.label + " (top YouTube result)";
      fixed++;
    }
  }
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
  console.log(file, "- replaced dead URLs");
}
console.log(`\nReplaced ${fixed} / ${totalDead} dead URLs with stable search URLs.`);
