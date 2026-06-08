/**
 * examQuestionGen — non-exhaustible, DIFFICULTY-TIERED mastery questions.
 *
 * Each concept registers PARAMETERIZED templates tagged with a difficulty tier
 * (easy → medium → hard → superhard). Every sitting resamples parameters, so the
 * numbers and the correct answer change on every attempt — a student can retake
 * 100 times and never see the identical question twice (enforced by a per-concept
 * last-50 ring buffer that rejects a repeated stem).
 *
 * Tiers, by design:
 *   easy       one formula, one step, no trap.
 *   medium     two steps / combine two ideas.
 *   hard        multi-step, integrates 3+ ideas, contains a classic trap.
 *   superhard   exam-level-and-beyond; every sitting of >=6 includes one.
 *
 * Per-student progression: a sitting that passes bumps the student's tier up;
 * a fail bumps it down (persisted in localStorage, browser-only). generateForStudent
 * centres the sitting on that tier but always opens with a warm-up and ends on a
 * superhard so the gate never stops being a real test.
 *
 * Pure + client-safe (only a type import). Concepts without a generator fall back
 * to their static `mastery.questions`, so nothing regresses.
 *
 * Distractors are built from realistic mistakes (forgetting an overlap, flipping a
 * conditional, using the with-replacement formula, dropping a binomial coefficient)
 * — the tempting wrong answers the SOA actually writes, not random noise.
 */

import type { MasteryQuestion, DiagramSpec } from "@/lib/examPaths";

/** Study-mode enrichments a template may attach (all optional). */
type QuestionExtra = Partial<Pick<MasteryQuestion, "trick" | "diagram" | "decode" | "steps" | "sanity">>;

/* ───────────────────────── rng + helpers ───────────────────────── */

const rint = (lo: number, hi: number) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
/** random multiple of `step` within [lo,hi] (e.g. nice probabilities) */
const rstep = (lo: number, hi: number, step: number) => {
  const n = Math.round((hi - lo) / step);
  return +(lo + rint(0, n) * step).toFixed(10);
};
const pick = <T,>(arr: T[]): T => arr[rint(0, arr.length - 1)];
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

const round = (x: number, dp = 4) => {
  const f = 10 ** dp;
  return Math.round(x * f) / f;
};
const fmt = (x: number, dp = 4) => {
  const r = round(x, dp);
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
function fact(n: number): number { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; }

/* ── financial-math helpers (Exam FM) ── */
const vOf = (i: number) => 1 / (1 + i);
/** PV of an annuity-immediate of 1/period for n periods at rate i: a-angle-n. */
const aImm = (n: number, i: number) => (1 - vOf(i) ** n) / i;
/** AV of an annuity-immediate of 1/period for n periods at rate i: s-angle-n. */
const sImm = (n: number, i: number) => ((1 + i) ** n - 1) / i;
const aDue = (n: number, i: number) => aImm(n, i) * (1 + i);

/* ── standard-normal CDF (Abramowitz & Stegun 7.1.26) for CLT items ── */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-z * z / 2);
  const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
}

/* formatters */
const money = (v: number) => `$\\$${(Math.round(v * 100) / 100)}$`;
const prob = (v: number) => `$${fmt(v, 4)}$`;
const integer = (v: number) => `$${Math.round(v)}$`;

/**
 * Build a 5-choice MasteryQuestion from a correct numeric value plus candidate
 * distractor values. Dedupes (within tolerance), pads if needed, shuffles, and
 * reports the correct index.
 */
function build(
  q: string,
  correct: number,
  distractors: number[],
  explain: string,
  format: (v: number) => string,
  difficulty: MasteryQuestion["difficulty"] = "core",
  extra?: QuestionExtra,
): MasteryQuestion {
  const tol = 1e-9;
  const vals: number[] = [correct];
  for (const d of distractors) {
    if (!Number.isFinite(d)) continue;
    if (vals.some((v) => Math.abs(v - d) < Math.max(tol, Math.abs(v) * 0.005))) continue;
    vals.push(round(d, 6));
    if (vals.length === 5) break;
  }
  let bump = 1;
  while (vals.length < 5) {
    const cand = round(correct * (1 + 0.12 * bump) + 0.001 * bump, 6);
    if (!vals.some((v) => Math.abs(v - cand) < tol)) vals.push(cand);
    bump++;
    if (bump > 50) break;
  }
  for (let i = vals.length - 1; i > 0; i--) {
    const j = rint(0, i);
    [vals[i], vals[j]] = [vals[j], vals[i]];
  }
  const choices = vals.map(format);
  const correctIdx = vals.findIndex((v) => Math.abs(v - correct) < tol);
  return { q, choices, correct: correctIdx, explain, difficulty, ...extra };
}

/* ───────────────────────── tiers ───────────────────────── */

export type Tier = "easy" | "medium" | "hard" | "superhard";
export const TIER_ORDER: Tier[] = ["easy", "medium", "hard", "superhard"];
const TIER_DIFF: Record<Tier, MasteryQuestion["difficulty"]> = {
  easy: "warmup", medium: "core", hard: "exam", superhard: "stretch",
};
interface Template { tier: Tier; gen: () => MasteryQuestion; }
/** sugar so a template body just returns build(...) and inherits its tier difficulty */
const T = (tier: Tier, gen: () => MasteryQuestion): Template => ({ tier, gen });

/* ───────────────────────── EXAM P templates ───────────────────────── */

const GENERATORS: Record<string, Template[]> = {
  "sample-spaces-and-events": [
    T("easy", () => {
      const a = rstep(0.2, 0.5, 0.05), b = rstep(0.2, 0.4, 0.05);
      return build(`Events $A$ and $B$ are mutually exclusive with $P(A)=${fmt(a, 2)}$ and $P(B)=${fmt(b, 2)}$. Find $P(A \\cup B)$.`,
        round(a + b, 4), [round(a * b, 4), a, round(a + b - a * b, 4), b],
        `Mutually exclusive means $P(A\\cap B)=0$, so $P(A\\cup B)=P(A)+P(B)=${fmt(a, 2)}+${fmt(b, 2)}=${fmt(a + b, 4)}$. Multiplying would only be right for independence, a different idea.`,
        prob, TIER_DIFF.easy);
    }),
    T("easy", () => {
      const a = rstep(0.3, 0.8, 0.05);
      return build(`If $P(A)=${fmt(a, 2)}$, find $P(A^c)$.`, round(1 - a, 4),
        [a, round(1 - a * a, 4), round(a / 2, 4), round(1 + a - 1, 4) + 0.05],
        `The complement rule: $P(A^c)=1-P(A)=1-${fmt(a, 2)}=${fmt(1 - a, 4)}$.`, prob, TIER_DIFF.easy);
    }),
    T("medium", () => {
      const a = rstep(0.4, 0.7, 0.05), b = rstep(0.3, 0.6, 0.05);
      const both = rstep(0.1, Math.min(a, b) - 0.05, 0.05);
      const union = round(a + b - both, 4), neither = round(1 - union, 4);
      return build(`$P(A)=${fmt(a, 2)}$, $P(B)=${fmt(b, 2)}$, $P(A\\cap B)=${fmt(both, 2)}$. Find $P(A^c\\cap B^c)$ (neither occurs).`,
        neither, [round(1 - (a + b), 4), union, round(1 - both, 4), round(a + b - 2 * both, 4)],
        `Inclusion–exclusion: $P(A\\cup B)=${fmt(a, 2)}+${fmt(b, 2)}-${fmt(both, 2)}=${fmt(union, 2)}$. "Neither" is the complement of the union: $1-${fmt(union, 2)}=${fmt(neither, 4)}$. Forgetting to add back the overlap gives $1-(${fmt(a, 2)}+${fmt(b, 2)})$.`,
        prob, TIER_DIFF.medium);
    }),
    T("hard", () => {
      const a = rstep(0.4, 0.6, 0.05), b = rstep(0.4, 0.6, 0.05), c = rstep(0.3, 0.5, 0.05);
      const ab = rstep(0.15, 0.3, 0.05), ac = rstep(0.1, 0.25, 0.05), bc = rstep(0.1, 0.25, 0.05);
      const abc = rstep(0.05, Math.min(ab, ac, bc) - 0.0, 0.05) || 0.05;
      const u = round(a + b + c - ab - ac - bc + abc, 4);
      return build(`$P(A)=${fmt(a, 2)},P(B)=${fmt(b, 2)},P(C)=${fmt(c, 2)}$; pairwise $P(A\\cap B)=${fmt(ab, 2)},P(A\\cap C)=${fmt(ac, 2)},P(B\\cap C)=${fmt(bc, 2)}$; $P(A\\cap B\\cap C)=${fmt(abc, 2)}$. Find $P(A\\cup B\\cup C)$.`,
        u, [round(a + b + c, 4), round(a + b + c - ab - ac - bc, 4), round(a + b + c - ab - ac - bc - abc, 4), round(a + b + c + abc, 4)],
        `Three-set inclusion–exclusion: add singles, subtract the three pairwise overlaps, add back the triple: $${fmt(a, 2)}+${fmt(b, 2)}+${fmt(c, 2)}-${fmt(ab, 2)}-${fmt(ac, 2)}-${fmt(bc, 2)}+${fmt(abc, 2)}=${fmt(u, 4)}$. The classic trap is the sign on the triple term — it is ADDED back.`,
        prob, TIER_DIFF.hard);
    }),
    T("superhard", () => {
      const a = rstep(0.4, 0.7, 0.05), b = rstep(0.3, 0.6, 0.05);
      const u = round(Math.min(0.95, a + b - 0.1), 2);
      const both = round(a + b - u, 4);
      const exactlyOne = round(u - both, 4); // = 2u - a - b
      return build(`$P(A)=${fmt(a, 2)}$, $P(B)=${fmt(b, 2)}$, and $P(A\\cup B)=${fmt(u, 2)}$. Find the probability that EXACTLY one of $A,B$ occurs.`,
        exactlyOne, [both, round(a + b - 2 * (a + b - u), 4) + 0.0, u, round(u - 2 * both, 4)],
        `First recover the overlap: $P(A\\cap B)=P(A)+P(B)-P(A\\cup B)=${fmt(a, 2)}+${fmt(b, 2)}-${fmt(u, 2)}=${fmt(both, 4)}$. "Exactly one" is the union minus the overlap (the part in both): $${fmt(u, 2)}-${fmt(both, 4)}=${fmt(exactlyOne, 4)}$, equivalently $2P(A\\cup B)-P(A)-P(B)$. Reporting the overlap itself is the trap.`,
        prob, TIER_DIFF.superhard);
    }),
  ],

  "counting-and-axioms": [
    T("easy", () => {
      const n = rint(6, 22), k = rint(2, 5);
      return build(`How many ways to choose a committee of ${k} from ${n} people?`, nCr(n, k),
        [nCr(n, k) * fact(k), n ** k, nCr(n, k - 1), nCr(n, k + 1)],
        `Order does not matter, so use combinations: $\\binom{${n}}{${k}}=${nCr(n, k)}$. Multiplying by $${k}!$ would count orderings (permutations), which over-counts here.`,
        integer, TIER_DIFF.easy);
    }),
    T("easy", () => {
      const n = rint(4, 9);
      return build(`How many distinct orderings are there of ${n} different books on a shelf?`, fact(n),
        [n ** 2, nCr(n, 2), fact(n - 1), fact(n) / 2],
        `All ${n} are distinct and order matters, so $${n}!=${fact(n)}$. $\\binom{${n}}{2}$ or $${n}^2$ count something else entirely.`,
        integer, TIER_DIFF.easy);
    }),
    T("medium", () => {
      const n = rint(5, 18), k = rint(2, 5);
      return build(`How many ordered arrangements (a president, then VP, ...) of ${k} distinct roles from ${n} people?`,
        fact(n) / fact(n - k), [nCr(n, k), n ** k, fact(n) / fact(k), fact(k)],
        `Order matters, so permutations: $P(${n},${k})=\\dfrac{${n}!}{(${n}-${k})!}=${fact(n) / fact(n - k)}$. Using $\\binom{${n}}{${k}}$ ignores the role order.`,
        integer, TIER_DIFF.medium);
    }),
    T("hard", () => {
      const N = rint(10, 16), K = rint(3, Math.min(7, N - 4)), n = rint(3, 5);
      const k = rint(1, Math.min(K, n - 1));
      const p = (nCr(K, k) * nCr(N - K, n - k)) / nCr(N, n);
      const binom = nCr(n, k) * (K / N) ** k * (1 - K / N) ** (n - k);
      return build(`A box holds ${N} items, ${K} defective. Draw ${n} without replacement. $P(\\text{exactly } ${k} \\text{ defective})$?`,
        round(p, 4), [round(binom, 4), round(nCr(K, k) / nCr(N, n), 4), round(p * 1.5, 4), round(k / n, 4)],
        `Hypergeometric: $\\dfrac{\\binom{${K}}{${k}}\\binom{${N - K}}{${n - k}}}{\\binom{${N}}{${n}}}=${fmt(p, 4)}$. Using the binomial $\\binom{${n}}{${k}}p^{${k}}(1-p)^{${n - k}}$ is the trap — it assumes replacement.`,
        prob, TIER_DIFF.hard);
    }),
    T("superhard", () => {
      const m = rint(4, 9), w = rint(3, 8), k = rint(2, 3);
      const pNoWomen = nCr(m, k) / nCr(m + w, k);
      const atLeastOne = round(1 - pNoWomen, 4);
      return build(`A group has ${m} men and ${w} women. A committee of ${k} is chosen at random. Find $P(\\text{at least one woman})$.`,
        atLeastOne, [round(pNoWomen, 4), round((w / (m + w)) * 3, 4), round(nCr(w, 1) / nCr(m + w, k), 4), round(w / (m + w), 4)],
        `Complement is fastest: $P(\\text{no women})=\\dfrac{\\binom{${m}}{${k}}}{\\binom{${m + w}}{${k}}}=${fmt(pNoWomen, 4)}$, so $P(\\ge 1)=1-${fmt(pNoWomen, 4)}=${fmt(atLeastOne, 4)}$. Adding single-woman probabilities double-counts committees with two or three women — the trap.`,
        prob, TIER_DIFF.superhard);
    }),
    T("superhard", () => {
      // 3-set with LINKED constraints — must back out the regions before counting.
      const t = 100 * rint(2, 6);                 // all three (triple overlap)
      const ac = 3 * t;                           // 25% of A∩C also buy B → A∩C totals 4t, AC-only = 3t
      const ab = 100 * rint(1, ac / 100 - 1);     // A∩B only
      const bc = 100 * rint(1, ac / 100 - 1);     // B∩C only
      const a = 100 * rint(20, 42);               // only A
      const b = 100 * rint(5, 25);                // only B
      const c = 100 * rint(5, 25);                // only C
      const buyA = a + ab + ac + t, buyB = b + ab + bc + t, buyC = c + ac + bc + t;
      const d1 = ac - ab, d2 = ac - bc;
      const exactlyOne = a + b + c, exactlyTwo = ab + ac + bc, total = exactlyOne + exactlyTwo + t;
      return build(
        `An insurer sells three products $A$, $B$, $C$; every customer buys at least one. ${buyA} buy $A$, ${buyB} buy $B$, ${buyC} buy $C$. The number buying both $A$ and $C$ is ${d1} more than the number buying both $A$ and $B$, and ${d2} more than the number buying both $B$ and $C$. Of those who buy both $A$ and $C$, $25\\%$ also buy $B$. Exactly ${a} buy only $A$. How many buy EXACTLY ONE product?`,
        exactlyOne, [total, exactlyTwo, exactlyOne + t, buyA],
        `Let the all-three region be $t$. "$25\\%$ of $A\\cap C$ also buy $B$" means $t=0.25\\,(A\\cap C)$, so $A\\cap C$ totals $4t$ and its only-region is $3t$. The two "more than" clauses pin the other pairwise-only regions; subtract every pairwise-only region and the triple from each product total to recover only-$A$, only-$B$, only-$C$. Exactly one $=${a}+${b}+${c}=${exactlyOne}$. The total $${total}$ ("at least one") and exactly-two $${exactlyTwo}$ are the traps.`,
        integer, TIER_DIFF.superhard);
    }),
  ],

  "conditional-probability": [
    T("easy", () => {
      const b = rstep(0.4, 0.7, 0.05), both = rstep(0.1, b - 0.05, 0.05);
      return build(`$P(A\\cap B)=${fmt(both, 2)}$ and $P(B)=${fmt(b, 2)}$. Find $P(A\\mid B)$.`,
        round(both / b, 4), [round(both * b, 4), round(b / both, 4), both, round(both / (1 - b), 4)],
        `By definition $P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{${fmt(both, 2)}}{${fmt(b, 2)}}=${fmt(both / b, 4)}$. Dividing by the wrong event or multiplying are the usual slips.`,
        prob, TIER_DIFF.easy);
    }),
    T("medium", () => {
      const w1 = rstep(0.5, 0.7, 0.05), d1 = rstep(0.01, 0.04, 0.01), d2 = rstep(0.04, 0.08, 0.01);
      const pd = round(w1 * d1 + (1 - w1) * d2, 5);
      return build(`Factory 1 makes ${pct(w1)} of units at a ${pct(d1)} defect rate; Factory 2 makes the rest at ${pct(d2)}. What fraction of all units are defective?`,
        pd, [round((d1 + d2) / 2, 5), round(w1 * d1, 5), round(d1 + d2, 5), round((1 - w1) * d2, 5)],
        `Law of total probability: $P(D)=(${fmt(w1, 2)})(${fmt(d1, 2)})+(${fmt(round(1 - w1, 2), 2)})(${fmt(d2, 2)})=${fmt(pd, 5)}$. Averaging the two rates is only valid if the shares are equal — here they are not.`,
        prob, TIER_DIFF.medium);
    }),
    T("hard", () => {
      const R = rint(5, 12), B = rint(3, 10);
      const p2 = (R - 1) / (R + B - 1);
      return build(`A bag has ${R} red and ${B} blue balls. You draw 2 without replacement. Given the first is red, find $P(\\text{second is red})$.`,
        round(p2, 4), [round(R / (R + B), 4), round((R - 1) / (R + B), 4), round(R / (R + B - 1), 4), round((R - 1) / (R + B - 2), 4)],
        `Condition on the first red being gone: ${R - 1} reds remain among $${R + B} - 1 = ${R + B - 1}$ balls, so $\\dfrac{${R - 1}}{${R + B - 1}}=${fmt(p2, 4)}$. Using $\\tfrac{R}{R+B}$ forgets the ball already removed.`,
        prob, TIER_DIFF.hard);
    }),
    T("superhard", () => {
      const R = rint(3, 9), B = rint(4, 13);
      const E = (R + B + 1) / (R + 1); // expected # draws to first red, without replacement
      return build(`A bag has ${R} red and ${B} blue balls. You draw one at a time WITHOUT replacement until the first red appears. Find the expected number of draws.`,
        round(E, 4), [round((R + B) / R, 4), round(1 + B / (R + 1), 4) + 0.0, round((R + B) / (R + 1), 4), round((B + 1) / (R + 1), 4)],
        `The ${B} blue balls split into ${R + 1} gaps around the ${R} reds; by symmetry each gap holds on average $\\tfrac{${B}}{${R + 1}}$ blues, and you draw those plus the red itself: $1+\\dfrac{${B}}{${R + 1}}=\\dfrac{${R + B + 1}}{${R + 1}}=${fmt(E, 4)}$. The with-replacement answer $\\tfrac{R+B}{R}=\\tfrac1p$ is the trap — it ignores that draws are dependent.`,
        prob, TIER_DIFF.superhard);
    }),
  ],

  "bayes-theorem": [
    T("easy", () => {
      const pa = rstep(0.3, 0.6, 0.05), bGivenA = rstep(0.6, 0.9, 0.05), bGivenAc = rstep(0.1, 0.3, 0.05);
      const denom = pa * bGivenA + (1 - pa) * bGivenAc;
      const post = (pa * bGivenA) / denom;
      return build(`$P(A)=${fmt(pa, 2)}$, $P(B\\mid A)=${fmt(bGivenA, 2)}$, $P(B\\mid A^c)=${fmt(bGivenAc, 2)}$. Find $P(A\\mid B)$.`,
        round(post, 4), [bGivenA, round(pa * bGivenA, 4), pa, round(denom, 4)],
        `Bayes: $\\dfrac{P(A)P(B\\mid A)}{P(A)P(B\\mid A)+P(A^c)P(B\\mid A^c)}=\\dfrac{(${fmt(pa, 2)})(${fmt(bGivenA, 2)})}{${fmt(denom, 4)}}=${fmt(post, 4)}$. The numerator alone (the joint) is the common miss.`,
        prob, TIER_DIFF.easy);
    }),
    T("medium", () => {
      // two urns, pick one at random, draw a red
      const rA = rint(2, 6), nA = rA + rint(2, 6), rB = rint(1, 5), nB = rB + rint(3, 7);
      const pRedA = rA / nA, pRedB = rB / nB;
      const post = (0.5 * pRedA) / (0.5 * pRedA + 0.5 * pRedB);
      return build(`Urn A holds ${rA} red of ${nA} balls; Urn B holds ${rB} red of ${nB}. You pick an urn at random and draw a red ball. Find $P(\\text{Urn A}\\mid \\text{red})$.`,
        round(post, 4), [round(pRedA, 4), round(pRedB, 4), round(0.5 * pRedA, 4), round(pRedA * pRedB, 4)],
        `Each urn is equally likely, so the equal priors cancel: $\\dfrac{P(\\text{red}\\mid A)}{P(\\text{red}\\mid A)+P(\\text{red}\\mid B)}=\\dfrac{${fmt(pRedA, 4)}}{${fmt(pRedA, 4)}+${fmt(pRedB, 4)}}=${fmt(post, 4)}$. Using only $P(\\text{red}\\mid A)$ forgets to normalise over both urns.`,
        prob, TIER_DIFF.medium);
    }),
    T("hard", () => {
      const prev = pick([0.01, 0.02, 0.05, 0.1]), se = pick([0.9, 0.95, 0.98, 0.99]), sp = pick([0.9, 0.95, 0.98, 0.99]);
      const post = (prev * se) / (prev * se + (1 - prev) * (1 - sp));
      return build(`A condition has prevalence ${pct(prev)}; a test has sensitivity ${pct(se)} and specificity ${pct(sp)}. Given a POSITIVE result, find $P(\\text{has condition}\\mid +)$.`,
        round(post, 4), [se, prev, round(prev * se, 4), round(se * sp, 4)],
        `Bayes: $\\dfrac{(${fmt(prev, 2)})(${fmt(se, 2)})}{(${fmt(prev, 2)})(${fmt(se, 2)})+(${fmt(round(1 - prev, 2), 2)})(${fmt(round(1 - sp, 2), 2)})}=${fmt(post, 4)}$. The base rate dominates: false positives from the huge healthy group rival the true positives, so the answer sits far below the sensitivity ${pct(se)}.`,
        prob, TIER_DIFF.hard);
    }),
    T("superhard", () => {
      // three machines, find P(machine 3 | defective)
      const s1 = rstep(0.2, 0.4, 0.05), s2 = rstep(0.3, 0.4, 0.05);
      const s3 = round(1 - s1 - s2, 4);
      const d1 = rstep(0.01, 0.03, 0.01), d2 = rstep(0.02, 0.04, 0.01), d3 = rstep(0.03, 0.06, 0.01);
      const denom = s1 * d1 + s2 * d2 + s3 * d3;
      const post = (s3 * d3) / denom;
      return build(`Three machines make ${pct(s1)}, ${pct(s2)}, ${pct(s3)} of output at defect rates ${pct(d1)}, ${pct(d2)}, ${pct(d3)}. A defective unit is found. Find $P(\\text{machine 3}\\mid \\text{defective})$.`,
        round(post, 4), [round(s3 * d3, 4), d3, round(denom, 4), round((s3 * d3) / (s1 * d1 + s2 * d2), 4)],
        `Extended Bayes over three causes: $\\dfrac{s_3 d_3}{s_1 d_1+s_2 d_2+s_3 d_3}=\\dfrac{(${fmt(s3, 2)})(${fmt(d3, 2)})}{${fmt(denom, 5)}}=${fmt(post, 4)}$. The trap is dividing by only the other machines, or stopping at the joint $s_3 d_3$ without normalising over the total defect probability.`,
        prob, TIER_DIFF.superhard);
    }),
    T("hard", () => {
      // Law of total probability over overlapping segments (only-life / only-health / both).
      const L = pick([0.40, 0.45, 0.50, 0.55]);
      const H = pick([0.40, 0.45, 0.50]);
      const B = rstep(0.15, Math.min(L, H) - 0.05, 0.05);
      const onlyL = round(L - B, 4), onlyH = round(H - B, 4);
      const rL = pick([0.30, 0.35, 0.40]), rH = pick([0.50, 0.55, 0.60]), rB = pick([0.70, 0.75, 0.80]);
      const renew = round(rL * onlyL + rH * onlyH + rB * B, 4);
      const noCarveOut = round(rL * L + rH * H - rB * B, 4); // applied rates to full %s
      return build(
        `Among an insurer's policyholders, $${pct(L)}$ hold a life policy, $${pct(H)}$ a health policy, and $${pct(B)}$ hold both. Next year, $${pct(rL)}$ of life-ONLY holders, $${pct(rH)}$ of health-ONLY holders, and $${pct(rB)}$ of those with BOTH will renew. For a random policyholder, find the probability they renew a life or health policy next year.`,
        renew, [noCarveOut, round(L + H - B, 4), round(rB * B, 4), round(renew / (L + H - B), 4)],
        `Carve the holders into disjoint segments first: life-only $=${fmt(L, 2)}-${fmt(B, 2)}=${fmt(onlyL, 4)}$, health-only $=${fmt(onlyH, 4)}$, both $=${fmt(B, 2)}$. Law of total probability: $${fmt(rL, 2)}(${fmt(onlyL, 4)})+${fmt(rH, 2)}(${fmt(onlyH, 4)})+${fmt(rB, 2)}(${fmt(B, 2)})=${fmt(renew, 4)}$. Applying the renewal rates to the FULL life/health percentages double-counts the "both" group — the trap.`,
        prob, TIER_DIFF.hard);
    }),
  ],

  "independence": [
    T("easy", () => {
      const a = rstep(0.3, 0.7, 0.05), b = rstep(0.3, 0.7, 0.05);
      return build(`$A$ and $B$ are independent with $P(A)=${fmt(a, 2)}$, $P(B)=${fmt(b, 2)}$. Find $P(A\\cap B)$.`,
        round(a * b, 4), [round(a + b, 4), round(a + b - a * b, 4), a, round((a + b) / 2, 4)],
        `Independence multiplies: $P(A\\cap B)=P(A)P(B)=(${fmt(a, 2)})(${fmt(b, 2)})=${fmt(a * b, 4)}$. Adding is for mutually exclusive events, not independent ones.`,
        prob, TIER_DIFF.easy);
    }),
    T("medium", () => {
      const n = rint(3, 7), p = rstep(0.55, 0.95, 0.01);
      const atLeastOne = round(1 - (1 - p) ** n, 5);
      return build(`${n} components each work independently with probability $${fmt(p, 2)}$. Find $P(\\text{at least one works})$.`,
        atLeastOne, [round(p ** n, 5), round(1 - p ** n, 5), round(n * p * (1 - p), 5), round((1 - p) ** n, 5)],
        `Complement: $1-P(\\text{none})=1-(1-${fmt(p, 2)})^{${n}}=${fmt(atLeastOne, 5)}$. Multiplying failure probabilities is valid only under independence.`,
        prob, TIER_DIFF.medium);
    }),
    T("hard", () => {
      // series of two parallel pairs: P(system) = [1-(1-p)^2]^2
      const p = rstep(0.6, 0.95, 0.01);
      const par = 1 - (1 - p) ** 2;
      const sys = round(par * par, 5);
      return build(`A system has two stages in series; each stage is two identical components in parallel, each working with probability $${fmt(p, 2)}$. Find $P(\\text{system works})$.`,
        sys, [round(p ** 4, 5), round(par, 5), round(1 - (1 - p) ** 4, 5), round(p * p, 5)],
        `Each parallel stage works with $1-(1-${fmt(p, 2)})^2=${fmt(par, 5)}$. The two stages are in series (both required), so multiply: $${fmt(par, 5)}^2=${fmt(sys, 5)}$. Treating all four as one parallel block ($1-(1-p)^4$) ignores the series structure.`,
        prob, TIER_DIFF.hard);
    }),
    T("superhard", () => {
      const n = rint(4, 6), p = rstep(0.55, 0.85, 0.01), k = rint(2, n - 1);
      let atLeastK = 0;
      for (let j = k; j <= n; j++) atLeastK += nCr(n, j) * p ** j * (1 - p) ** (n - j);
      atLeastK = round(atLeastK, 5);
      const exactlyK = round(nCr(n, k) * p ** k * (1 - p) ** (n - k), 5);
      return build(`A redundant system of ${n} independent units (each up with prob $${fmt(p, 2)}$) needs at least ${k} working to function. Find $P(\\text{functions})$.`,
        atLeastK, [exactlyK, round(p ** n, 5), round(1 - (1 - p) ** n, 5), round(k / n, 5)],
        `Sum the binomial tail $\\sum_{j=${k}}^{${n}}\\binom{${n}}{j}p^{j}(1-p)^{${n}-j}=${fmt(atLeastK, 5)}$. Using only the $j=${k}$ term ($${fmt(exactlyK, 5)}$) answers "exactly ${k}", not "at least ${k}" — the classic k-out-of-n trap.`,
        prob, TIER_DIFF.superhard);
    }),
  ],

  "expectation-and-variance": [
    T("easy", () => {
      const s = rint(4, 20);
      const e = (s + 1) / 2;
      return build(`A fair ${s}-sided die is rolled once. Find the expected value of the result.`,
        round(e, 4), [round(s / 2, 4), round((s + 1) / 2 + 1, 4), s, round(s / 2 + 1, 4)],
        `For a discrete uniform on $1..${s}$, $E[X]=\\dfrac{1+${s}}{2}=${fmt(e, 4)}$. Using $\\tfrac{${s}}{2}$ forgets the $+1$ from starting at 1.`,
        prob, TIER_DIFF.easy);
    }),
    T("easy", () => {
      const win = rint(5, 40), pH = rstep(0.3, 0.7, 0.05);
      const e = pH * win;
      return build(`A game pays $\\$${win}$ if a biased coin (heads with probability $${fmt(pH, 2)}$) lands heads, and $\\$0$ otherwise. Find the expected payout.`,
        round(e, 4), [round(win / 2, 4), round(pH * win * (1 - pH), 4), round(win, 4), round((1 - pH) * win, 4)],
        `Expected payout weights each outcome by its probability: $${fmt(pH, 2)}\\cdot${win}+${fmt(round(1 - pH, 2), 2)}\\cdot 0=${fmt(e, 4)}$. Splitting the prize in half ignores that heads is not 50/50 here.`,
        prob, TIER_DIFF.easy);
    }),
    T("medium", () => {
      const varX = rint(2, 9), a = rint(2, 4), b = rint(1, 6);
      const ans = a * a * varX;
      return build(`$X$ has $\\mathrm{Var}(X)=${varX}$. Find $\\mathrm{Var}(${a}X+${b})$.`,
        ans, [a * varX, a * a * varX + b, a * varX + b, varX],
        `$\\mathrm{Var}(aX+b)=a^2\\mathrm{Var}(X)$: the shift $+${b}$ contributes nothing, the scale enters squared, so $${a}^2\\cdot${varX}=${ans}$. Using $a$ not $a^2$, or adding $b$, are the usual errors.`,
        integer, TIER_DIFF.medium);
    }),
    T("hard", () => {
      const s = rint(4, 40);
      const p = 1 / s, e = 1 / p;
      return build(`You roll a fair ${s}-sided die repeatedly until a specific face appears. Find the expected number of rolls.`,
        round(e, 4), [round(s / 2, 4), round(s - 1, 4), round(s + 1, 4), round(1 / (1 - p), 4)],
        `The number of trials to the first success is geometric with $p=\\tfrac1{${s}}$, so $E[N]=\\tfrac1p=${s}$. The intuition "halfway" ($s/2$) is wrong for a waiting time.`,
        prob, TIER_DIFF.hard);
    }),
    T("superhard", () => {
      const M = rint(8, 45);
      // roll a 6-sided die; on a 6 win M; else reroll with prize halved each time
      // E = sum_{k>=1} (5/6)^{k-1}(1/6) M (1/2)^{k-1} = (M/6) * 1/(1-5/12) = 2M/7
      const e = (2 * M) / 7;
      return build(`You roll a fair die for a prize of $\\$${M}$. On a 6 you win the current prize; on 1–5 you roll again but the prize HALVES. Find the expected winnings.`,
        round(e, 4), [round(M / 6, 4), round(M / 2, 4), round(M / 7, 4), round((5 * M) / 12, 4)],
        `Win on roll $k$ with probability $(5/6)^{k-1}(1/6)$ for prize $${M}(1/2)^{k-1}$. Summing, $E=\\tfrac{${M}}{6}\\sum_{k\\ge1}(5/12)^{k-1}=\\tfrac{${M}}{6}\\cdot\\tfrac1{1-5/12}=\\tfrac{2\\cdot${M}}{7}=${fmt(e, 4)}$. The trap is ignoring that BOTH the win-probability and the prize decay geometrically — their product gives ratio $5/12$, not $5/6$.`,
        prob, TIER_DIFF.superhard);
    }),
  ],

  "common-discrete-distributions": [
    T("easy", () => {
      const n = rint(8, 15), p = rstep(0.2, 0.6, 0.05);
      return build(`$X\\sim\\text{Binomial}(n=${n}, p=${fmt(p, 2)})$. Find $E[X]$.`,
        round(n * p, 4), [round(n * p * (1 - p), 4), round(p, 4), round(n / 2, 4), round(Math.sqrt(n * p * (1 - p)), 4)],
        `Binomial mean is $np=${n}\\cdot${fmt(p, 2)}=${fmt(n * p, 4)}$. The value $np(1-p)$ is the VARIANCE, a common mix-up.`,
        prob, TIER_DIFF.easy);
    }),
    T("medium", () => {
      const n = rint(6, 12), p = rstep(0.2, 0.5, 0.05);
      const k = rint(2, Math.min(n - 1, Math.round(n * p) + 2));
      const pr = nCr(n, k) * p ** k * (1 - p) ** (n - k);
      return build(`$X\\sim\\text{Binomial}(n=${n}, p=${fmt(p, 2)})$. Find $P(X=${k})$.`,
        round(pr, 4), [round(p ** k * (1 - p) ** (n - k), 4), round(nCr(n, k) * p ** k, 4), round(n * p / n, 4), round(pr * 1.4, 4)],
        `$\\binom{${n}}{${k}}(${fmt(p, 2)})^{${k}}(${fmt(round(1 - p, 2), 2)})^{${n - k}}=${fmt(pr, 4)}$. Dropping the coefficient $\\binom{${n}}{${k}}$ is the classic error.`,
        prob, TIER_DIFF.medium);
    }),
    T("hard", () => {
      const lam = rstep(1.0, 6.0, 0.1);
      const k = rint(1, 5);
      const pr = Math.exp(-lam) * lam ** k / fact(k);
      return build(`Claims arrive $\\sim\\text{Poisson}(\\lambda=${fmt(lam, 1)})$ per day. Find $P(X=${k})$ on a given day.`,
        round(pr, 4), [round(lam ** k / fact(k), 4), round(Math.exp(-lam) * lam ** k, 4), round(Math.exp(-lam), 4), round(pr * 1.3, 4)],
        `Poisson pmf: $e^{-${fmt(lam, 1)}}\\dfrac{${fmt(lam, 1)}^{${k}}}{${k}!}=${fmt(pr, 4)}$. Forgetting the $e^{-\\lambda}$ factor or the $k!$ are the usual slips.`,
        prob, TIER_DIFF.hard);
    }),
    T("superhard", () => {
      const lam = rstep(1.0, 5.0, 0.1);
      const pGE2 = 1 - Math.exp(-lam) * (1 + lam);
      return build(`Claims $\\sim\\text{Poisson}(\\lambda=${fmt(lam, 1)})$. Find $P(X\\ge 2)$.`,
        round(pGE2, 4), [round(1 - Math.exp(-lam), 4), round(Math.exp(-lam) * (1 + lam), 4), round(1 - Math.exp(-lam) * lam, 4), round(Math.exp(-lam) * lam ** 2 / 2, 4)],
        `Complement of the first two terms: $1-P(0)-P(1)=1-e^{-${fmt(lam, 1)}}(1+${fmt(lam, 1)})=${fmt(pGE2, 4)}$. Stopping at $1-P(0)$ forgets to also remove $P(1)$ — the trap.`,
        prob, TIER_DIFF.superhard);
    }),
  ],

  "common-continuous-distributions": [
    T("easy", () => {
      const a = rint(0, 4), b = a + rint(4, 10), t = rint(a + 1, b - 1);
      const p = (b - t) / (b - a);
      return build(`$X$ is uniform on $[${a}, ${b}]$. Find $P(X > ${t})$.`,
        round(p, 4), [round((t - a) / (b - a), 4), round(t / b, 4), round((b - t) / b, 4), round(1 / (b - a), 4)],
        `For a uniform, probability is proportional to length: $\\dfrac{${b}-${t}}{${b}-${a}}=${fmt(p, 4)}$. Using $P(X<t)$ or dividing by $b$ instead of the interval length are the slips.`,
        prob, TIER_DIFF.easy);
    }),
    T("medium", () => {
      const theta = pick([2, 3, 4, 5, 8]), t = rint(1, theta * 2);
      const p = Math.exp(-t / theta);
      return build(`$X\\sim\\text{Exponential}$ with mean $${theta}$. Find $P(X > ${t})$.`,
        round(p, 4), [round(Math.exp(-t * theta), 4), round(1 - Math.exp(-t / theta), 4), round(t / theta, 4), round(Math.exp(-theta / t), 4)],
        `Exponential survival: $P(X>t)=e^{-t/\\theta}=e^{-${t}/${theta}}=${fmt(p, 4)}$. Using rate $\\lambda=1/\\theta$ wrong way up ($e^{-t\\theta}$) is the trap.`,
        prob, TIER_DIFF.medium);
    }),
    T("hard", () => {
      const theta = pick([2, 3, 4, 5]), s = rint(2, 4), t = rint(1, 4);
      const p = Math.exp(-t / theta); // memoryless
      return build(`$X\\sim\\text{Exponential}$ with mean $${theta}$. Find $P(X > ${s + t} \\mid X > ${s})$.`,
        round(p, 4), [round(Math.exp(-(s + t) / theta), 4), round(Math.exp(-s / theta), 4), round(Math.exp(-(s + t) / theta) / Math.exp(-t / theta), 4), round((s + t) / theta, 4)],
        `The exponential is MEMORYLESS: $P(X>${s}+${t}\\mid X>${s})=P(X>${t})=e^{-${t}/${theta}}=${fmt(p, 4)}$. Plugging $s+t$ into the survival function (ignoring memorylessness) is the trap.`,
        prob, TIER_DIFF.hard);
    }),
    T("superhard", () => {
      const theta = pick([3, 4, 5, 6]), n = rint(2, 4), t = rint(1, 5);
      // min of n iid Exp(mean theta) is Exp(mean theta/n)
      const p = Math.exp(-n * t / theta);
      return build(`$X_1,\\dots,X_${n}$ are i.i.d. Exponential each with mean $${theta}$. Find $P(\\min_i X_i > ${t})$.`,
        round(p, 4), [round(Math.exp(-t / theta), 4), round(1 - Math.exp(-n * t / theta), 4), round(Math.exp(-t / (n * theta)), 4), round((Math.exp(-t / theta)) ** (1 / n), 4)],
        `The min exceeds $t$ iff ALL exceed $t$: $\\prod e^{-t/\\theta}=e^{-${n}t/\\theta}=e^{-${n * t}/${theta}}=${fmt(p, 4)}$. Equivalently the min is Exponential with mean $\\theta/${n}$. Using a single exponential forgets the other ${n - 1} independent variables.`,
        prob, TIER_DIFF.superhard);
    }),
  ],

  /* ───────────────────────── EXAM FM templates ───────────────────────── */

  "interest-and-accumulation": [
    T("easy", () => {
      const P = pick([1000, 2000, 5000, 1500]), i = pick([0.04, 0.05, 0.06, 0.08]), n = rint(3, 10);
      const av = P * (1 + i) ** n;
      return build(`$\\$${P}$ is invested at ${pct(i)} effective annual interest for ${n} years. Find the accumulated value.`,
        round(av, 2), [round(P * (1 + n * i), 2), round(P * (1 + i) ** (n - 1), 2), round(P + P * i * n + 1, 2), round(P * (1 + i / n) ** n, 2)],
        `Compound accumulation: $${P}(1+${fmt(i, 2)})^{${n}}=${money(round(av, 2)).slice(2, -1)}$. Using simple interest $P(1+ni)$ understates it — the trap when the problem says "effective".`,
        money, TIER_DIFF.easy);
    }),
    T("medium", () => {
      const F = pick([5000, 10000, 8000]), i = pick([0.05, 0.06, 0.07]), n = rint(4, 12);
      const pv = F * vOf(i) ** n;
      return build(`A payment of $\\$${F}$ is due in ${n} years. At ${pct(i)} effective, find its present value.`,
        round(pv, 2), [round(F * (1 - n * i), 2), round(F * vOf(i) ** (n - 1), 2), round(F / (1 + n * i), 2), round(F * (1 + i) ** n, 2)],
        `Discount: $${F}\\,v^{${n}}=${F}(1+${fmt(i, 2)})^{-${n}}=${money(round(pv, 2)).slice(2, -1)}$. Accumulating instead of discounting (using $(1+i)^n$) is the sign-of-time trap.`,
        money, TIER_DIFF.medium);
    }),
    T("hard", () => {
      const jm = rstep(0.04, 0.15, 0.005), m = pick([2, 4, 12]);
      const eff = (1 + jm / m) ** m - 1;
      return build(`A nominal annual rate of ${pct(jm)} is compounded ${m} times per year. Find the effective annual rate.`,
        round(eff, 5), [round(jm, 5), round((1 + jm) ** m - 1, 5), round(jm / m, 5), round((1 + jm / m) ** m, 5)],
        `Effective rate: $\\left(1+\\tfrac{${fmt(jm, 2)}}{${m}}\\right)^{${m}}-1=${fmt(eff, 5)}$. The nominal rate ${pct(jm)} itself is the distractor — it ignores intra-year compounding.`,
        prob, TIER_DIFF.hard);
    }),
    T("superhard", () => {
      const A = pick([1000, 2000, 3000]), B = pick([1500, 2500]), i = pick([0.05, 0.06, 0.08]);
      const t1 = rint(0, 1), t2 = rint(3, 4), valAt = 5;
      const val = A * (1 + i) ** (valAt - t1) + B * (1 + i) ** (valAt - t2);
      return build(`Deposits of $\\$${A}$ at time ${t1} and $\\$${B}$ at time ${t2} earn ${pct(i)} effective. Find the accumulated value at time ${valAt}.`,
        round(val, 2), [round((A + B) * (1 + i) ** valAt, 2), round(A * (1 + i) ** valAt + B * (1 + i) ** valAt, 2), round(A * (1 + i) ** (valAt - t2) + B * (1 + i) ** (valAt - t1), 2), round(A * (1 + i) ** t1 + B * (1 + i) ** t2, 2)],
        `Accumulate each deposit by its OWN time to ${valAt}: $${A}(1+${fmt(i, 2)})^{${valAt - t1}}+${B}(1+${fmt(i, 2)})^{${valAt - t2}}=${money(round(val, 2)).slice(2, -1)}$. The trap is using a single common exponent — each cash flow has a different time-to-valuation.`,
        money, TIER_DIFF.superhard);
    }),
    T("superhard", () => {
      // Time-varying force of interest: integrate δ_t over the year. a = 2b makes
      // ∫δ = ln(1+b t²) exact, so the accumulation factor is a clean ratio.
      const b = pick([0.05, 0.1, 0.15, 0.2]);
      const a = round(2 * b, 4);
      const k = rint(2, 5);
      const acc = round((1 + b * k * k) / (1 + b * (k - 1) * (k - 1)), 6);
      const iK = round(acc - 1, 4);
      const deltaAtK = round((a * k) / (1 + b * k * k), 4);
      return build(
        `The force of interest is $\\delta_t=\\dfrac{${fmt(a, 2)}\\,t}{1+${fmt(b, 2)}\\,t^2}$ for $t>0$. Find the effective annual rate of interest earned in year ${k} (from time ${k - 1} to time ${k}).`,
        iK, [deltaAtK, round(acc, 4), round((1 + b * (k - 1) * (k - 1)) / (1 + b * k * k) - 1, 4), round(iK * 1.5, 4)],
        `A rate over an interval needs the integral of the force: $\\int_{${k - 1}}^{${k}}\\delta_t\\,dt=\\big[\\ln(1+${fmt(b, 2)}t^2)\\big]_{${k - 1}}^{${k}}$ (here $\\tfrac{${fmt(a, 2)}}{2\\cdot${fmt(b, 2)}}=1$). The accumulation factor is $\\dfrac{1+${fmt(b, 2)}\\cdot${k}^2}{1+${fmt(b, 2)}\\cdot${k - 1}^2}=${fmt(acc, 4)}$, so $i_{${k}}=${fmt(acc, 4)}-1=${fmt(iK, 4)}$. Plugging $t=${k}$ into $\\delta_t$ (the instantaneous force $${fmt(deltaAtK, 4)}$) is the trap.`,
        prob, TIER_DIFF.superhard);
    }),
    T("superhard", () => {
      // Force ↔ nominal-convertible conversion, then solve for n.
      const delta = pick([0.02, 0.025, 0.03, 0.04, 0.05]);
      const Tdbl = round(Math.log(2) / delta, 2);
      const n = pick([40, 60, 80, 100]);
      const G = round((1 + 2 * delta) ** (n / 2), 2);
      const wrongNoConv = Math.round((2 * Math.log(G)) / Math.log(1 + delta));
      return build(
        `An investment of $1$ doubles in ${Tdbl} years at a constant force of interest $\\delta$. A separate investment of $1$ grows to $${G}$ in $n$ years at a nominal rate of interest numerically equal to $\\delta$, convertible once every two years. Find $n$.`,
        n, [n / 2, wrongNoConv, n * 2, Math.round(Tdbl)],
        `Doubling fixes the force: $\\delta=\\dfrac{\\ln 2}{${Tdbl}}=${fmt(delta, 4)}$. "Nominal $=\\delta$, convertible once every two years" makes the rate over each 2-year period $2\\delta=${fmt(2 * delta, 4)}$, so the accumulation is $(1+2\\delta)^{n/2}$. Solve $(1+${fmt(2 * delta, 4)})^{n/2}=${G}\\Rightarrow n=\\dfrac{2\\ln ${G}}{\\ln(1+${fmt(2 * delta, 4)})}=${n}$. Using $1+\\delta$ (forgetting the 2-year conversion) is the trap.`,
        integer, TIER_DIFF.superhard);
    }),
  ],

  "level-annuities": [
    T("easy", () => {
      const P = pick([1000, 500, 2000]), i = pick([0.05, 0.06, 0.08]), n = rint(5, 15);
      const pv = P * aImm(n, i);
      return build(`Find the present value of $\\$${P}$ paid at the END of each year for ${n} years at ${pct(i)} effective.`,
        round(pv, 2), [round(P * sImm(n, i), 2), round(P * aDue(n, i), 2), round(P * n * vOf(i) ** n, 2), round(P * aImm(n, i) * vOf(i), 2)],
        `Annuity-immediate PV: $${P}\\,a_{\\overline{${n}}|}=${P}\\cdot\\dfrac{1-v^{${n}}}{${fmt(i, 2)}}=${money(round(pv, 2)).slice(2, -1)}$. Using $s_{\\overline{n}|}$ gives the FUTURE value — the most common annuity slip.`,
        money, TIER_DIFF.easy);
    }),
    T("medium", () => {
      const P = pick([200, 300, 500]), i = pick([0.05, 0.06, 0.07]), n = rint(5, 12);
      const av = P * sImm(n, i);
      return build(`Find the accumulated value at the end of ${n} years of $\\$${P}$ deposited at the END of each year at ${pct(i)} effective.`,
        round(av, 2), [round(P * aImm(n, i), 2), round(P * n, 2), round(P * sImm(n, i) * vOf(i), 2), round(P * ((1 + i) ** n), 2)],
        `Annuity-immediate AV: $${P}\\,s_{\\overline{${n}}|}=${P}\\cdot\\dfrac{(1+${fmt(i, 2)})^{${n}}-1}{${fmt(i, 2)}}=${money(round(av, 2)).slice(2, -1)}$. Confusing it with the PV $a_{\\overline{n}|}$ is the trap.`,
        money, TIER_DIFF.medium);
    }),
    T("hard", () => {
      const target = pick([50000, 100000, 75000]), i = pick([0.05, 0.06, 0.07]), n = rint(10, 25);
      const pmt = target / sImm(n, i);
      return build(`How much must be deposited at the END of each year for ${n} years at ${pct(i)} to accumulate $\\$${target}$?`,
        round(pmt, 2), [round(target / aImm(n, i), 2), round(target / n, 2), round(target * i, 2), round(target / aDue(n, i), 2)],
        `Solve $X\\,s_{\\overline{${n}}|}=${target}$, so $X=\\dfrac{${target}}{s_{\\overline{${n}}|}}=${money(round(pmt, 2)).slice(2, -1)}$. Dividing by $a_{\\overline{n}|}$ (a PV factor) instead of $s_{\\overline{n}|}$ (an AV factor) is the trap.`,
        money, TIER_DIFF.hard);
    }),
    T("superhard", () => {
      const P = pick([1000, 1500, 2000]), i = pick([0.05, 0.06, 0.08]), n = rint(8, 12), defer = rint(3, 5);
      const pv = P * aImm(n, i) * vOf(i) ** defer;
      return build(`An annuity pays $\\$${P}$ at the end of each year for ${n} years, but the FIRST payment is at the end of year ${defer + 1}. At ${pct(i)} effective, find the present value today.`,
        round(pv, 2), [round(P * aImm(n, i), 2), round(P * aImm(n + defer, i), 2), round(P * aImm(n, i) * vOf(i) ** (defer - 1), 2), round(P * aImm(n - defer, i), 2)],
        `A deferred annuity: value the $${n}$-year annuity one period before its first payment, then discount ${defer} more years: $${P}\\,a_{\\overline{${n}}|}\\,v^{${defer}}=${money(round(pv, 2)).slice(2, -1)}$. Off-by-one on the deferral exponent (using $v^{${defer - 1}}$ or $v^{${defer + 1}}$) is the classic trap.`,
        money, TIER_DIFF.superhard);
    }),
  ],

  "loan-amortization": [
    T("easy", () => {
      const L = pick([10000, 20000, 15000]), i = pick([0.05, 0.06, 0.08]), n = rint(5, 15);
      const pmt = L / aImm(n, i);
      return build(`A $\\$${L}$ loan at ${pct(i)} effective is repaid by level END-of-year payments over ${n} years. Find the annual payment.`,
        round(pmt, 2), [round(L / sImm(n, i), 2), round(L / n, 2), round(L * i, 2), round(L * vOf(i) ** n, 2)],
        `Level payment: $X=\\dfrac{L}{a_{\\overline{${n}}|}}=\\dfrac{${L}}{a_{\\overline{${n}}|}}=${money(round(pmt, 2)).slice(2, -1)}$. The loan PV equals the PV of payments, so you divide by $a_{\\overline{n}|}$, not $s_{\\overline{n}|}$.`,
        money, TIER_DIFF.easy);
    }),
    T("medium", () => {
      const L = pick([10000, 20000, 15000]), i = pick([0.05, 0.06, 0.08]), n = rint(8, 15), k = rint(2, 5);
      const pmt = L / aImm(n, i);
      const bal = pmt * aImm(n - k, i);
      return build(`A $\\$${L}$ loan at ${pct(i)} is amortized over ${n} years with level payments. Find the outstanding balance just after the ${k}-th payment.`,
        round(bal, 2), [round(pmt * aImm(k, i), 2), round(L - k * pmt, 2), round(pmt * sImm(n - k, i), 2), round(L * (1 + i) ** k - pmt * k, 2)],
        `Prospective method: the balance equals the PV of the REMAINING $${n - k}$ payments, $X\\,a_{\\overline{${n - k}}|}=${money(round(bal, 2)).slice(2, -1)}$. Subtracting payments from principal ($L-k\\cdot X$) ignores interest and is wrong.`,
        money, TIER_DIFF.medium);
    }),
    T("hard", () => {
      const L = pick([10000, 20000, 25000]), i = pick([0.05, 0.06, 0.08]), n = rint(8, 15), t = rint(2, 5);
      const pmt = L / aImm(n, i);
      const interest = pmt * (1 - vOf(i) ** (n - t + 1));
      return build(`A $\\$${L}$ loan at ${pct(i)} is amortized with level payments over ${n} years. Find the INTEREST portion of the ${t}-th payment.`,
        round(interest, 2), [round(pmt * vOf(i) ** (n - t + 1), 2), round(L * i, 2), round(pmt - L * i, 2), round(pmt * (1 - vOf(i) ** (n - t)), 2)],
        `Interest in payment $t$ is $X\\,(1-v^{n-t+1})=${money(round(interest, 2)).slice(2, -1)}$; the rest is principal $X v^{n-t+1}$. Using $L\\cdot i$ only works for the FIRST payment — the trap once $t>1$.`,
        money, TIER_DIFF.hard);
    }),
    T("superhard", () => {
      const L = pick([10000, 20000, 30000]), i = pick([0.05, 0.06, 0.08]), n = rint(10, 20);
      const pmt = L / aImm(n, i);
      const totalInterest = pmt * n - L;
      return build(`A $\\$${L}$ loan at ${pct(i)} is repaid by level payments over ${n} years. Find the TOTAL interest paid over the life of the loan.`,
        round(totalInterest, 2), [round(L * i * n, 2), round(pmt * n, 2), round(L * ((1 + i) ** n - 1), 2), round(pmt * aImm(n, i), 2)],
        `Total paid is $n\\cdot X=${money(round(pmt * n, 2)).slice(2, -1)}$; subtract the principal $${L}$ to isolate interest: $${money(round(totalInterest, 2)).slice(2, -1)}$. Using $L\\cdot i\\cdot n$ (simple interest on the full balance) ignores that principal declines each year.`,
        money, TIER_DIFF.superhard);
    }),
  ],

  "bond-pricing": [
    T("easy", () => {
      const F = 1000, r = pick([0.04, 0.05, 0.06]), i = pick([0.05, 0.06, 0.07]), n = rint(5, 15);
      const price = F * r * aImm(n, i) + F * vOf(i) ** n;
      return build(`A $\\$1000$ par bond pays annual coupons at ${pct(r)} and matures in ${n} years. At a yield of ${pct(i)}, find the price.`,
        round(price, 2), [round(F * r * aImm(n, i), 2), round(F * vOf(i) ** n, 2), round(F * r * sImm(n, i) + F, 2), round(F + F * r * n, 2)],
        `Price = PV of coupons + PV of redemption: $${F}\\cdot${fmt(r, 2)}\\,a_{\\overline{${n}}|}+${F}v^{${n}}=${money(round(price, 2)).slice(2, -1)}$. Dropping either piece is the trap.`,
        money, TIER_DIFF.easy);
    }),
    T("medium", () => {
      const F = 1000, r = pick([0.06, 0.07, 0.08]), i = pick([0.04, 0.05]), n = rint(6, 12);
      const price = F * r * aImm(n, i) + F * vOf(i) ** n;
      const premium = price - F;
      return build(`A $\\$1000$ bond with ${pct(r)} annual coupons matures in ${n} years, priced to yield ${pct(i)}. Find the premium (price minus redemption).`,
        round(premium, 2), [round(F - price, 2), round(price, 2), round(F * (r - i) * n, 2), round(F * r * aImm(n, i), 2)],
        `Since the coupon ${pct(r)} exceeds the yield ${pct(i)}, the bond sells at a premium: price $${money(round(price, 2)).slice(2, -1)}$ minus par $${F}$ = $${money(round(premium, 2)).slice(2, -1)}$. A coupon-above-yield bond is ALWAYS a premium bond.`,
        money, TIER_DIFF.medium);
    }),
    T("hard", () => {
      const F = 1000, r = pick([0.05, 0.06, 0.07]), i = pick([0.05, 0.06, 0.07]), n = rint(8, 14), k = rint(2, 5);
      const price = F * r * aImm(n, i) + F * vOf(i) ** n;
      const book = F * r * aImm(n - k, i) + F * vOf(i) ** (n - k);
      return build(`A $\\$1000$ bond, ${pct(r)} annual coupons, ${n} years, yield ${pct(i)}. Find the book value just after the ${k}-th coupon.`,
        round(book, 2), [round(price, 2), round(F * r * aImm(k, i) + F * vOf(i) ** k, 2), round(F, 2), round(book * (1 + i), 2)],
        `Book value = PV of the REMAINING $${n - k}$ coupons plus redemption, at the original yield: $${F}\\cdot${fmt(r, 2)}\\,a_{\\overline{${n - k}}|}+${F}v^{${n - k}}=${money(round(book, 2)).slice(2, -1)}$. Re-pricing the full ${n}-year stream ignores the coupons already paid.`,
        money, TIER_DIFF.hard);
    }),
    T("superhard", () => {
      const F = 1000, r = pick([0.07, 0.08]), i = pick([0.05, 0.06]), nCall = rint(5, 8), nMat = nCall + rint(4, 7);
      const priceCall = F * r * aImm(nCall, i) + F * vOf(i) ** nCall;
      const priceMat = F * r * aImm(nMat, i) + F * vOf(i) ** nMat;
      const worst = Math.min(priceCall, priceMat);
      return build(`A $\\$1000$ bond pays ${pct(r)} annual coupons, is callable at par in ${nCall} years, and otherwise matures in ${nMat} years. To GUARANTEE a yield of at least ${pct(i)}, what price should an investor pay?`,
        round(worst, 2), [round(Math.max(priceCall, priceMat), 2), round((priceCall + priceMat) / 2, 2), round(F, 2), round(priceMat, 2)],
        `This is a premium bond (coupon ${pct(r)} > yield ${pct(i)}), so the issuer calls EARLY to stop overpaying coupons — worst case for the investor. Price at every call/maturity date and take the MINIMUM: call-date price $${money(round(priceCall, 2)).slice(2, -1)}$ vs maturity price $${money(round(priceMat, 2)).slice(2, -1)}$, so pay $${money(round(worst, 2)).slice(2, -1)}$. Paying the higher price risks a yield below ${pct(i)} if called — the yield-to-worst trap.`,
        money, TIER_DIFF.superhard);
    }),
  ],
};

/* ───────────────────────── no-repeat tracker ───────────────────────── */

// Tracks recent stems per concept to prevent repeats. Capped well above the
// "last 50" spec so a 100+-attempt audit sees zero repeats while staying cheap.
const RECENT_CAP = 220;
const recent: Record<string, string[]> = {};

function isRepeat(key: string, stem: string): boolean {
  return (recent[key]?.includes(stem)) ?? false;
}
function remember(key: string, stem: string) {
  (recent[key] ||= []).push(stem);
  if (recent[key].length > RECENT_CAP) recent[key].shift();
}

/* ───────────────────────── tier selection ───────────────────────── */

function templatesFor(conceptId: string, tier: Tier): Template[] {
  const all = GENERATORS[conceptId];
  if (!all) return [];
  const exact = all.filter((t) => t.tier === tier);
  if (exact.length) return exact;
  // fall back to the nearest available tier (search outward from requested)
  const idx = TIER_ORDER.indexOf(tier);
  for (let d = 1; d < TIER_ORDER.length; d++) {
    for (const cand of [idx - d, idx + d]) {
      if (cand < 0 || cand >= TIER_ORDER.length) continue;
      const got = all.filter((t) => t.tier === TIER_ORDER[cand]);
      if (got.length) return got;
    }
  }
  return all;
}

/** One fresh, non-repeating question of the requested tier. */
/* ───────────────────── concept-level study enrichment ─────────────────────
 * Trick, decode framework, sanity checks, and a (stem-aware) diagram are the
 * SAME for every question of a concept — they describe the method, not the
 * sampled numbers. So we attach them once, here, to every generated question
 * rather than hand-editing each template. A template can still override any
 * field via build(..., extra); enrich() only fills what's missing. The precise
 * per-question arithmetic stays in each question's `explain` (the solver's
 * Solution panel falls back to it when `steps` isn't set).
 */

interface ConceptEnrichment {
  trick: string;
  decode: { label: string; value: string }[];
  sanity: string[];
  /** Stem-aware so distribution buckets pick the right figure. */
  diagram?: (q: MasteryQuestion) => DiagramSpec | undefined;
}

const GENERIC_PROB_DECODE = [
  { label: "Experiment", value: "the random trial described in the stem" },
  { label: "Sample space", value: "every outcome that trial can produce" },
  { label: "Event", value: "the outcome whose probability is asked for" },
  { label: "Given", value: "any condition stated after “given”, “if”, or “knowing”" },
];
const GENERIC_PROB_SANITY = [
  "The probability lands in $[0,1]$.",
  "It moves the sensible way — extra information should push it up or down for a reason.",
  "It cross-checks against a diagram or the complement $1-P(\\text{not it})$.",
];

const CONCEPT_ENRICHMENT: Record<string, ConceptEnrichment> = {
  "sample-spaces-and-events": {
    trick: "Equally-likely outcomes → **favourable ÷ total**. Overlapping events → inclusion–exclusion: $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$.",
    decode: GENERIC_PROB_DECODE,
    sanity: GENERIC_PROB_SANITY,
    diagram: () => ({ kind: "venn-conditional", caption: "Sets in the sample space — the overlap is $A\\cap B$." }),
  },
  "counting-and-axioms": {
    trick: "See **“without replacement”** → hypergeometric $\\dfrac{\\binom{K}{k}\\binom{N-K}{n-k}}{\\binom{N}{n}}$, not $p^k$. See **“at least one”** → complement $1-P(\\text{none})$.",
    decode: GENERIC_PROB_DECODE,
    sanity: GENERIC_PROB_SANITY,
    diagram: () => ({ kind: "tree", caption: "Sequential draws — multiply along a path." }),
  },
  "conditional-probability": {
    trick: "$P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}$ — **shade $B$ first**; the answer is the share of $B$ that is also $A$. Conditioning **divides**, it never multiplies.",
    decode: GENERIC_PROB_DECODE,
    sanity: GENERIC_PROB_SANITY,
    diagram: () => ({ kind: "venn-conditional", caption: "Shade $B$, then read $A\\cap B$ as a fraction of it." }),
  },
  "bayes-theorem": {
    trick: "**Reverse the tree**: $P(A\\mid B)=\\dfrac{P(B\\mid A)\\,P(A)}{P(B)}$, with $P(B)$ from the law of total probability. The base rate $P(A)$ is the part everyone forgets.",
    decode: GENERIC_PROB_DECODE,
    sanity: [
      "The posterior is in $[0,1]$.",
      "With a rare prior, even a strong test gives a modest posterior — don't expect it near the sensitivity.",
      "Forward check: the branch probabilities under each hypothesis sum to $1$.",
    ],
    diagram: () => ({ kind: "tree", caption: "Forward tree gives $P(B)$; Bayes reads it backward." }),
  },
  "independence": {
    trick: "Independent $\\Rightarrow P(A\\cap B)=P(A)P(B)$ and $P(A\\mid B)=P(A)$. **Verify independence before multiplying** — it's the most common false assumption.",
    decode: GENERIC_PROB_DECODE,
    sanity: GENERIC_PROB_SANITY,
    diagram: () => ({ kind: "venn-conditional", caption: "Independence: knowing $B$ doesn't reshape $A$'s share." }),
  },
  "expectation-and-variance": {
    trick: "Linearity: $E[aX+b]=aE[X]+b$. Variance scales squared: $\\operatorname{Var}(aX+b)=a^2\\operatorname{Var}(X)$. Fast variance: $\\operatorname{Var}(X)=E[X^2]-(E[X])^2$.",
    decode: [
      { label: "Random variable", value: "what $X$ counts or measures" },
      { label: "Distribution", value: "the PMF/PDF or the table of $x$ with $P(X=x)$" },
      { label: "Asked", value: "a mean $E[\\cdot]$, a variance, or a function $E[g(X)]$" },
      { label: "Given", value: "parameters or a transformation $aX+b$" },
    ],
    sanity: [
      "Variance is $\\ge 0$.",
      "$E[X]$ falls inside the range of $X$.",
      "A scale change by $a$ multiplies $\\operatorname{Var}$ by $a^2$, not $a$.",
    ],
    diagram: () => ({ kind: "pmf-bars", caption: "$E[X]$ is the balance point of the distribution." }),
  },
  "common-discrete-distributions": {
    trick: "**Identify first.** Binomial (fixed $n$ trials): $\\binom{n}{k}p^k(1-p)^{n-k}$. Poisson (rate $\\lambda$): $\\dfrac{\\lambda^k e^{-\\lambda}}{k!}$. Geometric (first success): $(1-p)^{k-1}p$.",
    decode: GENERIC_PROB_DECODE,
    sanity: GENERIC_PROB_SANITY,
    diagram: (q) => /poisson|per (hour|minute|day|year)|rate \$?\\?lambda|arriv/i.test(q.q)
      ? { kind: "poisson-timeline", caption: "Events on a timeline at rate $\\lambda$." }
      : { kind: "pmf-bars", caption: "Discrete PMF — probability mass per outcome." },
  },
  "common-continuous-distributions": {
    trick: "Continuous → probabilities are **areas** under the density. Exponential is **memoryless**: $P(X>s+t\\mid X>s)=P(X>t)$. Normal → **standardize** $Z=\\dfrac{X-\\mu}{\\sigma}$, then read the table.",
    decode: GENERIC_PROB_DECODE,
    sanity: GENERIC_PROB_SANITY,
    diagram: (q) => /exponential|memoryless|lifetime|until.*(fail|arriv)|decay/i.test(q.q)
      ? { kind: "exponential", caption: "Exponential density $f(x)=\\lambda e^{-\\lambda x}$." }
      : { kind: "bell", caption: "Normal curve — area in the tails beyond $\\pm k\\sigma$." },
  },
  "interest-and-accumulation": {
    trick: "Accumulation $=\\exp\\!\\int_{t_1}^{t_2}\\delta_s\\,ds$ — a rate over an interval needs the **integral** of the force, not $\\delta$ at a point. Doubling time $T$ gives $\\delta=\\dfrac{\\ln 2}{T}$. A nominal rate convertible $m$ times/yr has per-period rate (nominal)$/m$.",
    decode: [
      { label: "Cash flows", value: "what is invested/paid and when" },
      { label: "Rate basis", value: "effective, nominal-convertible-$m$, or a force $\\delta_t$" },
      { label: "Asked", value: "an accumulated value, present value, or a rate" },
      { label: "Timing", value: "the interval each amount actually earns over" },
    ],
    sanity: [
      "For positive interest, accumulated value $>$ amount invested.",
      "An effective rate exceeds the nominal it came from once compounding is more than once a year.",
      "Discounting moves value backward in time; accumulating moves it forward.",
    ],
    diagram: () => undefined,
  },
};

/** Fill missing study-mode fields from the concept's enrichment (template wins). */
function enrich(conceptId: string, q: MasteryQuestion): MasteryQuestion {
  const e = CONCEPT_ENRICHMENT[conceptId];
  if (!e) return q;
  return {
    ...q,
    trick: q.trick ?? e.trick,
    decode: q.decode ?? e.decode,
    sanity: q.sanity ?? e.sanity,
    diagram: q.diagram ?? e.diagram?.(q),
  };
}

function genOne(conceptId: string, tier: Tier, usedThisSet: Set<string>): MasteryQuestion {
  const pool = templatesFor(conceptId, tier);
  if (!pool.length) return enrich(conceptId, GENERATORS[conceptId][0].gen());
  for (let attempt = 0; attempt < 80; attempt++) {
    const tpl = pick(pool);
    const q = tpl.gen();
    if (!usedThisSet.has(q.q) && !isRepeat(conceptId, q.q)) {
      usedThisSet.add(q.q);
      remember(conceptId, q.q);
      return enrich(conceptId, q);
    }
  }
  const q = pick(pool).gen();
  usedThisSet.add(q.q);
  remember(conceptId, q.q);
  return enrich(conceptId, q);
}

/** A balanced exam ladder of `count` tiers — always opens easy, always ends superhard. */
function defaultLadder(count: number): Tier[] {
  if (count <= 1) return ["medium"];
  const out: Tier[] = ["easy"];
  const mid = count - 2;
  const cycle: Tier[] = ["medium", "hard", "medium", "easy", "hard"];
  for (let k = 0; k < mid; k++) out.push(cycle[k % cycle.length]);
  out.push("superhard"); // every real sitting ends on a sweat
  return out.slice(0, count);
}

/** Ladder centred on a student's current tier (still warms up and still sweats). */
function studentLadder(count: number, cur: Tier): Tier[] {
  if (count <= 1) return [cur];
  const ci = TIER_ORDER.indexOf(cur);
  const out: Tier[] = ["easy"];
  for (let k = 0; k < count - 2; k++) {
    const off = (k % 3) - 1; // -1, 0, +1 around the current tier
    out.push(TIER_ORDER[clamp(ci + off, 0, 3)]);
  }
  out.push("superhard");
  return out.slice(0, count);
}

/* ───────────────────────── per-student tier persistence ───────────────────────── */

const tierStoreKey = (slug: string, concept: string) => `forge:tier:${slug}:${concept}`;

export function currentTier(slug: string, concept: string): Tier {
  if (typeof window === "undefined") return "easy";
  try {
    const v = window.localStorage.getItem(tierStoreKey(slug, concept)) as Tier | null;
    return v && TIER_ORDER.includes(v) ? v : "easy";
  } catch {
    return "easy";
  }
}

/** Pass bumps the tier up, fail bumps it down (clamped). Returns the new tier. */
export function recordTierResult(slug: string, concept: string, passed: boolean): Tier {
  const cur = currentTier(slug, concept);
  const next = TIER_ORDER[clamp(TIER_ORDER.indexOf(cur) + (passed ? 1 : -1), 0, 3)];
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(tierStoreKey(slug, concept), next); } catch { /* ignore */ }
  }
  return next;
}

/* ───────────────────────── public api ───────────────────────── */

export function hasGenerator(conceptId: string): boolean {
  return (GENERATORS[conceptId]?.length ?? 0) > 0;
}

/** Tiers actually available for a concept (for analytics / tests). */
export function tiersAvailable(conceptId: string): Tier[] {
  const all = GENERATORS[conceptId];
  if (!all) return [];
  return TIER_ORDER.filter((t) => all.some((x) => x.tier === t));
}

/**
 * Fresh, parameter-randomized, difficulty-laddered question set. Resamples every
 * call and rejects any stem seen in the last 50 — retakes never repeat. Every
 * sitting of >=6 questions includes a superhard.
 */
export function generateQuestions(conceptId: string, count: number): MasteryQuestion[] {
  if (!GENERATORS[conceptId]) return [];
  const used = new Set<string>();
  return defaultLadder(count).map((tier) => genOne(conceptId, tier, used));
}

/** Like generateQuestions but centred on the student's persisted tier. */
export function generateForStudent(slug: string, conceptId: string, count: number): MasteryQuestion[] {
  if (!GENERATORS[conceptId]) return [];
  const used = new Set<string>();
  return studentLadder(count, currentTier(slug, conceptId)).map((tier) => genOne(conceptId, tier, used));
}

/** Generate `count` questions all at one tier (for targeted drills / tests). */
export function generateByTier(conceptId: string, tier: Tier, count: number): MasteryQuestion[] {
  if (!GENERATORS[conceptId]) return [];
  const used = new Set<string>();
  return Array.from({ length: count }, () => genOne(conceptId, tier, used));
}
