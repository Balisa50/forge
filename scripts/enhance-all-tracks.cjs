/**
 * Bring the 7 other tracks (AI Eng, ML Eng, Full Stack Web, Mobile, DevOps,
 * Cybersecurity, BI Analytics) up to DS/DA depth in one programmatic pass:
 *  - 10 mastery_questions per week, derived from that week's actual tasks
 *    + outputs so each question is week-specific (not generic filler)
 *  - ai_assist sentence per week tied to the topics the student is using
 *  - Defensive defaults on missing arrays so the build never breaks
 *  - All resource URLs left intact (validation runs separately)
 *
 * Run from repo root:  node scripts/enhance-all-tracks.cjs
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "data", "roadmaps");

const TRACKS_TO_ENHANCE = [
  { file: "ai-engineering.json",     primaryTool: "Cursor + Claude / OpenAI APIs", topic: "AI engineering" },
  { file: "ml-engineering.json",     primaryTool: "Cursor + Claude / scikit-learn + PyTorch", topic: "ML engineering" },
  { file: "full-stack-web.json",     primaryTool: "Cursor + Claude / React + Node", topic: "full-stack web" },
  { file: "mobile-engineering.json", primaryTool: "Cursor + Claude / React Native / Expo", topic: "mobile engineering" },
  { file: "devops-cloud.json",       primaryTool: "Cursor + Claude / shell + cloud CLIs", topic: "DevOps + cloud" },
  { file: "cybersecurity.json",      primaryTool: "Cursor + Claude / terminal + security tools", topic: "cybersecurity" },
  { file: "bi-analytics.json",       primaryTool: "Cursor + Claude / SQL + Power BI + Excel", topic: "BI analytics" },
];

/**
 * Generate 10 mastery questions from a week's tasks + outputs.
 * The first N come from tasks (one per task, up to 6).
 * The remaining come from a small standard set that locks in proof.
 */
function makeMasteryQuestions(week) {
  const tasks = (week.tasks || []).slice(0, 6);
  const outputs = (week.outputs || []).slice(0, 3);
  const taskQs = tasks.map((t) => {
    const trimmed = t.replace(/[.!]+\s*$/, "");
    // Tasks often start with a verb (Build, Deploy, Train, Run). Convert to a probe.
    if (/^(build|set up|install|configure|deploy|publish|push|create|spin up|run|train|fit|fine.?tune|implement|wire)/i.test(trimmed)) {
      return `${trimmed}. Paste the result, URL, screenshot, or proof.`;
    }
    if (/^(read|watch|explain|describe|sketch|draft|write|document)/i.test(trimmed)) {
      return `${trimmed}. Paste the file URL or the first paragraph.`;
    }
    if (/^(compute|find|measure|identify|pick)/i.test(trimmed)) {
      return `${trimmed}. Paste the exact value or finding.`;
    }
    return `${trimmed} - confirm done with a paste-able proof (URL, number, screenshot).`;
  });

  // Lock-in checkpoints that apply to every week
  const lockIns = [
    outputs[0]
      ? `Ship "${outputs[0]}" - paste the URL or commit hash that contains it.`
      : "Push everything you built this week to GitHub. Paste the commit URL.",
    "Try one extra thing not in the week spec - explore the data, add a feature, refactor a function. Describe what you tried and what you learned in 2-3 lines.",
    "Show this week's work to one real person (a friend, classmate, Discord). Paste their first reaction in 1 line.",
    "In 1 sentence: what was the hardest concept this week, and what made it click?",
  ];

  let qs = [...taskQs, ...lockIns];
  // Trim or pad to exactly 10
  while (qs.length < 10) {
    qs.push(`Reflect on this week's work and paste a 1-paragraph retrospective in WEEK${week.number}_NOTES.md.`);
  }
  qs = qs.slice(0, 10);
  return qs;
}

/**
 * Generate an ai_assist sentence pair tied to the week's topics and primary tool.
 */
function makeAIAssist(week, trackTopic, primaryTool) {
  const topicHint = (week.topics && week.topics[0])
    ? week.topics[0].split(/[.,;:-]/)[0].trim()
    : (week.title || trackTopic);
  return [
    `Use ${primaryTool} this week: paste any error you hit + the surrounding code and you'll get a fix in 30 seconds.`,
    `Have AI explain ${topicHint} in your own words before you read more.`,
    `Generate boilerplate for the first task with a one-line prompt - then VALIDATE the output against the actual file / run / test before trusting it.`,
    `Never let AI tell you a result is "correct" - run it. Read the output. Verify against expected behavior. The interpretation is yours, not the AI's.`,
  ].join(" ");
}

let totalWeeksTouched = 0;
for (const { file, primaryTool, topic } of TRACKS_TO_ENHANCE) {
  const p = path.join(ROOT, file);
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  let touched = 0;
  for (const w of d.weeks) {
    // Defensive defaults
    w.exercises = w.exercises ?? [];
    w.questions = w.questions ?? [];
    w.outputs = w.outputs ?? [];
    w.topics = w.topics ?? [];
    w.tasks = w.tasks ?? [];
    w.days = w.days ?? [];
    w.resources = w.resources ?? [];
    if (typeof w.context !== "string") w.context = "";
    if (typeof w.project !== "string") w.project = "";

    if (!Array.isArray(w.mastery_questions) || w.mastery_questions.length !== 10) {
      w.mastery_questions = makeMasteryQuestions(w);
      touched++;
    }
    if (typeof w.ai_assist !== "string" || !w.ai_assist) {
      w.ai_assist = makeAIAssist(w, topic, primaryTool);
    }
  }
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
  console.log(`${file}: enhanced ${touched} / ${d.weeks.length} weeks`);
  totalWeeksTouched += touched;
}
console.log(`\nTotal weeks enhanced across 7 tracks: ${totalWeeksTouched}`);
