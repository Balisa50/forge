"use client";

/**
 * ConceptCheck — 3-question warm-up at the start of a week.
 *
 * Not a test. Not graded. Just a low-stakes "do you have the right mental
 * picture before you build?" check. Flags confusion before it becomes
 * dropout.
 *
 * Each question = single-select multiple choice with 2–4 choices. The
 * learner sees instant feedback per question (correct/incorrect tint +
 * one-line debrief). Results persist server-side via /api/learn/concept-check
 * so the mentor can see them on the drilldown.
 *
 * Dismissable per-week via localStorage. Once a learner has answered all
 * questions OR explicitly skipped, the card collapses to a thin summary
 * strip.
 */

import { useEffect, useState } from "react";
import { ClipboardCheck, Check, X, ChevronDown } from "lucide-react";
import type { ConceptCheckQuestion } from "@/lib/roadmaps";

interface Props {
  slug: string;
  week: number;
  questions: ConceptCheckQuestion[];
}

interface Answers {
  [qIdx: number]: number;          // qIdx → choice index
}

const STORAGE = (slug: string, week: number) => `forge.conceptCheck.${slug}.w${week}`;

export default function ConceptCheck({ slug, week, questions }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [expanded, setExpanded] = useState(true);
  const [skipped, setSkipped] = useState(false);
  const [persisting, setPersisting] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE(slug, week));
      if (raw) {
        const data = JSON.parse(raw);
        setAnswers(data.answers ?? {});
        if (data.skipped) setSkipped(true);
        if (data.answers && Object.keys(data.answers).length >= questions.length) {
          // All answered — auto-collapse
          setExpanded(false);
        }
      }
    } catch { /* */ }
  }, [slug, week, questions.length]);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= questions.length;
  const correctCount = Object.entries(answers).filter(([qIdx, choice]) => questions[parseInt(qIdx)].correct === choice).length;

  const persist = (next: Answers, isSkipped = skipped) => {
    try {
      localStorage.setItem(STORAGE(slug, week), JSON.stringify({ answers: next, skipped: isSkipped }));
    } catch { /* */ }
    // Fire to server (don't block UI on it)
    setPersisting(true);
    void fetch("/api/learn/concept-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, week, answers: next, skipped: isSkipped, total: questions.length }),
    }).catch(() => { /* offline — local copy survives */ }).finally(() => setPersisting(false));
  };

  const answer = (qIdx: number, choiceIdx: number) => {
    const next = { ...answers, [qIdx]: choiceIdx };
    setAnswers(next);
    persist(next);
  };

  const skip = () => {
    setSkipped(true);
    setExpanded(false);
    persist(answers, true);
  };

  if (questions.length === 0) return null;

  // Collapsed strip — fully answered or skipped
  if (!expanded) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.625rem 0.875rem",
        marginBottom: "1.25rem",
        borderRadius: 8,
        background: "rgba(96,165,250,0.04)",
        border: "1px solid rgba(96,165,250,0.15)",
        fontSize: "0.8125rem",
        color: "var(--text-secondary)",
      }}>
        <ClipboardCheck size={13} color="var(--blue)" />
        {skipped && !allAnswered ? (
          <span>Warm-up skipped — that&apos;s fine.</span>
        ) : (
          <span>
            Warm-up done: <strong style={{ color: "var(--text-primary)" }}>{correctCount}/{questions.length}</strong> correct
          </span>
        )}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "none",
            color: "var(--text-dim)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            letterSpacing: "0.1em",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          Show <ChevronDown size={12} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: "1.5rem",
      padding: "1.125rem 1.25rem",
      borderRadius: 12,
      background: "rgba(96,165,250,0.04)",
      border: "1px solid rgba(96,165,250,0.2)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.625rem",
          letterSpacing: "0.28em",
          color: "var(--blue)",
          textTransform: "uppercase",
        }}>
          <ClipboardCheck size={11} /> Before you begin · warm-up
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.08em" }}>
          {answeredCount}/{questions.length} · low stakes {persisting ? "· saving…" : ""}
        </div>
      </div>

      <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "1rem", lineHeight: 1.55 }}>
        Three quick questions to check your mental picture. Wrong answers are
        useful too — they flag what to focus on this week.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {questions.map((q, qi) => {
          const picked = answers[qi];
          const answered = picked !== undefined;
          const correct = answered && picked === q.correct;
          return (
            <div key={qi} style={{
              padding: "0.875rem 1rem",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}>
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9375rem",
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: "0.625rem",
                lineHeight: 1.45,
              }}>
                <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", marginRight: "0.4rem" }}>Q{qi + 1}.</span>
                {q.q}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {q.choices.map((choice, ci) => {
                  const isPicked = picked === ci;
                  const isCorrect = ci === q.correct;
                  let tint = "var(--bg-card)";
                  let borderColor = "var(--border)";
                  let textColor = "var(--text-secondary)";
                  let badge: React.ReactNode = null;
                  if (answered) {
                    if (isPicked && isCorrect) { tint = "rgba(34,197,94,0.08)"; borderColor = "rgba(34,197,94,0.4)"; textColor = "var(--green)"; badge = <Check size={12} />; }
                    else if (isPicked && !isCorrect) { tint = "rgba(239,68,68,0.08)"; borderColor = "rgba(239,68,68,0.35)"; textColor = "var(--red)"; badge = <X size={12} />; }
                    else if (!isPicked && isCorrect) { tint = "rgba(34,197,94,0.04)"; borderColor = "rgba(34,197,94,0.2)"; textColor = "var(--green)"; badge = <Check size={12} />; }
                  }
                  return (
                    <button
                      key={ci}
                      type="button"
                      disabled={answered}
                      onClick={() => answer(qi, ci)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        background: tint,
                        border: `1px solid ${borderColor}`,
                        borderRadius: 6,
                        color: textColor,
                        fontSize: "0.875rem",
                        textAlign: "left",
                        cursor: answered ? "default" : "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ flexShrink: 0, width: 16, height: 16, display: "grid", placeItems: "center" }}>{badge}</span>
                      <span style={{ flex: 1 }}>{choice}</span>
                    </button>
                  );
                })}
              </div>
              {answered && q.explain && (
                <p style={{
                  marginTop: "0.625rem",
                  paddingLeft: "0.75rem",
                  borderLeft: `2px solid ${correct ? "rgba(34,197,94,0.5)" : "rgba(245,158,11,0.5)"}`,
                  color: "var(--text-secondary)",
                  fontSize: "0.8125rem",
                  fontStyle: "italic",
                  lineHeight: 1.55,
                }}>
                  {q.explain}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", gap: "0.75rem", flexWrap: "wrap" }}>
        {!allAnswered ? (
          <button
            type="button"
            onClick={skip}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-dim)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: "0.4rem 0",
            }}
          >
            Skip warm-up
          </button>
        ) : (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: correctCount === questions.length ? "var(--green)" : "var(--accent)" }}>
            {correctCount}/{questions.length} correct.{" "}
            {correctCount === questions.length ? "Solid mental picture — go build." : "Some gaps showed up — the week will fill them in."}
          </div>
        )}
        {allAnswered && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text-secondary)",
              padding: "0.4rem 0.75rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Collapse
          </button>
        )}
      </div>
    </div>
  );
}
