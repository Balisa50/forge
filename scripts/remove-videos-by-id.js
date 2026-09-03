// Removes specific video items (by YouTube ID) from all curriculum JSONs.
//
// First run, 2026-06-05: removes the videos this session added with URLs
// I picked from memory without independent verification. Per HANDOFF.md
// §8.5 the rule is "real videos only" — when I'm not 100% certain a URL
// works, it must come out. The student should never hit a dead end.
//
// Add new IDs to TO_REMOVE only AFTER confirming the URL is dead or wrong.
// Run with --dry-run first to see what will be touched.
const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/Abdoulie Balisa/OneDrive/Desktop/FORGE/data/roadmaps';
const TRACKS = [
  'data-science', 'data-analysis', 'ai-engineering', 'ml-engineering',
  'full-stack-web', 'mobile-engineering', 'devops-cloud', 'cybersecurity',
  'bi-analytics', 'ai-automation',
];

// YouTube IDs I added in earlier work in THIS session without independent
// URL verification. The user has explicitly reported a dead video on the
// AI-Engineering solo page; the safest interpretation is "any URL I picked
// from memory is suspect until verified" — those come out now, and the
// lessons rely on text + canonical docs instead (the HANDOFF.md fallback).
//
// To re-add a video later: run scripts/audit-videos.js, view the URL in a
// browser, confirm the title + length match, add the ID to KNOWN_GOOD, and
// reinsert with a tiny patch script.
const TO_REMOVE = new Set([
  // AI-engineering W1-W5 fabrications
  'Vb_OB-_-1jY',  // "AI Engineering in 100 Seconds" — likely fake
  'ckHCXm5_2k0',  // "OpenAI API in 90 seconds" — likely fake
  'R2nr1uZ8ffc',  // "Streamlit in 100 Seconds" — Fireship has Streamlit content but I made up this URL
  'D0D4Pa22iG0',  // "Streamlit full intro" — likely fake
  '2pVxsZb-AQU',  // "LLM evals explained simply" — likely fake
  'I5rEKnZ73E0',  // "Prompt injection explained (Simon Willison)" — likely fake URL
  'YyT_yvDqg5w',  // "Streaming chat completions explained" — likely fake
  'ckHCXm5_2k0',  // duplicate guard
  'ORMx45xqWkA',  // "PyTorch in 100 Seconds" — Fireship may have this but I am not certain enough to leave it
  // DS earlier batches — flagging the ones from the W26-W34 batches I am not certain of
  'ZzI9JE0i6Lc',  // "AWS in 100 Seconds" — Fireship has this content but URL unverified
  'kzKFuHk8ovk',  // "What is Google Cloud (and BigQuery) — 100 seconds" — unverified
  'Ip-fqIMG6KU',  // "AWS Free Tier setup with MFA + billing alarm" — unverified
  'ods97a5Pzw0',  // "Dask in 100 Seconds" — unverified
  'cZS5xYYIPzk',  // "PySpark in 100 Seconds" — unverified
  'qhRNvCVVJaA',  // "Q-learning explained visually" — unverified
  'JgvyzIkgxF0',  // "RL Briefly Explained" — unverified
  'gRkUhg9Wb-I',  // "Causal Inference Crash Course" — unverified (and 15-min cap edge)
  '8B271L3NtAw',  // "Correlation vs Causation" — unverified
  'jIXIuYdnyyk',  // "ML fairness explained" — unverified
  'fMym_BKWQzk',  // "Why removing the sensitive attribute isn't enough" — unverified
  'wOK0NtdGsKI',  // "RL in 100 seconds" — unverified
  'f8OK1HBEgn0',  // "How Netflix recommends movies" — unverified
  'lcnxdmkU3RM',  // "Make for ML pipelines" — unverified
  'KkX_zSZHL0M',  // "How they unmasked the Netflix Prize winners" — unverified
  '4nqbITGcqjk',  // "Differential Privacy visually" — unverified
  'DhRoTONcyZE',  // "LoRA explained (paper walkthrough)" — unverified
  'T-D1OfcDW1M',  // "RAG explained simply" — unverified
  'YRhxdVk_sIs',  // "CNN Explained" — unverified
  'cHYq1MRoyI0',  // "pytest in 90 seconds" — unverified
  'Sklc_fQBmcs',  // "Next.js in 100 Seconds" — Fireship has this but URL unverified
]);

function extractYouTubeId(url) {
  if (!url) return null;
  let m = url.match(/youtu\.be\/([\w-]{6,})/);
  if (m) return m[1];
  m = url.match(/youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/)([\w-]{6,})/);
  if (m) return m[1];
  return null;
}

function patchTrack(slug, dryRun) {
  const file = path.join(ROOT, slug + '.json');
  const track = JSON.parse(fs.readFileSync(file, 'utf8'));
  const removed = [];
  for (const w of (track.weeks || [])) {
    for (const d of (w.days || [])) {
      const next = [];
      for (const it of (d.items || [])) {
        if (it.kind === 'video') {
          const id = extractYouTubeId(it.url || '');
          if (id && TO_REMOVE.has(id)) {
            removed.push({ week: w.number, day: d.number, title: it.title, id });
            continue;
          }
        }
        next.push(it);
      }
      d.items = next;
    }
  }
  if (!dryRun && removed.length > 0) {
    fs.writeFileSync(file, JSON.stringify(track, null, 2), 'utf8');
  }
  return { slug, removed };
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const results = TRACKS.map((s) => patchTrack(s, dryRun));
  let total = 0;
  for (const r of results) {
    if (r.removed.length === 0) continue;
    console.log(`\n${r.slug}:`);
    for (const v of r.removed) {
      console.log(`  W${String(v.week).padStart(2,'0')} D${v.day}  ${v.id}  ${(v.title || '').slice(0,55)}`);
      total++;
    }
  }
  console.log('\n========================================');
  console.log(`${dryRun ? 'WOULD REMOVE' : 'REMOVED'}: ${total} video(s)`);
  console.log('========================================');
  if (dryRun) console.log('Re-run without --dry-run to apply.');
}

main();
