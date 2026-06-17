/**
 * Reusable day-lesson applier for the v2 stub-fill rewrite.
 *
 * Replaces placeholder/stub day-lesson bodies in a week with authored content.
 * Edits the SERVED file ({slug}-enriched.json if it exists, else {slug}.json)
 * via a surgical raw-JSON string replace, so the rest of the file is untouched.
 * Only replaces lessons that are still stubs; never overwrites real content.
 *
 * Content file format (one block per day, delimiter on its own line):
 *   ===D1===
 *   <markdown body for day 1>
 *   ===D2===
 *   <markdown body for day 2>
 *   ...
 *
 * Usage: node scripts/v2/apply-day-lessons.js <slug> <week> <contentFile>
 */
const fs = require("fs");

const [, , slug, weekArg, contentFile] = process.argv;
const week = Number(weekArg);
if (!slug || !week || !contentFile) {
 console.error("usage: node scripts/v2/apply-day-lessons.js <slug> <week> <contentFile>");
 process.exit(1);
}

function isStub(b) {
 b = b || "";
 return /Understand the concept before reaching for code/.test(b)
  || (/The key mental model/.test(b) && /\byou te(\s|$)/.test(b));
}

let fp = `data/roadmaps/${slug}-enriched.json`;
if (!fs.existsSync(fp)) fp = `data/roadmaps/${slug}.json`;

const md = fs.readFileSync(contentFile, "utf8");
const tokens = md.split(/^===D(\d+)===[^\n]*\r?\n/m);
const bodies = {};
for (let i = 1; i < tokens.length; i += 2) bodies[Number(tokens[i])] = tokens[i + 1].trim();

let raw = fs.readFileSync(fp, "utf8");
const obj = JSON.parse(raw);
const wk = (obj.weeks || []).find((w) => w.number === week);
if (!wk) { console.error(`week ${week} not found in ${fp}`); process.exit(1); }

let ok = 0, fail = 0;
for (const day of Object.keys(bodies).map(Number).sort((a, b) => a - b)) {
 const d = (wk.days || []).find((x) => x.number === day);
 if (!d) { console.log(`NO DAY  ${day}`); fail++; continue; }
 const lesson = (d.items || []).find((it) => it.kind === "lesson" && isStub(it.body));
 if (!lesson) { console.log(`NO STUB  D${day} (already written?) - skipped`); continue; }
 const newBody = bodies[day];
 if (lesson.body === newBody) { console.log(`SKIP already  D${day}`); ok++; continue; }
 const needle = JSON.stringify(lesson.body);
 const hits = raw.split(needle).length - 1;
 if (hits !== 1) { console.log(`FAIL match=${hits}  D${day}`); fail++; continue; }
 raw = raw.replace(needle, JSON.stringify(newBody));
 console.log(`OK  D${day} "${lesson.title}"  ${lesson.body.length}ch stub -> ${newBody.length}ch`);
 ok++;
}

JSON.parse(raw); // throws if the surgical replace produced invalid JSON
fs.writeFileSync(fp, raw);
console.log(`\n${ok} applied/ok, ${fail} failed  (${fp})`);
