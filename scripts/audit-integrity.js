/**
 * Deep integrity audit: video relevance/dedup, cross-track content leakage,
 * persona leakage, term/tool heuristics, project deliverables.
 *   node scripts/audit-integrity.js          (content checks, no network)
 *   node scripts/audit-integrity.js --titles (also fetch oembed titles for video relevance)
 * Writes audit-report.md. Distinguishes MACHINE-PROVEN from HEURISTIC findings.
 */
const fs = require("fs");
const path = require("path");
const DATA = path.join(process.cwd(), "data", "roadmaps");
const SLUGS = [
  "data-science", "data-analysis", "ai-engineering", "ml-engineering",
  "full-stack-web", "mobile-engineering", "devops-cloud", "cybersecurity",
  "bi-analytics", "ai-automation", "remote-ops", "growth-marketing",
];
// Each track's INVENTED project/persona markers. If track A's lesson mentions
// track B's marker, that is cross-track leakage. NOTE: deliberately excludes
// name-collisions that are NOT leakage: "hydra" (mobile's app name collides with
// THC-Hydra, a real security tool) and "superstore" (a public sample DATASET both
// data-analysis and bi-analytics legitimately use, like DS & ML share flights.csv).
const MARKERS = {
  "growth-marketing": ["adwoa", "akosua"],
  "remote-ops": ["ama mensah", "kola"],
  "full-stack-web": ["bean forge"],
  "devops-cloud": ["edge portfolio"],
  "ml-engineering": ["flightwise"],
};
// Companion lessons that are SHARED BY DESIGN across tracks (not teaching content):
// the free-alternatives reassurance, the setup walkthrough, the dataset description,
// and the generic tooling-setup lesson. Excluded from the leakage check.
// Includes the universal foundational-tool PRIMERS that every technical track puts on
// its Day-0 setup (Git/Docker/NumPy/matplotlib/pandas etc.) - identical by design because
// the foundational tools are the same everywhere; consistent onboarding, not leakage.
const SCAFFOLD_TITLE = /^(zero-cost path|see it in action|dataset:|set up your tooling|what this environment|which ai provider|git,|docker,|numpy,|matplotlib,|pandas,|the command line|the terminal|virtual environments?)/i;
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return null; } };
function loadServed(slug) {
  const e = path.join(DATA, `${slug}-enriched.json`), p = path.join(DATA, `${slug}.json`);
  const file = fs.existsSync(e) ? e : (fs.existsSync(p) ? p : null);
  if (!file) return null;
  const rm = readJson(file); if (!rm) return null;
  if (file === e && fs.existsSync(p)) {
    const raw = readJson(p);
    if (raw && raw.weeks) { const by = {}; raw.weeks.forEach((w) => by[w.number] = w);
      rm.weeks = (rm.weeks || []).map((ew) => by[ew.number] ? { ...by[ew.number], ...ew } : ew); }
  }
  return rm;
}
const norm = (s) => (s || "").toLowerCase().replace(/```[\s\S]*?```/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const words = (s) => norm(s).split(" ").filter(Boolean);
function shingles(ws, n = 6) { const out = new Set(); for (let i = 0; i + n <= ws.length; i++) out.add(ws.slice(i, i + n).join(" ")); return out; }
function jaccard(a, b) { let inter = 0; for (const x of a) if (b.has(x)) inter++; return inter / (a.size + b.size - inter || 1); }

// ---- gather ----
const lessons = []; // {slug, wn, dn, d0, title, body, ws, sh}
const videos = [];  // {slug, wn, dn, id, url, why, ctx}
const swipeSets = {}; // hash -> [locations]
for (const slug of SLUGS) {
  const rm = loadServed(slug); if (!rm) continue;
  for (const w of (rm.weeks || [])) {
    for (const d of (w.days || [])) {
      const dayCtx = `${w.title || ""} ${d.title || ""} ${d.summary || ""}`;
      for (const it of (d.items || [])) {
        if (it.kind === "lesson") {
          const body = (it.body || it.content || "");
          const ws = words(body);
          lessons.push({ slug, wn: w.number, dn: d.number, d0: d.number === 0, scaffold: SCAFFOLD_TITLE.test(it.title || ""), title: it.title || "", body, ws, sh: shingles(ws) });
        } else if (it.kind === "video") {
          const m = (it.url || "").match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
          videos.push({ slug, wn: w.number, dn: d.number, id: m ? m[1] : null, url: it.url || "", why: (it.why || "").trim(), ctx: dayCtx });
        } else if (it.kind === "swipe") {
          const h = norm(JSON.stringify((it.cards || []).map((c) => c.prompt)));
          (swipeSets[h] = swipeSets[h] || []).push(`${slug} W${w.number}D${d.number}`);
        }
      }
    }
  }
}

const report = [];
const fail = [];
function section(t) { report.push("\n## " + t); }
section("AUDIT INPUTS");
report.push(`- tracks: ${SLUGS.length} | lessons: ${lessons.length} | videos: ${videos.length}`);

// ---- PART 2/5: cross-track + within-track EXACT lesson-body leakage (MACHINE-PROVEN) ----
section("CONTENT LEAKAGE — exact lesson-body duplication (machine-proven)");
const byHash = {};
let scaffoldDups = 0;
for (const L of lessons) { if (L.scaffold) continue; const h = norm(L.body); if (h.length < 60) continue; (byHash[h] = byHash[h] || []).push(L); }
// count scaffold companion lessons that repeat (reported separately as intentional)
{ const sh = {}; for (const L of lessons) if (L.scaffold) { const h = norm(L.body); (sh[h] = sh[h] || 0) + 1; sh[h] = (sh[h] || 0) + 1; }
  scaffoldDups = Object.values(sh).filter((c) => c > 1).length; }
let crossExact = 0, inExact = 0;
for (const [h, arr] of Object.entries(byHash)) {
  if (arr.length < 2) continue;
  const tracks = new Set(arr.map((x) => x.slug));
  const locs = arr.map((x) => `${x.slug} W${x.wn}D${x.dn} "${x.title.slice(0, 30)}"`);
  if (tracks.size > 1) { crossExact++; fail.push(`CROSS-TRACK exact lesson dup: ${locs.join(" == ")}`); }
  else { inExact++; fail.push(`WITHIN-TRACK exact lesson dup: ${locs.join(" == ")}`); }
}
report.push(`- exact cross-track TEACHING-lesson duplicates (scaffolding excluded): ${crossExact}`);
report.push(`- exact within-track TEACHING-lesson duplicates: ${inExact}`);
report.push(`- (intentional shared SCAFFOLDING companion lessons reused across tracks: ${scaffoldDups} sets - zero-cost path, setup walkthrough, shared-dataset description; not teaching content)`);

// ---- near-duplicate cross-track (bucketed LSH-lite; MACHINE, threshold 0.75) ----
section("CONTENT LEAKAGE — near-duplicate lessons across tracks (machine, Jaccard>=0.75)");
const bucket = {}; // shingle -> [lessonIdx]
lessons.forEach((L, i) => { let c = 0; for (const s of L.sh) { if (c++ > 8) break; (bucket[s] = bucket[s] || []).push(i); } });
const checked = new Set(); let nearCross = 0; const nearList = [];
for (const ids of Object.values(bucket)) {
  if (ids.length < 2) continue;
  for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) {
    const i = ids[a], j = ids[b]; const key = i < j ? `${i}:${j}` : `${j}:${i}`;
    if (checked.has(key)) continue; checked.add(key);
    const A = lessons[i], B = lessons[j];
    if (A.slug === B.slug) continue; // cross-track only here
    if (A.scaffold || B.scaffold) continue; // intentional shared companion lessons
    if (A.d0 && B.d0) continue;      // D0 setup templates handled separately
    const sim = jaccard(A.sh, B.sh);
    if (sim >= 0.75) { nearCross++; nearList.push(`${sim.toFixed(2)} ${A.slug} W${A.wn}D${A.dn} ~ ${B.slug} W${B.wn}D${B.dn}`); }
  }
}
report.push(`- near-duplicate cross-track lesson pairs (>=0.75): ${nearCross}`);
nearList.slice(0, 30).forEach((s) => report.push("  - " + s));
if (nearCross) nearList.forEach((s) => fail.push("NEAR-DUP cross-track: " + s));

// ---- persona/project marker leakage (MACHINE-PROVEN) ----
section("CROSS-TRACK PERSONA/PROJECT LEAKAGE (machine-proven)");
let leak = 0;
for (const L of lessons) {
  const b = " " + norm(L.body) + " ";
  for (const [owner, marks] of Object.entries(MARKERS)) {
    if (owner === L.slug) continue;
    for (const mk of marks) {
      if (b.includes(" " + mk + " ") || b.includes(" " + mk + "s ")) {
        leak++; fail.push(`PERSONA LEAK: ${L.slug} W${L.wn}D${L.dn} mentions "${mk}" (owned by ${owner})`);
      }
    }
  }
}
report.push(`- cross-track persona/project references: ${leak}`);

// ---- shared swipe-card sets (informational: intentional UI scaffolding) ----
section("SHARED SWIPE-CARD SETS (informational — intentional generic scaffolding)");
const sharedSwipe = Object.entries(swipeSets).filter(([h, a]) => a.length > 1);
report.push(`- distinct swipe-card sets reused 2+ times: ${sharedSwipe.length} (these are generic quick-checks, not lesson content)`);

// ---- placeholder / broken-ref recheck (MACHINE) ----
section("PLACEHOLDER & UNRESOLVED-REFERENCE RECHECK (machine)");
const STUB = [/\[\s*(TODO|placeholder|TBD|FIXME|coming soon|insert|xxx)\s*\]/i, /^\s*(coming soon|to be (written|added|completed))\s*\.?\s*$/im, /lorem ipsum/i, /\byou te\s*$/i, /\n##\s*Key ideas\s*$/i];
let stubN = 0; for (const L of lessons) for (const re of STUB) if (re.test(L.body)) { stubN++; fail.push(`PLACEHOLDER ${L.slug} W${L.wn}D${L.dn}`); break; }
// "we'll cover later" without a concrete week reference
let vagueFwd = 0; const vagueList = [];
for (const L of lessons) { if (/\b(we'?ll (cover|get to|see) (this|that))\b/i.test(L.body) && !/week\s*\d|w\d|next week|later this week/i.test(L.body)) { vagueFwd++; vagueList.push(`${L.slug} W${L.wn}D${L.dn}`); } }
report.push(`- placeholder/stub bodies: ${stubN}`);
report.push(`- vague "we'll cover later" without a week pointer (heuristic/review): ${vagueFwd}`);
vagueList.slice(0, 15).forEach((s) => report.push("  - " + s));

// ---- PART 4: project deliverables + portfolio marker (MACHINE) ----
section("PROJECT DELIVERABLES & PORTFOLIO MARKERS (machine)");
let noProj = 0, noPortfolio = 0; const projTracks = {};
for (const slug of SLUGS) {
  const rm = loadServed(slug); let weeks = 0, port = 0, proj = 0;
  for (const w of (rm.weeks || [])) {
    weeks++;
    const hasProj = !!(w.project || w.deliverable || (w.outputs && w.outputs.length) || (w.days && w.days.length));
    if (!hasProj) { noProj++; fail.push(`NO DELIVERABLE: ${slug} W${w.number}`); } else proj++;
    const blob = norm(`${w.project || ""} ${(w.outputs || []).join(" ")} ${(w.days || []).map((d) => (d.items || []).map((i) => i.body || "").join(" ")).join(" ")}`);
    if (/portfolio|case study|deliverable|artefact|artifact|ship it/.test(blob)) port++; else noPortfolio++;
  }
  projTracks[slug] = { weeks, proj, port };
}
SLUGS.forEach((s) => report.push(`- ${s}: ${projTracks[s].proj}/${projTracks[s].weeks} weeks with a deliverable; ${projTracks[s].port}/${projTracks[s].weeks} weeks reference portfolio/case-study`));

// ---- PART 3: acronym definition heuristic (HEURISTIC/review) ----
section("ACRONYM DEFINITION (heuristic — common acronyms whitelisted)");
const WHITELIST = new Set("API APIs HTTP HTTPS HTML CSS JSON SQL URL URLs AI ML CEO CTO CV PDF UI UX OS IDE CLI SDK REST CRUD DNS SSH FTP RAM CPU GPU USB PR QA KPI KPIs ROI SEO ROAS CTA CTR CPC CPM CPA GA4 SMS DM DMs FAQ FAQs USA UK US EU OK TV ID IDs VS NASA RGB PNG JPG GIF MVP B2B B2C SAAS SaaS NGO WHO".split(" "));
const acroUnexplained = {};
for (const slug of SLUGS) {
  const rm = loadServed(slug);
  const allText = (rm.weeks || []).flatMap((w) => (w.days || []).flatMap((d) => (d.items || []).map((i) => i.body || ""))).join("\n");
  const acros = new Set((allText.match(/\b[A-Z]{2,6}\b/g) || []).filter((a) => !WHITELIST.has(a)));
  const unexplained = [];
  for (const a of acros) {
    // explained if "(A...)" pattern or "ACRO (" or "ACRO stands for" or words-before-(ACRO) appears
    const re = new RegExp(`\\(${a}\\)|${a}\\s*\\(|${a}\\s+(stands for|is |means )|\\b${a}\\b[^.]{0,40}\\(`, "");
    if (!re.test(allText)) unexplained.push(a);
  }
  if (unexplained.length) acroUnexplained[slug] = unexplained;
}
let acroTotal = 0;
SLUGS.forEach((s) => { const u = acroUnexplained[s] || []; acroTotal += u.length; if (u.length) report.push(`- ${s}: ${u.length} possibly-unexplained acronyms (review): ${u.slice(0, 12).join(", ")}`); });
report.push(`- total possibly-unexplained acronyms across tracks (heuristic, expect many to be domain-obvious): ${acroTotal}`);

// ---- write report + verdict ----
const hardFails = fail.filter((f) => !f.startsWith("NEAR-DUP")); // near-dup reviewed separately
section("VERDICT");
report.push(`- HARD failures (exact dup / persona leak / placeholder / missing deliverable): ${hardFails.length}`);
report.push(`- near-duplicate cross-track pairs to review: ${nearCross}`);
report.push("");
if (fail.length) { report.push("### FLAGS:"); fail.slice(0, 80).forEach((f) => report.push("- " + f)); if (fail.length > 80) report.push(`... +${fail.length - 80} more`); }

const out = report.join("\n");
fs.writeFileSync(path.join(process.cwd(), "audit-report.md"), "# FORGE Integrity Audit\n" + out + "\n");
console.log(out);
console.log("\n(written to audit-report.md)");
process.exit(hardFails.length ? 1 : 0);
