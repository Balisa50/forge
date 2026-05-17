"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MessageSquare, CheckCircle2, AlertTriangle, Lock,
  Clock, ExternalLink, Send, Loader2,
} from "lucide-react";

interface Checkin {
  id: string;
  description: string;
  evidenceType: string;
  evidenceUrl: string | null;
  status: string;
  attemptNum: number;
  createdAt: string;
}

interface MentorComment {
  id: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

interface MenteeTask {
  id: string;
  title: string;
  detail: string;
  why: string | null;
  milestone: string | null;
  estimatedHours: number | null;
  status: string;
  verifiedAt: string | null;
  sortOrder: number;
  checkins: Checkin[];
  mentorComments: MentorComment[];
}

interface MenteeRoadmap {
  id: string;
  title: string;
  tracks: {
    id: string;
    title: string;
    color: string;
    phases: {
      id: string;
      title: string;
      tasks: MenteeTask[];
    }[];
  }[];
}

interface Mentee {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  integrityScore: number;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  locked: "var(--text-dim)",
  available: "var(--accent)",
  in_progress: "var(--blue)",
  pending_verification: "var(--yellow)",
  verified: "var(--green)",
  failed: "var(--red)",
};

const STATUS_LABEL: Record<string, string> = {
  locked: "Locked",
  available: "Available",
  in_progress: "In progress",
  pending_verification: "Awaiting review",
  verified: "Passed",
  failed: "Failed",
};

export default function MenteeDrilldownPage() {
  const params = useParams<{ menteeId: string }>();
  const menteeId = params.menteeId;

  const [mentee, setMentee] = useState<Mentee | null>(null);
  const [roadmaps, setRoadmaps] = useState<MenteeRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [posting, setPosting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mentor/mentees/${menteeId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to load (${res.status})`);
      }
      const data = await res.json();
      setMentee(data.mentee);
      setRoadmaps(data.roadmaps);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [menteeId]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePost = async (task: MenteeTask) => {
    const body = (draft[task.id] || "").trim();
    if (!body) return;
    setPosting(task.id);
    try {
      const res = await fetch("/api/mentor/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, menteeId, body }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      setDraft((d) => ({ ...d, [task.id]: "" }));
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to post comment");
    } finally {
      setPosting(null);
    }
  };

  const stats = useMemo(() => {
    let total = 0, verified = 0, failed = 0, pending = 0;
    for (const r of roadmaps) {
      for (const t of r.tracks) {
        for (const p of t.phases) {
          for (const task of p.tasks) {
            total++;
            if (task.status === "verified") verified++;
            else if (task.status === "failed") failed++;
            else if (task.status === "pending_verification") pending++;
          }
        }
      }
    }
    return { total, verified, failed, pending };
  }, [roadmaps]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh", color: "var(--text-dim)" }}>
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (error || !mentee) {
    return (
      <div style={{ padding: "2rem", color: "var(--red)" }}>
        {error ?? "Mentee not found"}
        <div style={{ marginTop: "1rem" }}>
          <Link href="/dashboard/mentor" className="forge-btn forge-btn-ghost">Back to mentees</Link>
        </div>
      </div>
    );
  }

  const initials = (mentee.name ?? mentee.email).slice(0, 2).toUpperCase();

  return (
    <div style={{ paddingBottom: "4rem" }}>
      {/* Back link */}
      <Link
        href="/dashboard/mentor"
        className="inline-flex items-center gap-1.5 text-xs mb-4"
        style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
      >
        <ArrowLeft size={12} /> all mentees
      </Link>

      {/* Mentee header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          style={{
            width: 56, height: 56, borderRadius: 12,
            background: "var(--bg-panel)", border: "1px solid var(--border)",
            display: "grid", placeItems: "center", flexShrink: 0,
            fontFamily: "var(--font-headline)", fontSize: "1.25rem",
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem" }}>{mentee.name ?? mentee.email}</h1>
          <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)" }}>{mentee.email}</p>
          <div className="flex flex-wrap gap-4 mt-2" style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            <span>Integrity score <strong style={{ color: "var(--text-primary)" }}>{mentee.integrityScore}</strong></span>
            <span>Tasks {stats.total} · {stats.verified} passed · {stats.failed} failed · {stats.pending} awaiting</span>
          </div>
        </div>
      </div>

      {/* Roadmaps */}
      {roadmaps.length === 0 && (
        <div className="forge-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--text-dim)" }}>
          This mentee hasn&apos;t picked a roadmap yet.
        </div>
      )}

      {roadmaps.map((roadmap) => (
        <div key={roadmap.id} style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", marginBottom: "1rem" }}>{roadmap.title}</h2>

          {roadmap.tracks.flatMap((t) => t.phases).map((phase) => (
            <div key={phase.id} style={{ marginBottom: "1.25rem" }}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  marginBottom: "0.5rem",
                }}
              >
                {phase.title}
              </p>
              <div className="flex flex-col gap-2">
                {phase.tasks.map((task) => {
                  const isOpen = expanded === task.id;
                  const color = STATUS_COLOR[task.status] ?? "var(--text-dim)";
                  return (
                    <div
                      key={task.id}
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--bg-panel)",
                        borderRadius: 10,
                      }}
                    >
                      {/* Task row */}
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : task.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.875rem 1rem",
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span
                          style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: color, flexShrink: 0,
                          }}
                        />
                        <span style={{ flex: 1, color: "var(--text-primary)", fontWeight: 500 }}>{task.title}</span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.6875rem",
                            color, textTransform: "uppercase", letterSpacing: "0.1em",
                          }}
                        >
                          {STATUS_LABEL[task.status] ?? task.status}
                        </span>
                        {task.mentorComments.length > 0 && (
                          <span
                            className="inline-flex items-center gap-1"
                            style={{
                              fontSize: "0.6875rem",
                              fontFamily: "var(--font-mono)",
                              padding: "0.125rem 0.5rem",
                              background: "rgba(245,158,11,0.15)",
                              color: "var(--accent)",
                              borderRadius: 10,
                            }}
                          >
                            <MessageSquare size={11} />
                            {task.mentorComments.length}
                          </span>
                        )}
                      </button>

                      {/* Expanded detail */}
                      {isOpen && (
                        <div style={{ padding: "0 1rem 1rem 1rem", borderTop: "1px solid var(--border)" }}>
                          {/* Why / milestone / hours */}
                          {task.why && (
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.75rem" }}>
                              <em>{task.why}</em>
                            </p>
                          )}
                          {(task.milestone || task.estimatedHours) && (
                            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                              {task.estimatedHours != null && (
                                <span className="inline-flex items-center gap-1"><Clock size={11} /> ~{task.estimatedHours}h</span>
                              )}
                              {task.milestone && <span>{task.milestone.slice(0, 120)}{task.milestone.length > 120 ? "…" : ""}</span>}
                            </div>
                          )}

                          {/* Check-ins */}
                          {task.checkins.length > 0 ? (
                            <div style={{ marginTop: "0.875rem" }}>
                              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.5rem" }}>
                                Recent check-ins
                              </p>
                              <ul className="flex flex-col gap-2">
                                {task.checkins.map((c) => (
                                  <li
                                    key={c.id}
                                    style={{
                                      padding: "0.625rem 0.75rem",
                                      borderRadius: 8,
                                      background: "var(--bg-card)",
                                      border: "1px solid var(--border)",
                                      fontSize: "0.8125rem",
                                    }}
                                  >
                                    <div className="flex items-center gap-2" style={{ marginBottom: "0.25rem" }}>
                                      {c.status === "passed" ? (
                                        <CheckCircle2 size={13} style={{ color: "var(--green)" }} />
                                      ) : c.status === "failed" ? (
                                        <AlertTriangle size={13} style={{ color: "var(--red)" }} />
                                      ) : (
                                        <Lock size={13} style={{ color: "var(--text-dim)" }} />
                                      )}
                                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
                                        Attempt {c.attemptNum} · {new Date(c.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p style={{ color: "var(--text-primary)" }}>{c.description}</p>
                                    {c.evidenceUrl && (
                                      <a href={c.evidenceUrl} target="_blank" rel="noreferrer noopener"
                                         className="inline-flex items-center gap-1 mt-1"
                                         style={{ color: "var(--accent)", fontSize: "0.75rem" }}>
                                        <ExternalLink size={11} /> evidence
                                      </a>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p style={{ marginTop: "0.875rem", color: "var(--text-dim)", fontSize: "0.8125rem", fontStyle: "italic" }}>
                              No check-ins yet on this task.
                            </p>
                          )}

                          {/* Existing comments */}
                          {task.mentorComments.length > 0 && (
                            <div style={{ marginTop: "0.875rem" }}>
                              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.5rem" }}>
                                Your notes
                              </p>
                              <ul className="flex flex-col gap-2">
                                {task.mentorComments.map((cm) => (
                                  <li
                                    key={cm.id}
                                    style={{
                                      padding: "0.625rem 0.75rem",
                                      borderRadius: 8,
                                      background: "rgba(245,158,11,0.07)",
                                      border: "1px solid rgba(245,158,11,0.2)",
                                      fontSize: "0.875rem",
                                      color: "var(--text-primary)",
                                    }}
                                  >
                                    <p>{cm.body}</p>
                                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", marginTop: "0.25rem" }}>
                                      {new Date(cm.createdAt).toLocaleString()} {cm.readAt ? "· read" : "· unread"}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* New comment */}
                          <div style={{ marginTop: "0.875rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                            <textarea
                              value={draft[task.id] ?? ""}
                              onChange={(e) => setDraft({ ...draft, [task.id]: e.target.value })}
                              placeholder="Leave a note for this week's work…"
                              rows={2}
                              style={{
                                flex: 1,
                                padding: "0.5rem 0.75rem",
                                background: "var(--bg-card)",
                                border: "1px solid var(--border)",
                                borderRadius: 8,
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-body)",
                                fontSize: "0.875rem",
                                resize: "vertical",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handlePost(task)}
                              disabled={!(draft[task.id] ?? "").trim() || posting === task.id}
                              className="forge-btn forge-btn-primary"
                              style={{ padding: "0.5rem 0.875rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.375rem", alignItems: "center" }}
                            >
                              {posting === task.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                              Send
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
