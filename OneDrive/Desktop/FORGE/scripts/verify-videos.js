/**
 * Verify every video: ID format, summary present, within-track/week duplicates,
 * and oembed embeddability (with retries so transient network blips don't false-fail).
 *   node scripts/verify-videos.js
 */
const fs = require("fs");
const path = require("path");
const vids = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts", "_videos.json"), "utf-8"));

function extractId(url) {
  const m = (url || "").match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})(?:[&?]|$)/);
  return m ? m[1] : null;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function oembed(id, tries = 3) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
  for (let t = 0; t < tries; t++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (res.status === 200) { const j = await res.json(); return { ok: true, title: j.title, author: j.author_name }; }
      if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404)
        return { ok: false, status: res.status }; // definitively unavailable/not-embeddable
      // 429/5xx: retry
    } catch (e) { /* network/timeout: retry */ }
    await sleep(800 * (t + 1));
  }
  return { ok: null, status: "unverified" }; // could not verify after retries
}

(async () => {
  // format + summary + duplicates
  const fmtBad = [], noSummary = [];
  const byTrack = {}, byWeek = {};
  for (const v of vids) {
    const id = extractId(v.url);
    v.id = id;
    if (!id) fmtBad.push(`${v.slug} W${v.week}D${v.day} "${v.title.slice(0,40)}" url=${v.url}`);
    if (!v.why) noSummary.push(`${v.slug} W${v.week}D${v.day} "${v.title.slice(0,40)}"`);
    if (id) {
      (byTrack[`${v.slug}|${id}`] = byTrack[`${v.slug}|${id}`] || []).push(`W${v.week}D${v.day}`);
      (byWeek[`${v.slug}|W${v.week}|${id}`] = byWeek[`${v.slug}|W${v.week}|${id}`] || []).push(`D${v.day}`);
    }
  }
  const dupTrack = Object.entries(byTrack).filter(([k, a]) => a.length > 1);
  const dupWeek = Object.entries(byWeek).filter(([k, a]) => a.length > 1);

  // unique ids -> oembed (limited concurrency)
  const ids = [...new Set(vids.map((v) => v.id).filter(Boolean))];
  const results = {};
  const CONC = 8;
  for (let i = 0; i < ids.length; i += CONC) {
    const batch = ids.slice(i, i + CONC);
    const r = await Promise.all(batch.map((id) => oembed(id)));
    batch.forEach((id, k) => { results[id] = r[k]; });
    process.stderr.write(`  oembed ${Math.min(i + CONC, ids.length)}/${ids.length}\r`);
  }
  const dead = ids.filter((id) => results[id] && results[id].ok === false);
  const unverified = ids.filter((id) => results[id] && results[id].ok === null);
  const alive = ids.filter((id) => results[id] && results[id].ok === true);

  console.log("\n" + "=".repeat(64));
  console.log("VIDEO VERIFICATION");
  console.log("=".repeat(64));
  console.log(`total video items: ${vids.length} | unique IDs: ${ids.length}`);
  console.log(`ID format invalid: ${fmtBad.length}`);
  console.log(`missing summary (why): ${noSummary.length}`);
  console.log(`duplicate same-video WITHIN A WEEK: ${dupWeek.length}`);
  console.log(`same-video reused WITHIN A TRACK (diff weeks): ${dupTrack.length}`);
  console.log(`oembed ALIVE+embeddable: ${alive.length}`);
  console.log(`oembed DEAD/not-embeddable (4xx): ${dead.length}`);
  console.log(`could not verify after retries (network): ${unverified.length}`);
  console.log("-".repeat(64));
  if (fmtBad.length) { console.log("INVALID ID FORMAT:"); fmtBad.forEach((s) => console.log("  ✗ " + s)); }
  if (noSummary.length) { console.log(`MISSING SUMMARY (${noSummary.length}):`); noSummary.slice(0,20).forEach((s) => console.log("  ✗ " + s)); }
  if (dupWeek.length) { console.log("WITHIN-WEEK DUPLICATES:"); dupWeek.forEach(([k, a]) => console.log(`  ✗ ${k} @ ${a.join(",")}`)); }
  if (dupTrack.length) { console.log("WITHIN-TRACK REUSE (review - may be fine):"); dupTrack.slice(0,30).forEach(([k, a]) => console.log(`  ~ ${k} @ ${a.join(",")}`)); }
  if (dead.length) { console.log("DEAD / NOT EMBEDDABLE:"); dead.forEach((id) => {
    const where = vids.filter((v) => v.id === id).map((v) => `${v.slug} W${v.week}D${v.day}`);
    console.log(`  ✗ ${id} (status ${results[id].status}) @ ${where.join(", ")}`); }); }
  if (unverified.length) { console.log("UNVERIFIED (network, not necessarily dead):"); unverified.slice(0,40).forEach((id) => console.log("  ? " + id)); }

  fs.writeFileSync(path.join(process.cwd(), "scripts", "_video_titles.json"),
    JSON.stringify(Object.fromEntries(alive.map((id) => [id, results[id].title])), null, 2));
  const hardFail = fmtBad.length + noSummary.length + dupWeek.length + dead.length;
  console.log("-".repeat(64));
  console.log(hardFail ? `VIDEO HARD FAILURES: ${hardFail}` : "VIDEO CHECK: clean (format, summaries, no within-week dups, none dead)");
})();
