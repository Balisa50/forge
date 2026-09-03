"use client";

/**
 * ConceptCheck, the optional 3-question warm-up shown at the TOP of a week
 * (before the day list). Low-stakes multiple-choice: the learner picks an
 * answer, sees right/wrong + a one-line explanation, and the picks persist in
 * localStorage so they survive navigation and reload.
 *
 * Data-driven from `week.concept_check` (ConceptCheckQuestion[]), so the same
 * component powers every week of every track. Collapsible and subtly styled so
 * it sits off the critical path, it is a warm-up, not a gate.
 */

import { useState, useEffect } from "react";
import { Check, X, Sparkles } from "lucide-react";
import type { ConceptCheckQuestion } from "@/lib/roadmaps";

export default function ConceptCheck({
  questions,
  storageKey,
}: {
  questions: ConceptCheckQuestion[];
  /** Unique id for this week's warm-up; when set, picks persist in localStorage. */
  storageKey?: string;
}) {
  // picks[i] = the choice index the learner selected for question i (null = unanswered).
  const [picks, setPicks] = useState<(number | null)[]>(() => Array(questions.length).fill(null));

  // Rehydrate saved picks on mount (client-only; SSR-safe, no hydration mismatch).
  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "null");
      if (Array.isArray(saved) && saved.length === questions.length) setPicks(saved);
    } catch { /* ignore corrupt cache */ }
  }, [storageKey, questions.length]);

  const choose = (qi: number, ci: number) => {
    if (picks[qi] !== null) return; // lock after first answer
    const next = [...picks];
    next[qi] = ci;
    setPicks(next);
    if (storageKey && typeof window !== "undefined")
      try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* quota / privacy mode */ }
  };

  const answered = picks.filter((p) => p !== null).length;

  return (
    <details
      open
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "var(--bg-card)",
        padding: "1rem 1.125rem",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        <Sparkles size={14} /> Warm-up · {answered}/{questions.length}
      </summary>

      <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", margin: "0.5rem 0 1rem" }}>
        Quick check before you start. Not graded, just flags anything to watch for.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {questions.map((q, qi) => {
          const pick = picks[qi];
          const locked = pick !== null;
          return (
            <div key={qi}>
              <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: "0.5rem", lineHeight: 1.4 }}>
                {qi + 1}. {q.q}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {q.choices.map((c, ci) => {
                  const right = ci === q.correct;
                  const mine = ci === pick;
                  const show = locked && (right || mine);
                  return (
                    <button
                      key={ci}
                      onClick={() => choose(qi, ci)}
                      disabled={locked}
                      style={{
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: 8,
                        border: `1px solid ${!locked ? "var(--border)" : right ? "rgba(34,197,94,0.5)" : mine ? "rgba(239,68,68,0.5)" : "var(--border)"}`,
                        background: show && right ? "rgba(34,197,94,0.08)" : show && mine ? "rgba(239,68,68,0.08)" : "var(--bg-panel)",
                        color: "var(--text-primary)",
                        fontSize: "0.875rem",
                        cursor: locked ? "default" : "pointer",
                        lineHeight: 1.4,
                      }}
                    >
                      {show && right && <Check size={14} style={{ color: "var(--green)", flexShrink: 0 }} />}
                      {show && mine && !right && <X size={14} style={{ color: "#ef4444", flexShrink: 0 }} />}
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
              {locked && q.explain && (
                <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {q.explain}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </details>
  );
}
