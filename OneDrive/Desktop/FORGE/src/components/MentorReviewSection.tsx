"use client";

/**
 * Mentor Review section, lives at the bottom of the student's week page.
 *
 * Single place to:
 * - read the mentor's questions, numbered cleanly
 * - type answers directly under each one (one textarea per question)
 * - click "Submit Answers" to send them to the mentor
 * - once reviewed, see the verdict (PASSED / NEEDS REWORK), per-question
 * scores, written feedback and the mentor's 1-5 rating
 *
 * Questions are never delivered via chat. Answers never live in another
 * page. Everything is right here, attached to the week.
 */

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Award, AlertTriangle, MessageSquare, Send, Loader2 } from "lucide-react";

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
 // Inline answer drafts. Keyed by questionId. Initialised once the state
 // arrives and the student has not yet submitted.
 const [drafts, setDrafts] = useState<Record<string, string>>({});
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const refresh = async () => {
 try {
 const res = await fetch(`/api/mentee/review-state?taskId=${encodeURIComponent(taskId)}`);
 if (!res.ok) {
 setState(null);
 return;
 }
 const data = (await res.json()) as ReviewState;
 setState(data);
 // Seed drafts (empty for each question) only if not yet submitted.
 if (!data.submitted) {
 const seed: Record<string, string> = {};
 for (const q of data.questions) seed[q.id] = "";
 setDrafts(seed);
 }
 } catch {
 setState(null);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 setLoading(true);
 refresh();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [taskId]);

 const allAnswered = state?.questions.every((q) => (drafts[q.id] ?? "").trim().length > 0) ?? false;

 const submit = async () => {
 if (!state || submitting) return;
 setSubmitting(true);
 setError(null);
 try {
 const res = await fetch("/api/mentee/review-answers", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 taskId,
 answers: state.questions.map((q) => ({ questionId: q.id, answer: drafts[q.id] ?? "" })),
 }),
 });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 setError(data.error ?? "Submission failed. Try again.");
 return;
 }
 await refresh();
 } catch {
 setError("Network error, try again.");
 } finally {
 setSubmitting(false);
 }
 };

 if (loading) return null;
 if (!state) return null;
 // No mentor questions authored, nothing to render. Silent (no nag).
 if (!state.hasQuestions) return null;

 const reviewed = state.reviewed;
 const passed = !!state.passed;
 const submitted = state.submitted;
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

 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.55, marginBottom: "1rem" }}>
 {reviewed
 ? passed
 ? "Your mentor reviewed your answers and signed off on this week."
 : "Your mentor reviewed your answers. See feedback below, you can retry this week."
 : submitted
 ? "Your answers were submitted. Awaiting your mentor's review."
 : `Your mentor has ${state.questions.length} question${state.questions.length === 1 ? "" : "s"} on this week. Answer each one below, then submit.`}
 </p>

 <ol style={{ display: "flex", flexDirection: "column", gap: "1rem", listStyle: "none", padding: 0, margin: 0 }}>
 {state.questions.map((q) => {
 const draft = drafts[q.id] ?? "";
 return (
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

 {/* The answer area: a textarea while drafting, a read-only block
 once the student has submitted. */}
 {!submitted ? (
 <textarea
 value={draft}
 onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
 rows={3}
 placeholder="Type your answer..."
 className="forge-input"
 style={{
 marginLeft: "2.125rem",
 width: "calc(100% - 2.125rem)",
 boxSizing: "border-box",
 resize: "vertical",
 fontFamily: "var(--font-body)",
 fontSize: "0.9375rem",
 lineHeight: 1.55,
 }}
 />
 ) : (
 q.answer && (
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
 )
 )}
 </li>
 );
 })}
 </ol>

 {/* Submit button, only while there are unanswered questions */}
 {!submitted && (
 <div style={{ marginTop: "1.25rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
 <button
 type="button"
 onClick={submit}
 disabled={!allAnswered || submitting}
 className="forge-btn forge-btn-primary forge-btn-full"
 style={{
 padding: "0.625rem 1rem",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 gap: "0.5rem",
 boxSizing: "border-box",
 opacity: !allAnswered || submitting ? 0.6 : 1,
 cursor: !allAnswered || submitting ? "not-allowed" : "pointer",
 }}
 >
 {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
 {submitting ? "Submitting…" : "Submit Answers"}
 </button>
 {!allAnswered && (
 <span style={{ color: "var(--text-dim)", fontSize: "0.8125rem" }}>
 Answer every question before submitting.
 </span>
 )}
 </div>
 )}

 {error && (
 <p style={{ marginTop: "0.75rem", color: "var(--red)", fontSize: "0.875rem" }} role="alert">
 {error}
 </p>
 )}

 {/* Mentor feedback panel, only after review */}
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
