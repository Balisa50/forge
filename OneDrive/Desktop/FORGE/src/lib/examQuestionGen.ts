/**
 * examQuestionGen — non-exhaustible mastery questions (prompt item #6).
 *
 * Instead of a static bank a student can memorize, each concept can register
 * one or more PARAMETERIZED templates. Every time the gate runs we resample the
 * parameters, so the numbers (and the correct answer) change on every attempt —
 * a student can retake 100 times and never see the identical question twice.
 *
 * Pure + client-safe (no fs/server imports): MasteryQuiz calls this in the
 * browser at quiz start. Concepts without a generator fall back to their static
 * `mastery.questions`, so nothing regresses.
 *
 * Each template returns a MasteryQuestion-shaped object: stem (LaTeX ok), five
 * choices, the correct index, and a worked explanation that uses the SAME
 * sampled numbers. Distractors are built from realistic mistakes (forgetting an
 * overlap, flipping a conditional, using the wrong base), not random noise — so
 * the wrong answers are tempting, the way SOA writes them.
 */

import type { MasteryQuestion } from "@/lib/examPaths";

/* ───────────────────────── rng + helpers ───────────────────────── */

const rint = (lo: number, hi: number) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
/** random multiple of `step` within [lo,hi] (e.g. nice probabilities) */
const rstep = (lo: number, hi: number, step: number) => {
  const n = Math.round((hi - lo) / step);
  return +(lo + rint(0, n) * step).toFixed(10);
};
const pick = <T,>(arr: T[]): T => arr[rint(0, arr.length - 1)];

const round = (x: number, dp = 4) => {
  const f = 10 ** dp;
  return Math.round(x * f) / f;
};
const fmt = (x: number, dp = 4) => {
  const r = round(x, dp);
  // trim trailing zeros but keep at least 2 dp for probabilities
  let s = r.toFixed(dp);
  s = s.replace(/0+$/, "").replace(/\.$/, "");
  if (!s.includes(".")) s += ".0";
  return s;
};
const pct = (x: number, dp = 1) => `${round(x * 100, dp)}\\%`;

function nCr(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let num = 1, den = 1;
  for (let i = 0; i < k; i++) { num *= n - i; den *= i + 1; }
  return num / den;
}

/**
 * Build a 5-choice MasteryQuestion from a correct numeric value plus candidate
 * distractor values. Dedupes (within tolerance), pads if needed, shuffles, and
 * reports the correct index. `format` turns a value into the choice label.
 */
function build(
  q: string,
  correct: number,
  distractors: number[],
  explain: string,
  format: (v: number) => string,
  difficulty: MasteryQuestion["difficulty"] = "core",
): MasteryQuestion {
  const tol = 1e-9;
  const vals: number[] = [correct];
  for (const d of distractors) {
    if (!Number.isFinite(d) || d < 0) continue;
    if (vals.some((v) => Math.abs(v - d) < Math.max(tol, Math.abs(v) * 0.005))) continue;
    vals.push(round(d, 6));
    if (vals.length === 5) break;
  }
  // pad with small perturbations if not enough unique distractors
  let bump = 1;
  while (vals.length < 5) {
    const cand = round(correct * (1 + 0.12 * bump) + 0.001 * bump, 6);
    if (!vals.some((v) => Math.abs(v - cand) < tol)) vals.push(cand);
    bump++;
    if (bump > 50) break;
  }
  // shuffle (Fisher-Yates)
  for (let i = vals.length - 1; i > 0; i--) {
    const j = rint(0, i);
    [vals[i], vals[j]] = [vals[j], vals[i]];
  }
  const choices = vals.map(format);
  const correctIdx = vals.findIndex((v) => Math.abs(v - correct) < tol);
  return { q, choices, correct: correctIdx, explain, difficulty };
}

/* ───────────────────────── templates ───────────────────────── */

type Template = () => MasteryQuestion;

const GENERATORS: Record<string, Template[]> = {
  // ── Sample spaces & events: inclusion–exclusion "neither" ──
  "sample-spaces-and-events": [
    () => {
      const a = rstep(0.4, 0.7, 0.05);
      const b = rstep(0.3, 0.6, 0.05);
      const both = rstep(0.1, Math.min(a, b) - 0.05, 0.05);
      const union = round(a + b - both, 4);
      const neither = round(1 - union, 4);
      return build(
        `In a group, $P(A) = ${fmt(a, 2)}$, $P(B) = ${fmt(b, 2)}$, and $P(A \\cap B) = ${fmt(both, 2)}$. Find $P(A^c \\cap B^c)$ (neither event occurs).`,
        neither,
        [round(1 - (a + b), 4), union, round(1 - both, 4), round(a + b - 2 * both, 4)],
        `By inclusion–exclusion, $P(A \\cup B) = ${fmt(a, 2)} + ${fmt(b, 2)} - ${fmt(both, 2)} = ${fmt(union, 2)}$. "Neither" is the complement of the union: $1 - ${fmt(union, 2)} = ${fmt(neither, 2)}$. The trap is forgetting to add back the overlap, which gives $1-(${fmt(a, 2)}+${fmt(b, 2)})$.`,
        (v) => `$${fmt(v, 4)}$`,
      );
    },
    () => {
      const a = rstep(0.4, 0.7, 0.05);
      const b = rstep(0.3, 0.6, 0.05);
      const both = rstep(0.1, Math.min(a, b) - 0.05, 0.05);
      const onlyA = round(a - both, 4);
      return build(
        `Given $P(A) = ${fmt(a, 2)}$, $P(B) = ${fmt(b, 2)}$, $P(A \\cap B) = ${fmt(both, 2)}$, find $P(A \\cap B^c)$ (only $A$).`,
        onlyA,
        [a, round(a + both, 4), round(b - both, 4), round(a + b - both, 4)],
        `The difference rule: $P(A \\cap B^c) = P(A) - P(A \\cap B) = ${fmt(a, 2)} - ${fmt(both, 2)} = ${fmt(onlyA, 4)}$. It is $A$ with its overlap with $B$ carved away.`,
        (v) => `$${fmt(v, 4)}$`,
      );
    },
  ],

  // ── Counting: hypergeometric "exactly k" ──
  "counting-and-axioms": [
    () => {
      const N = rint(10, 16);
      const K = rint(3, Math.min(7, N - 4));
      const n = rint(3, 5);
      const k = rint(1, Math.min(K, n - 1));
      const p = (nCr(K, k) * nCr(N - K, n - k)) / nCr(N, n);
      const binom = nCr(n, k) * (K / N) ** k * (1 - K / N) ** (n - k);
      return build(
        `A box holds ${N} items, ${K} of them defective. You draw ${n} at random without replacement. What is the probability exactly ${k} are defective?`,
        round(p, 4),
        [round(binom, 4), round(nCr(K, k) / nCr(N, n), 4), round((nCr(K, k) * nCr(N - K, n - k)) / nCr(N, n) * 1.5, 4), round(k / n, 4)],
        `Hypergeometric: $\\dfrac{\\binom{${K}}{${k}}\\binom{${N - K}}{${n - k}}}{\\binom{${N}}{${n}}} = \\dfrac{${nCr(K, k)}\\cdot ${nCr(N - K, n - k)}}{${nCr(N, n)}} = ${fmt(p, 4)}$. Using binomial $\\binom{${n}}{${k}}p^{${k}}(1-p)^{${n - k}}$ would be wrong here because draws are without replacement.`,
        (v) => `$${fmt(v, 4)}$`,
      );
    },
  ],

  // ── Conditional probability: law of total probability ──
  "conditional-probability": [
    () => {
      const w1 = rstep(0.5, 0.7, 0.05);
      const d1 = rstep(0.01, 0.04, 0.01);
      const d2 = rstep(0.04, 0.08, 0.01);
      const pd = round(w1 * d1 + (1 - w1) * d2, 5);
      return build(
        `Factory 1 makes ${pct(w1)} of units at a ${pct(d1)} defect rate; Factory 2 makes the rest at a ${pct(d2)} defect rate. What fraction of all units are defective?`,
        round(pd, 5),
        [round((d1 + d2) / 2, 5), round(w1 * d1, 5), round(d1 + d2, 5), round((1 - w1) * d2, 5)],
        `Law of total probability: $P(D) = (${fmt(w1, 2)})(${fmt(d1, 2)}) + (${fmt(round(1 - w1, 2), 2)})(${fmt(d2, 2)}) = ${fmt(pd, 5)}$. Average the two rates only if the two factories made equal shares — here they do not.`,
        (v) => `$${fmt(v, 5)}$`,
      );
    },
  ],

  // ── Bayes: disease-test posterior ──
  "bayes-theorem": [
    () => {
      const prev = pick([0.01, 0.02, 0.05, 0.1]);
      const se = pick([0.9, 0.95, 0.98, 0.99]);
      const sp = pick([0.9, 0.95, 0.98, 0.99]);
      const post = (prev * se) / (prev * se + (1 - prev) * (1 - sp));
      return build(
        `A condition has prevalence ${pct(prev)}. A test has sensitivity ${pct(se)} and specificity ${pct(sp)}. Given a positive result, find $P(\\text{has condition} \\mid +)$.`,
        round(post, 4),
        [se, prev, round(prev * se, 4), round(se * sp, 4)],
        `Bayes: $\\dfrac{(${fmt(prev, 2)})(${fmt(se, 2)})}{(${fmt(prev, 2)})(${fmt(se, 2)}) + (${fmt(round(1 - prev, 2), 2)})(${fmt(round(1 - sp, 2), 2)})} = ${fmt(post, 4)}$. The base rate dominates: false positives from the large healthy group rival the true positives, so the answer is far below the sensitivity ${pct(se)}.`,
        (v) => `$${fmt(v, 4)}$`,
      );
    },
  ],

  // ── Independence: at-least-one ──
  "independence": [
    () => {
      const n = rint(3, 5);
      const p = rstep(0.6, 0.9, 0.05);
      const atLeastOne = round(1 - (1 - p) ** n, 5);
      return build(
        `${n} components each work independently with probability $${fmt(p, 2)}$. Find the probability at least one works.`,
        round(atLeastOne, 5),
        [round(p ** n, 5), round(1 - p ** n, 5), round(n * p * (1 - p), 5), round((1 - p) ** n, 5)],
        `"At least one" is cleanest via the complement: $1 - P(\\text{none work}) = 1 - (1-${fmt(p, 2)})^{${n}} = 1 - ${fmt(round((1 - p) ** n, 5), 5)} = ${fmt(atLeastOne, 5)}$. Multiplying failure probabilities relies on independence.`,
        (v) => `$${fmt(v, 5)}$`,
      );
    },
  ],

  // ── Binomial: exactly k ──
  "common-discrete-distributions": [
    () => {
      const n = rint(6, 12);
      const p = rstep(0.2, 0.5, 0.05);
      const k = rint(2, Math.min(n - 1, Math.round(n * p) + 2));
      const prob = nCr(n, k) * p ** k * (1 - p) ** (n - k);
      return build(
        `$X \\sim \\text{Binomial}(n=${n},\\, p=${fmt(p, 2)})$. Find $P(X = ${k})$.`,
        round(prob, 4),
        [round(p ** k * (1 - p) ** (n - k), 4), round(nCr(n, k) * p ** k, 4), round((n * p) / n, 4), round(prob * 1.4, 4)],
        `$P(X=${k}) = \\binom{${n}}{${k}}(${fmt(p, 2)})^{${k}}(${fmt(round(1 - p, 2), 2)})^{${n - k}} = ${nCr(n, k)} \\cdot ${fmt(p ** k, 6)} \\cdot ${fmt((1 - p) ** (n - k), 6)} = ${fmt(prob, 4)}$. Dropping the $\\binom{${n}}{${k}}$ coefficient is the classic error.`,
        (v) => `$${fmt(v, 4)}$`,
      );
    },
  ],

  // ── Expectation & variance: linear transform of a known mean/var ──
  "expectation-and-variance": [
    () => {
      const mu = rint(3, 8);
      const varX = rint(2, 9);
      const a = rint(2, 4);
      const b = rint(1, 6);
      const ans = round(a * a * varX, 4);
      return build(
        `$X$ has $E[X]=${mu}$ and $\\mathrm{Var}(X)=${varX}$. Find $\\mathrm{Var}(${a}X + ${b})$.`,
        ans,
        [round(a * varX, 4), round(a * a * varX + b, 4), round(a * varX + b, 4), round(varX, 4)],
        `$\\mathrm{Var}(aX+b) = a^2\\mathrm{Var}(X)$: the shift $+${b}$ contributes nothing and the scale enters squared, so $${a}^2 \\cdot ${varX} = ${fmt(ans, 4)}$. Using $a$ instead of $a^2$, or adding $b$, are the usual mistakes.`,
        (v) => `$${fmt(v, 4)}$`,
      );
    },
  ],
};

/* ───────────────────────── public api ───────────────────────── */

export function hasGenerator(conceptId: string): boolean {
  return (GENERATORS[conceptId]?.length ?? 0) > 0;
}

/**
 * Generate `count` fresh, parameter-randomized questions for a concept.
 * Rotates through the concept's templates so a sitting mixes question shapes,
 * and resamples every call so no two attempts are identical.
 */
export function generateQuestions(conceptId: string, count: number): MasteryQuestion[] {
  const templates = GENERATORS[conceptId];
  if (!templates || templates.length === 0) return [];
  const out: MasteryQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const t = templates[i % templates.length];
    out.push(t());
  }
  return out;
}
