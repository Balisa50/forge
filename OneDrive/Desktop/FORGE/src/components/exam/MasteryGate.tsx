"use client";

/**
 * MasteryGate, the deliberate "I've finished reading" closure before the quiz.
 *
 * The mastery quiz stays LOCKED (greyed, disabled) until the student explicitly
 * clicks "Complete". That forces a beat of closure, mentally finishing the
 * material instead of racing into the test. Once completed (persisted per
 * concept), the real MasteryQuiz renders. Completion survives reloads.
 *
 * Flat treatment: the closure moment is anchored by a gold top rule on the
 * page itself, not floated in a box.
 */

import { useEffect, useState } from "react";
import { Lock, Check, Trophy } from "lucide-react";
import MasteryQuiz from "./MasteryQuiz";
import type { MasteryQuestion as MQ } from "@/lib/examPaths";

const storageKey = (slug: string, conceptId: string) => `forge.exam.complete.${slug}.${conceptId}`;

export default function MasteryGate({
 slug,
 conceptId,
 passing,
 secondsPerQuestion,
 questions,
}: {
 slug: string;
 conceptId: string;
 passing: number;
 secondsPerQuestion: number;
 questions: MQ[];
}) {
 const [completed, setCompleted] = useState(false);
 const [hydrated, setHydrated] = useState(false);

 useEffect(() => {
 try {
 setCompleted(window.localStorage.getItem(storageKey(slug, conceptId)) === "1");
 } catch { /* private mode */ }
 setHydrated(true);
 }, [slug, conceptId]);

 const markComplete = () => {
 setCompleted(true);
 try { window.localStorage.setItem(storageKey(slug, conceptId), "1"); } catch { /* */ }
 };

 if (!hydrated) return <div style={{ height: 120 }} />;

 if (completed) {
 return (
 <MasteryQuiz
 slug={slug}
 conceptId={conceptId}
 passing={passing}
 secondsPerQuestion={secondsPerQuestion}
 questions={questions}
 />
 );
 }

 return (
 <div>
 {/* Completion closure */}
 <div className="border-t-2 pt-8 text-center" style={{ borderColor: "var(--accent)" }}>
 <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
 Finished the lesson?
 </h3>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, maxWidth: 460, margin: "0 auto 1.25rem" }}>
 Take a beat and make sure it actually clicked. When you&apos;re ready, mark this concept complete to unlock the mastery quiz.
 </p>
 <button
 onClick={markComplete}
 className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition hover:brightness-110"
 style={{ background: "var(--accent)", color: "#0a0a0a", fontSize: "0.9375rem" }}
 >
 <Check size={16} /> Complete
 </button>
 </div>

 {/* Locked quiz, flat, dimmed, sits under a hairline */}
 <div className="mt-8 border-t border-[color:var(--border)] pt-6 text-center" style={{ opacity: 0.55 }} aria-disabled>
 <p className="inline-flex items-center justify-center gap-2" style={{ color: "var(--text-dim)", fontSize: "0.875rem", marginBottom: "1rem" }}>
 <Lock size={15} /> Mastery quiz locked. Click <strong style={{ color: "var(--text-secondary)" }}>Complete</strong> above to unlock it.
 </p>
 <div>
 <button
 disabled
 className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold"
 style={{ background: "var(--bg-elev)", color: "var(--text-dim)", border: "1px solid var(--border)", fontSize: "0.9375rem", cursor: "not-allowed" }}
 >
 <Trophy size={16} /> Start mastery quiz
 </button>
 </div>
 </div>
 </div>
 );
}
