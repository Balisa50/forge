"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, ShieldCheck, Camera, AlertTriangle } from "lucide-react";
import SubmissionViewer from "@/components/SubmissionViewer";
import { type EvidenceData } from "@/lib/submission-types";

interface TranscriptEntry {
  role: "assistant" | "user" | "proctor";
  kind?: string;
  content?: string;
  questionNumber?: number;
  type?: string;
  pendingReview?: boolean;
  event?: { type?: string; detail?: string };
  timestamp?: string;
}

interface RubricEntry {
  position: number;
  prompt: string;
  rubric: string | null;
  idealAnswer: string | null;
}

interface Review {
  id: string;
  mode: string;
  passed: boolean;
  overallScore: number;
  feedback: string | null;
  transcript: TranscriptEntry[];
  completedAt: string | null;
  checkin: {
    description: string;
    evidenceType: string;
    evidenceUrl: string | null;
    evidenceData: EvidenceData | null;
    user: { id: string; name: string | null; email: string };
    task: { id: string; title: string };
  };
  questionBank?: RubricEntry[];
}

export default function MentorReviewsPage() {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  // 1-5 rating saved to Task.mentorRating — visible to the student in the
  // Mentor Review section + Journal. null = don't set/change the rating.
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/mentor/reviews");
    if (res.ok) {
      const data = await res.json();
      setRows(data.reviews);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = rows.find((r) => r.id === activeId);

  const open = (r: Review) => {
    setActiveId(r.id);
    const answerCount = r.transcript.filter((t) => t.role === "user" && typeof t.questionNumber === "number").length;
    setScores(Array(answerCount).fill(7));
    setFeedback("");
    setRating(null);
  };

  const submit = async (passed: boolean) => {
    if (!active) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/mentor/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interrogationId: active.id, scores, feedback, passed, mentorRating: rating }),
      });
      if (res.ok) {
        setActiveId(null);
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <Link href="/dashboard/mentor" className="inline-flex items-center gap-1.5 text-xs mb-4" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
        <ArrowLeft size={12} /> back to mentor home
      </Link>
      <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", marginBottom: "0.5rem" }}>Pending reviews</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
        Mentees who&apos;ve answered your questions are waiting on your grade.
      </p>

      {loading ? (
        <div style={{ color: "var(--text-dim)" }}><Loader2 size={14} className="inline animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="forge-panel" style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-dim)" }}>
          <CheckCircle2 size={28} style={{ margin: "0 auto 0.75rem", color: "var(--green)" }} />
          No reviews waiting. You&apos;re all caught up.
        </div>
      ) : (
        <ul className="flex flex-col gap-2 mb-6">
          {rows.map((r) => {
            const events = r.transcript.filter((t) => t.role === "proctor" && t.kind === "event");
            const snapshots = r.transcript.filter((t) => t.role === "proctor" && t.kind === "snapshot");
            return (
              <li key={r.id}>
                <button
                  onClick={() => (activeId === r.id ? setActiveId(null) : open(r))}
                  className="forge-panel"
                  style={{ padding: "0.875rem 1rem", textAlign: "left", width: "100%", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.875rem" }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{r.checkin.user.name ?? r.checkin.user.email}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>{r.checkin.task.title}</p>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
                    submitted {r.completedAt ? new Date(r.completedAt).toLocaleString() : ""}
                  </span>
                  {snapshots.length > 0 && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <Camera size={11} /> {snapshots.length}
                    </span>
                  )}
                  {events.length > 0 && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--yellow)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <AlertTriangle size={11} /> {events.length} flag{events.length === 1 ? "" : "s"}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Inline review panel */}
      {active && (
        <div className="forge-panel" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", marginBottom: "0.25rem" }}>{active.checkin.task.title}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginBottom: "1rem" }}>
            By {active.checkin.user.name ?? active.checkin.user.email}
          </p>

          {/* What they submitted */}
          <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "var(--bg-card)", borderRadius: 8 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "0.375rem" }}>What they built</p>
            <p style={{ fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>{active.checkin.description}</p>
            <SubmissionViewer
              evidenceType={active.checkin.evidenceType}
              evidenceUrl={active.checkin.evidenceUrl}
              evidenceData={active.checkin.evidenceData}
            />
          </div>

          {/* Camera snapshots */}
          {active.transcript.some((t) => t.role === "proctor" && t.kind === "snapshot") && (
            <details style={{ marginBottom: "1rem" }}>
              <summary style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", marginBottom: "0.375rem" }}>
                <Camera size={11} style={{ display: "inline", verticalAlign: "middle" }} /> Camera snapshots during exam
              </summary>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.375rem" }}>
                {active.transcript
                  .filter((t) => t.role === "proctor" && t.kind === "snapshot" && typeof t.content === "string")
                  .map((s, i) => (
                    <img
                      key={i}
                      src={s.content as string}
                      alt={`snapshot ${i}`}
                      style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 6, background: "#000" }}
                    />
                  ))}
              </div>
            </details>
          )}

          {/* Integrity events */}
          {active.transcript.some((t) => t.role === "proctor" && t.kind === "event") && (
            <details style={{ marginBottom: "1rem" }}>
              <summary style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--yellow)", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}>
                <AlertTriangle size={11} style={{ display: "inline", verticalAlign: "middle" }} /> Integrity events
              </summary>
              <ul style={{ marginTop: "0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {active.transcript.filter((t) => t.role === "proctor" && t.kind === "event").map((e, i) => (
                  <li key={i}>{e.timestamp ? new Date(e.timestamp).toLocaleTimeString() + " · " : ""}{JSON.stringify(e.event)}</li>
                ))}
              </ul>
            </details>
          )}

          {/* Q&A pairs */}
          <ol style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
            {active.transcript
              .filter((t) => t.role === "assistant" && t.type === "MENTOR_AUTHORED")
              .map((q, i) => {
                const answer = active.transcript.find((t) => t.role === "user" && t.questionNumber === (q.questionNumber as number));
                const question = (() => { try { return JSON.parse(q.content ?? "{}").question; } catch { return q.content; } })();
                // Match the rubric by transcript position (1-based) -> question.position (0-based).
                const rubricEntry = active.questionBank?.find((r) => r.position === i);
                return (
                  <li key={i} style={{ padding: "0.75rem 0.875rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--accent)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "0.25rem" }}>Q{i + 1}</p>
                    <p style={{ fontWeight: 500, marginBottom: "0.5rem" }}>{question}</p>
                    {/* Mentor's private rubric / ideal answer (only mentors see this). */}
                    {(rubricEntry?.rubric || rubricEntry?.idealAnswer) && (
                      <div
                        style={{
                          marginBottom: "0.5rem",
                          padding: "0.5rem 0.625rem",
                          background: "rgba(212,175,55,0.07)",
                          border: "1px dashed rgba(212,175,55,0.4)",
                          borderRadius: 6,
                        }}
                      >
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--accent)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                          Your rubric / ideal answer (private)
                        </p>
                        {rubricEntry?.rubric && (
                          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                            <strong style={{ color: "var(--text-primary)" }}>Rubric:</strong> {rubricEntry.rubric}
                          </p>
                        )}
                        {rubricEntry?.idealAnswer && (
                          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.5, marginTop: rubricEntry?.rubric ? "0.375rem" : 0 }}>
                            <strong style={{ color: "var(--text-primary)" }}>Ideal:</strong> {rubricEntry.idealAnswer}
                          </p>
                        )}
                      </div>
                    )}
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                      Student answer
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", whiteSpace: "pre-wrap", padding: "0.5rem 0.625rem", background: "var(--bg-panel)", borderRadius: 6, marginBottom: "0.5rem" }}>
                      {answer?.content ?? "(no answer)"}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>Score (0–10)</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={scores[i] ?? 0}
                        onChange={(e) => {
                          const next = scores.slice();
                          next[i] = Math.max(0, Math.min(10, parseInt(e.target.value || "0", 10)));
                          setScores(next);
                        }}
                        style={{ width: 60, padding: "0.25rem 0.5rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}
                      />
                    </div>
                  </li>
                );
              })}
          </ol>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback for the mentee (optional). They see this on the week page + Journal."
            rows={2}
            style={{ width: "100%", padding: "0.5rem 0.75rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: "0.875rem", marginBottom: "1rem", resize: "vertical" }}
          />

          {/* 1-5 rating selector. Saved to Task.mentorRating so the student
              sees it on the Mentor Review section + Journal. */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "var(--text-dim)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              Mentor rating (1–5) <span style={{ color: "var(--text-dim)", textTransform: "none", letterSpacing: 0 }}>— optional, visible to mentee</span>
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const selected = rating === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(selected ? null : n)}
                    aria-label={`Rate ${n} of 5`}
                    style={{
                      flex: 1,
                      padding: "0.5rem 0.5rem",
                      background: selected ? "rgba(212,175,55,0.18)" : "var(--bg-card)",
                      border: selected ? "1px solid var(--accent)" : "1px solid var(--border)",
                      borderRadius: 8,
                      color: selected ? "var(--accent)" : "var(--text-secondary)",
                      fontFamily: "var(--font-headline)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "0.4rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.625rem",
              color: "var(--text-dim)",
              letterSpacing: "0.08em",
            }}>
              <span>1 · surface</span>
              <span>3 · solid</span>
              <span>5 · exceptional</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => submit(true)} disabled={submitting} className="forge-btn forge-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem" }}>
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />} Mark Passed
            </button>
            <button onClick={() => submit(false)} disabled={submitting} className="forge-btn forge-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", color: "var(--red)", borderColor: "rgba(239,68,68,0.3)" }}>
              <XCircle size={13} /> Send Back (Needs Rework)
            </button>
            <button onClick={() => setActiveId(null)} className="forge-btn forge-btn-ghost" style={{ padding: "0.5rem 1rem" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
