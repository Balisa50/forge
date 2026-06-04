"use client";

/**
 * Mentor Review section — lives at the bottom of the student's week page.
 *
 * Everything review-related the student needs for THIS WEEK in one place:
 *   - the mentor's questions, numbered and easy to read
 *   - an answer box under each question (when not yet submitted)
 *   - the student's submitted answers + the mentor's per-question score,
 *     overall score, written feedback, pass/fail verdict and 1–5 rating
 *     (once the mentor has reviewed)
 *
 * Replaces the "where do my mentor's questions even live?" problem.
 * Questions are NEVER served from chat threads — they live here on the week
 * page, attached to the task.
 *
 * Submission of answers still goes through the daily check-in flow (the
 * existing engagement gate is intact), so this section's primary "submit"
 * affordance is a button that scrolls the student to the check-in page.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Award, AlertTriangle, MessageSquare, ArrowRight } from "lucide-react";

interface ReviewQuestionState {
  id: string;
  position: number;
  prompt: string;
  answer: string | null;
  score: number | null;
}

interface ReviewState {
  hasQuestions: boolean;
  questions: ReviewQuestionState[];
  submitted: boolean;
  reviewed: boolean;
  passed?: boolean | null;
  overallScore?: number | null;
  feedback?: string | null;
  reviewedAt?: string | null;
  mentorRating?: number | null;
  taskStatus?: string | null;
}

export default function MentorReviewSection({ taskId }: { taskId: string }) {
  const [state, setState] = useState<ReviewState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/mentee/review-state?taskId=${encodeURIComponent(taskId)}`);
        if (!res.ok) {
          if (!cancelled) setState(null);
          return;
        }
        const data = (await res.json()) as ReviewState;
        if (!cancelled) setState(data);
      } catch {
        if (!cancelled) setState(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [taskId]);

  if (loading) return null;
  if (!state) return null;

  // No mentor questions authored — nothing to render. Silent (no nag).
  if (!state.hasQuestions) return null;

  const reviewed = state.reviewed;
  const passed = !!state.passed;
  const rating = state.mentorRating ?? null;

  return (
    <section
      aria-label="Mentor Review"
      style={{
        marginTop: "2rem",
        borderRadius: 12,
        border: `1px solid ${reviewed ? (passed ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)") : "rgba(212,175,55,0.4)"}`,
        background: reviewed
          ? passed
            ? "rgba(34,197,94,0.05)"
            : "rgba(239,68,68,0.05)"
          : "rgba(212,175,55,0.04)",
        padding: "1.25rem 1.375rem",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <MessageSquare size={18} style={{ color: "var(--accent)" }} />
        <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.0625rem", letterSpacing: "0.04em" }}>
          Mentor Review
        </h3>
        <StatusPill state={state} />
        {rating !== null && reviewed && (
          <span
            title="Your mentor's rating of this week"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.375rem",
              padding: "0.25rem 0.625rem",
              background: "rgba(212,175,55,0.12)",
              border: "1px solid rgba(212,175,55,0.4)",
              borderRadius: 999,
              fontFamily: "var(--font-mono)", fontSize: "0.6875rem",
              color: "var(--accent)", letterSpacing: "0.1em",
            }}
          >
            <Award size={11} /> {rating}/5
          </span>
        )}
      </header>

      {/* Header sub-line that varies by state */}
      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.55, marginBottom: "1rem" }}>
        {reviewed
          ? passed
            ? "Your mentor reviewed your answers and signed off on this week."
            : "Your mentor reviewed your answers. See feedback below — you can retry this week."
          : state.submitted
            ? "Your answers were submitted. Awaiting your mentor's review."
            : `Your mentor has ${state.questions.length} question${state.questions.length === 1 ? "" : "s"} on this week. Answer them with your weekly check-in.`}
      </p>

      {/* Questions and (if submitted) answers, one block per question */}
      <ol style={{ display: "flex", flexDirection: "column", gap: "0.875rem", listStyle: "none", padding: 0, margin: 0 }}>
        {state.questions.map((q) => (
          <li key={q.id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 26, height: 26,
                  borderRadius: 999,
                  background: "rgba(212,175,55,0.18)",
                  color: "var(--accent)",
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 700,
                }}
              >
                {q.position + 1}
              </span>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", lineHeight: 1.55, fontWeight: 500 }}>
                {q.prompt}
              </p>
            </div>

            {/* Submitted answer (if any) */}
            {q.answer && (
              <div
                style={{
                  marginLeft: "2.125rem",
                  padding: "0.5rem 0.75rem",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: "0.875rem",
                  color: "var(--text-primary)",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.55,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)",
                    letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.25rem",
                  }}
                >
                  Your answer
                </span>
                <div>{q.answer}</div>
                {reviewed && q.score !== null && (
                  <div
                    style={{
                      marginTop: "0.375rem",
                      fontFamily: "var(--font-mono)", fontSize: "0.6875rem",
                      color: q.score >= 7 ? "var(--green)" : q.score >= 5 ? "var(--accent)" : "var(--red)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Mentor scored this answer {q.score}/10
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>

      {/* Mentor feedback block — only after review */}
      {reviewed && state.feedback && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem 0.875rem",
            background: passed ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${passed ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: 8,
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-mono)", fontSize: "0.625rem",
              color: passed ? "var(--green)" : "var(--red)",
              letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.375rem",
            }}
          >
            Mentor feedback
          </span>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {state.feedback}
          </p>
        </div>
      )}

      {/* CTA — only when there are unanswered questions */}
      {!state.submitted && (
        <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <Link
            href="/dashboard/checkin"
            className="forge-btn forge-btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem" }}
          >
            Answer in the daily check-in <ArrowRight size={14} />
          </Link>
          <span style={{ color: "var(--text-dim)", fontSize: "0.8125rem" }}>
            Your answers are required to submit this week.
          </span>
        </div>
      )}
    </section>
  );
}

function StatusPill({ state }: { state: ReviewState }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.25rem 0.625rem",
    borderRadius: 999,
    fontFamily: "var(--font-mono)",
    fontSize: "0.6875rem",
    letterSpacing: "0.1em",
  } as const;

  if (state.reviewed && state.passed) {
    return (
      <span style={{ ...base, color: "var(--green)", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.4)" }}>
        <CheckCircle2 size={11} /> PASSED
      </span>
    );
  }
  if (state.reviewed && !state.passed) {
    return (
      <span style={{ ...base, color: "var(--red)", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)" }}>
        <AlertTriangle size={11} /> NEEDS REWORK
      </span>
    );
  }
  if (state.submitted) {
    return (
      <span style={{ ...base, color: "var(--accent)", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)" }}>
        <Clock size={11} /> AWAITING MENTOR REVIEW
      </span>
    );
  }
  return (
    <span style={{ ...base, color: "var(--accent)", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)" }}>
      <MessageSquare size={11} /> ANSWER TO SUBMIT
    </span>
  );
}
