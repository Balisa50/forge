// Add a short NumPy intro video to DS W2 D1.
//
// Sits BETWEEN the NumPy lesson (added earlier) and the canonical numpy.org
// docs reading. Flow becomes: read the lesson → watch a 5-min visual primer
// → read the official quickstart → swipe-check → continue to Vectors.
//
// Why this video: Python Programmer (Giles McMullen-Klein) — "Learn NUMPY
// in 5 minutes - BEST Python Library!". Visual, well-paced, runs ~5 min so
// it sits well inside the platform's 15-min hard cap (10-min preferred).
//
// Idempotent: re-running the script skips when the video is already there.
const fs = require('fs');
const FILE = 'C:/Users/Abdoulie Balisa/OneDrive/Desktop/FORGE/data/roadmaps/data-science.json';
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const w2 = ds.weeks[1];
if (!w2 || !w2.days || !w2.days[0]) throw new Error('DS W2 D1 not found');
const d1 = w2.days[0];

// Guard — re-running the script does not duplicate the video.
const alreadyHasVideo = d1.items.some(
  (it) => it.kind === 'video' && /numpy/i.test((it.title || '') + (it.why || ''))
);
if (alreadyHasVideo) {
  console.log('SKIP — D1 already has a NumPy video. No change.');
  process.exit(0);
}

// Find the index of the prerequisite lesson we added earlier.
const lessonIdx = d1.items.findIndex(
  (it) => it.kind === 'lesson' && /numpy.{0,20}foundation/i.test(it.title || '')
);
if (lessonIdx === -1) {
  throw new Error('Could not find the NumPy prerequisite lesson — run ds-w2-numpy-prereq.js first.');
}

const numpyVideo = {
  kind: 'video',
  title: 'Learn NumPy in 5 minutes',
  url: 'https://www.youtube.com/watch?v=xECXZ3tyONo',
  duration_min: 5,
  creator: 'Python Programmer',
  why:
    'Watch second, right after the lesson above. A visual five-minute pass over the same arrays + element-wise ops + dot products you just read about. ' +
    'Seeing it animated locks the mental model before you hit the official docs.'
};

// Insert immediately after the lesson, before the reading.
d1.items.splice(lessonIdx + 1, 0, numpyVideo);

fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log(`SUCCESS — NumPy video added at D1 position ${lessonIdx + 1}. Items count: ${d1.items.length} (still 7 days).`);
