// Patch AI-Engineering W1 D1 to replace the visual content the removed
// 'AI Engineering in 100 Seconds' video would have carried, without
// fabricating a YouTube URL (per HANDOFF.md §8.5).
//
// What changes:
//   1. The first lesson body gets a richer "What AI engineering looks like"
//      section with a small ASCII flow diagram + two contrast examples.
//   2. A new reading item is inserted right after the first lesson, pointing
//      to OpenAI's official Quickstart — a canonical, stable docs URL that
//      teaches the same first-call concept the video would have covered.
//
// Idempotent: re-running checks for the marker phrase before patching.
const fs = require('fs');
const FILE = 'C:/Users/Abdoulie Balisa/OneDrive/Desktop/FORGE/data/roadmaps/ai-engineering.json';
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const w1 = ds.weeks[0];
if (!w1 || !w1.days || !w1.days[0]) throw new Error('AI-eng W1 D1 not found');
const d1 = w1.days[0];

const firstLessonIdx = d1.items.findIndex(
  (it) => it.kind === 'lesson' && /AI engineering vs software/i.test(it.title || '')
);
if (firstLessonIdx === -1) {
  throw new Error('Could not locate the first lesson in AI-eng W1 D1.');
}

const firstLesson = d1.items[firstLessonIdx];
const MARKER = 'The two shapes side by side';

if (firstLesson.body.includes(MARKER)) {
  console.log('SKIP — lesson already thickened. No change.');
  process.exit(0);
}

// New body: keeps the original framing, adds a visual ASCII flow + two
// concrete contrast examples + a tighter mental model. This is the
// material the (removed, unverified) 'AI Engineering in 100 Seconds'
// video would have carried; now it lives in text where it cannot rot.
firstLesson.body =
"## The shift\n" +
"In traditional software you write IF statements. The behaviour of your code is determined by the lines you typed. Every output is the deterministic result of an input you can trace.\n\n" +
"In **AI engineering** the core behaviour is delegated to a language model. You write a prompt — instructions in English — and the model decides what to output. Your job is no longer to write the logic, but to:\n" +
"- design the prompt so the model behaves correctly\n" +
"- handle the gracelessly-failing edge cases (model returns gibberish, refuses, is too slow, costs too much)\n" +
"- evaluate whether the output is actually any good\n" +
"- iterate the prompt + measure the result\n\n" +
"## The two shapes side by side\n" +
"```text\n" +
"TRADITIONAL FUNCTION\n" +
"  user input ──► explicit code rules ──► deterministic output\n" +
"  (\"123 KG\") ──► parseInt + unit lookup ──► { value: 123, unit: 'kg' }\n" +
"\n" +
"AI-DELEGATED FUNCTION\n" +
"  user input ──► system prompt + model call ──► probabilistic output\n" +
"  (\"sup how r u\") ──► \"translate to formal French\" ──► \"Bonjour, comment allez-vous?\"\n" +
"```\n\n" +
"Same shape on paper. Wildly different engineering. The first one is 8 lines of TypeScript that work the same way forever. The second one is 4 lines of Python whose output depends on the model, the prompt, the temperature, the user's exact wording, and whether the API is having a bad day.\n\n" +
"## Two examples — the same task in both styles\n\n" +
"### Example 1 — Translate English to French\n" +
"```python\n" +
"# Traditional: you would have to build / license a translation engine.\n" +
"# Practically: nobody writes this from scratch in 2026 — it is delegated.\n" +
"\n" +
"# AI-delegated: 8 lines, working the same day.\n" +
"resp = client.chat.completions.create(\n" +
"    model='gpt-4o-mini',\n" +
"    messages=[\n" +
"        {'role': 'system', 'content': 'Translate the user message to French. Reply with ONLY the translation.'},\n" +
"        {'role': 'user',   'content': 'Where is the train station?'},\n" +
"    ],\n" +
")\n" +
"print(resp.choices[0].message.content)   # 'Où se trouve la gare ?'\n" +
"```\n\n" +
"### Example 2 — Classify a customer support email as urgent / not urgent\n" +
"```python\n" +
"# Traditional: a rules engine. Hand-maintained keyword lists. Slow to update.\n" +
"#   if 'urgent' in text or 'asap' in text or 'help!!' in text: return URGENT\n" +
"#   ... 200 more rules ... still gets things wrong on phrasing variations.\n" +
"\n" +
"# AI-delegated: one prompt, hundreds of cases handled out of the box.\n" +
"resp = client.chat.completions.create(\n" +
"    model='gpt-4o-mini',\n" +
"    messages=[\n" +
"        {'role': 'system', 'content':\n" +
"            'Classify the email as URGENT or NOT_URGENT. Reply with one word.'},\n" +
"        {'role': 'user',   'content': email_text},\n" +
"    ],\n" +
")\n" +
"verdict = resp.choices[0].message.content.strip()\n" +
"```\n\n" +
"Both examples show the same flip: the engineer stops writing the logic, and starts writing the INSTRUCTIONS for the logic. That is the core skill shift of this whole roadmap.\n\n" +
"## The week's project — Polyglot v0.1\n" +
"A command-line translator: type English, get Spanish. ~50 lines of Python. It is deliberately tiny so you focus on the primitives — API call, cost tracking, error handling, README.\n\n" +
"By Sunday: you can run `python translator.py 'Hello, world'` and see `¡Hola, mundo!` — and the code is on your public GitHub, with a working README, and you know what it cost to run.\n\n" +
"## The roadmap arc\n" +
"Polyglot grows for four weeks: v0.1 terminal → v0.2 Streamlit web app → v0.3 evaluated → v0.4 hardened against prompt injection. One project, four shipped versions. That arc IS the portfolio.";

// Insert a reading item right after the first lesson. Canonical OpenAI
// Quickstart URL — stable, well-maintained, treats the same "your first
// model call" concept the removed video would have visualised.
const newReading = {
  kind: 'reading',
  title: 'OpenAI — Quickstart (official)',
  url: 'https://platform.openai.com/docs/quickstart',
  why: "Read second. The official 5-minute quickstart for the same concept the lesson above introduced — sign up, create a key, make your first call. Treat it as the operating-system manual; bookmark for whenever you forget a parameter."
};

d1.items.splice(firstLessonIdx + 1, 0, newReading);

fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log(`SUCCESS — AI-eng W1 D1 thickened. Items count: ${d1.items.length}.`);
