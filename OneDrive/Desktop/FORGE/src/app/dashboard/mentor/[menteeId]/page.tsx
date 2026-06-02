"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MessageSquare, CheckCircle2, AlertTriangle, Lock,
  Clock, ExternalLink, Send, Loader2, Unlock, ShieldCheck, RotateCcw,
  Link2, Plus, Trash2, Pin,
} from "lucide-react";
import MentorVisibilityControls from "@/components/MentorVisibilityControls";
import MentorQuestionBank from "@/components/MentorQuestionBank";
import Dialog, { type DialogConfig } from "@/components/Dialog";
import SubmissionViewer from "@/components/SubmissionViewer";
import MenteeRecoveryCard from "@/components/MenteeRecoveryCard";
import MentorCertReleaseCard from "@/components/MentorCertReleaseCard";
import { CURATED_ROADMAPS } from "@/lib/curated-roadmaps-client";
import { type EvidenceData } from "@/lib/submission-types";

interface Checkin {
  id: string;
  description: string;
  evidenceType: string;
  evidenceUrl: string | null;
  evidenceData: EvidenceData | null;
  status: string;
  attemptNum: number;
  createdAt: string;
}

interface MentorComment {
  id: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  authorRole: "mentor" | "mentee";
  kind: "note" | "message" | "request_unlock" | "action_log";
  mentorId: string;
}

interface MentorGrantedResource {
  id: string;
  title: string;
  url: string;
  note: string | null;
  createdAt: string;
}

interface MenteeTask {
  id: string;
  title: string;
  detail: string;
  why: string | null;
  milestone: string | null;
  resources: string[];
  estimatedHours: number | null;
  status: string;
  verifiedAt: string | null;
  releasedAt: string | null;
  releasedBy: string | null;
  deadline: string | null;
  closedAt: string | null;
  sortOrder: number;
  checkins: Checkin[];
  mentorComments: MentorComment[];
  mentorResources: MentorGrantedResource[];
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
  // ?tool=recovery|visibility — driven from the contextual sidebar. When
  // set, only that tool's panel renders at the top of the page. When null,
  // the page shows the roadmap view normally.
  const searchParams = useSearchParams();
  const activeTool = searchParams.get("tool");

  const [mentee, setMentee] = useState<Mentee | null>(null);
  const [roadmaps, setRoadmaps] = useState<MenteeRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [resDraft, setResDraft] = useState<Record<string, { title: string; url: string; note: string }>>({});
  const [posting, setPosting] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const [suspension, setSuspension] = useState<{ bannedAt: string; reason: string | null; appeal: string | null; appealAt: string | null } | null>(null);

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
      setSuspension(data.suspension ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [menteeId]);

  useEffect(() => {
    load();
  }, [load]);

  // kind "message" → week conversation thread (default). kind "note" → pinned
  // to the mentee's permanent Notes page. Only notes land on /dashboard/notes.
  const handlePost = async (task: MenteeTask, kind: "message" | "note" = "message") => {
    const body = (draft[task.id] || "").trim();
    if (!body) return;
    setPosting(task.id);
    try {
      const res = await fetch("/api/mentor/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, menteeId, body, kind }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      setDraft((d) => ({ ...d, [task.id]: "" }));
      await load();
    } catch (e) {
      setDialog({ kind: "alert", title: "Couldn't post", message: e instanceof Error ? e.message : "Failed to post comment" });
    } finally {
      setPosting(null);
    }
  };

  const handleGrantResource = async (task: MenteeTask) => {
    const r = resDraft[task.id];
    if (!r?.title?.trim() || !r?.url?.trim()) return;
    setPosting(task.id);
    try {
      const res = await fetch("/api/mentor/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, menteeId, title: r.title.trim(), url: r.url.trim(), note: r.note?.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not add resource");
      }
      setResDraft({ ...resDraft, [task.id]: { title: "", url: "", note: "" } });
      await load();
    } catch (e) {
      setDialog({ kind: "alert", title: "Couldn't grant resource", message: e instanceof Error ? e.message : "Failed" });
    } finally {
      setPosting(null);
    }
  };

  const handleDeleteResource = (resourceId: string, taskId: string) => {
    setDialog({
      kind: "confirm",
      title: "Remove this resource?",
      message: "It will disappear from your mentee's view immediately.",
      confirmText: "Remove",
      danger: true,
      onConfirm: async () => {
        setPosting(taskId);
        try {
          await fetch(`/api/mentor/resources?id=${resourceId}`, { method: "DELETE" });
          await load();
        } finally {
          setPosting(null);
        }
      },
    });
  };

  const handleAction = (task: MenteeTask, action: "unlock" | "verify" | "reopen" | "close") => {
    // Verify gets its own dialog with the 1-5 depth rating selector.
    if (action === "verify") {
      setDialog({
        kind: "verify",
        taskTitle: task.title,
        onSubmit: async (depthRating) => {
          setPosting(task.id);
          try {
            const res = await fetch(`/api/mentor/tasks/${task.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "verify", menteeId, depthRating }),
            });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error || "Could not verify");
            }
            await load();
          } catch (e) {
            setDialog({ kind: "alert", title: "Verify failed", message: e instanceof Error ? e.message : "Something went wrong" });
          } finally {
            setPosting(null);
          }
        },
      });
      return;
    }

    const meta: Record<"unlock" | "reopen" | "close", { title: string; message: string; confirmText: string; danger?: boolean }> = {
      unlock:  { title: "Unlock without a deadline?", message: "Legacy bypass — gives the mentee access to this week with no closing date. Prefer 'Release with deadline' for normal use.", confirmText: "Unlock anyway" },
      reopen:  { title: "Reopen this week for redo?", message: "The mentee will be able to check in on this week again — useful if they need another attempt.", confirmText: "Reopen" },
      close:   { title: "Close this week now?",       message: "The mentee will lose access to this week until you extend or reopen it.", confirmText: "Close now", danger: true },
    };
    const m = meta[action];
    setDialog({
      kind: "confirm",
      title: m.title,
      message: m.message,
      confirmText: m.confirmText,
      danger: m.danger,
      onConfirm: async () => {
        setPosting(task.id);
        try {
          const res = await fetch(`/api/mentor/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, menteeId }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Could not ${action}`);
          }
          await load();
        } catch (e) {
          setDialog({ kind: "alert", title: "Action failed", message: e instanceof Error ? e.message : "Something went wrong" });
        } finally {
          setPosting(null);
        }
      },
    });
  };

  /** Release a week with a mentor-set deadline + optional personal note. */
  const handleRelease = (task: MenteeTask, mode: "release" | "extend") => {
    const defaultDate = new Date(Date.now() + 7 * 86_400_000).toISOString().split("T")[0];
    setDialog({
      kind: "release",
      taskTitle: task.title,
      mode,
      defaultDate,
      onSubmit: async (deadlineIso, note) => {
        setPosting(task.id);
        try {
          const res = await fetch(`/api/mentor/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: mode,
              menteeId,
              deadlineAt: deadlineIso,
              note: note || undefined,
            }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Could not ${mode}`);
          }
          await load();
        } catch (e) {
          setDialog({ kind: "alert", title: `Could not ${mode}`, message: e instanceof Error ? e.message : "Something went wrong" });
        } finally {
          setPosting(null);
        }
      },
    });
  };

  /** Mentor picks a roadmap on behalf of the mentee (backfill for mentees
   *  who joined before path-scoped invites, or whose invite didn't have one). */
  const [seedingSlug, setSeedingSlug] = useState<string | null>(null);
  const handleSeedRoadmap = (slug: string, title: string) => {
    setDialog({
      kind: "confirm",
      title: `Assign "${title}"?`,
      message: `${mentee?.name ?? "This mentee"} will get the full ${title} curriculum. Every week starts locked — you'll release them one by one.`,
      confirmText: "Assign roadmap",
      onConfirm: async () => {
        setSeedingSlug(slug);
        try {
          const res = await fetch("/api/mentor/seed-roadmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ menteeId, slug }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Failed (${res.status})`);
          }
          await load();
        } catch (e) {
          setDialog({ kind: "alert", title: "Couldn't assign roadmap", message: e instanceof Error ? e.message : "Something went wrong" });
        } finally {
          setSeedingSlug(null);
        }
      },
    });
  };

  /** Suspend the mentee - locks them out of the whole app. */
  const handleBan = () => {
    setDialog({
      kind: "prompt",
      title: `Suspend ${mentee?.name?.split(" ")[0] ?? "this mentee"}?`,
      message: "They will be locked out of the entire app. On their next login they see a suspension letter with the reason below. Only you can lift it.",
      label: "Reason for suspension (the mentee will read this)",
      placeholder: "You abandoned Week 3 past the deadline and stopped responding. Reach out to me when you're ready to recommit.",
      confirmText: "Suspend mentee",
      danger: true,
      minLength: 3,
      onSubmit: async (reason) => {
        try {
          const res = await fetch("/api/mentor/ban", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ menteeId, action: "ban", reason }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Failed (${res.status})`);
          }
          await load();
        } catch (e) {
          setDialog({ kind: "alert", title: "Could not suspend", message: e instanceof Error ? e.message : "Something went wrong" });
        }
      },
    });
  };

  /** Lift the suspension - the mentee regains access immediately. */
  const handleUnban = () => {
    setDialog({
      kind: "confirm",
      title: `Reinstate ${mentee?.name?.split(" ")[0] ?? "this mentee"}?`,
      message: "They will regain full access to FORGE immediately on their next login. The suspension letter disappears.",
      confirmText: "Reinstate",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/mentor/ban", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ menteeId, action: "unban" }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Failed (${res.status})`);
          }
          await load();
        } catch (e) {
          setDialog({ kind: "alert", title: "Could not reinstate", message: e instanceof Error ? e.message : "Something went wrong" });
        }
      },
    });
  };

  const stats = useMemo(() => {
    let total = 0, verified = 0, failed = 0, pending = 0;
    let mostRecentCheckin: Date | null = null;
    for (const r of roadmaps) {
      for (const t of r.tracks) {
        for (const p of t.phases) {
          for (const task of p.tasks) {
            total++;
            if (task.status === "verified") verified++;
            else if (task.status === "failed") failed++;
            else if (task.status === "pending_verification") pending++;
            for (const c of task.checkins) {
              const d = new Date(c.createdAt);
              if (!mostRecentCheckin || d > mostRecentCheckin) mostRecentCheckin = d;
            }
          }
        }
      }
    }
    let daysSinceLastCheckin: number | null = null;
    let lastCheckinLabel: string | null = null;
    if (mostRecentCheckin) {
      const diffMs = Date.now() - (mostRecentCheckin as Date).getTime();
      daysSinceLastCheckin = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (daysSinceLastCheckin === 0) lastCheckinLabel = "today";
      else if (daysSinceLastCheckin === 1) lastCheckinLabel = "yesterday";
      else lastCheckinLabel = `${daysSinceLastCheckin} days ago`;
    } else {
      lastCheckinLabel = "never";
    }
    return { total, verified, failed, pending, daysSinceLastCheckin, lastCheckinLabel };
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
            <span>Tasks {stats.total} · {stats.verified} passed · {stats.failed} failed · {stats.pending} awaiting</span>
            {stats.lastCheckinLabel && (
              <span style={{ color: stats.daysSinceLastCheckin !== null && stats.daysSinceLastCheckin >= 3 ? "var(--yellow)" : "var(--text-secondary)" }}>
                Last check-in <strong style={{ color: stats.daysSinceLastCheckin !== null && stats.daysSinceLastCheckin >= 3 ? "var(--yellow)" : "var(--text-primary)" }}>{stats.lastCheckinLabel}</strong>
              </span>
            )}
          </div>
        </div>
        {/* Suspend only appears on the default Roadmap view — tool drilldowns
            (Recovery / Visibility / Certificate) hide it so each tool page
            has a single clear concern. */}
        {!suspension && !activeTool && (
          <button
            type="button"
            onClick={handleBan}
            className="forge-btn forge-btn-ghost"
            style={{
              flexShrink: 0,
              padding: "0.5rem 0.875rem",
              fontSize: "0.75rem",
              minHeight: "unset",
              color: "var(--red)",
              borderColor: "rgba(239,68,68,0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <Lock size={13} /> Suspend
          </button>
        )}
      </div>

      {/* Suspension banner — shows when this mentee is currently suspended */}
      {suspension && (
        <div
          className="forge-panel"
          style={{
            padding: "1.25rem",
            marginBottom: "1.5rem",
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.35)",
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Lock size={18} color="var(--red)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: "0.9375rem", color: "var(--red)" }}>
                This mentee is suspended
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.125rem" }}>
                Since {new Date(suspension.bannedAt).toLocaleDateString()}
                {suspension.reason ? ` — "${suspension.reason}"` : ""}
              </div>
            </div>
            <button
              type="button"
              onClick={handleUnban}
              className="forge-btn forge-btn-primary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", minHeight: "unset", flexShrink: 0 }}
            >
              Reinstate access
            </button>
          </div>

          {/* Appeal — only shows when the mentee sent one */}
          {suspension.appeal && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <MessageSquare size={14} color="var(--accent)" />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}>
                  Mentee appeal
                  {suspension.appealAt && (
                    <span style={{ color: "var(--text-dim)", marginLeft: "0.5rem" }}>
                      · {new Date(suspension.appealAt).toLocaleDateString()}
                    </span>
                  )}
                </span>
              </div>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                {suspension.appeal}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.75rem" }}>
                This was their one appeal. Reinstate their access above if you accept it — or leave the suspension in place.
              </p>
            </div>
          )}

          {/* No appeal yet */}
          {!suspension.appeal && (
            <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.75rem" }}>
              The mentee has not submitted an appeal yet.
            </p>
          )}
        </div>
      )}

      {/* Mentor tools — controlled from the contextual sidebar. Only the
          requested tool renders on the page, eliminating the stacked-card
          clutter. Default state (no ?tool) shows nothing here — page goes
          straight to the mentee's roadmap. */}
      {activeTool === "recovery" && (
        <MenteeRecoveryCard menteeId={menteeId} menteeName={mentee.name} />
      )}
      {activeTool === "visibility" && (
        <MentorVisibilityControls menteeId={menteeId} menteeName={mentee.name ?? mentee.email} />
      )}
      {activeTool === "certificate" && roadmaps.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          {roadmaps.map((roadmap) => (
            <div key={roadmap.id} style={{ marginBottom: "0.75rem" }}>
              {roadmaps.length > 1 && (
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  marginBottom: "0.5rem",
                }}>
                  {roadmap.title}
                </p>
              )}
              <MentorCertReleaseCard
                menteeId={menteeId}
                menteeName={mentee.name ?? mentee.email}
                roadmapId={roadmap.id}
              />
            </div>
          ))}
        </div>
      )}

      {/* Roadmaps — empty state lets the mentor PICK one on their behalf */}
      {roadmaps.length === 0 && (
        <div className="forge-panel" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", marginBottom: "0.375rem" }}>
            Assign a roadmap
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem", lineHeight: 1.55 }}>
            {mentee.name?.split(" ")[0] ?? "This mentee"} doesn&apos;t have a roadmap yet. Pick one below — every week will start
            locked and you control when each one is released.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {CURATED_ROADMAPS.map((r) => {
              const Icon = r.Icon;
              const busy = seedingSlug === r.slug;
              const disabled = seedingSlug !== null;
              return (
                <button
                  key={r.slug}
                  type="button"
                  onClick={() => handleSeedRoadmap(r.slug, r.title)}
                  disabled={disabled}
                  style={{
                    textAlign: "left",
                    padding: "0.875rem 1rem",
                    background: "var(--bg-card)",
                    border: `1px solid ${busy ? r.accent : "var(--border)"}`,
                    borderRadius: 10,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled && !busy ? 0.5 : 1,
                    transition: "border-color 0.15s, transform 0.1s",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.375rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: `${r.accent}22`,
                        color: r.accent,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </span>
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                      {r.title}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", lineHeight: 1.45, margin: 0 }}>
                    {r.tagline}
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.08em", marginTop: "0.125rem" }}>
                    {r.weeks} weeks · {r.phases} phases {busy && "· assigning…"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Roadmap view — hidden when any tool is active so the sidebar drill
          is a true full-screen replacement, not a layered panel. */}
      {!activeTool && roadmaps.map((roadmap) => (
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
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                              {task.estimatedHours != null && (
                                <span className="inline-flex items-center gap-1" style={{ flexShrink: 0 }}><Clock size={11} /> ~{task.estimatedHours}h</span>
                              )}
                              {task.milestone && <span style={{ lineHeight: 1.55 }}>{task.milestone}</span>}
                            </div>
                          )}

                          {/* Full week brief — the curated curriculum detail */}
                          {task.detail && (
                            <div style={{ marginTop: "0.875rem", padding: "0.75rem 0.875rem", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.5rem" }}>
                                Week brief
                              </p>
                              <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                {task.detail}
                              </p>
                            </div>
                          )}

                          {/* Curated learning resources from the roadmap (books, videos, articles) */}
                          {task.resources && task.resources.length > 0 && (
                            <div style={{ marginTop: "0.875rem" }}>
                              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <Link2 size={11} /> Curated resources for this week
                              </p>
                              <ul className="flex flex-col gap-1.5">
                                {task.resources.map((raw, idx) => {
                                  // Resource strings can ship as either:
                                  //   "Label - URL"   (regular hyphen, post-clean formatter)
                                  //   "Label — URL"   (em-dash, legacy)
                                  //   plus optional trailing "(note)"
                                  // Match a separator that is space + dash + space + URL, so a
                                  // short label like "5-min" doesn't accidentally split.
                                  const urlMatch = raw.match(/(https?:\/\/[^\s)]+)/);
                                  const url = urlMatch?.[0];
                                  const noteMatch = raw.match(/\(([^)]+)\)\s*$/);
                                  const note = noteMatch?.[1];
                                  // Strip the URL + trailing note from the label.
                                  let label = raw;
                                  if (url) label = label.replace(/\s+[-—–]?\s*https?:\/\/\S+.*$/, "").trim();
                                  if (note) label = label.replace(/\s*\([^)]+\)\s*$/, "").trim();
                                  if (label === raw) {
                                    // Fallback: split on dash separator
                                    label = raw.split(/\s+[—–-]\s+/)[0]?.trim() || raw;
                                  }
                                  return (
                                    <li
                                      key={idx}
                                      style={{
                                        padding: "0.625rem 0.875rem",
                                        borderRadius: 7,
                                        background: "var(--bg-card)",
                                        border: "1px solid var(--border)",
                                        fontSize: "0.8125rem",
                                        overflow: "hidden",
                                      }}
                                    >
                                      {url ? (
                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noreferrer noopener"
                                          style={{ color: "var(--text-primary)", textDecoration: "none", display: "flex", alignItems: "flex-start", gap: "0.5rem", minWidth: 0, overflowWrap: "anywhere", wordBreak: "break-word" }}
                                        >
                                          <ExternalLink size={12} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
                                          <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "0.125rem" }}>
                                            <span style={{ fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.4 }}>{label}</span>
                                            {note && <span style={{ color: "var(--text-dim)", fontSize: "0.75rem", lineHeight: 1.4 }}>{note}</span>}
                                          </span>
                                        </a>
                                      ) : (
                                        <span style={{ color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "0.125rem", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                                          <span style={{ fontWeight: 500 }}>{label}</span>
                                          {note && <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>{note}</span>}
                                        </span>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
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
                                    <SubmissionViewer
                                      evidenceType={c.evidenceType}
                                      evidenceUrl={c.evidenceUrl}
                                      evidenceData={c.evidenceData}
                                    />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p style={{ marginTop: "0.875rem", color: "var(--text-dim)", fontSize: "0.8125rem", fontStyle: "italic" }}>
                              No check-ins yet on this task.
                            </p>
                          )}

                          {/* Mentor-granted resources */}
                          <div style={{ marginTop: "0.875rem" }}>
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.5rem" }}>
                              Extra resources you&apos;ve given them
                            </p>
                            {task.mentorResources.length > 0 && (
                              <ul className="flex flex-col gap-2" style={{ marginBottom: "0.625rem" }}>
                                {task.mentorResources.map((r) => (
                                  <li
                                    key={r.id}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.5rem",
                                      padding: "0.5rem 0.75rem",
                                      borderRadius: 8,
                                      border: "1px solid var(--border)",
                                      background: "var(--bg-card)",
                                    }}
                                  >
                                    <Link2 size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                                    <a href={r.url} target="_blank" rel="noreferrer noopener" style={{ flex: 1, fontSize: "0.875rem", color: "var(--text-primary)", textDecoration: "none" }}>
                                      <span style={{ fontWeight: 500 }}>{r.title}</span>
                                      {r.note && <span style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginLeft: "0.5rem" }}>— {r.note}</span>}
                                    </a>
                                    <button
                                      onClick={() => handleDeleteResource(r.id, task.id)}
                                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0.25rem" }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <div className="responsive-form-row" style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr auto", gap: "0.375rem" }}>
                              <input
                                value={resDraft[task.id]?.title ?? ""}
                                onChange={(e) => setResDraft({ ...resDraft, [task.id]: { ...(resDraft[task.id] ?? { title: "", url: "", note: "" }), title: e.target.value } })}
                                placeholder="Resource title"
                                style={{ padding: "0.4rem 0.625rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem" }}
                              />
                              <input
                                value={resDraft[task.id]?.url ?? ""}
                                onChange={(e) => setResDraft({ ...resDraft, [task.id]: { ...(resDraft[task.id] ?? { title: "", url: "", note: "" }), url: e.target.value } })}
                                placeholder="https://..."
                                style={{ padding: "0.4rem 0.625rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)" }}
                              />
                              <button
                                type="button"
                                onClick={() => handleGrantResource(task)}
                                disabled={!(resDraft[task.id]?.title?.trim() && resDraft[task.id]?.url?.trim()) || posting === task.id}
                                className="forge-btn forge-btn-primary"
                                style={{ padding: "0.4rem 0.75rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.25rem", alignItems: "center" }}
                              >
                                <Plus size={13} /> Grant
                              </button>
                            </div>
                            <input
                              value={resDraft[task.id]?.note ?? ""}
                              onChange={(e) => setResDraft({ ...resDraft, [task.id]: { ...(resDraft[task.id] ?? { title: "", url: "", note: "" }), note: e.target.value } })}
                              placeholder="Why this resource? (optional)"
                              style={{ marginTop: "0.375rem", width: "100%", padding: "0.4rem 0.625rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem" }}
                            />
                          </div>

                          {/* Real messages and the automated activity log are split:
                              the PROFESSOR's daily flags / release events no longer
                              bury the actual you<->mentee conversation. */}
                          {task.mentorComments.length > 0 && (() => {
                            const msgs = task.mentorComments.filter((c) => c.kind !== "action_log");
                            const logs = task.mentorComments.filter((c) => c.kind === "action_log");
                            const renderItem = (cm: (typeof task.mentorComments)[number]) => {
                              const fromMentee = cm.authorRole === "mentee";
                              const isAction = cm.kind === "action_log";
                              const isRequest = cm.kind === "request_unlock";
                              return (
                                <li
                                  key={cm.id}
                                  style={{
                                    padding: "0.625rem 0.75rem",
                                    borderRadius: 8,
                                    background: isAction
                                      ? "rgba(59,130,246,0.06)"
                                      : isRequest
                                        ? "rgba(244,114,182,0.08)"
                                        : fromMentee
                                          ? "var(--bg-card)"
                                          : "rgba(245,158,11,0.07)",
                                    border: isAction
                                      ? "1px solid rgba(59,130,246,0.18)"
                                      : isRequest
                                        ? "1px solid rgba(244,114,182,0.25)"
                                        : fromMentee
                                          ? "1px solid var(--border)"
                                          : "1px solid rgba(245,158,11,0.2)",
                                    fontSize: "0.875rem",
                                    color: "var(--text-primary)",
                                  }}
                                >
                                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: isRequest ? "#f472b6" : isAction ? "#60a5fa" : fromMentee ? "var(--text-dim)" : "var(--accent)", marginBottom: "0.25rem" }}>
                                    {isAction ? "Action log" : isRequest ? "Unlock request" : fromMentee ? `${mentee.name ?? "Mentee"}` : "You"}
                                  </p>
                                  <p style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>{cm.body}</p>
                                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", marginTop: "0.25rem" }}>
                                    {new Date(cm.createdAt).toLocaleString()} {cm.readAt ? "· read" : "· unread"}
                                  </p>
                                </li>
                              );
                            };
                            return (
                              <div style={{ marginTop: "0.875rem" }}>
                                {msgs.length > 0 && (
                                  <>
                                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.5rem" }}>
                                      Conversation
                                    </p>
                                    <ul className="flex flex-col gap-2">{msgs.map(renderItem)}</ul>
                                  </>
                                )}
                                {logs.length > 0 && (
                                  <details style={{ marginTop: msgs.length > 0 ? "0.75rem" : 0 }}>
                                    <summary style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-dim)", padding: "0.25rem 0" }}>
                                      Activity log · {logs.length} automated event{logs.length !== 1 ? "s" : ""}
                                    </summary>
                                    <ul className="flex flex-col gap-2" style={{ marginTop: "0.5rem" }}>{logs.map(renderItem)}</ul>
                                  </details>
                                )}
                              </div>
                            );
                          })()}

                          {/* Mentor's question bank for this task */}
                          <MentorQuestionBank taskId={task.id} menteeId={menteeId} />

                          {/* Release/deadline status chip */}
                          {(task.releasedAt || task.closedAt) && (
                            <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", borderRadius: 6, background: task.closedAt ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)", border: `1px solid ${task.closedAt ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)"}`, fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: task.closedAt ? "var(--red)" : "var(--accent)" }}>
                              {task.closedAt
                                ? <>CLOSED {new Date(task.closedAt).toLocaleDateString()} — mentee locked out until you extend</>
                                : task.deadline
                                  ? <>RELEASED {task.releasedAt && new Date(task.releasedAt).toLocaleDateString()} · deadline {new Date(task.deadline).toLocaleDateString()}</>
                                  : <>RELEASED — no deadline</>}
                            </div>
                          )}

                          {/* Mentor actions (super-powers) */}
                          <div style={{ marginTop: "0.875rem", paddingTop: "0.75rem", borderTop: "1px dashed var(--border)", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {/* Release / extend (primary mentor action) */}
                            {task.status === "locked" && !task.closedAt && (
                              <button
                                onClick={() => handleRelease(task, "release")}
                                disabled={posting === task.id}
                                className="forge-btn forge-btn-primary"
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.4rem 0.875rem", fontSize: "0.8125rem" }}
                              >
                                <Unlock size={13} /> Release with deadline
                              </button>
                            )}
                            {(task.deadline || task.closedAt) && task.status !== "verified" && (
                              <button
                                onClick={() => handleRelease(task, "extend")}
                                disabled={posting === task.id}
                                className="forge-btn forge-btn-ghost"
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.4rem 0.75rem", fontSize: "0.8125rem", color: "var(--accent)", borderColor: "rgba(245,158,11,0.3)" }}
                              >
                                <Clock size={13} /> {task.closedAt ? "Reopen + extend" : "Extend deadline"}
                              </button>
                            )}
                            {(task.status === "available" || task.status === "in_progress") && !task.closedAt && (
                              <button
                                onClick={() => handleAction(task, "close")}
                                disabled={posting === task.id}
                                className="forge-btn forge-btn-ghost"
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.4rem 0.75rem", fontSize: "0.8125rem", color: "var(--red)", borderColor: "rgba(239,68,68,0.3)" }}
                              >
                                <Lock size={13} /> Close now
                              </button>
                            )}
                            {/* Legacy unlock (no deadline) */}
                            {task.status === "locked" && (
                              <button
                                onClick={() => handleAction(task, "unlock")}
                                disabled={posting === task.id}
                                className="forge-btn forge-btn-ghost"
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.4rem 0.75rem", fontSize: "0.75rem", color: "var(--text-dim)", borderColor: "var(--border)" }}
                              >
                                Unlock (no deadline)
                              </button>
                            )}
                            {(task.status === "available" || task.status === "in_progress" || task.status === "pending_verification") && (
                              <button
                                onClick={() => handleAction(task, "verify")}
                                disabled={posting === task.id}
                                className="forge-btn forge-btn-ghost"
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.4rem 0.75rem", fontSize: "0.8125rem", color: "var(--green)", borderColor: "rgba(34,197,94,0.3)" }}
                              >
                                <ShieldCheck size={13} /> Verify directly
                              </button>
                            )}
                            {(task.status === "verified" || task.status === "failed") && (
                              <button
                                onClick={() => handleAction(task, "reopen")}
                                disabled={posting === task.id}
                                className="forge-btn forge-btn-ghost"
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.4rem 0.75rem", fontSize: "0.8125rem", color: "var(--blue)", borderColor: "rgba(59,130,246,0.3)" }}
                              >
                                <RotateCcw size={13} /> Reopen for redo
                              </button>
                            )}
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", marginLeft: "auto", alignSelf: "center" }}>
                              Mentor overrides are logged as notes
                            </span>
                          </div>

                          {/* New comment */}
                          <div className="flex-col-on-mobile" style={{ marginTop: "0.875rem", display: "flex", gap: "0.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                            <textarea
                              value={draft[task.id] ?? ""}
                              onChange={(e) => setDraft({ ...draft, [task.id]: e.target.value })}
                              placeholder="Message about this week's work… (stays in this week's thread)"
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
                              onClick={() => handlePost(task, "message")}
                              disabled={!(draft[task.id] ?? "").trim() || posting === task.id}
                              className="forge-btn forge-btn-primary"
                              style={{ padding: "0.5rem 0.875rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.375rem", alignItems: "center" }}
                            >
                              {posting === task.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                              Send message
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePost(task, "note")}
                              disabled={!(draft[task.id] ?? "").trim() || posting === task.id}
                              className="forge-btn forge-btn-ghost"
                              title="Pin to the mentee's permanent Notes page instead of this week's thread"
                              style={{ padding: "0.5rem 0.875rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.375rem", alignItems: "center" }}
                            >
                              <Pin size={13} /> Pin as note
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

      <Dialog config={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
