"use client";

/**
 * MasteryQuiz — the gate that turns "I read it" into "it stuck".
 *
 * SOA realism by design: five choices A–E, a per-question countdown that mirrors
 * the ~3-min-a-question pace of the real sitting, and no going back. When the
 * student clears the passing bar the concept is marked mastered and enters the
 * spaced-repetition rotation (recordAttempt handles the box math). A failed
 * REVIEW of an already-mastered concept collapses it straight back into the
 * queue — the concept literally can't escape until it's automatic.
 *
 * LaTeX in stems / choices / explanations renders via the shared KaTeX helper
 * (stylesheet is loaded once by the exam route layout).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Timer, Check, X, RotateCcw, Trophy, ArrowRight } from "lucide-react";
import { renderRichText } from "@/lib/math";
import { recordAttempt, useExamProgress, getConcept } from "@/lib/examProgress";
import type { MasteryQuestion as MQ } from "@/lib/examPaths";

interface Props {
  slug: string;
  conceptId: string;
  passing: number; // fraction, e.g. 0.8
  secondsPerQuestion: number;
  questions: MQ[];
}

const LETTERS = ["A", "B", "C", "D", "E"];

export default function MasteryQuiz({ slug, conceptId, passing, secondsPerQuestion, questions }: Props) {
  // Framing-only: was this concept already mastered before this sitting?
  const { progress } = useExamProgress(slug);
  const alreadyMastered = getConcept(progress, conceptId).status === "mastered";
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [idx, setIdx] = useState(0);
  // picks[i] = chosen index, or -1 if timed out / unanswered.
  const [picks, setPicks] = useState<number[]>(() => questions.map(() => -2)); // -2 = not reached
  const [secs, setSecs] = useState(secondsPerQuestion);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = questions.length;

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (finalPicks: number[]) => {
      clearTick();
      const correct = finalPicks.reduce((n, p, i) => n + (p === questions[i].correct ? 1 : 0), 0);
      const score = total ? correct / total : 0;
      recordAttempt(slug, conceptId, score, score >= passing);
      setPhase("done");
    },
    [clearTick, conceptId, passing, questions, slug, total],
  );

  const advance = useCallback(
    (pick: number) => {
      setPicks((prev) => {
        const next = [...prev];
        next[idx] = pick;
        if (idx + 1 >= total) {
          finish(next);
        } else {
          setIdx(idx + 1);
          setSecs(secondsPerQuestion);
        }
        return next;
      });
    },
    [finish, idx, secondsPerQuestion, total],
  );

  // Per-question countdown. Timing out records a miss (-1) and auto-advances.
  useEffect(() => {
    if (phase !== "running") return;
    clearTick();
    tickRef.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          // time's up for this question
          advance(-1);
          return secondsPerQuestion;
        }
        return s - 1;
      });
    }, 1000);
    return clearTick;
  }, [phase, idx, advance, clearTick, secondsPerQuestion]);

  function start() {
    setPicks(questions.map(() => -2));
    setIdx(0);
    setSecs(secondsPerQuestion);
    setPhase("running");
  }

  const result = useMemo(() => {
    if (phase !== "done") return null;
    const correct = picks.reduce((n, p, i) => n + (p === questions[i].correct ? 1 : 0), 0);
    const score = total ? correct / total : 0;
    return { correct, score, passed: score >= passing };
  }, [phase, picks, questions, total, passing]);

  // ---- IDLE ----
  if (phase === "idle") {
    return (
      <div className="rounded-2xl border border-[color:var(--border)] p-6" style={{ background: "linear-gradient(180deg, rgba(212,175,55,0.06), rgba(212,175,55,0.01))" }}>
        <div className="flex items-center gap-2">
          <Trophy size={18} style={{ color: "var(--accent)" }} />
          <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", fontWeight: 700 }}>
            {alreadyMastered ? "Review check" : "Mastery gate"}
          </h3>
        </div>
        <p className="mt-2" style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
          {total} SOA-style questions · {secondsPerQuestion}s each · pass at <strong style={{ color: "var(--text-primary)" }}>{Math.round(passing * 100)}%</strong>.
          {alreadyMastered
            ? " You've mastered this — clear it again to push the next review further out. Miss it and it drops back into daily rotation."
            : " Clear it and the concept is locked in, then resurfaces on a spaced schedule so it never fades."}
        </p>
        <button
          onClick={start}
          className="mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition hover:brightness-110"
          style={{ background: "var(--accent)", color: "#0a0a0a", fontSize: "0.9375rem" }}
        >
          {alreadyMastered ? "Start review" : "Start mastery quiz"} <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // ---- RUNNING ----
  if (phase === "running") {
    const q = questions[idx];
    const low = secs <= Math.max(3, Math.round(secondsPerQuestion * 0.2));
    return (
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-6">
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Question {idx + 1} / {total}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: low ? "#ef4444" : "var(--accent)",
              background: low ? "rgba(239,68,68,0.12)" : "rgba(212,175,55,0.1)",
              border: `1px solid ${low ? "rgba(239,68,68,0.4)" : "rgba(212,175,55,0.3)"}`,
            }}
          >
            <Timer size={13} /> {secs}s
          </span>
        </div>
        {/* progress dots */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div style={{ width: `${(idx / total) * 100}%`, height: "100%", background: "var(--accent)", transition: "width 0.3s" }} />
        </div>

        <div className="mt-5" style={{ fontSize: "1.0625rem", lineHeight: 1.6, color: "var(--text-primary)" }}>
          {renderRichText(q.q, `q${idx}`)}
        </div>

        <div className="mt-5 grid gap-2.5">
          {q.choices.map((ch, ci) => (
            <button
              key={ci}
              onClick={() => advance(ci)}
              className="flex items-start gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3.5 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--bg-panel)]"
            >
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", fontWeight: 700, background: "rgba(212,175,55,0.12)", color: "var(--accent)" }}
              >
                {LETTERS[ci]}
              </span>
              <span style={{ fontSize: "0.9375rem", lineHeight: 1.5 }}>{renderRichText(ch, `q${idx}c${ci}`)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---- DONE ----
  const r = result!;
  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: r.passed ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.35)", background: r.passed ? "rgba(52,211,153,0.06)" : "rgba(239,68,68,0.05)" }}>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full" style={{ background: r.passed ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.12)" }}>
          {r.passed ? <Trophy size={22} style={{ color: "#34d399" }} /> : <RotateCcw size={22} style={{ color: "#ef4444" }} />}
        </div>
        <div>
          <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.375rem", fontWeight: 700 }}>
            {r.passed ? (alreadyMastered ? "Review cleared" : "Concept mastered") : "Not yet — run it back"}
          </h3>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            {r.correct}/{total} correct · {Math.round(r.score * 100)}% · bar {Math.round(passing * 100)}%
          </p>
        </div>
      </div>

      {r.passed ? (
        <p className="mt-3" style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
          Locked in. It'll resurface on a spaced schedule — show up when it's due and the interval keeps stretching until recall is automatic.
        </p>
      ) : (
        <p className="mt-3" style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
          Read the explanations below, re-skim the section, and go again. Missing the bar is information, not failure — it tells you exactly where the gap is.
        </p>
      )}

      {/* Per-question review */}
      <div className="mt-5 space-y-4">
        {questions.map((q, i) => {
          const pick = picks[i];
          const ok = pick === q.correct;
          return (
            <div key={i} className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-4">
              <div className="flex items-start gap-2">
                {ok ? <Check size={16} style={{ color: "#34d399", marginTop: 3, flexShrink: 0 }} /> : <X size={16} style={{ color: "#ef4444", marginTop: 3, flexShrink: 0 }} />}
                <div className="min-w-0" style={{ fontSize: "0.9375rem", lineHeight: 1.55 }}>
                  {renderRichText(q.q, `rq${i}`)}
                </div>
              </div>
              <p className="mt-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Correct: <span style={{ color: "#34d399" }}>{LETTERS[q.correct]}</span>
                {pick >= 0 && !ok && <> · you chose <span style={{ color: "#ef4444" }}>{LETTERS[pick]}</span></>}
                {pick === -1 && <> · <span style={{ color: "#f59e0b" }}>ran out of time</span></>}
              </p>
              <div className="mt-2" style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>
                {renderRichText(q.explain, `re${i}`)}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={start}
        className="mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition hover:brightness-110"
        style={{ background: r.passed ? "var(--bg-elev)" : "var(--accent)", color: r.passed ? "var(--text-primary)" : "#0a0a0a", border: r.passed ? "1px solid var(--border)" : "none", fontSize: "0.9375rem" }}
      >
        <RotateCcw size={16} /> {r.passed ? "Take it again" : "Try again"}
      </button>
    </div>
  );
}
