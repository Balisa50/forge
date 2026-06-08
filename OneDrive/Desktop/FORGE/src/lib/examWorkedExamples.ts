/**
 * examWorkedExamples — fully-worked, study-mode questions for the actuary paths.
 *
 * These power ActuaryQuestionSolver (Decode / Trick / Diagram / Solution / Check).
 * Unlike the generated quiz items, each here is hand-authored with the complete
 * 4-step breakdown the spec mandates, so a student can see EXACTLY how an expert
 * decomposes the question. Keyed by the concept id used in data/exam-paths.
 *
 * Server-safe: plain data, math as `$...$` / `$$...$$` (rendered by renderRichText).
 * Concepts without an entry simply show no study-mode block (graceful).
 */

import type { MasteryQuestion } from "@/lib/examPaths";

const EXAMPLES: Record<string, MasteryQuestion[]> = {
  "counting-and-axioms": [
    {
      q: "A bag holds **5 red** and **3 blue** marbles. You draw **2 without replacement**. What is $P(\\text{both red})$?",
      choices: ["$\\dfrac{5}{14}$", "$\\dfrac{25}{64}$", "$\\dfrac{15}{56}$", "$\\dfrac{5}{8}$", "$\\dfrac{3}{14}$"],
      correct: 0,
      explain: "Without replacement → count favourable unordered pairs over all pairs: $\\dfrac{\\binom{5}{2}}{\\binom{8}{2}}=\\dfrac{10}{28}=\\dfrac{5}{14}$.",
      difficulty: "core",
      decode: [
        { label: "Experiment", value: "Draw 2 marbles, without replacement" },
        { label: "Sample space", value: "All unordered pairs from 8 marbles: $\\binom{8}{2}=28$" },
        { label: "Event", value: "Both marbles are red" },
        { label: "Given", value: "None — this is unconditional" },
      ],
      trick: "See **“without replacement”** → reach for the **hypergeometric** count, not $p^2$. $$P=\\frac{\\binom{K}{k}\\,\\binom{N-K}{\\,n-k}}{\\binom{N}{n}}$$ Here $N=8,\\;K=5,\\;n=2,\\;k=2$. (Using $\\left(\\tfrac58\\right)^2$ is the classic trap — that's *with* replacement.)",
      diagram: { kind: "tree", caption: "Two draws: $\\frac{5}{8}\\cdot\\frac{4}{7}=\\frac{5}{14}$ along the red–red path." },
      steps: [
        "Favourable pairs of red: $\\binom{5}{2}=10$.",
        "Total pairs: $\\binom{8}{2}=28$.",
        "$P(\\text{both red})=\\dfrac{10}{28}=\\dfrac{5}{14}\\approx 0.357$.",
      ],
      sanity: [
        "Between 0 and 1 — yes ($0.357$).",
        "Less than $P(\\text{first red})=\\tfrac58=0.625$ — yes, drawing a second red is harder.",
        "Tree check: $\\tfrac58\\cdot\\tfrac47=\\tfrac{20}{56}=\\tfrac{5}{14}$ — matches.",
      ],
    },
  ],

  "conditional-probability": [
    {
      q: "In a cohort, $P(M)=0.6$ passed math and $P(M\\cap S)=0.45$ passed **both** math and stats. Given a student passed **math**, what is $P(S\\mid M)$?",
      choices: ["$0.75$", "$0.45$", "$0.27$", "$0.60$", "$0.90$"],
      correct: 0,
      explain: "Condition on $M$: $P(S\\mid M)=\\dfrac{P(M\\cap S)}{P(M)}=\\dfrac{0.45}{0.6}=0.75$.",
      difficulty: "core",
      decode: [
        { label: "Experiment", value: "Pick a student at random" },
        { label: "Sample space", value: "All students" },
        { label: "Event", value: "Passed stats, $S$" },
        { label: "Given", value: "Passed math, $M$ — we live inside $M$ now" },
      ],
      trick: "For **“given that”**: draw the Venn diagram, **shade $B$ first** — that's your new universe. The answer is the fraction of $B$ that also lies in $A$: $$P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}$$ It's a ratio of areas, not a product.",
      diagram: { kind: "venn-conditional", caption: "Shade $M$, then read $A\\cap B$ as a fraction of it." },
      steps: [
        "We're given $M$ happened, so divide by $P(M)$.",
        "$P(S\\mid M)=\\dfrac{P(M\\cap S)}{P(M)}=\\dfrac{0.45}{0.6}$.",
        "$=0.75$.",
      ],
      sanity: [
        "Between 0 and 1 — yes.",
        "Multiplying ($0.45\\times0.6=0.27$) is the trap; conditioning **divides**.",
        "$0.45 \\le 0.6$, so the ratio is $\\le 1$ — consistent.",
      ],
    },
  ],

  "bayes-theorem": [
    {
      q: "A disease affects $1\\%$ of people. A test is $99\\%$ sensitive ($P(+\\mid D)=0.99$) and $95\\%$ specific ($P(-\\mid D^c)=0.95$). A random person tests **positive**. What is $P(D\\mid +)$?",
      choices: ["$0.167$", "$0.990$", "$0.950$", "$0.010$", "$0.500$"],
      correct: 0,
      explain: "$P(D\\mid +)=\\dfrac{0.01\\cdot0.99}{0.01\\cdot0.99+0.99\\cdot0.05}=\\dfrac{0.0099}{0.0594}\\approx0.167$. The low base rate dominates a single positive.",
      difficulty: "exam",
      decode: [
        { label: "Experiment", value: "Test a random person" },
        { label: "Sample space", value: "Has disease $D$ or not $D^c$, then $+$ / $-$" },
        { label: "Event", value: "Actually has the disease, $D$" },
        { label: "Given", value: "Tested positive, $+$ — reverse the conditioning" },
      ],
      trick: "Bayes is a **reversed tree**: you know $P(+\\mid D)$, you want $P(D\\mid +)$. Flip it with $$P(D\\mid +)=\\frac{P(+\\mid D)\\,P(D)}{P(+)}$$ where the denominator is the **law of total probability**. The base rate $P(D)$ is the part everyone forgets.",
      diagram: { kind: "tree", caption: "Forward tree gives $P(+)$; Bayes reads it backward." },
      steps: [
        "True positives: $P(D)\\,P(+\\mid D)=0.01\\cdot0.99=0.0099$.",
        "False positives: $P(D^c)\\,P(+\\mid D^c)=0.99\\cdot0.05=0.0495$.",
        "$P(+)=0.0099+0.0495=0.0594$.",
        "$P(D\\mid +)=\\dfrac{0.0099}{0.0594}\\approx0.167$.",
      ],
      sanity: [
        "Between 0 and 1 — yes.",
        "Far below the $99\\%$ sensitivity — correct, because $D$ is rare.",
        "False positives ($0.0495$) outnumber true positives ($0.0099$) — so most positives are healthy people.",
      ],
    },
  ],
};

/** Worked study-mode examples for a concept, or [] if none authored yet. */
export function workedExamples(conceptId: string): MasteryQuestion[] {
  return EXAMPLES[conceptId] ?? [];
}
