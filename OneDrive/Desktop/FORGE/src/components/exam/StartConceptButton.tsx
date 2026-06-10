"use client";

/**
 * StartConceptButton, explicit, intentional progress tracking (Option A).
 *
 * Progress is marked ONLY when the student clicks "Start this concept", never
 * passively on page open. Once started (or already mastered), it shows a clear
 * confirmation so the student never wonders whether the system registered them.
 */

import { Play, CheckCircle2 } from "lucide-react";
import { useExamProgress, getConcept, markOpened } from "@/lib/examProgress";

export default function StartConceptButton({ slug, conceptId }: { slug: string; conceptId: string }) {
 const { progress, ready } = useExamProgress(slug);
 const status = getConcept(progress, conceptId).status;
 const started = status === "in-progress" || status === "mastered";

 // Avoid a flash of the wrong state before localStorage/server hydrate.
 if (!ready) return <div style={{ height: 44 }} />;

 if (started) {
 return (
 <div
 className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5"
 style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", fontSize: "0.875rem", fontWeight: 600 }}
 >
 <CheckCircle2 size={16} />
 Concept started. Your progress is being tracked.
 </div>
 );
 }

 return (
 <div className="flex flex-wrap items-center gap-3">
 <button
 onClick={() => markOpened(slug, conceptId)}
 className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition hover:brightness-110"
 style={{ background: "var(--accent)", color: "#0a0a0a", fontSize: "0.9375rem" }}
 >
 <Play size={16} /> Start this concept
 </button>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
 Click to mark you&apos;ve begun. That&apos;s what counts as progress.
 </span>
 </div>
 );
}
