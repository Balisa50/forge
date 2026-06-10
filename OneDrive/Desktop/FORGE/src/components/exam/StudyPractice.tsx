"use client";

/**
 * StudyPractice, infinite, fully-enriched practice in study mode.
 *
 * Pulls fresh parameter-randomized questions from the generator (which now
 * attaches trick / diagram / decode / sanity to every item) and renders each in
 * the ActuaryQuestionSolver, so a student can reveal the trick, the diagram, and
 * the four-step reasoning on ANY question, not just the hand-authored examples.
 * Self-hides for concepts that have no generator.
 */

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Dumbbell } from "lucide-react";
import { hasGenerator, generateForStudent } from "@/lib/examQuestionGen";
import type { MasteryQuestion } from "@/lib/examPaths";
import ActuaryQuestionSolver from "@/components/exam/ActuaryQuestionSolver";

export default function StudyPractice({ slug, conceptId, count = 3 }: { slug: string; conceptId: string; count?: number }) {
 const [questions, setQuestions] = useState<MasteryQuestion[]>([]);
 const available = hasGenerator(conceptId);

 const regen = useCallback(() => {
 setQuestions(generateForStudent(slug, conceptId, count));
 }, [slug, conceptId, count]);

 useEffect(() => { regen(); }, [regen]);

 if (!available) return null;

 return (
 <section className="mt-10">
 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
 <h2 style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontFamily: "var(--font-headline)", fontSize: "1.25rem", fontWeight: 700 }}>
 <Dumbbell size={18} style={{ color: "var(--accent)" }} /> Practice (study mode)
 </h2>
 <button
 type="button"
 onClick={regen}
 className="forge-btn forge-btn-ghost"
 style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.375rem 0.875rem", fontSize: "0.8125rem" }}
 >
 <RefreshCw size={13} /> New questions
 </button>
 </div>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "1rem" }}>
 Fresh every time. Try each yourself, then reveal the trick, the diagram, and the step-by-step. No timer here, this is for learning, not the gate.
 </p>
 <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
 {questions.map((q, i) => (
 <ActuaryQuestionSolver key={i} question={q} />
 ))}
 </div>
 </section>
 );
}
