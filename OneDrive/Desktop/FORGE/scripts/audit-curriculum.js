/**
 * Curriculum audit — finds the ONE defensible defect that matches the
 * complaint: day-lesson bodies that show commands/steps without teaching them
 * ("do this, good luck"). Mastery questions are GENERATED at runtime
 * (examQuestionGen.ts), and DS/DA teach through the day-stream rather than
 * week-level mentor fields, so neither is scored as a gap here.
 *
 * A lesson is flagged THIN when it is a walkthrough (its title says so, or it's
 * a list of >=3 commands/steps) but carries less than ~70 characters of plain
 * explanation per command — i.e. it lists what to type without explaining what
 * each step does, what you'll see, or what breaks. Verify-only bodies (just a
 * PASS checklist) are flagged too.
 *
 * Run: node scripts/audit-curriculum.js              (per-track gap counts)
 *      node scripts/audit-curriculum.js --list ai-engineering   (show offenders)
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data", "roadmaps");
const SLUGS = [
 "data-science", "data-analysis", "ai-engineering", "ml-engineering",
 "full-stack-web", "mobile-engineering", "devops-cloud", "cybersecurity",
 "bi-analytics", "ai-automation",
];

function readJson(p) { try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return null; } }

function loadServed(slug) {
 const plain = readJson(path.join(DATA_DIR, `${slug}.json`));
 const enr = readJson(path.join(DATA_DIR, `${slug}-enriched.json`));
 if (!plain && !enr) return null;
 if (!enr) return plain;
 const byNum = new Map((plain?.weeks ?? []).map((w) => [w.number, w]));
 const weeks = (enr.weeks ?? []).map((ew) => {
 const pw = byNum.get(ew.number);
 return pw ? { ...pw, ...ew } : ew;
 });
 return { ...enr, slug, weeks };
}

// Is this lesson body a walkthrough that barely explains itself?
function analyseLesson(body, title) {
 body = body || "";
 // Deliverable templates (```text / ```markdown / ```md) are content the learner
 // reads or fills in — teaching material, not code. Pull them out of the command/
 // step/fence detection and count their text as explanation, so good day-7
 // "ship/reflect" lessons aren't penalised for shipping a README skeleton.
 let templateProse = 0;
 const codeBody = body.replace(/```(?:text|markdown|md)\b[^\n]*\r?\n([\s\S]*?)```/gi, (_m, inner) => {
  templateProse += inner.trim().length;
  return " ";
 });
 const codeStripped = codeBody.replace(/```[\s\S]*?```/g, " ").replace(/`[^`]+`/g, " ");
 const proseChars = codeStripped.trim().length + templateProse;
 const cmd = /(^|\n)\s*(\d+\.\s*)?[`$]?\s*(git|pip|npm|npx|pnpm|yarn|docker|kubectl|terraform|cd|mkdir|curl|wget|ssh|sudo|apt|brew|python|node|aws|gcloud|psql|conda)\b/gi;
 const cmds = (codeBody.match(cmd) || []).length;
 const steps = (codeBody.match(/^\s*\d+\.\s/gm) || []).length;
 const fenced = Math.floor((codeBody.match(/```/g) || []).length / 2);
 const units = Math.max(cmds, steps, fenced);
 const verifyOnly = /\bPASS:|\[\s?x\s?\]/.test(body) && proseChars < 350;
 // Day-7 "ship/record/tag/README" items are verify checklists BY DESIGN — the
 // teaching happened earlier in the week. Don't count them as thin lessons.
 const shipStep = /\bship\b|record|\btag\b|readme|\.md\b|retro|submit|deliver/i.test(title || "");
 const titleSaysWalk = /see it in action|exact steps|walk ?through|step.by.step|do every step|^set ?up|hands.on/i.test(title || "");
 const isWalkthrough = titleSaysWalk || steps >= 3 || cmds >= 3;
 // A code-demo lesson ("see it in code / see it worked") teaches INSIDE the
 // fence: it prints the result and annotates what it means. Output annotations
 // appear as # (py/sh), -- (SQL) or // comments carrying a number; the house
 // style for "here's the result AND what it means" is an arrow callout
 // (118.4 <- highest, -> matches the 14% drop). Credit a demo when it shows
 // output AND interprets it (an arrow over a number, or >=2 result lines plus a
 // real summary sentence). A plot/command dump with neither stays thin and still
 // gets a teaching pass.
 const outputLines = (body.match(/^[ \t]*(?:#|--|\/\/)[^\n]*\d/gm) || []).length;
 const arrowCallout = /(<-|->|←|→)/.test(body) && /\d/.test(body);
 const teachesInFence = (outputLines >= 1 && arrowCallout) || (outputLines >= 2 && proseChars >= 120);

 if (verifyOnly && !shipStep) return { thin: true, reason: "verify-only checklist, no teaching", proseChars, units };
 if (teachesInFence) return { thin: false, reason: "annotated-output demo", proseChars, units };
 if (isWalkthrough && units >= 3 && proseChars < 70 * units)
 return { thin: true, reason: `${units} steps/cmds but only ${proseChars}ch explanation`, proseChars, units };
 if (proseChars < 180) return { thin: true, reason: `only ${proseChars}ch`, proseChars, units };
 return { thin: false, reason: "", proseChars, units };
}

// Placeholder/stub detector: the v2 generator left many day lessons as a
// truncated copy of the week intro ("...you te") plus generic "Key ideas"
// boilerplate. These read as ~600ch of plausible prose, so the thinness check
// passes them, yet they contain NONE of the day's actual teaching. Tracked
// separately from "thin" because it's a different, worse defect: unwritten.
function isStub(body) {
 const b = body || "";
 return /Understand the concept before reaching for code/.test(b)
  || (/The key mental model/.test(b) && /\byou te(\s|$)/.test(b));
}

const listSlug = process.argv.includes("--list") ? process.argv[process.argv.indexOf("--list") + 1] : null;
const rows = [];
let grandThin = 0, grandLessons = 0, grandStub = 0;

for (const slug of SLUGS) {
 const rm = loadServed(slug);
 if (!rm) { console.log(`MISSING ${slug}`); continue; }
 let lessons = 0, thin = 0, stub = 0;
 const offenders = [];
 for (const w of (rm.weeks ?? [])) {
 for (const d of (w.days ?? [])) {
 for (const it of (d.items ?? [])) {
 if (it.kind !== "lesson") continue;
 lessons++;
 if (isStub(it.body)) stub++;
 const a = analyseLesson(it.body, it.title);
 if (a.thin) { thin++; offenders.push({ w: w.number, wt: w.title, d: d.number, title: it.title, reason: a.reason }); }
 }
 }
 }
 grandThin += thin; grandLessons += lessons; grandStub += stub;
 rows.push({ slug, weeks: (rm.weeks ?? []).length, lessons, thin, stub, pct: lessons ? Math.round((thin / lessons) * 100) : 0, offenders });
}

if (listSlug) {
 const r = rows.find((x) => x.slug === listSlug);
 if (!r) { console.log(`No track '${listSlug}'`); process.exit(0); }
 console.log(`\n=== ${listSlug}: ${r.thin}/${r.lessons} thin walkthrough lessons ===\n`);
 for (const o of r.offenders) console.log(`  W${o.w} D${o.d}  "${o.title}"  — ${o.reason}`);
 process.exit(0);
}

console.log("\n=========== FORGE LESSON-DEPTH AUDIT ===========");
console.log("(thin = commands/steps listed without enough explanation)\n");
console.log("track                 weeks  lessons  thin  stub  %thin %stub");
rows.sort((a, b) => b.stub - a.stub || b.pct - a.pct);
for (const r of rows) {
 console.log(r.slug.padEnd(20) + String(r.weeks).padStart(6) + String(r.lessons).padStart(9) + String(r.thin).padStart(6) + String(r.stub).padStart(6) + String(r.pct + "%").padStart(7) + String(Math.round((r.stub / r.lessons) * 100) + "%").padStart(6));
}
console.log("\n" + "-".repeat(60));
console.log(`THIN   ${grandThin}/${grandLessons} bodies list steps without teaching them (${Math.round((grandThin / grandLessons) * 100)}%)`);
console.log(`STUB   ${grandStub}/${grandLessons} bodies are unwritten placeholders, truncated intro + "Key ideas" boilerplate (${Math.round((grandStub / grandLessons) * 100)}%)`);
console.log(`Drill in:  node scripts/audit-curriculum.js --list <track>`);
