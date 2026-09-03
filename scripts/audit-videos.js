// List every video item across the curriculum so a human can spot-check
// URLs that may have rotted (or were fabricated to begin with).
//
// Why this exists: this session added several YouTube videos with URLs I
// could not independently verify (no internet at write time). The rule per
// HANDOFF.md §8.5 is "real videos only; if unsure, leave the video out and
// rely on text + canonical docs." This audit makes the unverified set
// visible so we can clean it up.
//
// Usage:
//   node scripts/audit-videos.js                  # all tracks, all videos
//   node scripts/audit-videos.js --track ai-engineering
//   node scripts/audit-videos.js --json > videos.json
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'data', 'roadmaps');
const TRACKS = [
  'data-science', 'data-analysis', 'ai-engineering', 'ml-engineering',
  'full-stack-web', 'mobile-engineering', 'devops-cloud', 'cybersecurity',
  'bi-analytics', 'ai-automation',
];

// Confidence list — YouTube video IDs we are 100% confident exist (verified
// elsewhere). The audit flags everything NOT in this list as "review".
// Add to this list ONLY after the URL has been viewed in a browser.
const KNOWN_GOOD = new Set([
  'hwP7WQkmECE', // Fireship — Git in 100 Seconds
  'zsjvFFKOm3c', // Fireship — SQL in 100 Seconds
  'Gjnup-PuquQ', // Fireship — Docker in 100 Seconds
  'dcqPhpY7tWk', // Fireship — Pandas in 100 Seconds
  'fNk_zzaMoSs', // 3Blue1Brown — Essence of Linear Algebra Ep 1: Vectors
  'xECXZ3tyONo', // Python Programmer — Learn NumPy in 5 minutes
  'zjkBMFhNj_g', // Andrej Karpathy — Intro to Large Language Models (60 min — sanctioned deep-dive exception, see HANDOFF §8.5)
]);

function extractYouTubeId(url) {
  if (!url) return null;
  let m = url.match(/youtu\.be\/([\w-]{6,})/);
  if (m) return m[1];
  m = url.match(/youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/)([\w-]{6,})/);
  if (m) return m[1];
  return null;
}

function loadTrack(slug) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, slug + '.json'), 'utf8'));
}

function* walkVideos(track) {
  for (const w of (track.weeks || [])) {
    for (const d of (w.days || [])) {
      for (let i = 0; i < (d.items || []).length; i++) {
        const it = d.items[i];
        if (it.kind !== 'video') continue;
        yield {
          week: w.number,
          day: d.number,
          itemIndex: i,
          title: it.title || '(untitled)',
          url: it.url || '',
          duration: it.duration_min ?? null,
          creator: it.creator || '',
          ytId: extractYouTubeId(it.url || ''),
        };
      }
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const trackArg = args.find((a) => a.startsWith('--track='))?.slice('--track='.length)
                   || (args.includes('--track') ? args[args.indexOf('--track') + 1] : null);
  const wantJson = args.includes('--json');

  const tracks = trackArg ? [trackArg] : TRACKS;
  const all = [];
  for (const slug of tracks) {
    const t = loadTrack(slug);
    for (const v of walkVideos(t)) {
      all.push({ track: slug, ...v });
    }
  }

  if (wantJson) {
    process.stdout.write(JSON.stringify(all, null, 2));
    return;
  }

  let known = 0, review = 0, nonYt = 0;
  for (const slug of tracks) {
    const rows = all.filter((r) => r.track === slug);
    if (rows.length === 0) continue;
    console.log(`\n=== ${slug} (${rows.length} videos) ===`);
    for (const r of rows) {
      const tag = !r.ytId ? '⚠ NON-YT' : KNOWN_GOOD.has(r.ytId) ? '✓ KNOWN' : '? REVIEW';
      if (!r.ytId) nonYt++;
      else if (KNOWN_GOOD.has(r.ytId)) known++;
      else review++;
      console.log(`  ${tag}  W${String(r.week).padStart(2,'0')} D${r.day}  ${(r.duration || '?')+'m'}  ${r.title.slice(0,55).padEnd(55)}  ${r.creator}`);
      console.log(`           ${r.url}`);
    }
  }
  console.log('\n========================================');
  console.log(`KNOWN-GOOD: ${known}  ·  REVIEW: ${review}  ·  NON-YOUTUBE: ${nonYt}`);
  console.log('========================================');
  console.log('REVIEW = YouTube ID not yet vetted. Spot-check the URL in a browser.');
  console.log('If the video plays + matches title/length, add the ID to KNOWN_GOOD.');
  console.log('If it 404s or is wrong, use scripts/remove-videos-by-id.js to drop it.');
}

main();
