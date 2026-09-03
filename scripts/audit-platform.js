/**
 * Full platform content-integrity audit.
 *   node scripts/audit-platform.js
 * Loads the SERVED content for each live track (enriched if present, else plain,
 * with week-level fields merged from plain, replicating loadRoadmap) and checks:
 *  - duplicate day numbers; missing D0-D7
 *  - placeholder text (TODO / Coming soon / Lorem / "Focus: Day" / stub truncation / Key ideas boilerplate)
 *  - empty / near-empty lesson bodies
 *  - concept_check completeness (q, >=2 choices, valid correct index, explain)
 *  - per-week project/deliverable presence
 *  - collects every video URL for separate verification
 */
const fs = require("fs");
const path = require("path");
const DATA = path.join(process.cwd(), "data", "roadmaps");

const SLUGS = [
  "data-science", "data-analysis", "ai-engineering", "ml-engineering",
  "full-stack-web", "mobile-engineering", "devops-cloud", "cybersecurity",
  "bi-analytics", "ai-automation", "remote-ops", "growth-marketing",
];

// Real stub/unfinished markers only. The bare words "placeholder", "TODO", "coming soon"
// are legitimate teaching vocabulary (HTML placeholder attrs, <slot/> placeholders, code
// TODO smells, "don't ship a coming-soon screen"), so we match only stub SIGNATURES:
// bracketed markers, standalone marker lines, lorem ipsum, the known "you te" stub
// truncation, and the "## Key ideas" boilerplate that ended an unfinished body.
const PLACEHOLDERS = [
  /\[\s*(TODO|placeholder|TBD|FIXME|coming soon|insert|xxx)\s*\]/i,
  /^\s*(coming soon|to be (written|added|completed)|content pending)\s*\.?\s*$/im,
  /lorem ipsum/i,
  /\byou te\s*$/i,            // stub truncation signature
  /\n##\s*Key ideas\s*$/i,    // unfinished body ending in the boilerplate heading
];

function readJson(p) { try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return null; } }

// Replicate loadRoadmap: enriched wins; week-level fields merged from plain.
function loadServed(slug) {
  const enriched = path.join(DATA, `${slug}-enriched.json`);
  const plain = path.join(DATA, `${slug}.json`);
  const file = fs.existsSync(enriched) ? enriched : (fs.existsSync(plain) ? plain : null);
  if (!file) return null;
  const rm = readJson(file);
  if (!rm) return null;
  if (file === enriched && fs.existsSync(plain)) {
    const raw = readJson(plain);
    if (raw && Array.isArray(raw.weeks)) {
      const byNum = {}; for (const w of raw.weeks) byNum[w.number] = w;
      rm.weeks = (rm.weeks || []).map((ew) => {
        const rw = byNum[ew.number];
        return rw ? { ...rw, ...ew } : ew;
      });
    }
  }
  return rm;
}

const issues = [];
const videos = [];
let totalLessons = 0, totalDays = 0, totalWeeks = 0;

function lessonText(item) { return (item.body || item.content || "").toString(); }

for (const slug of SLUGS) {
  const rm = loadServed(slug);
  if (!rm) { issues.push(`[${slug}] FATAL: no data file loads`); continue; }
  const weeks = rm.weeks || [];
  totalWeeks += weeks.length;

  for (const w of weeks) {
    const wn = w.number;
    const days = w.days || [];

    // project / deliverable presence (week-level)
    if (!w.project && !w.deliverable && !(w.outputs && w.outputs.length)) {
      // gold tracks (DS/DA) teach via days only; only flag if there are NO days either
      if (!days.length) issues.push(`[${slug} W${wn}] no project/deliverable/outputs AND no days`);
    }

    // concept_check completeness (if present)
    if (w.concept_check) {
      if (!Array.isArray(w.concept_check) || w.concept_check.length === 0) {
        issues.push(`[${slug} W${wn}] concept_check present but empty/not-array`);
      } else {
        w.concept_check.forEach((q, i) => {
          if (!q.q || !q.q.trim()) issues.push(`[${slug} W${wn}] concept_check[${i}] missing question text`);
          if (!Array.isArray(q.choices) || q.choices.length < 2) issues.push(`[${slug} W${wn}] concept_check[${i}] <2 choices`);
          if (typeof q.correct !== "number" || q.correct < 0 || (Array.isArray(q.choices) && q.correct >= q.choices.length))
            issues.push(`[${slug} W${wn}] concept_check[${i}] invalid 'correct' index`);
          if (!q.explain || !q.explain.trim()) issues.push(`[${slug} W${wn}] concept_check[${i}] missing 'explain'`);
        });
      }
    }

    // day-level checks
    const dayNums = days.map((d) => d.number);
    const seen = {};
    for (const n of dayNums) { seen[n] = (seen[n] || 0) + 1; }
    Object.entries(seen).forEach(([n, c]) => { if (c > 1) issues.push(`[${slug} W${wn}] DUPLICATE day number ${n} (x${c})`); });

    // missing D0-D7 (standard arc). Gold tracks may differ; flag as a note only if a week has days but is missing some of 0-7
    if (days.length) {
      const present = new Set(dayNums);
      const missing = [];
      for (let d = 0; d <= 7; d++) if (!present.has(d)) missing.push(d);
      if (missing.length) issues.push(`[${slug} W${wn}] missing day(s): ${missing.join(",")} (has ${dayNums.slice().sort((a,b)=>a-b).join(",")})`);
    }

    totalDays += days.length;
    for (const d of days) {
      const items = d.items || [];
      let lessonCount = 0;
      for (const it of items) {
        if (it.kind === "lesson") {
          lessonCount++; totalLessons++;
          const body = lessonText(it).trim();
          if (body.length === 0) issues.push(`[${slug} W${wn} D${d.number}] EMPTY lesson body: "${(it.title||'').slice(0,40)}"`);
          else if (body.length < 120) issues.push(`[${slug} W${wn} D${d.number}] near-empty lesson (${body.length} chars): "${(it.title||'').slice(0,40)}"`);
          for (const re of PLACEHOLDERS) {
            if (re.test(body)) { issues.push(`[${slug} W${wn} D${d.number}] PLACEHOLDER /${re.source}/ in lesson "${(it.title||'').slice(0,40)}"`); break; }
          }
        }
        if (it.kind === "video") {
          videos.push({ slug, week: wn, day: d.number, title: it.title || "", url: it.url || "", why: !!it.why });
          if (!it.url) issues.push(`[${slug} W${wn} D${d.number}] video with NO url: "${(it.title||'').slice(0,40)}"`);
        }
        if (it.kind === "swipe") {
          if (!Array.isArray(it.cards) || it.cards.length === 0) issues.push(`[${slug} W${wn} D${d.number}] swipe with no cards`);
        }
      }
      // day summary (the "Today you'll..." goal) present?
      if (!d.summary || !d.summary.trim()) issues.push(`[${slug} W${wn} D${d.number}] missing day summary (the 'Today you'll' goal)`);
      // placeholder summaries
      if (d.summary && /Focus:\s*Day\s*\d|Focus:\s*$/.test(d.summary)) issues.push(`[${slug} W${wn} D${d.number}] placeholder summary: "${d.summary.slice(0,50)}"`);
      // non-D0 day with zero lessons
      if (d.number !== 0 && lessonCount === 0) issues.push(`[${slug} W${wn} D${d.number}] non-setup day with NO lesson`);
    }
  }
}

console.log("=".repeat(70));
console.log("FORGE PLATFORM CONTENT-INTEGRITY AUDIT");
console.log("=".repeat(70));
console.log(`tracks: ${SLUGS.length} | weeks: ${totalWeeks} | days: ${totalDays} | lessons: ${totalLessons} | videos: ${videos.length}`);
console.log(`ISSUES FOUND: ${issues.length}`);
console.log("-".repeat(70));
if (issues.length) issues.slice(0, 200).forEach((s) => console.log("  ✗ " + s));
else console.log("  ✓ No content-integrity issues found.");
if (issues.length > 200) console.log(`  ... and ${issues.length - 200} more`);

// write videos to a file for verification phase
fs.writeFileSync(path.join(process.cwd(), "scripts", "_videos.json"), JSON.stringify(videos, null, 2));
console.log("-".repeat(70));
console.log(`videos written to scripts/_videos.json (${videos.length})`);
process.exit(issues.length ? 1 : 0);
