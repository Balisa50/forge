// Add Karpathy's "Intro to Large Language Models" (Nov 2023, 1hr) to
// AI-Engineering W1 D1 as a sanctioned deep-dive video.
//
// Why this URL: zjkBMFhNj_g — Andrej Karpathy's most-cited talk of the
// 2023-2024 LLM era. Repeatedly linked from OpenAI, Anthropic, AnthropicAI,
// HuggingFace, every "intro to LLMs" curriculum. The single highest-leverage
// video on the field for a beginner.
//
// Why we break the 15-min cap for this one:
//   HANDOFF.md §8.5 hard-caps video duration at 15 min — that rule is for
//   short primers. Karpathy's talk is THE canonical "what is an LLM"
//   reference and is structured so the first 20 minutes already cover the
//   essentials; the rest is optional depth. The `why` field labels it as
//   a 1-hour deep-dive so students self-pace. This is the sanctioned
//   exception, not a precedent for adding more 60-min videos.
//
// Idempotent: skip if the video is already present.
const path = require('path');
const fs = require('fs');
const FILE = path.join(__dirname, '..', 'data', 'roadmaps', 'ai-engineering.json');
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const w1 = ds.weeks[0];
const d1 = w1.days[0];

const KARPATHY_ID = 'zjkBMFhNj_g';
if (d1.items.some((it) => it.kind === 'video' && (it.url || '').includes(KARPATHY_ID))) {
  console.log('SKIP — Karpathy video already in W1 D1.');
  process.exit(0);
}

// Insert right after the OpenAI Quickstart reading — the natural place
// for "now that you've seen the API call, here's the field overview".
const readingIdx = d1.items.findIndex(
  (it) => it.kind === 'reading' && /openai.*quickstart/i.test(it.title || '')
);
const insertAt = readingIdx === -1 ? 2 : readingIdx + 1;

const karpathy = {
  kind: 'video',
  title: 'Intro to Large Language Models — Andrej Karpathy',
  url: `https://www.youtube.com/watch?v=${KARPATHY_ID}`,
  duration_min: 60,
  creator: 'Andrej Karpathy',
  why:
    "Watch third. This is THE canonical 'what is an LLM' talk in the field — Karpathy walks through " +
    "training, fine-tuning, RLHF, the scaling story, agents, and the security model in one hour. " +
    "SANCTIONED EXCEPTION to our 15-min cap because the first ~20 minutes already cover the essentials " +
    "and the rest is optional depth you'll come back to. Pause when you need to; do not feel obliged " +
    "to finish in one sitting."
};

d1.items.splice(insertAt, 0, karpathy);

fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log(`SUCCESS — Karpathy video added at D1 position ${insertAt}. Items: ${d1.items.length}.`);
