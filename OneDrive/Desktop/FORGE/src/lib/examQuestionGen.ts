/**
 * examQuestionGen, non-exhaustible, DIFFICULTY-TIERED mastery questions.
 *
 * Each concept registers PARAMETERIZED templates tagged with a difficulty tier
 * (easy → medium → hard → superhard). Every sitting resamples parameters, so the
 * numbers and the correct answer change on every attempt, a student can retake
 * 100 times and never see the identical question twice (enforced by a per-concept
 * last-50 ring buffer that rejects a repeated stem).
 *
 * Tiers, by design:
 * easy one formula, one step, no trap.
 * medium two steps / combine two ideas.
 * hard multi-step, integrates 3+ ideas, contains a classic trap.
 * superhard exam-level-and-beyond; every sitting of >=6 includes one.
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
 *, the tempting wrong answers the SOA actually writes, not random noise.
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
// Render amounts as a plain number inside one $...$ span. A literal `\$` cannot
// be shown here: renderRichText's tokenizer treats the `$` in `\$` as a closing
// delimiter, so `$\$1000$` garbles to "\1000$". Number-in-math reads cleanly.
const money = (v: number) => `$${(Math.round(v * 100) / 100)}$`;
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
 prob, TIER_DIFF.easy, { diagram: { kind: "venn-conditional", caption: "Mutually exclusive: circles never overlap. P(A∩B) = 0.", labels: { pA: a, pB: b, pAB: 0 } } });
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
 `Inclusion, exclusion: $P(A\\cup B)=${fmt(a, 2)}+${fmt(b, 2)}-${fmt(both, 2)}=${fmt(union, 2)}$. "Neither" is the complement of the union: $1-${fmt(union, 2)}=${fmt(neither, 4)}$. Forgetting to add back the overlap gives $1-(${fmt(a, 2)}+${fmt(b, 2)})$.`,
 prob, TIER_DIFF.medium);
 }),
 T("hard", () => {
 const a = rstep(0.4, 0.6, 0.05), b = rstep(0.4, 0.6, 0.05), c = rstep(0.3, 0.5, 0.05);
 const ab = rstep(0.15, 0.3, 0.05), ac = rstep(0.1, 0.25, 0.05), bc = rstep(0.1, 0.25, 0.05);
 const abc = rstep(0.05, Math.min(ab, ac, bc) - 0.0, 0.05) || 0.05;
 const u = round(a + b + c - ab - ac - bc + abc, 4);
 return build(`$P(A)=${fmt(a, 2)},P(B)=${fmt(b, 2)},P(C)=${fmt(c, 2)}$; pairwise $P(A\\cap B)=${fmt(ab, 2)},P(A\\cap C)=${fmt(ac, 2)},P(B\\cap C)=${fmt(bc, 2)}$; $P(A\\cap B\\cap C)=${fmt(abc, 2)}$. Find $P(A\\cup B\\cup C)$.`,
 u, [round(a + b + c, 4), round(a + b + c - ab - ac - bc, 4), round(a + b + c - ab - ac - bc - abc, 4), round(a + b + c + abc, 4)],
 `Three-set inclusion, exclusion: add singles, subtract the three pairwise overlaps, add back the triple: $${fmt(a, 2)}+${fmt(b, 2)}+${fmt(c, 2)}-${fmt(ab, 2)}-${fmt(ac, 2)}-${fmt(bc, 2)}+${fmt(abc, 2)}=${fmt(u, 4)}$. The classic trap is the sign on the triple term, it is ADDED back.`,
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
 prob, TIER_DIFF.superhard, { diagram: { kind: "venn-conditional", caption: `P(exactly one) = P(A∪B) − P(A∩B) = ${fmt(u, 2)} − ${fmt(both, 4)} = ${fmt(exactlyOne, 4)}`, labels: { pA: a, pB: b, pAB: both } } });
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
 `Hypergeometric: $\\dfrac{\\binom{${K}}{${k}}\\binom{${N - K}}{${n - k}}}{\\binom{${N}}{${n}}}=${fmt(p, 4)}$. Using the binomial $\\binom{${n}}{${k}}p^{${k}}(1-p)^{${n - k}}$ is the trap, it assumes replacement.`,
 prob, TIER_DIFF.hard);
 }),
 T("superhard", () => {
 const m = rint(4, 9), w = rint(3, 8), k = rint(2, 3);
 const pNoWomen = nCr(m, k) / nCr(m + w, k);
 const atLeastOne = round(1 - pNoWomen, 4);
 return build(`A group has ${m} men and ${w} women. A committee of ${k} is chosen at random. Find $P(\\text{at least one woman})$.`,
 atLeastOne, [round(pNoWomen, 4), round((w / (m + w)) * 3, 4), round(nCr(w, 1) / nCr(m + w, k), 4), round(w / (m + w), 4)],
 `Complement is fastest: $P(\\text{no women})=\\dfrac{\\binom{${m}}{${k}}}{\\binom{${m + w}}{${k}}}=${fmt(pNoWomen, 4)}$, so $P(\\ge 1)=1-${fmt(pNoWomen, 4)}=${fmt(atLeastOne, 4)}$. Adding single-woman probabilities double-counts committees with two or three women, the trap.`,
 prob, TIER_DIFF.superhard);
 }),
 T("superhard", () => {
 // 3-set with LINKED constraints, must back out the regions before counting.
 const t = 100 * rint(2, 6); // all three (triple overlap)
 const ac = 3 * t; // 25% of A∩C also buy B → A∩C totals 4t, AC-only = 3t
 const ab = 100 * rint(1, ac / 100 - 1); // A∩B only
 const bc = 100 * rint(1, ac / 100 - 1); // B∩C only
 const a = 100 * rint(20, 42); // only A
 const b = 100 * rint(5, 25); // only B
 const c = 100 * rint(5, 25); // only C
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
 `Law of total probability: $P(D)=(${fmt(w1, 2)})(${fmt(d1, 2)})+(${fmt(round(1 - w1, 2), 2)})(${fmt(d2, 2)})=${fmt(pd, 5)}$. Averaging the two rates is only valid if the shares are equal, here they are not.`,
 prob, TIER_DIFF.medium, { diagram: { kind: "tree", caption: "Multiply along each branch; add the two paths that end in D.", labels: { p1: w1, l1: "F1", l2: "F2", p11: d1, l11: "D|F1", l12: "D'|F1", p21: d2, l21: "D|F2", l22: "D'|F2" } } });
 }),
 T("hard", () => {
 const R = rint(5, 12), B = rint(3, 10);
 const p2 = (R - 1) / (R + B - 1);
 return build(`A bag has ${R} red and ${B} blue balls. You draw 2 without replacement. Given the first is red, find $P(\\text{second is red})$.`,
 round(p2, 4), [round(R / (R + B), 4), round((R - 1) / (R + B), 4), round(R / (R + B - 1), 4), round((R - 1) / (R + B - 2), 4)],
 `Condition on the first red being gone: ${R - 1} reds remain among $${R + B} - 1 = ${R + B - 1}$ balls, so $\\dfrac{${R - 1}}{${R + B - 1}}=${fmt(p2, 4)}$. Using $\\tfrac{R}{R+B}$ forgets the ball already removed.`,
 prob, TIER_DIFF.hard, { diagram: { kind: "tree", caption: `Draw 1 removes one ball. Branches show P(2nd red | 1st draw).`, labels: { p1: round(R / (R + B), 4), l1: "Red₁", l2: "Blue₁", p11: round((R - 1) / (R + B - 1), 4), l11: "Red₂|R₁", l12: "Blue₂|R₁", p21: round(R / (R + B - 1), 4), l21: "Red₂|B₁", l22: "Blue₂|B₁" } } });
 }),
 T("superhard", () => {
 const R = rint(3, 9), B = rint(4, 13);
 const E = (R + B + 1) / (R + 1); // expected # draws to first red, without replacement
 return build(`A bag has ${R} red and ${B} blue balls. You draw one at a time WITHOUT replacement until the first red appears. Find the expected number of draws.`,
 round(E, 4), [round((R + B) / R, 4), round(1 + B / (R + 1), 4) + 0.0, round((R + B) / (R + 1), 4), round((B + 1) / (R + 1), 4)],
 `The ${B} blue balls split into ${R + 1} gaps around the ${R} reds; by symmetry each gap holds on average $\\tfrac{${B}}{${R + 1}}$ blues, and you draw those plus the red itself: $1+\\dfrac{${B}}{${R + 1}}=\\dfrac{${R + B + 1}}{${R + 1}}=${fmt(E, 4)}$. The with-replacement answer $\\tfrac{R+B}{R}=\\tfrac1p$ is the trap, it ignores that draws are dependent.`,
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
 prob, TIER_DIFF.superhard, { diagram: { kind: "partition", caption: `M1(${pct(s1)}, d=${pct(d1)})  M2(${pct(s2)}, d=${pct(d2)})  M3(${pct(s3)}, d=${pct(d3)}). Gold band = defective units.`, labels: { l1: `M1 ${pct(s1)}`, l2: `M2 ${pct(s2)}`, l3: `M3 ${pct(s3)}` } } });
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
 `Carve the holders into disjoint segments first: life-only $=${fmt(L, 2)}-${fmt(B, 2)}=${fmt(onlyL, 4)}$, health-only $=${fmt(onlyH, 4)}$, both $=${fmt(B, 2)}$. Law of total probability: $${fmt(rL, 2)}(${fmt(onlyL, 4)})+${fmt(rH, 2)}(${fmt(onlyH, 4)})+${fmt(rB, 2)}(${fmt(B, 2)})=${fmt(renew, 4)}$. Applying the renewal rates to the FULL life/health percentages double-counts the "both" group, the trap.`,
 prob, TIER_DIFF.hard, { diagram: { kind: "partition", caption: `Renewal rates: Life-only ${pct(rL)}, Both ${pct(rB)}, Health-only ${pct(rH)}. Gold band = renewing policyholders.`, labels: { l1: `Life ${pct(onlyL)}`, l2: `Both ${pct(B)}`, l3: `Health ${pct(onlyH)}` } } });
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
 `Sum the binomial tail $\\sum_{j=${k}}^{${n}}\\binom{${n}}{j}p^{j}(1-p)^{${n}-j}=${fmt(atLeastK, 5)}$. Using only the $j=${k}$ term ($${fmt(exactlyK, 5)}$) answers "exactly ${k}", not "at least ${k}", the classic k-out-of-n trap.`,
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
 return build(`A game pays $${win}$ if a biased coin (heads with probability $${fmt(pH, 2)}$) lands heads, and $0$ otherwise. Find the expected payout.`,
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
 return build(`You roll a fair die for a prize of $${M}$. On a 6 you win the current prize; on 1, 5 you roll again but the prize HALVES. Find the expected winnings.`,
 round(e, 4), [round(M / 6, 4), round(M / 2, 4), round(M / 7, 4), round((5 * M) / 12, 4)],
 `Win on roll $k$ with probability $(5/6)^{k-1}(1/6)$ for prize $${M}(1/2)^{k-1}$. Summing, $E=\\tfrac{${M}}{6}\\sum_{k\\ge1}(5/12)^{k-1}=\\tfrac{${M}}{6}\\cdot\\tfrac1{1-5/12}=\\tfrac{2\\cdot${M}}{7}=${fmt(e, 4)}$. The trap is ignoring that BOTH the win-probability and the prize decay geometrically, their product gives ratio $5/12$, not $5/6$.`,
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
 `Complement of the first two terms: $1-P(0)-P(1)=1-e^{-${fmt(lam, 1)}}(1+${fmt(lam, 1)})=${fmt(pGE2, 4)}$. Stopping at $1-P(0)$ forgets to also remove $P(1)$, the trap.`,
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
 return build(`$${P}$ is invested at ${pct(i)} effective annual interest for ${n} years. Find the accumulated value.`,
 round(av, 2), [round(P * (1 + n * i), 2), round(P * (1 + i) ** (n - 1), 2), round(P + P * i * n + 1, 2), round(P * (1 + i / n) ** n, 2)],
 `Compound accumulation: $${P}(1+${fmt(i, 2)})^{${n}}=${money(round(av, 2)).slice(1, -1)}$. Using simple interest $P(1+ni)$ understates it, the trap when the problem says "effective".`,
 money, TIER_DIFF.easy);
 }),
 T("medium", () => {
 const F = pick([5000, 10000, 8000]), i = pick([0.05, 0.06, 0.07]), n = rint(4, 12);
 const pv = F * vOf(i) ** n;
 return build(`A payment of $${F}$ is due in ${n} years. At ${pct(i)} effective, find its present value.`,
 round(pv, 2), [round(F * (1 - n * i), 2), round(F * vOf(i) ** (n - 1), 2), round(F / (1 + n * i), 2), round(F * (1 + i) ** n, 2)],
 `Discount: $${F}\\,v^{${n}}=${F}(1+${fmt(i, 2)})^{-${n}}=${money(round(pv, 2)).slice(1, -1)}$. Accumulating instead of discounting (using $(1+i)^n$) is the sign-of-time trap.`,
 money, TIER_DIFF.medium);
 }),
 T("hard", () => {
 const jm = rstep(0.04, 0.15, 0.005), m = pick([2, 4, 12]);
 const eff = (1 + jm / m) ** m - 1;
 return build(`A nominal annual rate of ${pct(jm)} is compounded ${m} times per year. Find the effective annual rate.`,
 round(eff, 5), [round(jm, 5), round((1 + jm) ** m - 1, 5), round(jm / m, 5), round((1 + jm / m) ** m, 5)],
 `Effective rate: $\\left(1+\\tfrac{${fmt(jm, 2)}}{${m}}\\right)^{${m}}-1=${fmt(eff, 5)}$. The nominal rate ${pct(jm)} itself is the distractor, it ignores intra-year compounding.`,
 prob, TIER_DIFF.hard);
 }),
 T("superhard", () => {
 const A = pick([1000, 2000, 3000]), B = pick([1500, 2500]), i = pick([0.05, 0.06, 0.08]);
 const t1 = rint(0, 1), t2 = rint(3, 4), valAt = 5;
 const val = A * (1 + i) ** (valAt - t1) + B * (1 + i) ** (valAt - t2);
 return build(`Deposits of $${A}$ at time ${t1} and $${B}$ at time ${t2} earn ${pct(i)} effective. Find the accumulated value at time ${valAt}.`,
 round(val, 2), [round((A + B) * (1 + i) ** valAt, 2), round(A * (1 + i) ** valAt + B * (1 + i) ** valAt, 2), round(A * (1 + i) ** (valAt - t2) + B * (1 + i) ** (valAt - t1), 2), round(A * (1 + i) ** t1 + B * (1 + i) ** t2, 2)],
 `Accumulate each deposit by its OWN time to ${valAt}: $${A}(1+${fmt(i, 2)})^{${valAt - t1}}+${B}(1+${fmt(i, 2)})^{${valAt - t2}}=${money(round(val, 2)).slice(1, -1)}$. The trap is using a single common exponent, each cash flow has a different time-to-valuation.`,
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
 return build(`Find the present value of $${P}$ paid at the END of each year for ${n} years at ${pct(i)} effective.`,
 round(pv, 2), [round(P * sImm(n, i), 2), round(P * aDue(n, i), 2), round(P * n * vOf(i) ** n, 2), round(P * aImm(n, i) * vOf(i), 2)],
 `Annuity-immediate PV: $${P}\\,a_{\\overline{${n}}|}=${P}\\cdot\\dfrac{1-v^{${n}}}{${fmt(i, 2)}}=${money(round(pv, 2)).slice(1, -1)}$. Using $s_{\\overline{n}|}$ gives the FUTURE value, the most common annuity slip.`,
 money, TIER_DIFF.easy);
 }),
 T("medium", () => {
 const P = pick([200, 300, 500]), i = pick([0.05, 0.06, 0.07]), n = rint(5, 12);
 const av = P * sImm(n, i);
 return build(`Find the accumulated value at the end of ${n} years of $${P}$ deposited at the END of each year at ${pct(i)} effective.`,
 round(av, 2), [round(P * aImm(n, i), 2), round(P * n, 2), round(P * sImm(n, i) * vOf(i), 2), round(P * ((1 + i) ** n), 2)],
 `Annuity-immediate AV: $${P}\\,s_{\\overline{${n}}|}=${P}\\cdot\\dfrac{(1+${fmt(i, 2)})^{${n}}-1}{${fmt(i, 2)}}=${money(round(av, 2)).slice(1, -1)}$. Confusing it with the PV $a_{\\overline{n}|}$ is the trap.`,
 money, TIER_DIFF.medium);
 }),
 T("hard", () => {
 const target = pick([50000, 100000, 75000]), i = pick([0.05, 0.06, 0.07]), n = rint(10, 25);
 const pmt = target / sImm(n, i);
 return build(`How much must be deposited at the END of each year for ${n} years at ${pct(i)} to accumulate $${target}$?`,
 round(pmt, 2), [round(target / aImm(n, i), 2), round(target / n, 2), round(target * i, 2), round(target / aDue(n, i), 2)],
 `Solve $X\\,s_{\\overline{${n}}|}=${target}$, so $X=\\dfrac{${target}}{s_{\\overline{${n}}|}}=${money(round(pmt, 2)).slice(1, -1)}$. Dividing by $a_{\\overline{n}|}$ (a PV factor) instead of $s_{\\overline{n}|}$ (an AV factor) is the trap.`,
 money, TIER_DIFF.hard);
 }),
 T("superhard", () => {
 const P = pick([1000, 1500, 2000]), i = pick([0.05, 0.06, 0.08]), n = rint(8, 12), defer = rint(3, 5);
 const pv = P * aImm(n, i) * vOf(i) ** defer;
 return build(`An annuity pays $${P}$ at the end of each year for ${n} years, but the FIRST payment is at the end of year ${defer + 1}. At ${pct(i)} effective, find the present value today.`,
 round(pv, 2), [round(P * aImm(n, i), 2), round(P * aImm(n + defer, i), 2), round(P * aImm(n, i) * vOf(i) ** (defer - 1), 2), round(P * aImm(n - defer, i), 2)],
 `A deferred annuity: value the $${n}$-year annuity one period before its first payment, then discount ${defer} more years: $${P}\\,a_{\\overline{${n}}|}\\,v^{${defer}}=${money(round(pv, 2)).slice(1, -1)}$. Off-by-one on the deferral exponent (using $v^{${defer - 1}}$ or $v^{${defer + 1}}$) is the classic trap.`,
 money, TIER_DIFF.superhard);
 }),
 ],

 "loan-amortization": [
 T("easy", () => {
 const L = pick([10000, 20000, 15000]), i = pick([0.05, 0.06, 0.08]), n = rint(5, 15);
 const pmt = L / aImm(n, i);
 return build(`A $${L}$ loan at ${pct(i)} effective is repaid by level END-of-year payments over ${n} years. Find the annual payment.`,
 round(pmt, 2), [round(L / sImm(n, i), 2), round(L / n, 2), round(L * i, 2), round(L * vOf(i) ** n, 2)],
 `Level payment: $X=\\dfrac{L}{a_{\\overline{${n}}|}}=\\dfrac{${L}}{a_{\\overline{${n}}|}}=${money(round(pmt, 2)).slice(1, -1)}$. The loan PV equals the PV of payments, so you divide by $a_{\\overline{n}|}$, not $s_{\\overline{n}|}$.`,
 money, TIER_DIFF.easy);
 }),
 T("medium", () => {
 const L = pick([10000, 20000, 15000]), i = pick([0.05, 0.06, 0.08]), n = rint(8, 15), k = rint(2, 5);
 const pmt = L / aImm(n, i);
 const bal = pmt * aImm(n - k, i);
 return build(`A $${L}$ loan at ${pct(i)} is amortized over ${n} years with level payments. Find the outstanding balance just after the ${k}-th payment.`,
 round(bal, 2), [round(pmt * aImm(k, i), 2), round(L - k * pmt, 2), round(pmt * sImm(n - k, i), 2), round(L * (1 + i) ** k - pmt * k, 2)],
 `Prospective method: the balance equals the PV of the REMAINING $${n - k}$ payments, $X\\,a_{\\overline{${n - k}}|}=${money(round(bal, 2)).slice(1, -1)}$. Subtracting payments from principal ($L-k\\cdot X$) ignores interest and is wrong.`,
 money, TIER_DIFF.medium);
 }),
 T("hard", () => {
 const L = pick([10000, 20000, 25000]), i = pick([0.05, 0.06, 0.08]), n = rint(8, 15), t = rint(2, 5);
 const pmt = L / aImm(n, i);
 const interest = pmt * (1 - vOf(i) ** (n - t + 1));
 return build(`A $${L}$ loan at ${pct(i)} is amortized with level payments over ${n} years. Find the INTEREST portion of the ${t}-th payment.`,
 round(interest, 2), [round(pmt * vOf(i) ** (n - t + 1), 2), round(L * i, 2), round(pmt - L * i, 2), round(pmt * (1 - vOf(i) ** (n - t)), 2)],
 `Interest in payment $t$ is $X\\,(1-v^{n-t+1})=${money(round(interest, 2)).slice(1, -1)}$; the rest is principal $X v^{n-t+1}$. Using $L\\cdot i$ only works for the FIRST payment, the trap once $t>1$.`,
 money, TIER_DIFF.hard);
 }),
 T("superhard", () => {
 const L = pick([10000, 20000, 30000]), i = pick([0.05, 0.06, 0.08]), n = rint(10, 20);
 const pmt = L / aImm(n, i);
 const totalInterest = pmt * n - L;
 return build(`A $${L}$ loan at ${pct(i)} is repaid by level payments over ${n} years. Find the TOTAL interest paid over the life of the loan.`,
 round(totalInterest, 2), [round(L * i * n, 2), round(pmt * n, 2), round(L * ((1 + i) ** n - 1), 2), round(pmt * aImm(n, i), 2)],
 `Total paid is $n\\cdot X=${money(round(pmt * n, 2)).slice(1, -1)}$; subtract the principal $${L}$ to isolate interest: $${money(round(totalInterest, 2)).slice(1, -1)}$. Using $L\\cdot i\\cdot n$ (simple interest on the full balance) ignores that principal declines each year.`,
 money, TIER_DIFF.superhard);
 }),
 ],

 "bond-pricing": [
 T("easy", () => {
 const F = 1000, r = pick([0.04, 0.05, 0.06]), i = pick([0.05, 0.06, 0.07]), n = rint(5, 15);
 const price = F * r * aImm(n, i) + F * vOf(i) ** n;
 return build(`A $1000$ par bond pays annual coupons at ${pct(r)} and matures in ${n} years. At a yield of ${pct(i)}, find the price.`,
 round(price, 2), [round(F * r * aImm(n, i), 2), round(F * vOf(i) ** n, 2), round(F * r * sImm(n, i) + F, 2), round(F + F * r * n, 2)],
 `Price = PV of coupons + PV of redemption: $${F}\\cdot${fmt(r, 2)}\\,a_{\\overline{${n}}|}+${F}v^{${n}}=${money(round(price, 2)).slice(1, -1)}$. Dropping either piece is the trap.`,
 money, TIER_DIFF.easy);
 }),
 T("medium", () => {
 const F = 1000, r = pick([0.06, 0.07, 0.08]), i = pick([0.04, 0.05]), n = rint(6, 12);
 const price = F * r * aImm(n, i) + F * vOf(i) ** n;
 const premium = price - F;
 return build(`A $1000$ bond with ${pct(r)} annual coupons matures in ${n} years, priced to yield ${pct(i)}. Find the premium (price minus redemption).`,
 round(premium, 2), [round(F - price, 2), round(price, 2), round(F * (r - i) * n, 2), round(F * r * aImm(n, i), 2)],
 `Since the coupon ${pct(r)} exceeds the yield ${pct(i)}, the bond sells at a premium: price $${money(round(price, 2)).slice(1, -1)}$ minus par $${F}$ = $${money(round(premium, 2)).slice(1, -1)}$. A coupon-above-yield bond is ALWAYS a premium bond.`,
 money, TIER_DIFF.medium);
 }),
 T("hard", () => {
 const F = 1000, r = pick([0.05, 0.06, 0.07]), i = pick([0.05, 0.06, 0.07]), n = rint(8, 14), k = rint(2, 5);
 const price = F * r * aImm(n, i) + F * vOf(i) ** n;
 const book = F * r * aImm(n - k, i) + F * vOf(i) ** (n - k);
 return build(`A $1000$ bond, ${pct(r)} annual coupons, ${n} years, yield ${pct(i)}. Find the book value just after the ${k}-th coupon.`,
 round(book, 2), [round(price, 2), round(F * r * aImm(k, i) + F * vOf(i) ** k, 2), round(F, 2), round(book * (1 + i), 2)],
 `Book value = PV of the REMAINING $${n - k}$ coupons plus redemption, at the original yield: $${F}\\cdot${fmt(r, 2)}\\,a_{\\overline{${n - k}}|}+${F}v^{${n - k}}=${money(round(book, 2)).slice(1, -1)}$. Re-pricing the full ${n}-year stream ignores the coupons already paid.`,
 money, TIER_DIFF.hard);
 }),
 T("superhard", () => {
 const F = 1000, r = pick([0.07, 0.08]), i = pick([0.05, 0.06]), nCall = rint(5, 8), nMat = nCall + rint(4, 7);
 const priceCall = F * r * aImm(nCall, i) + F * vOf(i) ** nCall;
 const priceMat = F * r * aImm(nMat, i) + F * vOf(i) ** nMat;
 const worst = Math.min(priceCall, priceMat);
 return build(`A $1000$ bond pays ${pct(r)} annual coupons, is callable at par in ${nCall} years, and otherwise matures in ${nMat} years. To GUARANTEE a yield of at least ${pct(i)}, what price should an investor pay?`,
 round(worst, 2), [round(Math.max(priceCall, priceMat), 2), round((priceCall + priceMat) / 2, 2), round(F, 2), round(priceMat, 2)],
 `This is a premium bond (coupon ${pct(r)} > yield ${pct(i)}), so the issuer calls EARLY to stop overpaying coupons, worst case for the investor. Price at every call/maturity date and take the MINIMUM: call-date price $${money(round(priceCall, 2)).slice(1, -1)}$ vs maturity price $${money(round(priceMat, 2)).slice(1, -1)}$, so pay $${money(round(worst, 2)).slice(1, -1)}$. Paying the higher price risks a yield below ${pct(i)} if called, the yield-to-worst trap.`,
 money, TIER_DIFF.superhard);
 }),
 ],

 "covariance-and-correlation": [
  T("easy", () => {
   const sdx = rint(2, 7), sdy = rint(2, 7), rho = rstep(0.2, 0.8, 0.1);
   const vx = sdx * sdx, vy = sdy * sdy, cov = round(rho * sdx * sdy, 4);
   return build(
    `$\\operatorname{Var}(X)=${vx}$, $\\operatorname{Var}(Y)=${vy}$, and $\\operatorname{Cov}(X,Y)=${fmt(cov, 2)}$. Find the correlation $\\rho_{XY}$.`,
    round(cov / Math.sqrt(vx * vy), 4),
    [round(cov / (vx * vy), 4), round(cov / (vx + vy), 4), round(cov / Math.sqrt(vx + vy), 4), round(cov / (sdx + sdy), 4)],
    `$\\rho=\\dfrac{\\operatorname{Cov}(X,Y)}{\\sqrt{\\operatorname{Var}(X)\\,\\operatorname{Var}(Y)}}=\\dfrac{${fmt(cov, 2)}}{\\sqrt{${vx}\\cdot${vy}}}=\\dfrac{${fmt(cov, 2)}}{${sdx * sdy}}=${fmt(round(cov / (sdx * sdy), 4), 4)}$. Dividing by the product of the variances (not the standard deviations) is the classic slip.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const vx = rint(4, 16), vy = rint(4, 16);
   const cap = Math.max(1, Math.floor(Math.sqrt(vx * vy)) - 1);
   const cov = pick([-1, 1]) * rint(1, cap);
   const a = pick([2, 3]);
   const b = pick([-3, -2, 2, 3]);
   const correct = a * a * vx + b * b * vy + 2 * a * b * cov;
   return build(
    `$\\operatorname{Var}(X)=${vx}$, $\\operatorname{Var}(Y)=${vy}$, $\\operatorname{Cov}(X,Y)=${cov}$. Find $\\operatorname{Var}(${a}X${b < 0 ? b : "+" + b}Y)$.`,
    correct,
    [a * a * vx + b * b * vy, a * a * vx + b * b * vy - 2 * a * b * cov, a * vx + b * vy + 2 * a * b * cov, a * a * vx + b * b * vy + a * b * cov],
    `$\\operatorname{Var}(aX+bY)=a^2\\operatorname{Var}(X)+b^2\\operatorname{Var}(Y)+2ab\\operatorname{Cov}(X,Y)=${a * a}\\cdot${vx}+${b * b}\\cdot${vy}+2(${a})(${b})(${cov})=${correct}$. Dropping the $2ab\\operatorname{Cov}$ term, or its sign when $b<0$, is the trap.`,
    integer, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const vx = rint(5, 20), vy = rint(5, 20);
   const cap = Math.max(1, Math.floor(Math.sqrt(vx * vy)) - 1);
   const cov = pick([-1, 1]) * rint(1, cap);
   const a = pick([1, 2, 3]);
   const b = pick([1, 2, 3].filter((x) => x !== a));
   const c = pick([2, 3]);
   const d = pick([-2, -1, 3].filter((x) => x !== c));
   const correct = a * c * vx + b * d * vy + (a * d + b * c) * cov;
   return build(
    `$\\operatorname{Var}(X)=${vx}$, $\\operatorname{Var}(Y)=${vy}$, $\\operatorname{Cov}(X,Y)=${cov}$. Find $\\operatorname{Cov}(${a}X+${b}Y,\\;${c}X${d < 0 ? d : "+" + d}Y)$.`,
    correct,
    [a * c * vx + b * d * vy, a * c * vx + b * d * vy + (a * c + b * d) * cov, (a * c + b * d) * (vx + vy), (a + b) * (c + d) * cov],
    `Bilinearity: $\\operatorname{Cov}(aX+bY,cX+dY)=ac\\operatorname{Var}(X)+bd\\operatorname{Var}(Y)+(ad+bc)\\operatorname{Cov}(X,Y)=${a * c}\\cdot${vx}+${b * d}\\cdot${vy}+(${a * d + b * c})(${cov})=${correct}$. The cross-term coefficient is $ad+bc$, not $ac+bd$, the most common error.`,
    integer, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const vx = rint(4, 12), vy = rint(4, 12);
   const cap = Math.max(1, Math.floor(Math.sqrt(vx * vy)) - 1);
   const cov = pick([-1, 1]) * rint(1, cap);
   const varSum = vx + vy + 2 * cov;
   const correct = round((vx + cov) / Math.sqrt(vx * varSum), 4);
   return build(
    `$\\operatorname{Var}(X)=${vx}$, $\\operatorname{Var}(Y)=${vy}$, $\\operatorname{Cov}(X,Y)=${cov}$. Find the correlation between $X$ and $X+Y$.`,
    correct,
    [round(cov / Math.sqrt(vx * varSum), 4), round((vx + cov) / Math.sqrt(vx * vy), 4), round((vx + cov) / varSum, 4), round(Math.sqrt(vx / varSum), 4)],
    `$\\operatorname{Cov}(X,X+Y)=\\operatorname{Var}(X)+\\operatorname{Cov}(X,Y)=${vx}+(${cov})=${vx + cov}$ and $\\operatorname{Var}(X+Y)=${vx}+${vy}+2(${cov})=${varSum}$, so $\\rho=\\dfrac{${vx + cov}}{\\sqrt{${vx}\\cdot${varSum}}}=${fmt(correct, 4)}$. Treating $\\operatorname{Cov}(X,X+Y)$ as just $\\operatorname{Cov}(X,Y)$ (forgetting the $\\operatorname{Var}(X)$ piece) is the trap.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "percentiles-and-measures": [
  T("easy", () => {
   const a = rint(0, 8), b = a + rint(6, 20), p = rstep(0.2, 0.9, 0.1);
   const correct = round(a + p * (b - a), 4);
   return build(
    `$X$ is uniform on $[${a},\\,${b}]$. Find the ${Math.round(p * 100)}th percentile of $X$.`,
    correct,
    [round(p * (b - a), 4), round(a + p * b, 4), round((a + b) * p, 4), round(b - p * (b - a), 4)],
    `A uniform's $p$-th percentile solves $\\dfrac{x-a}{b-a}=p$, so $x=a+p(b-a)=${a}+${fmt(p, 2)}(${b - a})=${fmt(correct, 4)}$. Forgetting to add back the lower bound $a$ is the slip.`,
    (v) => `$${fmt(v, 4)}$`, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const theta = pick([4, 5, 6, 8, 10, 12, 15, 20, 25, 30]);
   const p = pick([0.25, 0.5, 0.75, 0.9, 0.95]);
   const correct = round(-theta * Math.log(1 - p), 4);
   return build(
    `$X$ is exponential with mean $${theta}$. Find its ${Math.round(p * 100)}th percentile.`,
    correct,
    [round(-theta * Math.log(p), 4), round(theta * Math.log(1 - p), 4), round(theta * p, 4), round(-Math.log(1 - p), 4)],
    `Set the CDF $1-e^{-x/${theta}}=${p}$: $x=-${theta}\\ln(1-${p})=-${theta}\\ln(${round(1 - p, 2)})=${fmt(correct, 4)}$. Using $\\ln p$ instead of $\\ln(1-p)$ inverts the tail, the usual error.`,
    (v) => `$${fmt(v, 4)}$`, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const theta = pick([100, 200, 250, 500, 1000]);
   const alpha = pick([2, 3, 4]);
   const p = pick([0.5, 0.75, 0.9, 0.95, 0.99]);
   const correct = round(theta * Math.pow(1 - p, -1 / alpha), 2);
   return build(
    `$X$ is Pareto with CDF $F(x)=1-\\left(\\dfrac{${theta}}{x}\\right)^{${alpha}}$ for $x>${theta}$. Find the ${Math.round(p * 100)}th percentile.`,
    correct,
    [round(theta * Math.pow(1 - p, 1 / alpha), 2), round(theta * Math.pow(p, -1 / alpha), 2), round(theta / (1 - p), 2), round(theta * (1 + p), 2)],
    `Invert the CDF: $1-(\\theta/x)^{\\alpha}=p\\Rightarrow(\\theta/x)^{\\alpha}=1-p\\Rightarrow x=\\theta(1-p)^{-1/\\alpha}=${theta}(${round(1 - p, 2)})^{-1/${alpha}}=${fmt(correct, 2)}$. Missing the negative exponent (from inverting $\\theta/x$) is where it breaks.`,
    (v) => `$${fmt(v, 2)}$`, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const b = rint(4, 15);
   const p = pick([0.6, 0.7, 0.75, 0.8, 0.9]);
   const xp = round(p * b, 4);
   const correct = round(xp * xp, 4);
   return build(
    `$X$ is uniform on $[0,\\,${b}]$ and $Y=X^2$. Find the ${Math.round(p * 100)}th percentile of $Y$.`,
    correct,
    [round((b * b) / 3, 4), round((b * b) / 4, 4), xp, round(b * b * p, 4)],
    `Percentiles are preserved under a strictly increasing transform. The $p$-th percentile of $X$ is $${fmt(xp, 4)}$ (uniform), so the $p$-th percentile of $Y=X^2$ is $(${fmt(xp, 4)})^2=${fmt(correct, 4)}$. Computing $E[X^2]=${fmt(round(b * b / 3, 4), 4)}$ answers a different question, the classic trap of confusing a percentile with a mean.`,
    (v) => `$${fmt(v, 4)}$`, TIER_DIFF.superhard);
  }),
 ],

 "double-expectation": [
  T("easy", () => {
   const q = pick([0.3, 0.4, 0.6, 0.7]);
   const m0 = pick([10, 20, 30, 40]);
   const m1 = pick([60, 80, 100, 120]);
   const correct = round((1 - q) * m0 + q * m1, 4);
   return build(
    `A risk is high-type with probability $${fmt(q, 2)}$ (expected claim $${m1}$) and low-type otherwise (expected claim $${m0}$). Find the overall expected claim $E[X]$.`,
    correct,
    [round(q * m0 + (1 - q) * m1, 4), round((m0 + m1) / 2, 4), round(q * m1, 4), round(m0 + q * (m1 - m0) * 2, 4)],
    `Law of total expectation: $E[X]=E[E[X\\mid \\text{type}]]=(1-${fmt(q, 2)})(${m0})+${fmt(q, 2)}(${m1})=${fmt(correct, 4)}$. Swapping which probability multiplies which mean is the trap.`,
    (v) => `$${fmt(v, 2)}$`, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const n = rint(5, 20);
   const p = rstep(0.1, 0.6, 0.1);
   const mu = pick([5, 10, 20, 50]);
   const correct = round(n * p * mu, 4);
   return build(
    `The number of claims $N$ is binomial$(${n},\\,${fmt(p, 1)})$ and each claim has mean $${mu}$, independent of $N$. Find the expected aggregate $E[S]=E[N]\\,E[X]$.`,
    correct,
    [round(n * mu, 4), round(p * mu, 4), round(n * p + mu, 4), round(n * p * mu * p, 4)],
    `$E[N]=np=${n}(${fmt(p, 1)})=${fmt(n * p, 2)}$, so $E[S]=E[N]E[X]=${fmt(n * p, 2)}\\times${mu}=${fmt(correct, 4)}$. Using $n$ instead of $E[N]=np$ is the common slip.`,
    (v) => `$${fmt(v, 2)}$`, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const lam = rint(2, 10);
   const mu = pick([10, 20, 30, 50]);
   const sd = pick([5, 10, 20]);
   const correct = lam * (sd * sd + mu * mu);
   return build(
    `Aggregate claims $S$ are compound with claim count $N$ (mean and variance both $${lam}$) and i.i.d. severities of mean $${mu}$, standard deviation $${sd}$. Find $\\operatorname{Var}(S)$.`,
    correct,
    [lam * sd * sd, lam * mu * mu, lam * (sd + mu) * (sd + mu), lam * sd * sd + mu * mu],
    `Compound variance: $\\operatorname{Var}(S)=E[N]\\operatorname{Var}(X)+\\operatorname{Var}(N)E[X]^2=${lam}(${sd * sd})+${lam}(${mu * mu})=${lam}(${sd * sd}+${mu * mu})=${correct}$. Keeping only $E[N]\\operatorname{Var}(X)$ and forgetting the frequency-variance term $\\operatorname{Var}(N)E[X]^2$ is the classic trap.`,
    integer, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const lam = rint(2, 12);
   const mu = pick([5, 10, 15, 20, 25, 50]);
   const correct = 2 * lam * mu * mu;
   return build(
    `Claims arrive as a Poisson process with mean count $${lam}$, and each claim size is exponential with mean $${mu}$. Find the variance of total claims $\\operatorname{Var}(S)$.`,
    correct,
    [lam * mu * mu, 2 * mu * mu, lam * mu, lam * lam * 2 * mu * mu],
    `For compound Poisson, $\\operatorname{Var}(S)=\\lambda\\,E[X^2]$. An exponential with mean $${mu}$ has $E[X^2]=2\\mu^2=2(${mu * mu})=${2 * mu * mu}$, so $\\operatorname{Var}(S)=${lam}\\times${2 * mu * mu}=${correct}$. Using $E[X^2]=\\mu^2$ (forgetting an exponential's variance equals its mean squared) gives $\\lambda\\mu^2$, the trap.`,
    integer, TIER_DIFF.superhard);
  }),
 ],

 "clt-and-sums": [
  T("easy", () => {
   const n = rint(20, 200);
   const sigma = pick([50, 100, 150, 200, 250, 500]);
   const correct = round(sigma * Math.sqrt(n), 2);
   return build(
    `An insurer has ${n} independent claims, each with standard deviation $${sigma}$. Find the standard deviation of the TOTAL claims.`,
    correct,
    [round(sigma * n, 2), round(sigma, 2), round(sigma / Math.sqrt(n), 2), round(sigma * Math.sqrt(2 * n), 2)],
    `For a sum of $n$ independent pieces, variances add: $\\operatorname{Var}(\\text{total})=n\\sigma^2$, so $\\operatorname{SD}=\\sigma\\sqrt{n}=${sigma}\\sqrt{${n}}=${fmt(correct, 2)}$. Multiplying the SD by $n$ instead of $\\sqrt{n}$ is the error, that scales the variance, not the SD.`,
    (v) => `$${fmt(v, 2)}$`, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const n = rint(30, 120);
   const mu = pick([5, 10, 15, 20]);
   const sigma = pick([2, 3, 4, 5]);
   const z = pick([-1.5, -1, -0.5, 0.5, 1, 1.5]);
   const K = round(n * mu + z * sigma * Math.sqrt(n), 1);
   const zA = (K - n * mu) / (sigma * Math.sqrt(n));
   const correct = round(normalCdf(zA), 4);
   return build(
    `${n} independent claims each have mean $${mu}$ and standard deviation $${sigma}$. Using the normal approximation, find $P(\\text{total} < ${fmt(K, 1)})$.`,
    correct,
    [round(1 - correct, 4), round(normalCdf(zA * Math.sqrt(n)), 4), round(normalCdf(zA / Math.sqrt(n)), 4), 0.5],
    `Total $\\approx N(n\\mu,\\,n\\sigma^2)=N(${n * mu},\\,${n * sigma * sigma})$. Standardize: $z=\\dfrac{${fmt(K, 1)}-${n * mu}}{${sigma}\\sqrt{${n}}}=${fmt(zA, 3)}$, so $P=\\Phi(${fmt(zA, 3)})=${fmt(correct, 4)}$. Dividing by $\\sigma$ alone, forgetting the $\\sqrt{n}$, is the classic trap.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const n = pick([25, 36, 49, 64, 100]);
   const mu = pick([50, 60, 70, 80, 100]);
   const sigma = pick([10, 12, 15, 20]);
   const z = pick([-2, -1.5, -1, 1, 1.5, 2]);
   const se = sigma / Math.sqrt(n);
   const c = round(mu + z * se, 2);
   const zA = (c - mu) / se;
   const correct = round(1 - normalCdf(zA), 4);
   return build(
    `A sample of ${n} observations comes from a population with mean $${mu}$ and standard deviation $${sigma}$. Find $P(\\bar X > ${fmt(c, 2)})$ by the normal approximation.`,
    correct,
    [round(normalCdf(zA), 4), round(1 - normalCdf(zA / Math.sqrt(n)), 4), round(1 - normalCdf(zA * Math.sqrt(n)), 4), 0.5],
    `The sample mean has standard error $\\sigma/\\sqrt{n}=${sigma}/${Math.round(Math.sqrt(n))}=${fmt(se, 3)}$. Standardize: $z=\\dfrac{${fmt(c, 2)}-${mu}}{${fmt(se, 3)}}=${fmt(zA, 3)}$, so $P(\\bar X>${fmt(c, 2)})=1-\\Phi(${fmt(zA, 3)})=${fmt(correct, 4)}$. Using $\\sigma$ rather than $\\sigma/\\sqrt{n}$ for the spread of a MEAN is the trap.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const n = pick([100, 400, 900, 1600, 2500]);
   const mu = pick([100, 200, 250, 500]);
   const sigma = pick([50, 100, 150, 200, 300]);
   const correct = round(mu + 1.645 * sigma / Math.sqrt(n), 2);
   return build(
    `An insurer writes ${n} independent policies, each with expected loss $${mu}$ and standard deviation $${sigma}$. What premium per policy makes $P(\\text{total losses} < \\text{total premium}) \\ge 0.95$ under the normal approximation?`,
    correct,
    [round(mu + 1.96 * sigma / Math.sqrt(n), 2), round(mu + 1.645 * sigma / n, 2), round(mu + 1.645 * sigma * Math.sqrt(n), 2), round(mu + 1.645 * sigma, 2)],
    `Total losses $\\approx N(n\\mu,\\,n\\sigma^2)$. Need $np \\ge n\\mu + 1.645\\,\\sigma\\sqrt{n}$ (the one-sided $95\\%$ point is $z=1.645$), so $p \\ge \\mu + \\dfrac{1.645\\,\\sigma}{\\sqrt{n}}=${mu}+\\dfrac{1.645(${sigma})}{${Math.round(Math.sqrt(n))}}=${fmt(correct, 2)}$. Using $z=1.96$ (the two-sided / $97.5\\%$ point) is the classic mistake.`,
    (v) => `$${fmt(v, 2)}$`, TIER_DIFF.superhard);
  }),
 ],

 "nominal-rates-and-force": [
  T("easy", () => {
   const i = rstep(0.02, 0.15, 0.002);
   const delta = round(Math.log(1 + i), 5);
   return build(`An account earns an effective annual interest rate of ${pct(i)}. Find the equivalent constant force of interest $\\delta$.`,
    delta, [round(i, 5), round(i / (1 + i), 5), round(2 * Math.log(1 + i / 2), 5), round((1 + i) ** 0.5 - 1, 5)],
    `The force is the continuous-compounding equivalent: $\\delta=\\ln(1+i)=\\ln(1+${fmt(i, 3)})=${fmt(delta, 5)}$. Reporting $i$ itself, or the effective discount rate $d=\\frac{i}{1+i}$, is the classic force-vs-discount slip; both sit just below $i$.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const m = pick([2, 4, 12]);
   const dm = rstep(0.02, 0.13, 0.005);
   const conv = m === 2 ? "semiannually" : m === 4 ? "quarterly" : "monthly";
   const i = round((1 - dm / m) ** (-m) - 1, 5);
   return build(`A nominal annual rate of DISCOUNT of ${pct(dm)} convertible ${conv} is given. Find the equivalent effective annual rate of interest.`,
    i, [round(dm, 5), round((1 + dm / m) ** m - 1, 5), round(1 / (1 - dm) - 1, 5), round(dm / (1 - dm), 5)],
    `A nominal discount rate accumulates as $\\left(1-\\frac{d^{(${m})}}{${m}}\\right)^{-${m}}$, so $v=\\left(1-\\frac{${fmt(dm, 4)}}{${m}}\\right)^{${m}}$ and $i=v^{-1}-1=${fmt(i, 5)}$. Treating $d^{(${m})}$ like a nominal INTEREST rate (a $+$ sign) is the trap.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const p = pick([2, 4, 12]), q = pick([2, 4, 12]);
   const ip = rstep(0.03, 0.13, 0.005);
   const ieff = (1 + ip / p) ** p - 1;
   const dq = round(q * (1 - (1 + ieff) ** (-1 / q)), 5);
   const conv = (mm: number) => (mm === 2 ? "semiannually" : mm === 4 ? "quarterly" : "monthly");
   return build(`A nominal annual interest rate of ${pct(ip)} convertible ${conv(p)} is equivalent to a nominal annual rate of DISCOUNT $d^{(${q})}$ convertible ${conv(q)}. Find $d^{(${q})}$.`,
    dq, [round(ip, 5), round(q * ((1 + ieff) ** (1 / q) - 1), 5), round(ieff / (1 + ieff), 5), round(ieff, 5)],
    `First the effective rate: $i=\\left(1+\\frac{${fmt(ip, 3)}}{${p}}\\right)^{${p}}-1=${fmt(ieff, 5)}$. Then $d^{(${q})}=${q}\\left(1-(1+i)^{-1/${q}}\\right)=${fmt(dq, 5)}$. Computing $i^{(${q})}=${q}((1+i)^{1/${q}}-1)$ (interest, not discount) is the trap; discount uses $1-v^{1/${q}}$.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const P = pick([1000, 2000, 5000]);
   const dm = rstep(0.04, 0.09, 0.005);
   const delta = rstep(0.03, 0.07, 0.005);
   const y1 = pick([4, 5, 6]), y2 = pick([2, 3]);
   const av = round(P * (1 - dm / 12) ** (-12 * y1) * Math.exp(delta * y2), 2);
   return build(`$${P}$ is invested. For the first ${y1} years it earns a nominal rate of discount of ${pct(dm)} convertible monthly; for the next ${y2} years it earns a constant force of interest of ${pct(delta)}. Find the accumulated value at the end of ${y1 + y2} years.`,
    av, [round(P * (1 + dm / 12) ** (12 * y1) * Math.exp(delta * y2), 2), round(P * (1 - dm) ** (-y1) * Math.exp(delta * y2), 2), round(P * (1 - dm / 12) ** (-12 * y1) * (1 + delta * y2), 2), round(P * (1 - dm / 12) ** (-12 * y1) * (1 + delta) ** y2, 2)],
    `Accumulate in two stages. Discount phase: $\\left(1-\\frac{${fmt(dm, 3)}}{12}\\right)^{-12\\cdot${y1}}$. Force phase: $e^{${fmt(delta, 3)}\\cdot${y2}}$. Multiplying gives ${av}. Using $(1+d/12)^{+12y}$ (discount treated as interest) or dropping the force exponent ${y2} are the traps.`,
    money, TIER_DIFF.superhard);
  }),
 ],

 "perpetuities-and-varying": [
  T("easy", () => {
   const X = 50 * rint(1, 20), i = rstep(0.03, 0.10, 0.0025);
   const pv = round(X / i, 2);
   return build(`A perpetuity-immediate pays $${X}$ at the end of each year forever. At an effective annual rate of ${pct(i, 2)}, find its present value.`,
    pv, [round(X * (1 + i) / i, 2), round(X * i, 2), round(X / (i * i), 2), round(X * vOf(i) / i, 2)],
    `Perpetuity-immediate: $PV=\\frac{X}{i}=\\frac{${X}}{${fmt(i, 4)}}=${pv}$. The perpetuity-DUE value $\\frac{X}{d}=\\frac{X(1+i)}{i}$ values the same payments one period earlier, the timing trap.`,
    money, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const X = 50 * rint(2, 16), i = rstep(0.04, 0.10, 0.0025), k = rint(3, 9);
   const pv = round((X / i) * vOf(i) ** k, 2);
   return build(`A perpetuity-immediate pays $${X}$ annually, but the FIRST payment is at the end of year ${k + 1}. At ${pct(i, 2)} effective, find the present value today.`,
    pv, [round(X / i, 2), round((X / i) * vOf(i) ** (k - 1), 2), round((X / i) * vOf(i) ** (k + 1), 2), round((X / i) * (1 + i) ** k, 2)],
    `Value the perpetuity one period before its first payment (at time ${k}) as $\\frac{X}{i}$, then discount ${k} years: $\\frac{X}{i}v^{${k}}=${pv}$. Off-by-one on the deferral exponent is the classic trap.`,
    money, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const X = 50 * rint(1, 12), i = rstep(0.04, 0.12, 0.0025);
   const pv = round(X * (1 + i) / (i * i), 2);
   return build(`A perpetuity-immediate pays $${X}$ at the end of year 1, $${2 * X}$ at the end of year 2, $${3 * X}$ at the end of year 3, increasing by $${X}$ each year forever. At ${pct(i, 2)} effective, find the present value.`,
    pv, [round(X / (i * i), 2), round(X / i, 2), round(X * (2 + i) / (i * i), 2), round(X * (1 + i) / i, 2)],
    `Increasing perpetuity-immediate: $PV=X\\left(\\frac{1}{i}+\\frac{1}{i^2}\\right)=\\frac{X(1+i)}{i^2}=${pv}$. Using only $\\frac{X}{i^2}$ (dropping the level part) is the trap.`,
    money, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const X = 50 * rint(2, 12), C = pick([10, 20, 25, 50]), i = rstep(0.04, 0.10, 0.0025);
   const pv = round(X / i + C / (i * i), 2);
   return build(`A perpetuity-immediate pays $${X}$ at the end of year 1, and each subsequent annual payment is $${C}$ larger than the one before, forever. At ${pct(i, 2)} effective, find the present value.`,
    pv, [round(X / i + C / i, 2), round((X + C) / i, 2), round(X / i, 2), round(X / i + C * (1 + i) / (i * i), 2)],
    `Split into a level perpetuity plus an arithmetic-increasing one: $PV=\\frac{X}{i}+\\frac{C}{i^2}=${pv}$. The increasing piece carries $\\frac{C}{i^2}$ (an extra power of $i$); using $\\frac{C}{i}$ is the trap.`,
    money, TIER_DIFF.superhard);
  }),
 ],

 "geometric-annuities": [
  T("easy", () => {
   const X = 100 * rint(1, 10), i = rstep(0.05, 0.10, 0.0025), g = rstep(0.02, 0.04, 0.005), n = rint(8, 20);
   const pv = round(X * (1 - ((1 + g) / (1 + i)) ** n) / (i - g), 2);
   return build(`An annuity-immediate makes ${n} annual payments. The first is $${X}$ and each later payment is ${pct(g, 1)} larger than the previous. At ${pct(i, 2)} effective, find the present value.`,
    pv, [round(X * aImm(n, i), 2), round(X * (1 - ((1 + g) / (1 + i)) ** n) / (i + g), 2), round(X * (1 - ((1 + i) / (1 + g)) ** n) / (i - g), 2), round(X * n / (1 + i), 2)],
    `Geometric annuity-immediate: $PV=X\\cdot\\frac{1-\\left(\\frac{1+g}{1+i}\\right)^{n}}{i-g}=${pv}$. Discount by the NET rate $i-g$. Ignoring growth (level $Xa_{\\overline{n}|}$) or using $i+g$ are the classic traps.`,
    money, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const X = 100 * rint(1, 12), i = rstep(0.05, 0.12, 0.0025), g = rstep(0.01, 0.04, 0.005);
   const pv = round(X / (i - g), 2);
   return build(`A perpetuity-immediate pays $${X}$ at the end of year 1, and each later payment grows by ${pct(g, 1)} per year forever. At ${pct(i, 2)} effective (with $i>g$), find the present value.`,
    pv, [round(X / i, 2), round(X / (i + g), 2), round(X * (1 + g) / (i - g), 2), round(X * (1 - g) / i, 2)],
    `A geometric (Gordon-growth) perpetuity: $PV=\\frac{X}{i-g}=${pv}$, valid only when $i>g$. Forgetting to subtract the growth (using $\\frac{X}{i}$) understates it, this is the dividend-discount model.`,
    money, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const X = 100 * rint(1, 10), i = rstep(0.05, 0.10, 0.0025), g = rstep(0.02, 0.04, 0.005), n = rint(8, 18);
   const av = round(X * ((1 + i) ** n - (1 + g) ** n) / (i - g), 2);
   return build(`An annuity-immediate makes ${n} annual payments; the first is $${X}$ and each grows ${pct(g, 1)} per year. At ${pct(i, 2)} effective, find the ACCUMULATED value just after the last payment.`,
    av, [round(X * sImm(n, i), 2), round(X * ((1 + i) ** n - (1 + g) ** n) / (i + g), 2), round(X * ((1 + g) ** n - (1 + i) ** n) / (i - g), 2), round(X * (1 - ((1 + g) / (1 + i)) ** n) / (i - g), 2)],
    `Accumulate the geometric annuity: $AV=X\\cdot\\frac{(1+i)^{n}-(1+g)^{n}}{i-g}=${av}$ (the PV grown by $(1+i)^n$). Using the level $Xs_{\\overline{n}|}$ ignores growth, the trap.`,
    money, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const X = 100 * rint(1, 10), i = rstep(0.06, 0.12, 0.0025), g = rstep(0.02, 0.05, 0.005);
   const pv = round(X / (i - g), 2);
   return build(`An investor pays $${pv}$ today for a perpetuity-immediate whose first payment (one year from now) is $${X}$, with every later payment ${pct(g, 1)} larger than the one before. Find the effective annual yield $i$ the investor earns.`,
    round(i, 5), [round(X / pv, 5), round(g + X / (pv * (1 + g)), 5), round(X / pv - g, 5), round(g, 5)],
    `Invert the Gordon perpetuity $PV=\\frac{X}{i-g}$: $i=g+\\frac{X}{PV}=${fmt(g, 3)}+\\frac{${X}}{${pv}}=${fmt(round(i, 5), 5)}$. Reporting just $\\frac{X}{PV}$ (forgetting to add the growth $g$ back) is the trap.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "spot-forward-rates": [
  T("easy", () => {
   const t = rint(1, 4);
   const s1 = rstep(0.03, 0.06, 0.0025);
   const s2 = round(s1 + pick([0.003, 0.005, 0.007, 0.01, 0.012]), 4);
   const f = round((1 + s2) ** (t + 1) / (1 + s1) ** t - 1, 5);
   return build(`The ${t}-year spot rate is ${pct(s1, 2)} and the ${t + 1}-year spot rate is ${pct(s2, 2)}. Find the 1-year forward rate from year ${t} to year ${t + 1}.`,
    f, [round(s2, 5), round(s2 - s1, 5), round((1 + s2) / (1 + s1) - 1, 5), round(2 * s2 - s1, 5)],
    `Forwards compound the spots: $(1+s_{${t + 1}})^{${t + 1}}=(1+s_{${t}})^{${t}}(1+f)$, so $f=\\frac{(1+s_{${t + 1}})^{${t + 1}}}{(1+s_{${t}})^{${t}}}-1=${fmt(f, 5)}$. The naive $s_{${t + 1}}-s_{${t}}$ ignores compounding over the first ${t} years.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const a = rint(1, 3), gap = pick([2, 3]), b = a + gap;
   const sa = rstep(0.03, 0.05, 0.0025);
   const sb = round(sa + pick([0.005, 0.008, 0.01, 0.012]), 4);
   const f = round(((1 + sb) ** b / (1 + sa) ** a) ** (1 / (b - a)) - 1, 5);
   return build(`The ${a}-year spot rate is ${pct(sa, 2)} and the ${b}-year spot rate is ${pct(sb, 2)}. Find the annual forward rate that applies over the ${gap}-year period from year ${a} to year ${b}.`,
    f, [round((1 + sb) ** b / (1 + sa) ** a - 1, 5), round(sb - sa, 5), round(sb, 5), round((1 + sb) / (1 + sa) - 1, 5)],
    `Over $b-a=${gap}$ years: $(1+s_{${b}})^{${b}}=(1+s_{${a}})^{${a}}(1+f)^{${gap}}$, so $f=\\left(\\frac{(1+s_{${b}})^{${b}}}{(1+s_{${a}})^{${a}}}\\right)^{1/${gap}}-1=${fmt(f, 5)}$. Skipping the ${gap}-th root leaves a TOTAL growth, not an annual rate.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const X = pick([1000, 500, 2000, 1500]);
   const s1 = rstep(0.03, 0.05, 0.0025);
   const s2 = round(s1 + pick([0.002, 0.004, 0.006]), 4);
   const s3 = round(s2 + pick([0.002, 0.004]), 4);
   const pv = round(X * ((1 + s1) ** -1 + (1 + s2) ** -2 + (1 + s3) ** -3), 2);
   return build(`Annual effective spot rates are $s_1=${pct(s1, 2)}$, $s_2=${pct(s2, 2)}$, $s_3=${pct(s3, 2)}$. Find the present value of payments of $${X}$ at the end of years 1, 2, and 3.`,
    pv, [round(X * ((1 + s3) ** -1 + (1 + s3) ** -2 + (1 + s3) ** -3), 2), round(X * ((1 + s1) ** -1 + (1 + s1) ** -2 + (1 + s1) ** -3), 2), round(X * ((1 + s1) ** -1 + (1 + s2) ** -1 + (1 + s3) ** -1), 2), round(3 * X, 2)],
    `Discount each payment at its OWN spot rate: $PV=X\\big[(1+s_1)^{-1}+(1+s_2)^{-2}+(1+s_3)^{-3}\\big]=${pv}$. Using a single flat rate (e.g. $s_3$ as a yield for all three years) is the classic mistake, the spot curve is not flat.`,
    money, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const s1 = rstep(0.03, 0.05, 0.0025);
   const s2true = round(s1 + pick([0.005, 0.008, 0.01, 0.012]), 4);
   const c = pick([0.04, 0.05, 0.06, 0.07, 0.08]);
   const v1 = (1 + s1) ** -1;
   const price = round(100 * c * v1 + (100 + 100 * c) * (1 + s2true) ** -2, 2);
   const v2 = (price - 100 * c * v1) / (100 + 100 * c);
   const s2 = round(v2 ** (-1 / 2) - 1, 5);
   return build(`A 2-year bond with face $100$ pays annual coupons of ${pct(c, 0)} and is priced at $${price}$. The 1-year spot rate is ${pct(s1, 2)}. Find the 2-year spot rate.`,
    s2, [round(v2 ** -1 - 1, 5), round(s1, 5), round(v2 ** (-1 / 2), 5), round(c, 5)],
    `Bootstrap: the first coupon is discounted at $s_1$, so strip it out: $v^2=\\frac{P-100c\\,(1+s_1)^{-1}}{100+100c}$, then $s_2=(v^2)^{-1/2}-1=${fmt(s2, 5)}$. Annualizing $v^2$ as a one-year factor ($(v^2)^{-1}-1$) is the trap.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "mgf-and-moments": [
  T("easy", () => {
   const alpha = rint(1, 8);
   const theta = pick([2, 3, 4, 5, 0.5, 1.5, 2.5, 10, 6, 8]);
   const mean = round(alpha * theta, 4);
   return build(`The moment generating function of $X$ is $M(t)=(1-${theta}t)^{-${alpha}}$ for $t<1/${theta}$. Find $E[X]$.`,
    mean, [round(theta, 4), round(alpha, 4), round(alpha * theta * theta, 4), round(alpha + theta, 4)],
    `Moments come from derivatives at $0$: $E[X]=M'(0)$. With $M'(t)=\\alpha\\theta(1-${theta}t)^{-(\\alpha+1)}$, $E[X]=\\alpha\\theta=${alpha}\\cdot${theta}=${fmt(mean, 4)}$. This is a Gamma$(\\alpha=${alpha},\\theta=${theta})$ MGF; reporting $\\theta$ alone (forgetting $\\alpha$) is the trap.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const alpha = rint(2, 8);
   const theta = pick([2, 3, 4, 5, 1.5, 2.5, 6, 8, 10, 0.5]);
   const variance = round(alpha * theta * theta, 4);
   return build(`The moment generating function of $X$ is $M(t)=(1-${theta}t)^{-${alpha}}$. Find $\\operatorname{Var}(X)$.`,
    variance, [round(alpha * theta, 4), round(alpha * (alpha + 1) * theta * theta, 4), round((alpha * theta) ** 2, 4), round(theta * theta, 4)],
    `$E[X]=\\alpha\\theta$ and $E[X^2]=M''(0)=\\alpha(\\alpha+1)\\theta^2$, so $\\operatorname{Var}=E[X^2]-(E[X])^2=\\alpha\\theta^2=${alpha}\\cdot${theta}^2=${fmt(variance, 4)}$. Using $E[X^2]$ itself (forgetting to subtract $(E[X])^2$) is the trap.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const theta = pick([2, 3, 4, 5, 1.5, 2.5, 6]);
   const a1 = rint(1, 5), a2 = rint(1, 5);
   const variance = round((a1 + a2) * theta * theta, 4);
   return build(`$X$ and $Y$ are independent with $M_X(t)=(1-${theta}t)^{-${a1}}$ and $M_Y(t)=(1-${theta}t)^{-${a2}}$. Find $\\operatorname{Var}(X+Y)$.`,
    variance, [round(a1 * theta * theta + a2 * theta, 4), round((a1 + a2) * theta, 4), round(a1 * a2 * theta * theta, 4), round((a1 + a2) * (a1 + a2 + 1) * theta * theta, 4)],
    `Independent MGFs multiply: $M_{X+Y}(t)=(1-${theta}t)^{-(${a1}+${a2})}$, a Gamma$(\\alpha=${a1 + a2},\\theta=${theta})$. So $\\operatorname{Var}(X+Y)=(\\alpha_1+\\alpha_2)\\theta^2=${a1 + a2}\\cdot${theta}^2=${fmt(variance, 4)}$. Variances of independent sums ADD; each part is $\\alpha_i\\theta^2$.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const mu = rint(1, 8);
   const s2 = pick([1, 2, 4, 9, 16, 3, 5, 6, 8, 25]);
   const m3 = round(mu ** 3 + 3 * mu * s2, 4);
   return build(`$X$ has moment generating function $M(t)=e^{${mu}t+${s2 / 2}t^2}$. Find $E[X^3]$.`,
    m3, [round(mu ** 3, 4), round(mu ** 3 + mu * s2, 4), round(mu + 3 * mu * s2, 4), round(3 * mu * s2, 4)],
    `Matching $e^{\\mu t+\\sigma^2 t^2/2}$ identifies a Normal$(\\mu=${mu},\\sigma^2=${s2})$. Its third moment is $E[X^3]=\\mu^3+3\\mu\\sigma^2=${mu}^3+3(${mu})(${s2})=${fmt(m3, 4)}$. Forgetting the $3\\mu\\sigma^2$ term (reporting $\\mu^3$) is the trap.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "transformations-univariate": [
  T("easy", () => {
   const theta = pick([2, 3, 4, 5, 10, 6, 8, 1.5, 2.5, 12]);
   const c = pick([2, 3, 0.5, 4, 1.5]);
   const y = c * theta * pick([1, 2, 0.5, 1.5, 3]);
   const p = round(Math.exp(-y / (c * theta)), 4);
   return build(`$X$ is exponential with mean $${theta}$, and $Y=${c}X$. Find $P(Y>${round(y, 2)})$.`,
    p, [round(Math.exp(-y / theta), 4), round(Math.exp(-c * y / theta), 4), round(1 - Math.exp(-y / (c * theta)), 4), round(Math.exp(-y / (c + theta)), 4)],
    `Scaling an exponential scales its mean: $Y=${c}X$ is exponential with mean $${c}\\cdot${theta}=${round(c * theta, 2)}$, so $P(Y>y)=e^{-y/(${round(c * theta, 2)})}=${fmt(p, 4)}$. Using the old mean $${theta}$ (forgetting the scale) is the trap.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const theta = pick([2, 3, 4, 5, 10, 6, 8, 1.5, 12, 2.5]);
   const y = theta * pick([0.5, 1, 1.5, 2, 0.25, 3, 0.75]);
   const p = round(Math.exp(-y / theta), 4);
   return build(`$X$ is uniform on $(0,1)$ and $Y=-${theta}\\ln(1-X)$. Find $P(Y>${round(y, 3)})$.`,
    p, [round(1 - Math.exp(-y / theta), 4), round(Math.exp(-y), 4), round(Math.exp(-theta * y), 4), round(Math.exp(-y / theta) / 2, 4)],
    `Invert: $P(Y\\le y)=P\\!\\left(X\\le 1-e^{-y/${theta}}\\right)=1-e^{-y/${theta}}$, so $Y$ is exponential with mean $${theta}$ and $P(Y>y)=e^{-y/${theta}}=${fmt(p, 4)}$. This is the inverse-CDF (probability-integral) transform.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const n = pick([2, 3, 4, 5, 6]);
   const y = rstep(0.1, 0.9, 0.05);
   const p = round(y ** n, 5);
   return build(`$X$ is uniform on $(0,1)$ and $Y=X^{1/${n}}$. Find $P(Y\\le ${fmt(y, 2)})$.`,
    p, [round(y ** (1 / n), 5), round(y, 5), round(n * y ** (n - 1), 5), round(y ** (n - 1), 5)],
    `CDF method: $P(Y\\le y)=P(X^{1/${n}}\\le y)=P(X\\le y^{${n}})=y^{${n}}=${fmt(p, 5)}$ for $0<y<1$ (so $Y\\sim$ Beta$(${n},1)$). Inverting the exponent to $y^{1/${n}}$ is the trap.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const a = rint(6, 15);
   const yv = pick([0.25, 1, 4, 9, 16, 25]);
   const sqrtY = Math.sqrt(yv);
   const f = round(1 / (2 * a * sqrtY), 5);
   return build(`$X$ is uniform on $(-${a},${a})$ and $Y=X^2$. Find the probability density $f_Y(${yv})$.`,
    f, [round(1 / (a * sqrtY), 5), round(1 / (2 * a * yv), 5), round(1 / (2 * a), 5), round(1 / (a * yv), 5)],
    `$Y=X^2$ is non-monotonic: both $x=\\pm\\sqrt{y}$ map to $y$. With $f_X=\\frac{1}{2(${a})}$, $f_Y(y)=2\\,f_X(\\sqrt y)\\left|\\frac{dx}{dy}\\right|=2\\cdot\\frac{1}{2(${a})}\\cdot\\frac{1}{2\\sqrt y}=\\frac{1}{2(${a})\\sqrt y}=${fmt(f, 5)}$. Dropping the factor of $2$ for the two roots is the trap.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "order-statistics": [
  T("easy", () => {
   const n = rint(2, 12);
   const theta = pick([1, 2, 5, 10, 4, 8, 20, 6, 3, 100]);
   const e = round(n * theta / (n + 1), 4);
   return build(`$X_1,\\dots,X_{${n}}$ are independent and uniform on $(0,${theta})$. Find $E\\!\\left[\\max(X_1,\\dots,X_{${n}})\\right]$.`,
    e, [round(theta, 4), round(theta / (n + 1), 4), round(theta / 2, 4), round(theta * (n + 1) / n, 4)],
    `The maximum of $${n}$ iid Uniform$(0,\\theta)$ has CDF $(x/\\theta)^{${n}}$, giving density $\\frac{${n}x^{${n}-1}}{\\theta^{${n}}}$ and $E[X_{(${n})}]=\\frac{${n}}{${n}+1}\\theta=${fmt(e, 4)}$. By symmetry $E[\\min]=\\frac{\\theta}{n+1}$; swapping them is the trap.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const n = rint(2, 12);
   const theta = pick([2, 5, 10, 4, 8, 20, 6, 3, 12, 100]);
   const e = round(theta / n, 4);
   return build(`$X_1,\\dots,X_{${n}}$ are independent, each exponential with mean $${theta}$. Find $E\\!\\left[\\min(X_1,\\dots,X_{${n}})\\right]$.`,
    e, [round(theta, 4), round(theta / (n + 1), 4), round(theta * n, 4), round(theta / (n * n), 4)],
    `The minimum of $${n}$ independent exponentials is exponential with rate equal to the SUM of the rates, $\\frac{${n}}{${theta}}$, hence mean $\\frac{${theta}}{${n}}=${fmt(e, 4)}$. The memoryless minimum is the fastest of the competing clocks.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const n = rint(2, 8);
   const theta = pick([10, 20, 100, 5, 50, 4, 8]);
   const m = round(theta * pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8]), 2);
   const p = round((m / theta) ** n, 5);
   return build(`$X_1,\\dots,X_{${n}}$ are independent and uniform on $(0,${theta})$. Find $P\\!\\left(\\max(X_1,\\dots,X_{${n}})\\le ${m}\\right)$.`,
    p, [round(m / theta, 5), round(1 - (1 - m / theta) ** n, 5), round(n * (m / theta) ** (n - 1), 5), round((1 - m / theta) ** n, 5)],
    `Every observation must be $\\le ${m}$: $P(\\max\\le m)=\\left(\\frac{m}{\\theta}\\right)^{${n}}=\\left(\\frac{${m}}{${theta}}\\right)^{${n}}=${fmt(p, 5)}$. The single-variable probability $\\frac{m}{\\theta}$ (forgetting all $${n}$ must comply) is the trap.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const n = rint(4, 8);
   const k = rint(2, n - 1);
   const pp = pick([0.3, 0.4, 0.5, 0.6, 0.7]);
   let tail = 0;
   for (let j = k; j <= n; j++) tail += nCr(n, j) * pp ** j * (1 - pp) ** (n - j);
   const correct = round(tail, 5);
   const single = round(nCr(n, k) * pp ** k * (1 - pp) ** (n - k), 5);
   return build(`$X_1,\\dots,X_{${n}}$ are independent and uniform on $(0,\\theta)$. For a threshold $m$ with $\\frac{m}{\\theta}=${pp}$, find $P\\!\\left(X_{(${k})}\\le m\\right)$ (the $${k}$-th smallest is at most $m$).`,
    correct, [single, round(1 - tail, 5), round(pp ** k, 5), round(nCr(n, k) * pp ** k, 5)],
    `$X_{(${k})}\\le m$ means at least $${k}$ of the $${n}$ observations fall below $m$, each with probability $\\frac{m}{\\theta}=${pp}$. So $P=\\sum_{j=${k}}^{${n}}\\binom{${n}}{j}(${pp})^{j}(1-${pp})^{${n}-j}=${fmt(correct, 5)}$. Taking only the $j=${k}$ term ignores that "at least $k$" is a binomial tail.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "sums-and-convolutions": [
  T("easy", () => {
   const l1 = pick([1, 2, 3, 1.5, 2.5, 0.5, 4]);
   const l2 = pick([1, 2, 3, 1.5, 0.5, 2.5, 4]);
   const k = rint(0, 4);
   const s = l1 + l2;
   const p = round(Math.exp(-s) * s ** k / fact(k), 5);
   return build(`$X$ and $Y$ are independent Poisson random variables with means $${l1}$ and $${l2}$. Find $P(X+Y=${k})$.`,
    p, [round(Math.exp(-l1) * l1 ** k / fact(k), 5), round(Math.exp(-s) * s ** k, 5), round(Math.exp(-s), 5), round(Math.exp(-s) * l1 ** k / fact(k), 5)],
    `A sum of independent Poissons is Poisson with the means ADDED: $X+Y\\sim$ Poisson$(${l1}+${l2}=${round(s, 2)})$. So $P(X+Y=${k})=\\frac{e^{-${round(s, 2)}}(${round(s, 2)})^{${k}}}{${k}!}=${fmt(p, 5)}$. Using only one of the two means is the trap.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const mu1 = rint(2, 10), mu2 = rint(2, 10);
   const v1 = pick([4, 9, 16, 25, 1, 36]), v2 = pick([9, 16, 4, 25, 49, 1]);
   const mSum = mu1 + mu2, sd = Math.sqrt(v1 + v2);
   const vthr = round(mSum + pick([-1, 0, 1, 2, -2]) * sd, 2);
   const z = (vthr - mSum) / sd;
   const p = round(1 - normalCdf(z), 4);
   return build(`$X\\sim N(${mu1},${v1})$ and $Y\\sim N(${mu2},${v2})$ are independent. Find $P(X+Y>${vthr})$.`,
    p, [round(1 - normalCdf((vthr - mSum) / (Math.sqrt(v1) + Math.sqrt(v2))), 4), round(normalCdf(z), 4), round(1 - normalCdf((vthr - mSum) / (v1 + v2)), 4), round(1 - normalCdf((vthr - mSum) / Math.sqrt(v1 * v2)), 4)],
    `Independent normals add: $X+Y\\sim N(${mSum},\\,${v1 + v2})$ (means AND variances add). Standardize: $z=\\frac{${vthr}-${mSum}}{\\sqrt{${v1 + v2}}}=${fmt(z, 3)}$, so $P=1-\\Phi(z)=${fmt(p, 4)}$. Adding standard deviations instead of variances is the classic error.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const n = rint(2, 5);
   const theta = pick([1, 2, 5, 10, 4, 0.5]);
   const t = round(theta * n * pick([0.5, 0.75, 1, 1.25, 1.5]), 2);
   const lt = t / theta;
   let tail = 0;
   for (let j = 0; j < n; j++) tail += Math.exp(-lt) * lt ** j / fact(j);
   const p = round(1 - tail, 5);
   return build(`$S=X_1+\\dots+X_{${n}}$, where the $X_i$ are independent exponentials each with mean $${theta}$. Find $P(S\\le ${t})$.`,
    p, [round(1 - Math.exp(-lt), 5), round(tail, 5), round(Math.exp(-lt) * lt ** (n - 1) / fact(n - 1), 5), round(1 - Math.exp(-t), 5)],
    `A sum of $${n}$ iid exponentials is Erlang (Gamma with integer shape): $P(S\\le t)=1-\\sum_{j=0}^{${n - 1}} e^{-t/${theta}}\\frac{(t/${theta})^{j}}{j!}=${fmt(p, 5)}$, with $t/\\theta=${fmt(lt, 3)}$. Using a single exponential $1-e^{-t/\\theta}$ ignores that it takes $${n}$ events.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const a = rint(2, 12);
   const rfac = pick([0.3, 0.5, 0.7, 0.9, 1.2, 1.4, 1.6, 1.8]);
   const s = round(a * rfac, 2);
   const p = round(rfac <= 1 ? rfac * rfac / 2 : 1 - (2 - rfac) ** 2 / 2, 5);
   return build(`$X$ and $Y$ are independent, each uniform on $(0,${a})$. Find $P(X+Y\\le ${s})$.`,
    p, [round(rfac * rfac / 2, 5), round(s / (2 * a), 5), round((s / (2 * a)) ** 2, 5), round(rfac <= 1 ? rfac / 2 : 1 - (2 - rfac) / 2, 5)],
    `The sum of two independent uniforms is TRIANGULAR on $(0,${2 * a})$. With $r=\\frac{s}{${a}}=${fmt(rfac, 2)}$: for $r\\le 1$, $P=\\frac{r^2}{2}$; for $r>1$, $P=1-\\frac{(2-r)^2}{2}$. Here $P=${fmt(p, 5)}$. Treating the sum as uniform (a straight $\\frac{s}{2a}$) ignores the triangular shape.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "random-variables-and-distributions": [
  T("easy", () => {
   const n = rint(5, 15);
   const p = pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.25, 0.1, 0.35]);
   const k = rint(2, Math.min(n - 2, 8));
   const ans = round(nCr(n, k) * p ** k * (1 - p) ** (n - k), 5);
   return build(`$X$ is binomial with ${n} trials and success probability $${p}$. Find $P(X=${k})$.`,
    ans, [round(p ** k * (1 - p) ** (n - k), 5), round(nCr(n, k) * p ** k, 5), round(nCr(n, k) * p ** k * (1 - p) ** n, 5), round(Math.exp(-n * p) * (n * p) ** k / fact(k), 5)],
    `Binomial pmf: $P(X=k)=\\binom{${n}}{${k}}(${p})^{${k}}(1-${p})^{${n}-${k}}=${fmt(ans, 5)}$. Forgetting the count $\\binom{${n}}{${k}}$ of arrangements (using just $p^k(1-p)^{n-k}$) is the trap.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const theta = pick([2, 3, 4, 5, 10, 6, 8, 12]);
   const m = round(theta * pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8]), 2);
   const ans = round(1 - (m / theta) ** 2, 5);
   return build(`The density of $X$ is $f(x)=\\frac{2x}{${theta * theta}}$ for $0<x<${theta}$ (and $0$ otherwise). Find $P(X>${m})$.`,
    ans, [round((m / theta) ** 2, 5), round(1 - m / theta, 5), round(m / theta, 5), round(1 - (m / theta) ** 3, 5)],
    `$f(x)=\\frac{2x}{\\theta^2}$ has CDF $F(x)=\\left(\\frac{x}{\\theta}\\right)^2$, so $P(X>${m})=1-\\left(\\frac{${m}}{${theta}}\\right)^2=${fmt(ans, 5)}$. Forgetting to take the complement (reporting $F(m)$) is the trap.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const theta = pick([100, 200, 500, 1000, 50, 250]);
   const alpha = pick([2, 3, 1.5, 4, 2.5]);
   const p = pick([0.5, 0.75, 0.9, 0.8, 0.95]);
   const xp = round(theta * (1 - p) ** (-1 / alpha), 2);
   return build(`$X$ follows a Pareto distribution with CDF $F(x)=1-\\left(\\frac{${theta}}{x}\\right)^{${alpha}}$ for $x>${theta}$. Find the ${round(p * 100, 0)}-th percentile of $X$.`,
    xp, [round(theta * (1 - p) ** (1 / alpha), 2), round(theta / (1 - p), 2), round(theta * p ** (-1 / alpha), 2), round(theta * (1 - p) ** (-alpha), 2)],
    `Set $F(x_p)=${p}$: $1-\\left(\\frac{${theta}}{x}\\right)^{${alpha}}=${p}\\Rightarrow \\left(\\frac{${theta}}{x}\\right)^{${alpha}}=${round(1 - p, 2)}\\Rightarrow x_p=${theta}(1-${p})^{-1/${alpha}}=${fmt(xp, 2)}$. Flipping the sign of the exponent is the trap.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const theta = pick([500, 1000, 2000, 800, 1500, 250]);
   const d = round(theta * pick([0.25, 0.5, 0.75, 1, 1.5]), 0);
   const ans = round(theta * Math.exp(-d / theta), 2);
   return build(`Losses $X$ are exponential with mean $${theta}$. An insurance policy with deductible $${d}$ pays $(X-${d})_+$ (the loss above the deductible, or $0$). Find the expected payment per loss.`,
    ans, [round(theta - d, 2), round(theta, 2), round(theta * Math.exp(-d / theta) - d, 2), round((theta - d) * Math.exp(-d / theta), 2)],
    `For an exponential loss, the expected payment per loss with deductible $d$ is $E[(X-d)_+]=\\theta e^{-d/\\theta}=${theta}\\,e^{-${d}/${theta}}=${fmt(ans, 2)}$. The memoryless property makes the excess over $d$ exponential again (mean $\\theta$), scaled by the survival $e^{-d/\\theta}$. Using $\\theta-d$ (as if losses were certain) is the trap.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "gamma-beta-lognormal": [
  T("easy", () => {
   const alpha = rint(2, 9);
   const theta = pick([2, 3, 4, 5, 1.5, 2.5, 6, 10]);
   const variance = round(alpha * theta * theta, 4);
   return build(`$X$ has a Gamma distribution with shape $\\alpha=${alpha}$ and scale $\\theta=${theta}$. Find $\\operatorname{Var}(X)$.`,
    variance, [round(alpha * theta, 4), round((alpha * theta) ** 2, 4), round(theta * theta, 4), round(alpha * alpha * theta, 4)],
    `For Gamma$(\\alpha,\\theta)$: $E[X]=\\alpha\\theta$ and $\\operatorname{Var}(X)=\\alpha\\theta^2=${alpha}\\cdot${theta}^2=${fmt(variance, 4)}$. Using $\\alpha\\theta$ (the mean) or $(\\alpha\\theta)^2$ (the mean squared) is the trap.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const mu = pick([0, 0.5, 1, 1.5, 2, -0.5, 0.25, 1.25]);
   const sigma = pick([0.5, 1, 0.25, 0.75, 1.5, 0.4]);
   const ans = round(Math.exp(mu + sigma * sigma / 2), 4);
   return build(`$X$ is lognormal: $\\ln X\\sim N(\\mu=${mu},\\,\\sigma=${sigma})$. Find $E[X]$.`,
    ans, [round(Math.exp(mu), 4), round(Math.exp(mu + sigma), 4), round(Math.exp(mu - sigma * sigma / 2), 4), round(Math.exp(mu) * sigma, 4)],
    `For a lognormal, $E[X]=e^{\\mu+\\sigma^2/2}=e^{${mu}+${round(sigma * sigma / 2, 4)}}=${fmt(ans, 4)}$. The $+\\sigma^2/2$ correction is essential: $e^{\\mu}$ is the MEDIAN, not the mean.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const a = rint(1, 6), b = rint(1, 6);
   const variance = round((a * b) / ((a + b) ** 2 * (a + b + 1)), 5);
   return build(`$X$ has a Beta distribution with parameters $a=${a}$ and $b=${b}$ (on $(0,1)$). Find $\\operatorname{Var}(X)$.`,
    variance, [round(a / (a + b), 5), round((a * b) / ((a + b) ** 2), 5), round((a * b) / ((a + b) ** 3), 5), round(a / ((a + b) * (a + b + 1)), 5)],
    `For Beta$(a,b)$: $E[X]=\\frac{a}{a+b}$ and $\\operatorname{Var}(X)=\\frac{ab}{(a+b)^2(a+b+1)}=\\frac{${a}\\cdot${b}}{${(a + b) ** 2}\\cdot${a + b + 1}}=${fmt(variance, 5)}$. Dropping the $(a+b+1)$ factor is the trap.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const mu = pick([0, 0.5, 1, 1.5, 2, 0.25, 1.25, 0.75]);
   const sigma = pick([0.5, 1, 0.75, 1.5, 0.4, 1.25]);
   const x = pick([1, 2, 3, 5, 4, 6, 8, 10]);
   const z = (Math.log(x) - mu) / sigma;
   const ans = round(normalCdf(z), 4);
   return build(`$X$ is lognormal with $\\ln X\\sim N(${mu},\\,\\sigma=${sigma})$. Find $P(X\\le ${x})$.`,
    ans, [round(1 - normalCdf(z), 4), round(normalCdf((x - mu) / sigma), 4), round(normalCdf(Math.log(x) - mu), 4), round(normalCdf((Math.log(x) - mu) / (sigma * sigma)), 4)],
    `Lognormal probabilities go through the normal CDF: $P(X\\le ${x})=P(\\ln X\\le \\ln ${x})=\\Phi\\!\\left(\\frac{\\ln ${x}-${mu}}{${sigma}}\\right)=\\Phi(${fmt(z, 3)})=${fmt(ans, 4)}$. Forgetting the $\\ln$ (using $x$ directly) is the trap.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "joint-and-marginal": [
  T("easy", () => {
   const a = rint(2, 10), b = rint(2, 10);
   const c = round(4 / (a * a * b * b), 5);
   return build(`The joint density of $X$ and $Y$ is $f(x,y)=c\\,xy$ for $0<x<${a}$, $0<y<${b}$ (and $0$ otherwise). Find the constant $c$.`,
    c, [round(1 / (a * b), 5), round(2 / (a * a * b * b), 5), round(4 / (a * b), 5), round(1 / (a * a * b * b), 5)],
    `Total probability is $1$: $\\int_0^{${a}}\\!\\int_0^{${b}} c\\,xy\\,dy\\,dx=c\\cdot\\frac{${a}^2}{2}\\cdot\\frac{${b}^2}{2}=\\frac{c\\,${a * a}\\cdot${b * b}}{4}=1$, so $c=\\frac{4}{${a * a}\\cdot${b * b}}=${fmt(c, 5)}$.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const a = rint(2, 9), b = rint(2, 9);
   const x0 = round(a * pick([0.25, 0.5, 0.75, 0.4, 0.6, 0.8]), 2);
   const fx = round(2 * x0 / (a * a), 5);
   return build(`The joint density of $X$ and $Y$ is $f(x,y)=\\frac{4xy}{${a * a * b * b}}$ on $0<x<${a}$, $0<y<${b}$. Find the marginal density $f_X(${x0})$.`,
    fx, [round(x0 / (a * a), 5), round(2 * x0 / a, 5), round(4 * x0 / (a * a), 5), round(2 * x0 / (a * a * b), 5)],
    `Integrate $y$ out: $f_X(x)=\\int_0^{${b}}\\frac{4xy}{${a * a * b * b}}\\,dy=\\frac{4x}{${a * a * b * b}}\\cdot\\frac{${b}^2}{2}=\\frac{2x}{${a * a}}$, so $f_X(${x0})=${fmt(fx, 5)}$. (Note $X$ and $Y$ are independent here.)`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const a = pick([2, 3, 4, 5, 10, 6]), b = pick([2, 3, 5, 4, 8, 6]);
   const x0 = round(a * pick([0.5, 1, 1.5, 0.75, 2]), 2);
   const y0 = round(b * pick([0.5, 1, 1.5, 0.75, 2]), 2);
   const ans = round((1 - Math.exp(-x0 / a)) * (1 - Math.exp(-y0 / b)), 5);
   return build(`$X$ and $Y$ are independent exponentials with means $${a}$ and $${b}$. Find $P(X\\le ${x0},\\;Y\\le ${y0})$.`,
    ans, [round(1 - Math.exp(-x0 / a) - Math.exp(-y0 / b), 5), round((1 - Math.exp(-x0 / a)) + (1 - Math.exp(-y0 / b)), 5), round(Math.exp(-x0 / a) * Math.exp(-y0 / b), 5), round(1 - Math.exp(-x0 / a) * Math.exp(-y0 / b), 5)],
    `Independence factors the joint CDF: $P(X\\le ${x0},Y\\le ${y0})=\\left(1-e^{-${x0}/${a}}\\right)\\left(1-e^{-${y0}/${b}}\\right)=${fmt(ans, 5)}$. Adding the two marginal probabilities instead of multiplying is the trap.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const a = rint(1, 10), b = rint(1, 10);
   const ans = round(b / (a + b), 5);
   return build(`Two components have independent exponential lifetimes: $X$ with mean $${a}$ and $Y$ with mean $${b}$. Find $P(X<Y)$ (the probability $X$ fails first).`,
    ans, [round(a / (a + b), 5), round(0.5, 5), round(b / a, 5), round((b * b) / (a * a + b * b), 5)],
    `For independent exponentials, $P(X<Y)=\\frac{\\lambda_X}{\\lambda_X+\\lambda_Y}$ where $\\lambda=1/\\text{mean}$. So $P(X<Y)=\\frac{1/${a}}{1/${a}+1/${b}}=\\frac{${b}}{${a}+${b}}=${fmt(ans, 5)}$. The faster clock (smaller mean) is more likely to fire first.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "conditional-distributions": [
  T("easy", () => {
   const theta = pick([2, 3, 4, 5, 10, 6, 8, 12]);
   const s = round(theta * pick([0.5, 1, 1.5, 2]), 1);
   const t = round(theta * pick([0.5, 1, 1.5, 2, 0.25]), 2);
   const ans = round(Math.exp(-t / theta), 4);
   return build(`$X$ is exponential with mean $${theta}$. Find $P(X>${round(s + t, 2)}\\mid X>${s})$.`,
    ans, [round(Math.exp(-(s + t) / theta), 4), round(Math.exp(-s / theta), 4), round(1 - Math.exp(-t / theta), 4), round(Math.exp(-t / (theta * 2)), 4)],
    `The exponential is MEMORYLESS: $P(X>s+t\\mid X>s)=P(X>t)=e^{-t/${theta}}=e^{-${t}/${theta}}=${fmt(ans, 4)}$. The past survival to time $${s}$ is irrelevant; only the extra $${t}$ matters.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const theta = pick([10, 20, 50, 100, 8, 12, 40]);
   const a = round(theta * pick([0.2, 0.3, 0.4, 0.5]), 1);
   const b = round(theta * pick([0.6, 0.7, 0.8, 0.9]), 1);
   const ans = round((theta - b) / (theta - a), 5);
   return build(`$X$ is uniform on $(0,${theta})$. Find $P(X>${b}\\mid X>${a})$.`,
    ans, [round((theta - b) / theta, 5), round(b / a, 5), round(1 - (theta - b) / (theta - a), 5), round((theta - a) / (theta - b), 5)],
    `Condition on the surviving range: given $X>${a}$, $X$ is uniform on $(${a},${theta})$, so $P(X>${b}\\mid X>${a})=\\frac{${theta}-${b}}{${theta}-${a}}=${fmt(ans, 5)}$. Using the unconditional $\\frac{\\theta-b}{\\theta}$ is the trap.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const theta = pick([2, 3, 4, 5, 10, 6, 8, 12]);
   const d = round(theta * pick([0.5, 1, 1.5, 2, 0.75]), 2);
   const ans = round(theta + d, 2);
   return build(`$X$ is exponential with mean $${theta}$. Find $E[X\\mid X>${d}]$.`,
    ans, [round(theta, 2), round(d, 2), round(theta - d, 2), round(theta * Math.exp(-d / theta) + d, 2)],
    `By memorylessness, the excess $X-${d}$ given $X>${d}$ is again exponential with mean $${theta}$, so $E[X\\mid X>${d}]=${d}+${theta}=${fmt(ans, 2)}$. The conditional mean is the threshold plus the (undiminished) mean.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const theta = pick([4, 6, 8, 10, 12, 5]);
   const y0 = round(theta * pick([0.3, 0.5, 0.7, 0.9, 0.4, 0.6]), 2);
   const ans = round(y0 * y0 / 12, 5);
   return build(`$(X,Y)$ is uniform on the triangle $0<x<y<${theta}$. Find $\\operatorname{Var}(X\\mid Y=${y0})$.`,
    ans, [round(y0 / 2, 5), round(y0 * y0 / 4, 5), round(theta * theta / 12, 5), round(y0 / 12, 5)],
    `For fixed $Y=${y0}$, the density is flat in $x$ over $(0,${y0})$, so $X\\mid Y=${y0}\\sim\\text{Uniform}(0,${y0})$. A uniform on $(0,L)$ has variance $\\frac{L^2}{12}$, hence $\\operatorname{Var}(X\\mid Y=${y0})=\\frac{${y0}^2}{12}=${fmt(ans, 5)}$. ($E[X\\mid Y]=\\frac{Y}{2}$ is the conditional mean, not the variance.)`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "equation-of-value": [
  T("easy", () => {
   const L = pick([1000, 2000, 5000, 10000, 1500, 3000]);
   const i = rstep(0.04, 0.10, 0.0025);
   const t1 = rint(1, 3), t2 = rint(4, 7);
   const x = round(L / (vOf(i) ** t1 + vOf(i) ** t2), 2);
   return build(`A debt of $${L}$ is repaid by two EQUAL payments of $X$, one at the end of year ${t1} and one at the end of year ${t2}. At ${pct(i, 2)} effective, find $X$.`,
    x, [round(L / 2, 2), round(L / (2 * vOf(i) ** t1), 2), round(L * i, 2), round(L / (vOf(i) ** t1 + vOf(i) ** t2) / 2, 2)],
    `Set PV of payments $=$ debt: $X(v^{${t1}}+v^{${t2}})=${L}$, so $X=\\frac{${L}}{v^{${t1}}+v^{${t2}}}=${x}$. Splitting the debt in half (ignoring the time value) is the trap.`,
    money, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const A = pick([100, 200, 500, 1000]), B = pick([150, 300, 250, 400]);
   const i = rstep(0.04, 0.10, 0.0025);
   const t1 = rint(1, 3), T = rint(5, 8);
   const x = round(A * (1 + i) ** T + B * (1 + i) ** (T - t1), 2);
   return build(`A fund receives $${A}$ at time $0$ and $${B}$ at the end of year ${t1}. It earns ${pct(i, 2)} effective. Find the fund balance at the end of year ${T}.`,
    x, [round((A + B) * (1 + i) ** T, 2), round(A * (1 + i) ** T + B * (1 + i) ** (T + t1), 2), round(A * (1 + i) ** T + B * (1 + i) ** T, 2), round((A + B) * (1 + i) ** (T - t1), 2)],
    `Accumulate each deposit to time ${T} over its OWN horizon: $${A}(1+i)^{${T}}+${B}(1+i)^{${T - t1}}=${x}$. The second deposit grows only ${T - t1} years (it arrives at year ${t1}); using ${T} for both is the trap.`,
    money, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const A = pick([1000, 2000, 1500]), B = pick([500, 800, 1200]), C = pick([300, 600, 900]);
   const i = rstep(0.04, 0.09, 0.0025);
   const t1 = 1, t2 = rint(3, 4), t3 = rint(6, 8), T = rint(9, 11);
   const v = round(A * (1 + i) ** (T - t1) + B * (1 + i) ** (T - t2) + C * (1 + i) ** (T - t3), 2);
   return build(`Payments of $${A}$, $${B}$, and $${C}$ are made at the ends of years ${t1}, ${t2}, and ${t3}. At ${pct(i, 2)} effective, find their combined accumulated value at the end of year ${T}.`,
    v, [round((A + B + C) * (1 + i) ** T, 2), round(A * (1 + i) ** (T - t1) + B * (1 + i) ** (T - t2) + C * (1 + i) ** (T - t3) + (A + B + C) * 0.01, 2), round(A * (1 + i) ** t1 + B * (1 + i) ** t2 + C * (1 + i) ** t3, 2), round((A + B + C) * (1 + i) ** (T - t2), 2)],
    `Value each cash flow at the comparison date $t=${T}$: $${A}(1+i)^{${T - t1}}+${B}(1+i)^{${T - t2}}+${C}(1+i)^{${T - t3}}=${v}$. The equation of value is invariant to the comparison date, but each flow's exponent is its OWN distance to it.`,
    money, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const A = pick([1000, 2000, 1500, 800]), B = pick([1500, 2500, 1200, 3000]);
   const i = rstep(0.04, 0.10, 0.0025);
   const t1 = rint(1, 3), t2 = rint(5, 9);
   const num = A * vOf(i) ** t1 + B * vOf(i) ** t2;
   const Texact = round(Math.log((A + B) / num) / Math.log(1 + i), 3);
   const approx = round((A * t1 + B * t2) / (A + B), 3);
   return build(`A payment of $${A}$ at the end of year ${t1} and $${B}$ at the end of year ${t2} are to be replaced by a SINGLE payment of $${A + B}$ at time $T$, of equal value at ${pct(i, 2)} effective. Find the exact $T$.`,
    Texact, [approx, round(Texact + 0.5, 3), round((t1 + t2) / 2, 3), round(Math.log(num / (A + B)) / Math.log(1 + i), 3)],
    `Equate values: $(${A + B})v^{T}=${A}v^{${t1}}+${B}v^{${t2}}$, so $v^{T}=\\frac{${A}v^{${t1}}+${B}v^{${t2}}}{${A + B}}$ and $T=\\frac{\\ln[(${A + B})/(${A}v^{${t1}}+${B}v^{${t2}})]}{\\ln(1+i)}=${fmt(Texact, 3)}$. The method of equated time $\\bar t=\\frac{\\sum t_k A_k}{\\sum A_k}=${fmt(approx, 3)}$ only APPROXIMATES it (and is always slightly larger).`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "sinking-funds": [
  T("easy", () => {
   const L = pick([10000, 20000, 50000, 100000, 15000]);
   const j = rstep(0.04, 0.09, 0.0025);
   const n = rint(5, 20);
   const d = round(L / sImm(n, j), 2);
   return build(`A loan of $${L}$ is repaid by the SINKING-FUND method over ${n} years; the fund earns ${pct(j, 2)} effective. Find the annual sinking-fund deposit.`,
    d, [round(L / aImm(n, j), 2), round(L / n, 2), round(L * j, 2), round(L * j / n, 2)],
    `The deposits must accumulate to the loan: $D\\,s_{\\overline{${n}}|}=${L}$, so $D=\\frac{${L}}{s_{\\overline{${n}}|}}=${d}$. Dividing by $a_{\\overline{n}|}$ (a PV factor) instead of $s_{\\overline{n}|}$ (an AV factor) is the trap.`,
    money, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const L = pick([10000, 20000, 50000, 15000, 25000]);
   const i = rstep(0.06, 0.11, 0.0025);
   const j = round(i - pick([0.01, 0.015, 0.02, 0.025]), 4);
   const n = rint(8, 20);
   const total = round(L * i + L / sImm(n, j), 2);
   return build(`A loan of $${L}$ is repaid by the sinking-fund method over ${n} years. The borrower pays ${pct(i, 2)} interest to the lender and deposits into a fund earning ${pct(j, 2)}. Find the TOTAL annual payment.`,
    total, [round(L / sImm(n, j), 2), round(L * i + L / aImm(n, j), 2), round(L / aImm(n, i), 2), round(L * i, 2)],
    `Total $=$ interest to lender $+$ sinking-fund deposit $=${L}(${fmt(i, 4)})+\\frac{${L}}{s_{\\overline{${n}}|}^{\\,${pct(j, 2)}}}=${total}$. The interest is on the FULL loan every year (principal never declines under this method).`,
    money, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const L = pick([10000, 20000, 50000, 30000]);
   const j = rstep(0.05, 0.09, 0.0025);
   const n = rint(10, 20), t = rint(3, 8);
   const bal = round((L / sImm(n, j)) * sImm(t, j), 2);
   return build(`A loan of $${L}$ uses the sinking-fund method over ${n} years with a fund earning ${pct(j, 2)}. Find the amount in the sinking fund just after the ${t}-th deposit.`,
    bal, [round(L * t / n, 2), round((L / sImm(n, j)) * aImm(t, j), 2), round((L / sImm(n, j)) * t, 2), round(L * sImm(t, j) / sImm(n, j) * vOf(j) ** t, 2)],
    `Each deposit is $D=\\frac{${L}}{s_{\\overline{${n}}|}}$; after ${t} of them the fund holds $D\\,s_{\\overline{${t}}|}=${bal}$. A straight-line $\\frac{${L}\\cdot${t}}{${n}}$ ignores the interest the fund has earned.`,
    money, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const L = pick([10000, 20000, 50000, 25000]);
   const i = rstep(0.07, 0.11, 0.0025);
   const j = round(i - pick([0.02, 0.025, 0.03, 0.035]), 4);
   const n = rint(10, 20);
   const extra = round(L * (1 / sImm(n, j) - 1 / sImm(n, i)), 2);
   return build(`A loan of $${L}$ over ${n} years can be repaid two ways: amortized at ${pct(i, 2)}, or sinking-fund (pay ${pct(i, 2)} interest, deposit to a fund earning only ${pct(j, 2)}). How much MORE per year does the sinking-fund method cost?`,
    extra, [round(L / sImm(n, j), 2), round(L / aImm(n, i), 2), round(L * (i - j), 2), round(L * (1 / aImm(n, j) - 1 / aImm(n, i)), 2)],
    `Amortization pays $L(i+\\tfrac{1}{s_{\\overline n|}^i})$; sinking-fund pays $L(i+\\tfrac{1}{s_{\\overline n|}^j})$. The difference is $L\\left(\\frac{1}{s_{\\overline{${n}}|}^{\\,${pct(j, 2)}}}-\\frac{1}{s_{\\overline{${n}}|}^{\\,${pct(i, 2)}}}\\right)=${extra}$, the penalty for the fund earning less than the loan rate.`,
    money, TIER_DIFF.superhard);
  }),
 ],

 "dollar-time-weighted": [
  T("easy", () => {
   const B0 = pick([10000, 20000, 50000, 100000, 5000]);
   const D = pick([5000, 10000, 2000, 20000]);
   const t = pick([0.25, 0.5, 0.75]);
   const I = pick([500, 1000, 1500, 2000, 800, 1200]);
   const B1 = B0 + D + I;
   const idw = round(I / (B0 + D * (1 - t)), 5);
   return build(`A fund starts the year with $${B0}$. A deposit of $${D}$ is made at time $t=${t}$. The year-end balance is $${B1}$. Find the dollar-weighted (money-weighted) yield.`,
    idw, [round(I / B0, 5), round(I / (B0 + D), 5), round(I / (B0 + D * t), 5), round(B1 / B0 - 1, 5)],
    `Interest earned is $${B1}-${B0}-${D}=${I}$. Dollar-weighting uses simple-interest exposure: $i=\\frac{I}{B_0+D(1-t)}=\\frac{${I}}{${B0}+${D}(1-${t})}=${fmt(idw, 5)}$. The deposit only works for the remaining $(1-${t})$ of the year.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const B0 = pick([100, 200, 500, 1000]);
   const M = round(B0 * pick([1.05, 1.08, 1.1, 0.95, 1.12]), 2);
   const D = pick([100, 200, 50, 300]);
   const B1 = round((M + D) * pick([1.04, 1.06, 0.97, 1.1, 1.03]), 2);
   const itw = round((M / B0) * (B1 / (M + D)) - 1, 5);
   return build(`A fund holds $${B0}$ at the start of the year. Just BEFORE a deposit of $${D}$ at mid-year the balance is $${M}$; the year-end balance is $${B1}$. Find the time-weighted yield.`,
    itw, [round(B1 / B0 - 1, 5), round((M / B0) * (B1 / M) - 1, 5), round((B1 - B0 - D) / B0, 5), round(M / B0 + B1 / (M + D) - 1, 5)],
    `Time-weighting multiplies the sub-period growth factors and ignores the deposit's timing: $(1+i)=\\frac{${M}}{${B0}}\\cdot\\frac{${B1}}{${M}+${D}}$, so $i=${fmt(itw, 5)}$. Dividing only end by start ($\\frac{B_1}{B_0}-1$) double-counts the deposit.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const B0 = pick([1000, 2000, 5000]);
   const M1 = round(B0 * pick([1.04, 1.06, 0.98, 1.08]), 2);
   const D1 = pick([500, 1000, 300]);
   const M2 = round((M1 + D1) * pick([1.03, 1.05, 0.97, 1.07]), 2);
   const D2 = pick([400, 800, 200]);
   const B1 = round((M2 + D2) * pick([1.02, 1.05, 0.99, 1.06]), 2);
   const itw = round((M1 / B0) * (M2 / (M1 + D1)) * (B1 / (M2 + D2)) - 1, 5);
   return build(`A fund (start $${B0}$) is valued just before each external flow: balance $${M1}$ before a deposit of $${D1}$, then $${M2}$ before a deposit of $${D2}$, and ends at $${B1}$. Find the time-weighted yield.`,
    itw, [round(B1 / B0 - 1, 5), round((M1 / B0) * (M2 / M1) * (B1 / M2) - 1, 5), round((M1 / B0) * (M2 / (M1 + D1)) - 1, 5), round(B1 / (B0 + D1 + D2) - 1, 5)],
    `Chain ALL sub-period factors: $(1+i)=\\frac{${M1}}{${B0}}\\cdot\\frac{${M2}}{${M1}+${D1}}\\cdot\\frac{${B1}}{${M2}+${D2}}$, giving $i=${fmt(itw, 5)}$. Each interim valuation must be taken just BEFORE its cash flow.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const B0 = pick([50000, 100000, 20000, 80000]);
   const D1 = pick([10000, 20000, 5000]), t1 = pick([0.25, 0.3, 0.5]);
   const W2 = pick([5000, 10000, 8000]), t2 = pick([0.6, 0.75, 0.8]);
   const I = pick([2000, 5000, 3000, 4000]);
   const B1 = B0 + D1 - W2 + I;
   const denom = B0 + D1 * (1 - t1) - W2 * (1 - t2);
   const idw = round(I / denom, 5);
   return build(`A fund starts at $${B0}$. A deposit of $${D1}$ is made at time $${t1}$ and a WITHDRAWAL of $${W2}$ at time $${t2}$. The year-end balance is $${B1}$. Find the dollar-weighted yield.`,
    idw, [round(I / B0, 5), round(I / (B0 + D1 - W2), 5), round(I / (B0 + D1 * (1 - t1) + W2 * (1 - t2)), 5), round(B1 / B0 - 1, 5)],
    `Net interest $=${B1}-${B0}-${D1}+${W2}=${I}$. Each flow is weighted by its time in the fund (the withdrawal REDUCES exposure): $i=\\frac{${I}}{${B0}+${D1}(1-${t1})-${W2}(1-${t2})}=${fmt(idw, 5)}$. Sign errors on the withdrawal's weight are the trap.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "yield-rates-npv": [
  T("easy", () => {
   const C0 = pick([1000, 2000, 5000, 1500]);
   const R1 = pick([600, 800, 1200, 1000]), R2 = pick([700, 900, 1500, 1100]);
   const i = rstep(0.05, 0.12, 0.0025);
   const t1 = 1, t2 = 2;
   const npv = round(-C0 + R1 * vOf(i) ** t1 + R2 * vOf(i) ** t2, 2);
   return build(`A project costs $${C0}$ now and returns $${R1}$ at the end of year 1 and $${R2}$ at the end of year 2. At a ${pct(i, 2)} cost of capital, find the net present value.`,
    npv, [round(-C0 + R1 + R2, 2), round(R1 * vOf(i) + R2 * vOf(i) ** 2, 2), round(-C0 + (R1 + R2) * vOf(i) ** 2, 2), round(-C0 + R1 * vOf(i) ** 2 + R2 * vOf(i), 2)],
    `Discount every inflow and net the cost: $NPV=-${C0}+${R1}v+${R2}v^2=${npv}$ at $i=${pct(i, 2)}$. Adding undiscounted cash flows ignores the time value of money.`,
    money, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const C0 = pick([5000, 10000, 20000, 8000]);
   const R = pick([1000, 1500, 2000, 2500]);
   const i = rstep(0.05, 0.10, 0.0025);
   const n = rint(6, 15);
   const npv = round(-C0 + R * aImm(n, i), 2);
   return build(`A project costs $${C0}$ today and returns $${R}$ at the end of each year for ${n} years. At ${pct(i, 2)} effective, find the net present value.`,
    npv, [round(-C0 + R * n, 2), round(-C0 + R * sImm(n, i), 2), round(R * aImm(n, i), 2), round(-C0 + R * aDue(n, i), 2)],
    `The inflows are a level annuity-immediate: $NPV=-${C0}+${R}\\,a_{\\overline{${n}}|}=${npv}$. Using $s_{\\overline{n}|}$ (an accumulated value) instead of $a_{\\overline{n}|}$ (a present value) is the trap.`,
    money, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const C0 = pick([1000, 2000, 5000, 4000]);
   const i = rstep(0.05, 0.15, 0.005);
   const n = rint(3, 10);
   const A = round(C0 * (1 + i) ** n, 2);
   const irr = round((A / C0) ** (1 / n) - 1, 5);
   return build(`An investment of $${C0}$ grows to a single payout of $${A}$ after ${n} years. Find the annual yield (internal rate of return).`,
    irr, [round((A - C0) / C0, 5), round((A - C0) / (C0 * n), 5), round(A / C0 - 1, 5), round((A / C0) ** n - 1, 5)],
    `The IRR sets PV of inflow $=$ cost: $${C0}(1+i)^{${n}}=${A}$, so $i=\\left(\\frac{${A}}{${C0}}\\right)^{1/${n}}-1=${fmt(irr, 5)}$. Dividing total growth by $${n}$ (a simple-interest average) understates the compounded yield.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const i = rstep(0.06, 0.20, 0.005);
   const R1 = pick([500, 1000, 800, 1200]), R2 = pick([1000, 1500, 2000, 1300]);
   const v = vOf(i);
   const C0 = round(R1 * v + R2 * v * v, 2);
   return build(`A project costs $${C0}$ now and returns $${R1}$ at the end of year 1 and $${R2}$ at the end of year 2. Find the internal rate of return (the yield $i$ with $NPV=0$).`,
    round(i, 5), [round(R1 / C0, 5), round((R1 + R2) / C0 - 1, 5), round((R1 + R2 - C0) / (2 * C0), 5), round(((R1 + R2) / C0) ** (1 / 2) - 1, 5)],
    `Set $NPV=0$: $${C0}=${R1}v+${R2}v^2$, a quadratic in $v$. The positive root is $v=\\frac{-${R1}+\\sqrt{${R1}^2+4(${R2})(${C0})}}{2(${R2})}$, giving $i=\\frac1v-1=${fmt(round(i, 5), 5)}$. A single-cash-flow shortcut ignores that two payments at different times set the yield.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "deferred-and-continuous-annuities": [
  T("easy", () => {
   const R = pick([100, 500, 1000, 200, 1500, 300]);
   const i = rstep(0.04, 0.10, 0.0025);
   const n = rint(5, 15), m = rint(2, 6);
   const pv = round(R * aImm(n, i) * vOf(i) ** m, 2);
   return build(`An annuity-immediate pays $${R}$ at the end of each year for ${n} years, but the first payment is deferred so it occurs at the end of year ${m + 1}. At ${pct(i, 2)} effective, find the present value.`,
    pv, [round(R * aImm(n, i), 2), round(R * aImm(n, i) * vOf(i) ** (m - 1), 2), round(R * aImm(n + m, i), 2), round(R * aImm(n, i) * vOf(i) ** (m + 1), 2)],
    `Value the $${n}$-year annuity one period before its first payment, then discount the $${m}$-year deferral: $${R}\\,a_{\\overline{${n}}|}\\,v^{${m}}=${pv}$. Off-by-one on the deferral exponent is the classic trap.`,
    money, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const R = pick([100, 500, 1000, 200, 1500, 2000]);
   const i = rstep(0.04, 0.10, 0.0025);
   const n = rint(5, 20);
   const delta = Math.log(1 + i);
   const pv = round(R * (1 - vOf(i) ** n) / delta, 2);
   return build(`A continuous annuity pays at a rate of $${R}$ per year, continuously, for ${n} years. At ${pct(i, 2)} effective, find the present value.`,
    pv, [round(R * aImm(n, i), 2), round(R * (1 - vOf(i) ** n) / i, 2), round(R * ((1 + i) ** n - 1) / delta, 2), round(R * n, 2)],
    `A continuous annuity discounts with the FORCE: $\\bar a_{\\overline{${n}}|}=\\frac{1-v^{${n}}}{\\delta}$ where $\\delta=\\ln(1+i)=${fmt(delta, 5)}$. So PV $=${R}\\cdot\\frac{1-v^{${n}}}{\\delta}=${pv}$. Using $i$ instead of $\\delta$ in the denominator is the trap.`,
    money, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const R = pick([100, 500, 1000, 200, 1500]);
   const i = rstep(0.04, 0.10, 0.0025);
   const n = rint(5, 20);
   const delta = Math.log(1 + i);
   const av = round(R * ((1 + i) ** n - 1) / delta, 2);
   return build(`A continuous annuity pays at a rate of $${R}$ per year for ${n} years. At ${pct(i, 2)} effective, find the ACCUMULATED value at the end of ${n} years.`,
    av, [round(R * (1 - vOf(i) ** n) / delta, 2), round(R * ((1 + i) ** n - 1) / i, 2), round(R * sImm(n, i), 2), round(R * n * (1 + i) ** n, 2)],
    `The continuous accumulated value is $\\bar s_{\\overline{${n}}|}=\\frac{(1+i)^{${n}}-1}{\\delta}$ with $\\delta=\\ln(1+i)=${fmt(delta, 5)}$, so AV $=${R}\\cdot\\frac{(1+i)^{${n}}-1}{\\delta}=${av}$. Confusing it with the present value $\\bar a_{\\overline{n}|}$ is the trap.`,
    money, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const i = rstep(0.04, 0.10, 0.0025);
   const n = rint(5, 15);
   const delta = Math.log(1 + i);
   const abar = (1 - vOf(i) ** n) / delta;
   const pv = round((abar - n * vOf(i) ** n) / delta, 4);
   return build(`A continuously-increasing continuous annuity pays at the instantaneous rate of $t$ per year at time $t$, for $${n}$ years (at time $t$ the payment rate is $t$). At ${pct(i, 2)} effective, find the present value $(\\bar I\\bar a)_{\\overline{${n}}|}$.`,
    pv, [round(abar, 4), round((abar - n * vOf(i) ** n) / i, 4), round(n * n / 2 * vOf(i) ** n, 4), round((abar - n * vOf(i) ** n) / delta + n, 4)],
    `Integrate the rate against the discount: $(\\bar I\\bar a)_{\\overline{${n}}|}=\\int_0^{${n}} t\\,v^{t}\\,dt=\\frac{\\bar a_{\\overline{${n}}|}-${n}v^{${n}}}{\\delta}=${fmt(pv, 4)}$, with $\\delta=${fmt(delta, 5)}$ and $\\bar a_{\\overline{${n}}|}=${fmt(abar, 4)}$. Dividing by $i$ rather than $\\delta$ is the trap.`,
    prob, TIER_DIFF.superhard);
  }),
 ],

 "bond-amortization": [
  T("easy", () => {
   const F = pick([1000, 5000, 10000]);
   const cr = pick([0.04, 0.05, 0.06, 0.07, 0.08]);
   const i = pick([0.04, 0.05, 0.06, 0.07]);
   const n = rint(8, 15), t = rint(2, 6);
   const bt = round(F * cr * aImm(n - t, i) + F * vOf(i) ** (n - t), 2);
   return build(`A $${F}$ par-value bond pays ${pct(cr, 0)} annual coupons, matures in ${n} years, and is bought to yield ${pct(i, 0)}. Find the book value just after the ${t}-th coupon.`,
    bt, [round(F * cr * aImm(n, i) + F * vOf(i) ** n, 2), round(F * cr * aImm(n - t, i) + F * vOf(i) ** (n - t) + F * cr, 2), round(F, 2), round(F * cr * aImm(t, i) + F * vOf(i) ** t, 2)],
    `Book value is the PROSPECTIVE price of the remaining cash flows: $B_{${t}}=Fr\\,a_{\\overline{${n - t}}|}+F v^{${n - t}}=${bt}$. It uses the time remaining $(${n}-${t})$, not the original term.`,
    money, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const F = pick([1000, 5000, 10000]);
   const cr = pick([0.05, 0.06, 0.07, 0.08]);
   const i = pick([0.04, 0.05, 0.06]);
   const n = rint(8, 15), t = rint(2, 6);
   const bPrev = F * cr * aImm(n - t + 1, i) + F * vOf(i) ** (n - t + 1);
   const interest = round(i * bPrev, 2);
   return build(`A $${F}$ par bond with ${pct(cr, 0)} annual coupons matures in ${n} years, bought to yield ${pct(i, 0)}. Find the INTEREST earned in the ${t}-th coupon (the amortization schedule's interest column).`,
    interest, [round(F * cr, 2), round(i * F, 2), round(F * cr - i * bPrev, 2), round(i * (F * cr * aImm(n - t, i) + F * vOf(i) ** (n - t)), 2)],
    `Interest earned in period ${t} is the yield on the PRIOR book value: $i\\cdot B_{${t - 1}}=${fmt(i, 2)}\\times${fmt(round(bPrev, 2), 2)}=${interest}$. The coupon $Fr=${fmt(F * cr, 2)}$ is the cash; the rest of it amortizes principal.`,
    money, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const F = pick([1000, 5000, 10000]);
   const cr = pick([0.06, 0.07, 0.08]);
   const i = pick([0.04, 0.05]);
   const n = rint(8, 15), t = rint(2, 6);
   const adj = round((F * cr - F * i) * vOf(i) ** (n - t + 1), 2);
   return build(`A $${F}$ par bond, ${pct(cr, 0)} annual coupons, ${n} years, yield ${pct(i, 0)}. Find the principal adjustment (write-down) in the ${t}-th coupon.`,
    adj, [round(F * cr - F * i, 2), round(F * cr, 2), round((F * cr - F * i) * vOf(i) ** (n - t), 2), round(F * i, 2)],
    `The write-down equals coupon minus interest, which simplifies to $(Fr-Fi)\\,v^{n-t+1}=(${fmt(F * cr, 0)}-${fmt(F * i, 0)})v^{${n - t + 1}}=${adj}$. The undiscounted $(Fr-Fi)$ is the FINAL period's adjustment only.`,
    money, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const F = pick([1000, 5000, 10000]);
   const cr = pick([0.05, 0.06, 0.07, 0.08]);
   const i = pick([0.04, 0.05, 0.06]);
   const n = rint(10, 16), t1 = rint(2, 4), k = rint(3, 5);
   const t2 = t1 + k;
   const b1 = F * cr * aImm(n - t1, i) + F * vOf(i) ** (n - t1);
   const b2 = round(b1 * (1 + i) ** k - F * cr * sImm(k, i), 2);
   return build(`A $${F}$ par bond (${pct(cr, 0)} coupons, yield ${pct(i, 0)}, ${n} years) has book value $${round(b1, 2)}$ just after coupon ${t1}. Find the book value just after coupon ${t2}.`,
    b2, [round(b1, 2), round(b1 * (1 + i) ** k, 2), round(b1 - F * cr * k, 2), round(b1 * (1 + i) ** k - F * cr * aImm(k, i), 2)],
    `Roll the book value forward: each period it earns interest then loses the coupon, so $B_{${t2}}=B_{${t1}}(1+i)^{${k}}-Fr\\,s_{\\overline{${k}}|}=${b2}$. Forgetting the accumulated coupons $Fr\\,s_{\\overline{k}|}$ is the trap.`,
    money, TIER_DIFF.superhard);
  }),
 ],

 "callable-bonds": [
  T("easy", () => {
   const F = pick([1000, 5000, 10000]);
   const i = pick([0.04, 0.05, 0.06]);
   const cr = round(i + pick([0.01, 0.015, 0.02, 0.025]), 4);
   const c = rint(5, 9), n = c + rint(3, 6);
   const price = round(F * cr * aImm(c, i) + F * vOf(i) ** c, 2);
   return build(`A $${F}$ par bond pays ${pct(cr, 1)} annual coupons, is callable at par after ${c} years, and otherwise matures in ${n} years. To GUARANTEE a yield of at least ${pct(i, 0)}, what price should an investor pay?`,
    price, [round(F * cr * aImm(n, i) + F * vOf(i) ** n, 2), round(F, 2), round(F * cr * aImm(c, i) + F * vOf(i) ** c + F * cr, 2), round(F * cr * aImm(n, i) + F * vOf(i) ** c, 2)],
    `Coupon ${pct(cr, 1)} $>$ yield ${pct(i, 0)} makes this a PREMIUM bond, so the issuer calls at the EARLIEST date (worst case for the investor). Price at year ${c}: $Fr\\,a_{\\overline{${c}}|}+F v^{${c}}=${price}$. Pricing to maturity would risk a yield below ${pct(i, 0)} if called.`,
    money, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const F = pick([1000, 5000, 10000]);
   const i = pick([0.05, 0.06, 0.07]);
   const cr = round(i - pick([0.01, 0.015, 0.02]), 4);
   const c = rint(4, 7), n = c + rint(3, 6);
   const price = round(F * cr * aImm(n, i) + F * vOf(i) ** n, 2);
   return build(`A $${F}$ par bond pays ${pct(cr, 1)} annual coupons, is callable at par after ${c} years, and otherwise matures in ${n} years. To GUARANTEE a yield of at least ${pct(i, 0)}, what price should an investor pay?`,
    price, [round(F * cr * aImm(c, i) + F * vOf(i) ** c, 2), round(F, 2), round(F * cr * aImm(n, i) + F * vOf(i) ** c, 2), round(F * cr * aImm(n, i), 2)],
    `Coupon ${pct(cr, 1)} $<$ yield ${pct(i, 0)} makes this a DISCOUNT bond, so the worst case is the LATEST redemption (maturity at year ${n}). Price $=Fr\\,a_{\\overline{${n}}|}+F v^{${n}}=${price}$. A discount bond is never called early to the investor's disadvantage.`,
    money, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const F = 1000;
   const i = pick([0.05, 0.06, 0.07]);
   const cr = round(i + pick([0.01, 0.02]), 4);
   const Ccall = pick([1050, 1100, 1025, 1075]);
   const c = rint(5, 8), n = c + rint(3, 6);
   const pCall = F * cr * aImm(c, i) + Ccall * vOf(i) ** c;
   const pMat = F * cr * aImm(n, i) + F * vOf(i) ** n;
   const price = round(Math.min(pCall, pMat), 2);
   return build(`A $1000$ par bond pays ${pct(cr, 1)} annual coupons. It is callable for $${Ccall}$ after ${c} years, or it matures at par ($1000$) in ${n} years. At a yield of ${pct(i, 0)}, find the price that guarantees the yield (price to the worst case).`,
    price, [round(Math.max(pCall, pMat), 2), round((pCall + pMat) / 2, 2), round(F * cr * aImm(c, i) + F * vOf(i) ** c, 2), round(F, 2)],
    `With a call premium you cannot assume the earliest date, you must price EVERY redemption and take the minimum: call value $${fmt(round(pCall, 2), 2)}$ vs maturity value $${fmt(round(pMat, 2), 2)}$, so pay $${price}$. The lower price is the one that still attains ${pct(i, 0)} in every scenario.`,
    money, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const F = 1000;
   const i = pick([0.05, 0.06, 0.07]);
   const cr = round(i + pick([0.01, 0.015, 0.02]), 4);
   const c1 = rint(4, 6), c2 = c1 + rint(2, 4), n = c2 + rint(2, 4);
   const dates = [c1, c2, n];
   const prices = dates.map((d) => F * cr * aImm(d, i) + F * vOf(i) ** d);
   const price = round(Math.min(...prices), 2);
   return build(`A $1000$ par bond pays ${pct(cr, 1)} annual coupons and is callable at par at the end of year ${c1} or year ${c2}, otherwise maturing at par in year ${n}. At a yield of ${pct(i, 0)}, find the price that guarantees the yield.`,
    price, [round(Math.max(...prices), 2), round(prices[1], 2), round(prices[2], 2), round(F, 2)],
    `Price the bond at EVERY possible redemption date $\\{${c1},${c2},${n}\\}$ and take the minimum. Since the coupon ${pct(cr, 1)} exceeds the yield (a premium bond), the earliest date year ${c1} is worst, giving $${price}$. Always confirm by valuing each date rather than assuming.`,
    money, TIER_DIFF.superhard);
  }),
 ],

 "duration-and-immunization": [
  T("easy", () => {
   const n = rint(3, 20);
   const i = rstep(0.03, 0.10, 0.0025);
   const dmod = round(n / (1 + i), 4);
   return build(`A zero-coupon bond matures in ${n} years and is priced at a yield of ${pct(i, 2)}. Find its MODIFIED duration.`,
    dmod, [round(n, 4), round(n * (1 + i), 4), round(n / (1 + i) ** 2, 4), round((n - 1) / (1 + i), 4)],
    `A zero's Macaulay duration is its term, $${n}$ years; the modified duration divides by $(1+i)$: $D_{mod}=\\frac{${n}}{1+${fmt(i, 4)}}=${fmt(dmod, 4)}$. Reporting the Macaulay duration $${n}$ (forgetting the $(1+i)$) is the trap.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const cf1 = pick([100, 200, 500, 1000]), cf2 = pick([100, 300, 800, 1500]);
   const t1 = rint(1, 3), t2 = rint(5, 9);
   const i = rstep(0.04, 0.09, 0.0025);
   const p1 = cf1 * vOf(i) ** t1, p2 = cf2 * vOf(i) ** t2;
   const dmac = round((t1 * p1 + t2 * p2) / (p1 + p2), 4);
   return build(`A portfolio pays $${cf1}$ at the end of year ${t1} and $${cf2}$ at the end of year ${t2}. At ${pct(i, 2)} effective, find the Macaulay duration.`,
    dmac, [round((t1 + t2) / 2, 4), round((t1 * cf1 + t2 * cf2) / (cf1 + cf2), 4), round((t1 * p1 + t2 * p2) / (p1 + p2) / (1 + i), 4), round(t2, 4)],
    `Macaulay duration is the PV-weighted average time: $D=\\frac{${t1}\\,P_1+${t2}\\,P_2}{P_1+P_2}$ where $P_k$ is each flow's present value, giving $${fmt(dmac, 4)}$. Weighting by raw cash flows (not present values) is the trap.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const P = pick([10000, 50000, 25000, 100000]);
   const dmod = pick([4.5, 6.2, 7.8, 3.5, 9.1, 5.0]);
   const di = pick([0.005, 0.01, 0.0075, -0.005, -0.01]);
   const newP = round(P * (1 - dmod * di), 2);
   return build(`A bond portfolio worth $${P}$ has modified duration ${dmod}. Using the first-order (duration) approximation, estimate its value if the yield ${di >= 0 ? "rises" : "falls"} by ${pct(Math.abs(di), 2)}.`,
    newP, [round(P * (1 + dmod * di), 2), round(P * (1 - dmod), 2), round(P - dmod * di, 2), round(P * (1 - dmod * di / (1 + 0.05)), 2)],
    `The duration estimate is $\\Delta P\\approx -D_{mod}\\,P\\,\\Delta i$, so new value $\\approx ${P}(1-${dmod}\\times(${fmt(di, 4)}))=${newP}$. Price moves OPPOSITE to yield; the sign of $-D_{mod}\\Delta i$ is the whole point.`,
    money, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const L = pick([10000, 50000, 100000, 25000]);
   const i = rstep(0.04, 0.08, 0.0025);
   const t1 = rint(2, 4), n = t1 + rint(2, 4), t2 = n + rint(2, 4);
   const pvL = L * vOf(i) ** n;
   const p1 = round(pvL * (t2 - n) / (t2 - t1), 2);
   return build(`A single liability of $${L}$ is due in ${n} years. It is to be immunized (PV- and duration-matched) at ${pct(i, 2)} using two zero-coupon bonds maturing in ${t1} and ${t2} years. Find the present value to invest in the ${t1}-year bond.`,
    p1, [round(pvL * (n - t1) / (t2 - t1), 2), round(pvL / 2, 2), round(pvL, 2), round(L * (t2 - n) / (t2 - t1), 2)],
    `Matching PV and duration gives $P_1=PV_L\\cdot\\frac{t_2-n}{t_2-t_1}$ where $PV_L=${L}v^{${n}}=${fmt(round(pvL, 2), 2)}$. So $P_1=${fmt(round(pvL, 2), 2)}\\cdot\\frac{${t2}-${n}}{${t2}-${t1}}=${p1}$. (The other bond gets $PV_L\\frac{n-t_1}{t_2-t_1}$; the weights are the lever arms around year ${n}.)`,
    money, TIER_DIFF.superhard);
  }),
 ],

 "convexity-and-matching": [
  T("easy", () => {
   const n = rint(3, 20);
   const i = rstep(0.03, 0.10, 0.0025);
   const conv = round(n * (n + 1) / (1 + i) ** 2, 4);
   return build(`A zero-coupon bond matures in ${n} years at a yield of ${pct(i, 2)}. Find its (modified) convexity.`,
    conv, [round(n * n / (1 + i) ** 2, 4), round(n * (n + 1) / (1 + i), 4), round(n * (n + 1), 4), round(n / (1 + i) ** 2, 4)],
    `For a zero $P=(1+i)^{-${n}}$, so $P''=${n}\\cdot${n + 1}(1+i)^{-${n}-2}$ and convexity $=\\frac{P''}{P}=\\frac{${n}(${n}+1)}{(1+i)^2}=${fmt(conv, 4)}$. Using $n^2$ instead of $n(n+1)$ is the trap.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const D = pick([4.5, 6.2, 7.8, 3.5, 9.1, 5.0, 8.4]);
   const C = pick([25, 40, 60, 18, 80, 50]);
   const di = pick([0.01, 0.015, 0.02, -0.01, -0.015, 0.005]);
   const pct_ = round(-D * di + 0.5 * C * di * di, 5);
   return build(`A bond has modified duration ${D} and convexity ${C}. Using the second-order (duration + convexity) approximation, estimate the fractional change in price if the yield ${di >= 0 ? "rises" : "falls"} by ${pct(Math.abs(di), 2)}.`,
    pct_, [round(-D * di, 5), round(-D * di - 0.5 * C * di * di, 5), round(-D * di + C * di * di, 5), round(0.5 * C * di * di, 5)],
    `The second-order estimate is $\\frac{\\Delta P}{P}\\approx -D\\,\\Delta i+\\tfrac12 C(\\Delta i)^2=-(${D})(${fmt(di, 4)})+\\tfrac12(${C})(${fmt(di, 4)})^2=${fmt(pct_, 5)}$. Convexity is a POSITIVE correction; dropping it (duration only) underestimates the price for a yield drop.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const cf1 = pick([100, 200, 500, 1000]), cf2 = pick([100, 300, 800, 1500]);
   const t1 = rint(1, 3), t2 = rint(5, 9);
   const i = rstep(0.04, 0.09, 0.0025);
   const p1 = cf1 * vOf(i) ** t1, p2 = cf2 * vOf(i) ** t2;
   const conv = round((cf1 * t1 * (t1 + 1) * vOf(i) ** (t1 + 2) + cf2 * t2 * (t2 + 1) * vOf(i) ** (t2 + 2)) / (p1 + p2), 4);
   return build(`A portfolio pays $${cf1}$ at the end of year ${t1} and $${cf2}$ at the end of year ${t2}. At ${pct(i, 2)} effective, find its (modified) convexity.`,
    conv, [round((cf1 * t1 * t1 * vOf(i) ** (t1 + 2) + cf2 * t2 * t2 * vOf(i) ** (t2 + 2)) / (p1 + p2), 4), round((t1 * (t1 + 1) + t2 * (t2 + 1)) / 2, 4), round((cf1 * t1 * (t1 + 1) * vOf(i) ** t1 + cf2 * t2 * (t2 + 1) * vOf(i) ** t2) / (p1 + p2), 4), round((p1 * t1 * (t1 + 1) + p2 * t2 * (t2 + 1)) / (p1 + p2), 4)],
    `Convexity $=\\frac{1}{P}\\sum CF_t\\,t(t+1)v^{t+2}=\\frac{${cf1}\\cdot${t1}(${t1}+1)v^{${t1 + 2}}+${cf2}\\cdot${t2}(${t2}+1)v^{${t2 + 2}}}{P}=${fmt(conv, 4)}$. Each term carries TWO extra powers of $v$ (from differentiating $v^t$ twice).`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const P = pick([10000, 50000, 100000, 25000]);
   const C = pick([40, 60, 80, 100, 120, 50]);
   const di = pick([0.01, 0.015, 0.02, 0.025, 0.03]);
   const corr = round(0.5 * C * P * di * di, 2);
   return build(`A bond portfolio worth $${P}$ has convexity ${C}. A duration-only estimate of the new value after a yield move of ${pct(di, 1)} omits the convexity term. By how many dollars does the convexity correction adjust the estimate?`,
    corr, [round(C * P * di * di, 2), round(0.5 * C * P * di, 2), round(0.5 * C * di * di, 2), round(P * di * di, 2)],
    `The convexity term in $\\Delta P\\approx P(-D\\,\\Delta i+\\tfrac12 C\\,\\Delta i^2)$ contributes $\\tfrac12 C P\\,\\Delta i^2=\\tfrac12(${C})(${P})(${fmt(di, 3)})^2=${corr}$. It is always POSITIVE (convexity helps the holder), and it is what duration alone misses.`,
    money, TIER_DIFF.superhard);
  }),
 ],

 "interest-rate-swaps": [
  T("easy", () => {
   const s1 = rstep(0.02, 0.06, 0.0025);
   const s2 = round(s1 + pick([0.003, 0.005, 0.008, 0.01]), 4);
   const P1 = (1 + s1) ** -1, P2 = (1 + s2) ** -2;
   const R = round((1 - P2) / (P1 + P2), 5);
   return build(`The 1-year and 2-year spot rates are ${pct(s1, 2)} and ${pct(s2, 2)}. Find the fixed rate of a 2-year interest-rate swap (the rate making the swap's value zero).`,
    R, [round(s2, 5), round((1 - P2) / P2, 5), round((s1 + s2) / 2, 5), round(s1, 5)],
    `The swap rate equates fixed and floating legs: $R=\\frac{1-P_2}{P_1+P_2}$ where $P_t=(1+s_t)^{-t}$. With $P_1=${fmt(round(P1, 5), 5)}$, $P_2=${fmt(round(P2, 5), 5)}$, $R=${fmt(R, 5)}$. It is a discount-factor-weighted average of the forward rates, not just the final spot.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const s1 = rstep(0.02, 0.05, 0.0025);
   const s2 = round(s1 + pick([0.003, 0.005, 0.007]), 4);
   const s3 = round(s2 + pick([0.003, 0.005, 0.007]), 4);
   const P1 = (1 + s1) ** -1, P2 = (1 + s2) ** -2, P3 = (1 + s3) ** -3;
   const R = round((1 - P3) / (P1 + P2 + P3), 5);
   return build(`The 1-, 2-, and 3-year spot rates are ${pct(s1, 2)}, ${pct(s2, 2)}, and ${pct(s3, 2)}. Find the fixed rate of a 3-year interest-rate swap.`,
    R, [round(s3, 5), round((1 - P3) / P3, 5), round((s1 + s2 + s3) / 3, 5), round((1 - P3) / (P1 + P2), 5)],
    `$R=\\frac{1-P_3}{P_1+P_2+P_3}$ with $P_t=(1+s_t)^{-t}$, giving $R=${fmt(R, 5)}$. The denominator is the swap's "annuity" (sum of discount factors); the numerator $1-P_n$ is the floating leg's value.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const s1 = rstep(0.02, 0.05, 0.0025);
   const s2 = round(s1 + pick([0.003, 0.005, 0.006]), 4);
   const s3 = round(s2 + pick([0.003, 0.005]), 4);
   const s4 = round(s3 + pick([0.002, 0.004]), 4);
   const P1 = (1 + s1) ** -1, P2 = (1 + s2) ** -2, P3 = (1 + s3) ** -3, P4 = (1 + s4) ** -4;
   const R = round((1 - P4) / (P1 + P2 + P3 + P4), 5);
   return build(`Spot rates for years 1-4 are ${pct(s1, 2)}, ${pct(s2, 2)}, ${pct(s3, 2)}, ${pct(s4, 2)}. Find the fixed rate of a 4-year interest-rate swap.`,
    R, [round(s4, 5), round((1 - P4) / P4, 5), round((1 - P4) / (P1 + P2 + P3), 5), round((s1 + s2 + s3 + s4) / 4, 5)],
    `$R=\\frac{1-P_4}{P_1+P_2+P_3+P_4}$ where $P_t=(1+s_t)^{-t}$, so $R=${fmt(R, 5)}$. Adding a year just extends both the floating-leg value $1-P_n$ and the annuity denominator.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const N = pick([1000000, 500000, 2000000, 5000000]);
   const s1 = rstep(0.02, 0.05, 0.0025);
   const s2 = round(s1 + pick([0.004, 0.006, 0.008]), 4);
   const s3 = round(s2 + pick([0.004, 0.006]), 4);
   const P1 = (1 + s1) ** -1, P2 = (1 + s2) ** -2, P3 = (1 + s3) ** -3;
   const ann = P1 + P2 + P3;
   const Rstar = (1 - P3) / ann;
   const Rold = round(Rstar - pick([0.005, 0.008, 0.01, -0.005, -0.008]), 4);
   const value = round(N * (Rstar - Rold) * ann, 2);
   return build(`A 3-year payer swap (pays fixed ${pct(Rold, 2)}, receives floating) has notional $${N}$. Current 1-, 2-, 3-year spot rates are ${pct(s1, 2)}, ${pct(s2, 2)}, ${pct(s3, 2)}. Find the swap's market value to the fixed-rate payer.`,
    value, [round(N * (Rold - Rstar) * ann, 2), round(N * (Rstar - Rold), 2), round(N * (Rstar - Rold) * 3, 2), round((Rstar - Rold) * ann, 2)],
    `The current par swap rate is $R^*=\\frac{1-P_3}{P_1+P_2+P_3}=${fmt(round(Rstar, 5), 5)}$. A payer swap is worth $N(R^*-R)\\sum P_t=${N}(${fmt(round(Rstar, 5), 5)}-${fmt(Rold, 4)})(${fmt(round(ann, 5), 5)})=${value}$. Locking a fixed rate BELOW today's market is a gain to the payer.`,
    money, TIER_DIFF.superhard);
  }),
 ],

 "determinants-of-interest": [
  T("easy", () => {
   const r = rstep(0.01, 0.05, 0.0025);
   const e = rstep(0.01, 0.06, 0.0025);
   const i = round((1 + r) * (1 + e) - 1, 5);
   return build(`The real interest rate is ${pct(r, 2)} and expected inflation is ${pct(e, 2)}. Using the (exact) Fisher equation, find the nominal interest rate.`,
    i, [round(r + e, 5), round(r * e, 5), round((1 + r) / (1 + e) - 1, 5), round(r + e - r * e, 5)],
    `Fisher: $(1+i)=(1+r)(1+e)=(1+${fmt(r, 4)})(1+${fmt(e, 4)})$, so $i=${fmt(i, 5)}$. The approximation $i\\approx r+e$ omits the cross term $re=${fmt(round(r * e, 5), 5)}$.`,
    prob, TIER_DIFF.easy);
  }),
  T("medium", () => {
   const i = rstep(0.04, 0.12, 0.0025);
   const e = rstep(0.01, 0.06, 0.0025);
   const r = round((1 + i) / (1 + e) - 1, 5);
   return build(`A bond yields a nominal ${pct(i, 2)} while inflation runs at ${pct(e, 2)}. Using the exact Fisher relation, find the real rate of return.`,
    r, [round(i - e, 5), round((1 + e) / (1 + i) - 1, 5), round(i / e - 1, 5), round(i - e + i * e, 5)],
    `Solve Fisher for the real rate: $1+r=\\frac{1+i}{1+e}=\\frac{1+${fmt(i, 4)}}{1+${fmt(e, 4)}}$, so $r=${fmt(r, 5)}$. The shortcut $r\\approx i-e$ overstates it slightly when rates are high.`,
    prob, TIER_DIFF.medium);
  }),
  T("hard", () => {
   const r = rstep(0.01, 0.03, 0.0025);
   const e = rstep(0.015, 0.04, 0.0025);
   const d = rstep(0.005, 0.03, 0.0025);
   const x = rstep(0.005, 0.02, 0.0025);
   const i = round(r + e + d + x, 5);
   return build(`A corporate bond's nominal yield of ${pct(i, 2)} decomposes (additively) into a real rate ${pct(r, 2)}, an inflation premium ${pct(e, 2)}, a default-risk premium ${pct(d, 2)}, and a liquidity/maturity premium. Find the liquidity/maturity premium.`,
    x, [round(i - r - e, 5), round(r + e + d, 5), round(i - d, 5), round(i / (r + e + d) - 1, 5)],
    `The additive build-up is $i=r+e+d+(\\text{liq/mat})$, so the liquidity/maturity premium $=${fmt(i, 4)}-${fmt(r, 4)}-${fmt(e, 4)}-${fmt(d, 4)}=${fmt(x, 5)}$. Each premium compensates a distinct risk stacked onto the real rate.`,
    prob, TIER_DIFF.hard);
  }),
  T("superhard", () => {
   const r = rstep(0.01, 0.04, 0.0025);
   const e = rstep(0.015, 0.05, 0.0025);
   const p = rstep(0.01, 0.04, 0.0025);
   const i = round((1 + r) * (1 + e) * (1 + p) - 1, 5);
   return build(`A bond's nominal yield ${pct(i, 2)} reflects three multiplicative factors: a real rate, expected inflation ${pct(e, 2)}, and a risk premium ${pct(p, 2)}, via $(1+i)=(1+r)(1+e)(1+\\text{premium})$. Find the real rate $r$.`,
    r, [round(i - e - p, 5), round((1 + i) / (1 + e) - 1, 5), round((1 + i) / (1 + e + p) - 1, 5), round(i - e - p - e * p, 5)],
    `Peel off both factors: $1+r=\\frac{1+i}{(1+e)(1+p)}=\\frac{1+${fmt(i, 4)}}{(1+${fmt(e, 4)})(1+${fmt(p, 4)})}$, so $r=${fmt(r, 5)}$. Subtracting $e$ and $p$ additively ignores their cross terms.`,
    prob, TIER_DIFF.superhard);
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
 * SAME for every question of a concept, they describe the method, not the
 * sampled numbers. So we attach them once, here, to every generated question
 * rather than hand-editing each template. A template can still override any
 * field via build(..., extra); enrich() only fills what's missing. The precise
 * per-question arithmetic stays in each question's `explain` (the solver's
 * Solution panel falls back to it when `steps` isn't set).
 */

interface ConceptEnrichment {
 trick: string;
 /** The governing formula/rule (Step 2). */
 formula?: string;
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
 "It moves the sensible way, extra information should push it up or down for a reason.",
 "It cross-checks against a diagram or the complement $1-P(\\text{not it})$.",
];

const FM_DECODE = [
 { label: "Cash flows", value: "what is paid/received, and at which times" },
 { label: "Rate basis", value: "effective $i$, nominal $i^{(m)}$, or a force $\\delta$" },
 { label: "Asked", value: "a present value, accumulated value, payment, or rate" },
 { label: "Timing", value: "the interval each cash flow is discounted/accumulated over" },
];
const FM_SANITY = [
 "For positive interest, accumulated value $>$ amount invested.",
 "Present value $<$ future value, discounting shrinks, accumulating grows.",
 "An effective rate exceeds the nominal it came from once compounding is more than once a year.",
];

/* ── Tiny regex helpers that extract the ACTUAL numbers from each generated
 * question stem so the diagram shows those numbers, not hard-coded defaults. ──
 */
function _num(s: string, re: RegExp, fallback: number): number {
 const m = s.match(re);
 return m ? parseFloat(m[1]) : fallback;
}

const CONCEPT_ENRICHMENT: Record<string, ConceptEnrichment> = {
 "sample-spaces-and-events": {
 trick: "Equally-likely outcomes → **favourable ÷ total**. Overlapping events → inclusion, exclusion: $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$.",
 formula: "$P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$",
 decode: GENERIC_PROB_DECODE,
 sanity: GENERIC_PROB_SANITY,
 diagram: (q) => {
 const pA = _num(q.q, /P\(A\)=([0-9.]+)/, 0.45);
 const pB = _num(q.q, /P\(B\)=([0-9.]+)/, 0.35);
 // Try to find P(A∩B); if not in stem, derive from union where possible
 const rawAB = q.q.match(/P\(A\\cap B\)=([0-9.]+)/);
 const union = q.q.match(/P\(A\\cup B\)=([0-9.]+)/);
 const pAB = rawAB
 ? parseFloat(rawAB[1])
 : union
 ? +(pA + pB - parseFloat(union[1])).toFixed(4)
 : +(pA * pB * 0.65).toFixed(4);
 return {
 kind: "venn-conditional",
 caption: "Sets in the sample space, the overlap is $A\\cap B$.",
 labels: { pA, pB, pAB: Math.max(0, pAB) },
 };
 },
 },

 "counting-and-axioms": {
 trick: "See **“without replacement”** → hypergeometric $\\dfrac{\\binom{K}{k}\\binom{N-K}{n-k}}{\\binom{N}{n}}$, not $p^k$. See **“at least one”** → complement $1-P(\\text{none})$.",
 formula: "$\\dfrac{\\binom{K}{k}\\binom{N-K}{n-k}}{\\binom{N}{n}}\\quad\\text{and}\\quad P(\\ge 1)=1-P(\\text{none})$",
 decode: GENERIC_PROB_DECODE,
 sanity: GENERIC_PROB_SANITY,
 diagram: (q) => {
 if (/without replacement|defective|women|committee/i.test(q.q)) {
 // Extract N (population), K (successes in population), n (draw size)
 const Nm = q.q.match(/(\d+) items?/) ?? q.q.match(/(\d+) people/) ?? q.q.match(/group has (\d+)/);
 const Km = q.q.match(/(\d+) defective/) ?? q.q.match(/(\d+) women/);
 const nm = q.q.match(/Draw (\d+)/) ?? q.q.match(/committee of (\d+)/);
 const N = Nm ? parseInt(Nm[1]) : 12;
 const K = Km ? parseInt(Km[1]) : Math.round(N * 0.35);
 const n = nm ? parseInt(nm[1]) : 3;
 return {
 kind: "urn",
 caption: "Drawing without replacement from a finite population.",
 labels: { N, K, n },
 };
 }
 return { kind: "tree", caption: "Sequential draws, multiply along a path." };
 },
 },

 "conditional-probability": {
 trick: "$P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}$, **shade $B$ first**; the answer is the share of $B$ that is also $A$. Conditioning **divides**, it never multiplies.",
 formula: "$P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}$",
 decode: GENERIC_PROB_DECODE,
 sanity: GENERIC_PROB_SANITY,
 diagram: (q) => {
 // Bayes-like factory questions: build a tree instead
 if (/factory|machine|urn|bag/i.test(q.q) && /defect|red|blue/i.test(q.q)) {
 const p1 = _num(q.q, /(\d+(?:\.\d+)?)\\%.*(?:factory|urn|machine)/i, 60) / 100;
 return {
 kind: "tree",
 caption: "Branch by source, then condition on the outcome.",
 labels: {
 p1, l1: "Src 1", l2: "Src 2",
 p11: _num(q.q, /([0-9.]+)\\% defect.*factory 1/i, 2) / 100,
 p21: _num(q.q, /([0-9.]+)\\% defect.*factory 2/i, 4) / 100,
 },
 };
 }
 const pAB = _num(q.q, /P\(A\\cap B\)=([0-9.]+)/, 0.15);
 const pB = _num(q.q, /P\(B\)=([0-9.]+)/, 0.40);
 const pA = Math.max(pAB + 0.10, _num(q.q, /P\(A\)=([0-9.]+)/, pAB + 0.15));
 return {
 kind: "venn-conditional",
 caption: "Shade $B$, then read $A\\cap B$ as a fraction of it.",
 labels: { pA, pB, pAB },
 };
 },
 },

 "bayes-theorem": {
 trick: "**Reverse the tree**: $P(A\\mid B)=\\dfrac{P(B\\mid A)\\,P(A)}{P(B)}$, with $P(B)$ from the law of total probability. The base rate $P(A)$ is the part everyone forgets.",
 formula: "$P(A_i\\mid B)=\\dfrac{P(B\\mid A_i)\\,P(A_i)}{\\sum_j P(B\\mid A_j)\\,P(A_j)}$",
 decode: GENERIC_PROB_DECODE,
 sanity: [
 "The posterior is in $[0,1]$.",
 "With a rare prior, even a strong test gives a modest posterior, don't expect it near the sensitivity.",
 "Forward check: the branch probabilities under each hypothesis sum to $1$.",
 ],
 diagram: (q) => {
 // Extract the prior and likelihoods from the stem
 const p1 = _num(q.q, /P\(A\)=([0-9.]+)/, 0.50);
 // P(B|A) appears as "P(B\mid A)=..."
 const p11 = _num(q.q, /P\(B\\mid A\)=([0-9.]+)/, 0.80);
 // P(B|A^c) appears as "P(B\mid A^c)=..."
 const p21 = _num(q.q, /P\(B\\mid A\^c\)=([0-9.]+)/, 0.20);
 // Urn question: pick from proportions
 const urnA = q.q.match(/Urn A holds (\d+) red of (\d+)/);
 const urnB = q.q.match(/Urn B holds (\d+) red of (\d+)/);
 if (urnA && urnB) {
 const lA = parseInt(urnA[1]) / parseInt(urnA[2]);
 const lB = parseInt(urnB[1]) / parseInt(urnB[2]);
 return {
 kind: "tree",
 caption: "Forward tree gives $P(\\text{red})$; Bayes reads it backward.",
 labels: { p1: 0.5, l1: "Urn A", l2: "Urn B", p11: +lA.toFixed(4), p21: +lB.toFixed(4) },
 };
 }
 // Medical test / machine question: use prevalence as prior
 const prev = q.q.match(/prevalence ([0-9.]+)\\%/);
 if (prev) {
 const pr = parseFloat(prev[1]) / 100;
 const se = _num(q.q, /sensitivity ([0-9.]+)\\%/, 90) / 100;
 const sp = _num(q.q, /specificity ([0-9.]+)\\%/, 95) / 100;
 return {
 kind: "tree",
 caption: "Forward tree gives $P(+)$; Bayes reads it backward for $P(\\text{disease}\\mid +)$.",
 labels: { p1: pr, l1: "Disease", l2: "Healthy", p11: se, p21: +(1 - sp).toFixed(4), l11: "+|D", l12: "−|D", l21: "+|H", l22: "−|H" },
 };
 }
 return {
 kind: "tree",
 caption: "Forward tree gives $P(B)$; Bayes reads it backward.",
 labels: { p1, l1: "A", l2: "A'", p11, p21, l11: "B|A", l12: "B'|A", l21: "B|A'", l22: "B'|A'" },
 };
 },
 },

 "independence": {
 trick: "Independent $\\Rightarrow P(A\\cap B)=P(A)P(B)$ and $P(A\\mid B)=P(A)$. **Verify independence before multiplying**, it's the most common false assumption.",
 formula: "$P(A\\cap B)=P(A)\\,P(B)$",
 decode: GENERIC_PROB_DECODE,
 sanity: GENERIC_PROB_SANITY,
 diagram: (q) => {
 const pA = _num(q.q, /P\(A\)=([0-9.]+)/, 0.50);
 const pB = _num(q.q, /P\(B\)=([0-9.]+)/, 0.45);
 return {
 kind: "venn-conditional",
 caption: "Independence: knowing $B$ does not reshape $A$'s share.",
 labels: { pA, pB, pAB: +(pA * pB).toFixed(4) },
 };
 },
 },

 "expectation-and-variance": {
 trick: "Linearity: $E[aX+b]=aE[X]+b$. Variance scales squared: $\\operatorname{Var}(aX+b)=a^2\\operatorname{Var}(X)$. Fast variance: $\\operatorname{Var}(X)=E[X^2]-(E[X])^2$.",
 formula: "$E[aX+b]=aE[X]+b,\\quad \\operatorname{Var}(aX+b)=a^2\\operatorname{Var}(X),\\quad \\operatorname{Var}(X)=E[X^2]-(E[X])^2$",
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
 diagram: (q) => {
 // n-sided die → uniform discrete PMF
 const dieMatch = q.q.match(/(\d+)-sided die/);
 if (dieMatch) {
 const s = Math.min(parseInt(dieMatch[1]), 8);
 const p = +(1 / s).toFixed(4);
 return {
 kind: "pmf-bars",
 caption: "$E[X]$ is the balance point; each bar has height $1/{" + s + "}$.",
 labels: {
 ps: Array(s).fill(p).join(","),
 xs: Array.from({ length: s }, (_, i) => i + 1).join(","),
 },
 };
 }
 // Biased coin / Bernoulli
 const coinMatch = q.q.match(/probability \$([0-9.]+)\$/);
 if (coinMatch) {
 const ph = parseFloat(coinMatch[1]);
 return {
 kind: "pmf-bars",
 caption: "$E[X]=p\\cdot\\text{win}$; bar at $X=1$ has height $p$.",
 labels: {
 ps: `${+(1 - ph).toFixed(4)},${+ph.toFixed(4)}`,
 xs: "0,1",
 highlight: 1,
 },
 };
 }
 return { kind: "pmf-bars", caption: "$E[X]$ is the balance point of the distribution." };
 },
 },

 "common-discrete-distributions": {
 trick: "**Identify first.** Binomial (fixed $n$ trials): $\\binom{n}{k}p^k(1-p)^{n-k}$. Poisson (rate $\\lambda$): $\\dfrac{\\lambda^k e^{-\\lambda}}{k!}$. Geometric (first success): $(1-p)^{k-1}p$.",
 formula: "Binomial $\\binom{n}{k}p^k(1-p)^{n-k}$ · Poisson $\\dfrac{\\lambda^k e^{-\\lambda}}{k!}$ · Geometric $(1-p)^{k-1}p$",
 decode: GENERIC_PROB_DECODE,
 sanity: GENERIC_PROB_SANITY,
 diagram: (q) => {
 // Poisson questions always have \lambda= in the stem
 const lamMatch = q.q.match(/\\lambda=([0-9.]+)/);
 if (lamMatch) {
 const lam = parseFloat(lamMatch[1]);
 const kMatch = q.q.match(/P\(X=(\d+)\)/);
 return {
 kind: "poisson-timeline",
 caption: "Events on a timeline at rate $\\lambda$.",
 labels: { lambda: lam, t: 1, expected: +lam.toFixed(4) },
 };
 }
 // Binomial: extract n and p, compute the PMF bars
 const nMatch = q.q.match(/n=(\d+)/);
 const pMatch = q.q.match(/p=([0-9.]+)/);
 if (nMatch && pMatch) {
 const n = Math.min(parseInt(nMatch[1]), 9);
 const p = parseFloat(pMatch[1]);
 const ps = Array.from(
 { length: n + 1 },
 (_, k) => +(nCr(n, k) * p ** k * (1 - p) ** (n - k)).toFixed(4),
 ).join(",");
 const xs = Array.from({ length: n + 1 }, (_, k) => k).join(",");
 const kMatch = q.q.match(/P\(X=(\d+)\)/);
 const highlight = kMatch ? parseInt(kMatch[1]) : Math.round(n * p);
 return {
 kind: "pmf-bars",
 caption: `Binomial$(${n}, ${p})$ PMF, highlighted bar is the exact value asked.`,
 labels: { ps, xs, highlight },
 };
 }
 return { kind: "pmf-bars", caption: "Discrete PMF, probability mass per outcome." };
 },
 },

 "common-continuous-distributions": {
 trick: "Continuous → probabilities are **areas** under the density. Exponential is **memoryless**: $P(X>s+t\\mid X>s)=P(X>t)$. Normal → **standardize** $Z=\\dfrac{X-\\mu}{\\sigma}$, then read the table.",
 formula: "Exponential $f(x)=\\lambda e^{-\\lambda x},\\ P(X>x)=e^{-\\lambda x}$ · Normal $Z=\\dfrac{X-\\mu}{\\sigma}$",
 decode: GENERIC_PROB_DECODE,
 sanity: GENERIC_PROB_SANITY,
 diagram: (q) => {
 // Exponential (mean theta)
 const expMatch = q.q.match(/[Ee]xponential.*mean \$(\d+)/);
 if (expMatch) {
 const theta = parseInt(expMatch[1]);
 const lambda = +(1 / theta).toFixed(4);
 // Look for a threshold value "P(X > t)" in the stem
 const x0Match = q.q.match(/X > (\d+(?:\.\d+)?)/);
 const x0 = x0Match ? parseFloat(x0Match[1]) : undefined;
 return {
 kind: "exponential",
 caption: "Exponential density $f(x)=\\lambda e^{-\\lambda x}$. Shaded = $P(X>x_0)$.",
 labels: x0 !== undefined ? { lambda, x0 } : { lambda },
 };
 }
 // Uniform on [a, b]
 const unifMatch = q.q.match(/uniform on \$\[(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\]/);
 if (unifMatch) {
 const a = parseFloat(unifMatch[1]), b = parseFloat(unifMatch[2]);
 const x1Match = q.q.match(/X > (\d+(?:\.\d+)?)/);
 const x1 = x1Match ? parseFloat(x1Match[1]) : undefined;
 return {
 kind: "uniform",
 caption: "Uniform density on $[a,b]$, shaded region is the asked probability.",
 labels: x1 !== undefined ? { a, b, x1, x2: b } : { a, b },
 };
 }
 // Minimum of n exponentials → exponential with rate n/theta
 const minMatch = q.q.match(/i\.i\.d\. Exponential each with mean \$(\d+)/);
 const nIndepMatch = q.q.match(/X_1.*X_(\d+)/);
 if (minMatch) {
 const theta = parseInt(minMatch[1]);
 const nInd = nIndepMatch ? parseInt(nIndepMatch[1]) : 2;
 const lambda = +(nInd / theta).toFixed(4);
 const x0Match = q.q.match(/> (\d+(?:\.\d+)?)/);
 const x0 = x0Match ? parseFloat(x0Match[1]) : undefined;
 return {
 kind: "exponential",
 caption: `$\\min(X_1,\\dots,X_n) \\sim \\text{Exp}(\\lambda=${lambda})$, minimum is also exponential.`,
 labels: x0 !== undefined ? { lambda, x0 } : { lambda },
 };
 }
 // Default: bell curve
 return { kind: "bell", caption: "Normal curve, area in the tails beyond $\\pm k\\sigma$." };
 },
 },

 "interest-and-accumulation": {
 trick: "Accumulation $=\\exp\\!\\int_{t_1}^{t_2}\\delta_s\\,ds$, a rate over an interval needs the **integral** of the force, not $\\delta$ at a point. Doubling time $T$ gives $\\delta=\\dfrac{\\ln 2}{T}$. A nominal rate convertible $m$ times/yr has per-period rate (nominal)$/m$.",
 formula: "$a(t)=\\exp\\!\\int_0^t\\delta_s\\,ds$ · $i^{(m)}/m$ per period · $\\delta=\\dfrac{\\ln 2}{T_{\\text{double}}}$",
 decode: FM_DECODE,
 sanity: FM_SANITY,
 diagram: (q) => {
 // Extract the interest rate (as "5.0\%")
 const rateMatch = q.q.match(/([0-9]+(?:\.[0-9]+)?)\\%/);
 const rate = rateMatch ? parseFloat(rateMatch[1]) / 100 : 0.05;
 // Extract period length ("for n years")
 const nMatch = q.q.match(/for (\d+) years/);
 const n = nMatch ? parseInt(nMatch[1]) : 5;
 // First dollar amount is the lump-sum invested
 const t0Match = q.q.match(/\$([0-9,]+)/);
 const t0val = t0Match ? -parseFloat(t0Match[1].replace(/,/g, "")) : -1000;
 return {
 kind: "timeline",
 caption: "Each amount earns compound interest over its own time interval.",
 labels: { n, rate, pmt: 0, t0val },
 };
 },
 },

 "level-annuities": {
 trick: "Annuity-immediate $a_{\\overline{n}|}=\\dfrac{1-v^n}{i}$ (payments at END of period); annuity-due $\\ddot a_{\\overline{n}|}=a_{\\overline{n}|}(1+i)$ (payments at START). Accumulated value uses $s_{\\overline{n}|}=\\dfrac{(1+i)^n-1}{i}$.",
 formula: "$a_{\\overline{n}|}=\\dfrac{1-v^n}{i},\\quad s_{\\overline{n}|}=\\dfrac{(1+i)^n-1}{i},\\quad \\ddot a_{\\overline{n}|}=(1+i)\\,a_{\\overline{n}|}$",
 decode: FM_DECODE,
 sanity: FM_SANITY,
 diagram: (q) => {
 const rateMatch = q.q.match(/([0-9]+(?:\.[0-9]+)?)\\%/);
 const rate = rateMatch ? parseFloat(rateMatch[1]) / 100 : 0.05;
 const nMatch = q.q.match(/(\d+) years/) ?? q.q.match(/(\d+)-year/);
 const n = nMatch ? parseInt(nMatch[1]) : 10;
 // Payment amount: first dollar amount in the stem
 const pmtMatch = q.q.match(/\$(\d+)/);
 const pmt = pmtMatch ? parseInt(pmtMatch[1]) : 1000;
 return {
 kind: "timeline",
 caption: "Level payments, PV with $a_{\\overline{n}|}$, AV with $s_{\\overline{n}|}$.",
 labels: { n, pmt, rate },
 };
 },
 },

 "loan-amortization": {
 trick: "Level payment $X=\\dfrac{L}{a_{\\overline{n}|}}$. Outstanding balance = PV of REMAINING payments (prospective): $X\\,a_{\\overline{n-t}|}$. Interest in payment $t$ is $X(1-v^{\\,n-t+1})$; the rest is principal.",
 formula: "$X=\\dfrac{L}{a_{\\overline{n}|}}$ · balance $=X\\,a_{\\overline{n-t}|}$ · interest$_t=X(1-v^{\\,n-t+1})$",
 decode: FM_DECODE,
 sanity: [
 "The balance falls toward $0$ at the final payment.",
 "Early payments are mostly interest; later payments mostly principal.",
 "Total paid $=nX$ exceeds the principal $L$ by the total interest.",
 ],
 diagram: (q) => {
 const rateMatch = q.q.match(/([0-9]+(?:\.[0-9]+)?)\\%/);
 const rate = rateMatch ? parseFloat(rateMatch[1]) / 100 : 0.06;
 const nMatch = q.q.match(/(\d+) years/);
 const n = nMatch ? parseInt(nMatch[1]) : 10;
 // Loan principal: first dollar amount
 const loanMatch = q.q.match(/\$([0-9,]+)/);
 const L = loanMatch ? parseFloat(loanMatch[1].replace(/,/g, "")) : 10000;
 const pmt = +(L / aImm(n, rate)).toFixed(2);
 return {
 kind: "timeline",
 caption: "Each level payment splits into an interest portion + principal reduction.",
 labels: { n, pmt, rate, t0val: -L },
 };
 },
 },

 "bond-pricing": {
 trick: "Price $=$ PV of coupons $+$ PV of redemption: $P=Fr\\,a_{\\overline{n}|}+C v^n$. Coupon rate $>$ yield → **premium** ($P>C$); $<$ yield → **discount**. For a callable premium bond, price to the WORST call/maturity date.",
 formula: "$P=Fr\\,a_{\\overline{n}|}+C\\,v^n$",
 decode: FM_DECODE,
 sanity: [
 "Coupon rate $=$ yield ⇒ price $=$ par.",
 "Higher yield ⇒ lower price (inverse relationship).",
 "A premium bond's price declines to redemption value over time.",
 ],
 diagram: (q) => {
 // The bond generators always include "at a yield of X%" or "yield X%"
 const yieldMatch = q.q.match(/yield.*?([0-9]+(?:\.[0-9]+)?)\\%/i) ?? q.q.match(/([0-9]+(?:\.[0-9]+)?)\\%.*?yield/i);
 const rate = yieldMatch ? parseFloat(yieldMatch[1]) / 100 : 0.06;
 // Maturity in years: the larger of the two n values in "matures in N years"
 const allN = [...q.q.matchAll(/(\d+) years/g)].map(m => parseInt(m[1]));
 const n = allN.length ? Math.max(...allN) : 10;
 // Coupon payment = face × coupon rate; face is first dollar amount
 const faceMatch = q.q.match(/\$(\d{3,})/);
 const face = faceMatch ? parseInt(faceMatch[1]) : 1000;
 const couponRateMatch = q.q.match(/([0-9]+(?:\.[0-9]+)?)\\% annual coupon/) ?? q.q.match(/coupons at ([0-9]+(?:\.[0-9]+)?)\\%/i);
 const couponRate = couponRateMatch ? parseFloat(couponRateMatch[1]) / 100 : 0.06;
 const pmt = +(face * couponRate).toFixed(2);
 return {
 kind: "timeline",
 caption: "Coupon payments each period + redemption value at maturity.",
 labels: { n, pmt, rate, t0val: -face },
 };
 },
 },
 "nominal-rates-and-force": {
  trick: "Convert everything to an **effective annual $i$** first, then translate: $\\delta=\\ln(1+i)$, $d=\\frac{i}{1+i}$, $i^{(m)}=m((1+i)^{1/m}-1)$, $d^{(m)}=m(1-(1+i)^{-1/m})$.",
  formula: "$\\left(1+\\frac{i^{(m)}}{m}\\right)^{m}=1+i=\\left(1-\\frac{d^{(m)}}{m}\\right)^{-m}=e^{\\delta}$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "perpetuities-and-varying": {
  trick: "Perpetuity-immediate level $=\\frac{X}{i}$, due $=\\frac{X}{d}$. Increasing $1,2,3,\\dots$ $=\\frac{1}{i}+\\frac{1}{i^2}$. Arithmetic $X,X+C,\\dots=\\frac{X}{i}+\\frac{C}{i^2}$.",
  formula: "$a_{\\overline{\\infty}|}=\\frac{1}{i},\\qquad (Ia)_{\\overline{\\infty}|}=\\frac{1}{i}+\\frac{1}{i^2}$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "geometric-annuities": {
  trick: "Geometric payments → discount at the **net rate** $i-g$: finite $PV=X\\frac{1-((1+g)/(1+i))^n}{i-g}$, perpetuity $PV=\\frac{X}{i-g}$ (needs $i>g$).",
  formula: "$PV=X\\cdot\\dfrac{1-\\left(\\frac{1+g}{1+i}\\right)^{n}}{i-g}$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "spot-forward-rates": {
  trick: "Forwards **compound** spots: $(1+s_b)^b=(1+s_a)^a(1+f)^{b-a}$. Price multi-period cash flows by discounting each at its OWN spot $(1+s_t)^{-t}$, never one flat rate.",
  formula: "$(1+s_b)^{b}=(1+s_a)^{a}(1+f_{[a,b]})^{b-a}$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "mgf-and-moments": {
  trick: "$E[X^n]=M^{(n)}(0)$ (differentiate, then set $t=0$). Recognize the named MGF: Gamma $=(1-\\theta t)^{-\\alpha}$, Normal $=e^{\\mu t+\\sigma^2 t^2/2}$, Poisson $=e^{\\lambda(e^t-1)}$. Independent sums multiply MGFs.",
  formula: "$M_X(t)=E[e^{tX}],\\quad E[X^n]=M_X^{(n)}(0),\\quad M_{X+Y}=M_X M_Y$",
  decode: GENERIC_PROB_DECODE,
  sanity: GENERIC_PROB_SANITY,
 },
 "transformations-univariate": {
  trick: "Monotonic $g$: use the CDF method $F_Y(y)=P(g(X)\\le y)$ then differentiate, or $f_Y(y)=f_X(x)\\left|\\frac{dx}{dy}\\right|$. Non-monotonic (e.g. $Y=X^2$): SUM over every $x$ root.",
  formula: "$f_Y(y)=\\sum_i f_X(x_i)\\left|\\dfrac{dx_i}{dy}\\right|$",
  decode: GENERIC_PROB_DECODE,
  sanity: GENERIC_PROB_SANITY,
 },
 "order-statistics": {
  trick: "$\\max\\le m \\Leftrightarrow$ ALL $\\le m$, so $F_{(n)}=F^n$. $\\min>m \\Leftrightarrow$ ALL $>m$, so $S_{(1)}=S^n$. For Uniform$(0,\\theta)$: $E[X_{(k)}]=\\frac{k\\theta}{n+1}$.",
  formula: "$F_{\\max}(m)=F(m)^n,\\quad F_{\\min}(m)=1-[1-F(m)]^n$",
  decode: GENERIC_PROB_DECODE,
  sanity: GENERIC_PROB_SANITY,
 },
 "sums-and-convolutions": {
  trick: "Closure: independent Poissons $\\to$ Poisson$(\\sum\\lambda)$; independent Normals $\\to$ Normal (means AND variances add); $n$ iid Exponentials $\\to$ Erlang/Gamma. Otherwise convolve.",
  formula: "$f_{X+Y}(s)=\\int f_X(x)f_Y(s-x)\\,dx$",
  decode: GENERIC_PROB_DECODE,
  sanity: GENERIC_PROB_SANITY,
 },
 "random-variables-and-distributions": {
  trick: "Name the distribution, then reach for its pmf/pdf and survival. $P(X>m)=1-F(m)$. Insurance payment with deductible $d$: $E[(X-d)_+]$ (for exponential $=\\theta e^{-d/\\theta}$).",
  formula: "$P(X>m)=1-F(m),\\qquad E[(X-d)_+]=\\int_d^\\infty (x-d)f(x)\\,dx$",
  decode: GENERIC_PROB_DECODE,
  sanity: GENERIC_PROB_SANITY,
 },
 "gamma-beta-lognormal": {
  trick: "Gamma$(\\alpha,\\theta)$: $E=\\alpha\\theta$, $\\operatorname{Var}=\\alpha\\theta^2$. Lognormal: $E=e^{\\mu+\\sigma^2/2}$, probabilities via $\\Phi\\!\\left(\\frac{\\ln x-\\mu}{\\sigma}\\right)$. Beta$(a,b)$: $E=\\frac{a}{a+b}$.",
  formula: "$E[\\text{LN}]=e^{\\mu+\\sigma^2/2},\\quad \\operatorname{Var}[\\text{Beta}]=\\frac{ab}{(a+b)^2(a+b+1)}$",
  decode: GENERIC_PROB_DECODE,
  sanity: GENERIC_PROB_SANITY,
 },
 "joint-and-marginal": {
  trick: "Normalize so the joint integrates to $1$. Marginal: integrate the OTHER variable out. Independent $\\Rightarrow$ joint factors, so the joint CDF is the product of marginals.",
  formula: "$f_X(x)=\\int f(x,y)\\,dy,\\qquad P(X<Y)=\\tfrac{\\lambda_X}{\\lambda_X+\\lambda_Y}\\ (\\text{indep. exp.})$",
  decode: GENERIC_PROB_DECODE,
  sanity: GENERIC_PROB_SANITY,
 },
 "conditional-distributions": {
  trick: "Condition by RESTRICTING and renormalizing. Exponential is memoryless: $P(X>s+t\\mid X>s)=P(X>t)$ and $E[X\\mid X>d]=d+\\theta$. For a flat joint, the conditional is uniform.",
  formula: "$f_{Y\\mid X}(y\\mid x)=\\frac{f(x,y)}{f_X(x)}$",
  decode: GENERIC_PROB_DECODE,
  sanity: GENERIC_PROB_SANITY,
 },
 "equation-of-value": {
  trick: "Pick ONE comparison date, accumulate/discount every cash flow to it, set inflows $=$ outflows. The equation is invariant to the date you choose, but each flow's exponent is its own distance to it.",
  formula: "$\\sum \\text{inflows}\\cdot(1+i)^{T-t_k}=\\sum \\text{outflows}\\cdot(1+i)^{T-t_k}$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "sinking-funds": {
  trick: "Borrower pays interest $Li$ to the lender EVERY period (principal never declines) AND deposits $D=\\frac{L}{s_{\\overline n|}^{\\,j}}$ into a fund earning $j$. Total $=Li+D$. Extra vs amortizing $=L(\\frac1{s^j}-\\frac1{s^i})$.",
  formula: "$D=\\dfrac{L}{s_{\\overline{n}|}^{\\,j}},\\qquad \\text{total}=Li+D$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "dollar-time-weighted": {
  trick: "Time-weighted MULTIPLIES sub-period growth factors (value just BEFORE each flow) — measures the manager. Dollar-weighted solves the equation of value (simple-interest exposure $B_0+\\sum F_k(1-t_k)$) — measures the investor's actual return.",
  formula: "$1+i_{TW}=\\prod\\frac{B_k^{-}}{B_{k-1}^{+}},\\qquad i_{DW}=\\frac{I}{B_0+\\sum F_k(1-t_k)}$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "yield-rates-npv": {
  trick: "NPV discounts every cash flow at the cost of capital and nets the outlay. The IRR is the rate making $NPV=0$; for a single future payout it is $\\left(\\frac{A}{C_0}\\right)^{1/n}-1$, otherwise solve the polynomial in $v$.",
  formula: "$NPV=\\sum CF_t\\,v^t,\\qquad IRR:\\ NPV=0$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "deferred-and-continuous-annuities": {
  trick: "Deferred: value the annuity one period before its first payment, then discount the deferral $v^m$. Continuous: discount with the FORCE $\\delta=\\ln(1+i)$ in the denominator, $\\bar a_{\\overline n|}=\\frac{1-v^n}{\\delta}$.",
  formula: "$\\bar a_{\\overline{n}|}=\\frac{1-v^{n}}{\\delta},\\qquad {}_{m|}a_{\\overline{n}|}=a_{\\overline{n}|}\\,v^{m}$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "bond-amortization": {
  trick: "Book value is the prospective price of the REMAINING flows: $B_t=Fr\\,a_{\\overline{n-t}|}+Cv^{n-t}$. Each coupon splits into interest $iB_{t-1}$ and principal adjustment $(Fr-Ci)v^{n-t+1}$.",
  formula: "$B_t=Fr\\,a_{\\overline{n-t}|}+Cv^{n-t},\\qquad B_{t}=B_{t-1}(1+i)-Fr$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "callable-bonds": {
  trick: "Price to the WORST redemption date (yield-to-worst). Premium bond (coupon $>$ yield) $\\Rightarrow$ earliest call; discount bond $\\Rightarrow$ latest. With a call premium, price EVERY date and take the minimum.",
  formula: "$\\text{price}=\\min_{\\text{dates }d}\\left[Fr\\,a_{\\overline{d}|}+C_d\\,v^{d}\\right]$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "duration-and-immunization": {
  trick: "Macaulay $=$ PV-weighted average time; modified $=$ Macaulay$/(1+i)$. Price move $\\Delta P\\approx -D_{mod}P\\,\\Delta i$. Redington immunization: match PV and duration, with assets MORE convex than liabilities.",
  formula: "$D_{Mac}=\\frac{\\sum t\\,v^{t}CF_t}{\\sum v^{t}CF_t},\\qquad \\Delta P\\approx -D_{mod}\\,P\\,\\Delta i$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "convexity-and-matching": {
  trick: "Convexity is the SECOND-order term: $\\frac{\\Delta P}{P}\\approx -D\\,\\Delta i+\\tfrac12 C(\\Delta i)^2$. It is always positive (it helps the holder). Compute $C=\\frac1P\\sum CF_t\\,t(t+1)v^{t+2}$; a zero's is $\\frac{n(n+1)}{(1+i)^2}$.",
  formula: "$C=\\frac{1}{P}\\sum CF_t\\,t(t+1)v^{t+2},\\qquad \\frac{\\Delta P}{P}\\approx -D\\Delta i+\\tfrac12 C\\Delta i^2$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "interest-rate-swaps": {
  trick: "Par swap rate $R=\\frac{1-P_n}{\\sum_{t}P_t}$ with $P_t=(1+s_t)^{-t}$. A seasoned payer swap (pays fixed $R$) is worth $N(R^*-R)\\sum P_t$, where $R^*$ is today's par rate.",
  formula: "$R=\\dfrac{1-P_n}{\\sum_{t=1}^{n}P_t},\\qquad V_{\\text{payer}}=N(R^*-R)\\textstyle\\sum P_t$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
 "determinants-of-interest": {
  trick: "Fisher (exact): $(1+i)=(1+r)(1+e)$ — the $\\approx i=r+e$ shortcut drops the cross term $re$. Nominal yield builds up from a real rate plus inflation, default, liquidity, and maturity premiums.",
  formula: "$(1+i)=(1+r)(1+e),\\qquad i\\approx r+e+\\text{(risk premiums)}$",
  decode: FM_DECODE,
  sanity: FM_SANITY,
 },
};

/** Fill missing study-mode fields from the concept's enrichment (template wins). */
function enrich(conceptId: string, q: MasteryQuestion): MasteryQuestion {
 const e = CONCEPT_ENRICHMENT[conceptId];
 if (!e) return q;
 return {
 ...q,
 trick: q.trick ?? e.trick,
 formula: q.formula ?? e.formula,
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

/** A balanced exam ladder of `count` tiers, always opens easy, always ends superhard. */
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
 * call and rejects any stem seen in the last 50, retakes never repeat. Every
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
