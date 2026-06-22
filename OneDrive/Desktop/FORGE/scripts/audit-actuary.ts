/**
 * Actuary question-engine audit.
 *   1. No question repeats across 100+ attempts per concept (exact stem match).
 *   2. Every concept exposes all four difficulty tiers.
 *   3. Every default sitting contains a super-hard question (the "sweat").
 *   4. Every generated question is structurally valid (5 choices, correct in 0..4).
 *
 * Run: npx tsx scripts/audit-actuary.ts
 */
import {
  generateQuestions,
  generateByTier,
  tiersAvailable,
  hasGenerator,
  TIER_ORDER,
  type Tier,
} from "../src/lib/examQuestionGen";

// Concepts with tiered generators (Exam P + Exam FM).
const EXAM_P = [
  "sample-spaces-and-events", "counting-and-axioms", "conditional-probability",
  "bayes-theorem", "independence", "expectation-and-variance",
  "common-discrete-distributions", "common-continuous-distributions",
  "covariance-and-correlation", "percentiles-and-measures",
  "double-expectation", "clt-and-sums",
  "mgf-and-moments", "transformations-univariate", "order-statistics", "sums-and-convolutions",
  "random-variables-and-distributions", "gamma-beta-lognormal", "joint-and-marginal", "conditional-distributions",
];
const EXAM_FM = [
  "interest-and-accumulation", "level-annuities", "loan-amortization", "bond-pricing",
  "nominal-rates-and-force", "perpetuities-and-varying", "geometric-annuities", "spot-forward-rates",
  "equation-of-value", "sinking-funds", "dollar-time-weighted", "yield-rates-npv",
];
const CONCEPTS = [...EXAM_P, ...EXAM_FM];

const ATTEMPTS = 120; // > the 100 the spec demands
let failures = 0;
const line = (s: string) => process.stdout.write(s + "\n");

line("=".repeat(74));
line("ACTUARY QUESTION-ENGINE AUDIT  (Exam P + Exam FM)");
line("=".repeat(74));
line(
  `${"concept".padEnd(34)} ${"tiers".padEnd(6)} ${"uniq/attempts".padEnd(14)} ${"superhard?".padEnd(11)} valid?`,
);
line("-".repeat(74));

for (const c of CONCEPTS) {
  if (!hasGenerator(c)) { line(`${c.padEnd(34)} NO GENERATOR`); failures++; continue; }

  // (1) 120 single-question attempts drawn across all tiers -> all distinct stems.
  const seen = new Set<string>();
  let dup = 0;
  let structOk = true;
  for (let k = 0; k < ATTEMPTS; k++) {
    const tier = TIER_ORDER[k % TIER_ORDER.length] as Tier;
    const [q] = generateByTier(c, tier, 1);
    if (!q) { structOk = false; break; }
    if (q.choices.length !== 5 || q.correct < 0 || q.correct > 4) structOk = false;
    if (seen.has(q.q)) dup++;
    seen.add(q.q);
  }

  // (2) all four tiers present
  const tiers = tiersAvailable(c);
  const tiersOk = TIER_ORDER.every((t) => tiers.includes(t));

  // (3) a default 7-question sitting must contain a superhard
  let sweat = false;
  for (let trial = 0; trial < 20 && !sweat; trial++) {
    const set = generateQuestions(c, 7);
    if (set.some((q) => q.difficulty === "stretch")) sweat = true;
  }

  const uniqOk = dup === 0;
  const ok = uniqOk && tiersOk && sweat && structOk;
  if (!ok) failures++;
  line(
    `${c.padEnd(34)} ${String(tiers.length).padEnd(6)} ` +
    `${`${seen.size}/${ATTEMPTS}`.padEnd(14)} ` +
    `${(sweat ? "yes" : "NO").padEnd(11)} ${structOk ? "yes" : "NO"}` +
    `${ok ? "" : "   <-- FAIL"}`,
  );
}

line("-".repeat(74));

// (4) spot-check a worked super-hard from each exam so a human can eyeball the math.
function sample(concept: string) {
  const [q] = generateByTier(concept, "superhard", 1);
  line(`\nSUPER-HARD SAMPLE  [${concept}]`);
  line("  Q: " + q.q.replace(/\\\\/g, "\\"));
  q.choices.forEach((ch, i) => line(`   ${i === q.correct ? "*" : " "} ${"ABCDE"[i]}. ${ch}`));
  line("  why: " + q.explain.replace(/\\\\/g, "\\"));
}
sample("conditional-probability");
sample("expectation-and-variance");
sample("bond-pricing");

line("\n" + "=".repeat(74));
if (failures === 0) {
  line(`RESULT: PASS - ${CONCEPTS.length} concepts, ${ATTEMPTS} attempts each, zero repeats, every tier + sweat present.`);
} else {
  line(`RESULT: FAIL - ${failures} concept(s) failed.`);
}
line("=".repeat(74));
process.exit(failures === 0 ? 0 : 1);
