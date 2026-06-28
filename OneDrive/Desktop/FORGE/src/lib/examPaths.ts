/**
 * Actuary exam concept-path loader.
 *
 * This is deliberately NOT a roadmap. The dev roadmaps (data/roadmaps) are
 * week/project based; the actuary paths are CONCEPT based and mastery gated.
 * They get their own schema, their own data dir (data/exam-paths), their own
 * routes (/learn/exam/[slug]), and their own renderer. The student stays on a
 * concept until a timed, SOA-style mastery quiz proves it has stuck, and weak
 * concepts resurface via spaced repetition (handled client-side).
 *
 * Source of truth: data/exam-paths/{slug}.json. Progress lives in the browser
 * (localStorage) so classmates can start instantly with no account.
 */

import fs from "fs";
import path from "path";

/** A teaching block inside a concept. The renderer styles each kind distinctly. */
export type ConceptSectionKind =
 | "hook" // why this matters / the one-sentence stakes
 | "intuition" // plain-language mental model BEFORE any formula
 | "formula" // the method/identity, with LaTeX
 | "worked" // a fully stepped example
 | "trick" // a speed shortcut / exam-day move
 | "trap" // a common mistake, pre-inoculated
 | "widget" // an interactive simulation (reuses the concept-widget registry)
 | "recall"; // active-recall flashcards

export interface ConceptSection {
 kind: ConceptSectionKind;
 title?: string;
 /** Prose body. May contain $inline$ and $$display$$ LaTeX, **bold**, `code`. */
 body?: string;
 /** For kind === "worked": ordered solution steps (each may contain math). */
 steps?: string[];
 /** For kind === "worked": the final boxed answer. */
 answer?: string;
 /** For kind === "widget": registry id + caption (see conceptWidgets). */
 widget?: { id: string; caption?: string; params?: Record<string, string | number | boolean> };
 /** For kind === "recall": front/back flashcards. */
 cards?: { front: string; back: string }[];
}

/** One SOA-style multiple-choice question for the mastery gate. */
export interface MasteryQuestion {
 /** The stem. May contain LaTeX. */
 q: string;
 /** Exactly 5 choices (A, E), matching real SOA format. */
 choices: string[];
 /** Zero-indexed correct choice. */
 correct: number;
 /** Worked explanation shown after answering (may contain LaTeX). */
 explain: string;
 /** Rough difficulty tag for analytics/sequencing. */
 difficulty?: "warmup" | "core" | "exam" | "stretch";

 // ── Optional study-mode enrichments (ActuaryQuestionSolver) ──────────────
 // All optional, so existing questions/generators are untouched. When present,
 // the solver exposes Decode / Trick / Diagram / Solution panels.

 /** Step 1, decode the English into structure (experiment, sample space, …). */
 decode?: { label: string; value: string }[];
 /** Step 2/Rule 2, the fastest way to solve this TYPE (may contain LaTeX). */
 trick?: string;
 /** Step 2, the governing formula/rule for this concept (may contain LaTeX). */
 formula?: string;
 /** Step 3, ordered compute steps, each may contain LaTeX. */
 steps?: string[];
 /** Step 4, sanity checks (each may contain LaTeX). */
 sanity?: string[];
 /** A diagram to render (key into the exam diagram library) + optional labels. */
 diagram?: DiagramSpec;
}

/** A reference to one of the SVG diagrams in ExamDiagrams.tsx. */
export type DiagramKind =
 | "venn-conditional" // two overlapping sets, overlap shaded
 | "tree" // 2-level probability tree
 | "partition" // sample space split into boxes (law of total prob)
 | "bell" // normal curve with ±1σ/±2σ/±3σ tails
 | "pmf-bars" // discrete PMF as bars
 | "poisson-timeline" // events as dots on a timeline
 | "exponential" // memoryless decay curve
 | "uniform" // flat density rectangle
 | "clt" // sampling distribution tightening to normal as n grows
 | "urn" // hypergeometric: drawn vs remaining balls
 | "timeline"; // FM cash-flow timeline

export interface DiagramSpec {
 kind: DiagramKind;
 /** Optional caption shown under the figure (may contain LaTeX). */
 caption?: string;
 /**
 * Question-specific values injected by the generator so each diagram shows
 * the ACTUAL numbers from that question, not hard-coded examples.
 *
 * Keys by kind:
 * venn-conditional pA, pB, pAB, labelA?, labelB?
 * tree p1, l1, p11, l11, p12, l12, p21, l21, p22, l22
 * bell mu, sigma, x1? (x1 = highlighted value)
 * pmf-bars ps (comma-sep probs), xs? (comma-sep x labels), highlight?
 * poisson-timeline lambda, t, expected?
 * exponential lambda, x0?
 * uniform a, b, x1?, x2? (x1..x2 = shaded probability region)
 * urn N, K, n
 * timeline n, pmt, rate, t0val? (t0val = amount at t=0, signed)
 */
 labels?: Record<string, string | number | undefined>;
}

export interface Concept {
 /** Stable url slug within the path, e.g. "bayes-theorem". */
 id: string;
 title: string;
 /** One-line promise of what clicks after this concept. */
 tagline: string;
 /** Estimated focused minutes. */
 minutes: number;
 /** Teaching blocks, in order. */
 sections: ConceptSection[];
 /** The gate: pass this to mark the concept mastered. */
 mastery: {
 /** Fraction correct required to pass (e.g. 0.8). */
 passing: number;
 /** Seconds budget PER question (drives the on-screen timer / exam realism). */
 secondsPerQuestion: number;
 questions: MasteryQuestion[];
 };
}

export interface ExamModule {
 /** Stable id, e.g. "general-probability". */
 id: string;
 title: string;
 /** Official SOA weight band, e.g. "23, 30%". */
 weight: string;
 /** One-line framing of the module. */
 blurb: string;
 concepts: Concept[];
}

export interface ExamPath {
 slug: string; // "exam-p"
 exam: string; // "P"
 title: string; // "Exam P, Probability"
 subtitle: string;
 /** Long-form intro shown on the path landing page. */
 intro: string;
 format: {
 questions: number;
 minutes: number;
 choices: number;
 passing: string; // human description, e.g. "Grade 6+ on the SOA 0, 10 scale"
 };
 /** Accent gradient classes (Tailwind) for cards/banner. */
 gradient: string;
 modules: ExamModule[];
}

const DATA_DIR = path.join(process.cwd(), "data", "exam-paths");

export function loadExamPath(slug: string): ExamPath | null {
 const file = path.join(DATA_DIR, `${slug}.json`);
 if (!fs.existsSync(file)) return null;
 return JSON.parse(fs.readFileSync(file, "utf-8")) as ExamPath;
}

export function loadAllExamPaths(): ExamPath[] {
 if (!fs.existsSync(DATA_DIR)) return [];
 return fs
 .readdirSync(DATA_DIR)
 .filter((f) => f.endsWith(".json"))
 .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf-8")) as ExamPath)
 .sort((a, b) => a.exam.localeCompare(b.exam));
}

/** Flatten every concept in path order, tagged with its module, used by the
 * renderer for prev/next navigation and the global progress bar. */
export function flattenConcepts(p: ExamPath): { module: ExamModule; concept: Concept; index: number }[] {
 const out: { module: ExamModule; concept: Concept; index: number }[] = [];
 let i = 0;
 for (const m of p.modules) for (const c of m.concepts) out.push({ module: m, concept: c, index: i++ });
 return out;
}

export function findConcept(p: ExamPath, conceptId: string): { module: ExamModule; concept: Concept } | null {
 for (const m of p.modules) {
 const c = m.concepts.find((x) => x.id === conceptId);
 if (c) return { module: m, concept: c };
 }
 return null;
}

export function totalConcepts(p: ExamPath): number {
 return p.modules.reduce((s, m) => s + m.concepts.length, 0);
}
