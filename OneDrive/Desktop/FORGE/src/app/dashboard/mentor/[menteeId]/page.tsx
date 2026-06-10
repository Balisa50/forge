"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Lock, Loader2 } from "lucide-react";
import MentorVisibilityControls from "@/components/MentorVisibilityControls";
import Dialog, { type DialogConfig } from "@/components/Dialog";
import MentorWeekDetail from "@/components/MentorWeekDetail";
import MenteeRecoveryCard from "@/components/MenteeRecoveryCard";
import MentorCertReleaseCard from "@/components/MentorCertReleaseCard";
import { CURATED_ROADMAPS } from "@/lib/curated-roadmaps-client";
import { type EvidenceData } from "@/lib/submission-types";

interface Checkin {
 id: string;
 description: string;
 evidenceType: string;
 evidenceUrl: string | null;
 videoUrl: string | null;
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
 submissionConfig: unknown;
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
 // ?tool=recovery|visibility, driven from the contextual sidebar. When
 // set, only that tool's panel renders at the top of the page. When null,
 // the page shows the roadmap view normally.
 const searchParams = useSearchParams();
 const activeTool = searchParams.get("tool");

 const [mentee, setMentee] = useState<Mentee | null>(null);
 const [roadmaps, setRoadmaps] = useState<MenteeRoadmap[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [expanded, setExpanded] = useState<string | null>(null);
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
 } finally {
 setPosting(null);
 }
 },
 });
 return;
 }

 const meta: Record<"unlock" | "reopen" | "close", { title: string; message: string; confirmText: string; danger?: boolean }> = {
 unlock: { title: "Unlock without a deadline?", message: "Legacy bypass, gives the mentee access to this week with no closing date. Prefer 'Release with deadline' for normal use.", confirmText: "Unlock anyway" },
 reopen: { title: "Reopen this week for redo?", message: "The mentee will be able to check in on this week again, useful if they need another attempt.", confirmText: "Reopen" },
 close: { title: "Close this week now?", message: "The mentee will lose access to this week until you extend or reopen it.", confirmText: "Close now", danger: true },
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
 } finally {
 setPosting(null);
 }
 },
 });
 };

 /** Mentor picks a roadmap on behalf of the mentee (backfill for mentees
 * who joined before path-scoped invites, or whose invite didn't have one). */
 const [seedingSlug, setSeedingSlug] = useState<string | null>(null);
 const handleSeedRoadmap = (slug: string, title: string) => {
 setDialog({
 kind: "confirm",
 title: `Assign "${title}"?`,
 message: `${mentee?.name ?? "This mentee"} will get the full ${title} curriculum. Every week starts locked, you'll release them one by one.`,
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
 // Success, Dialog closes itself. Any throw above stays visible
 // inline in the dialog instead of being swallowed by the close.
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
 // overflowX:hidden on the root container is the belt to the email-wrap
 // braces, guarantees no descendant can force horizontal scroll on this
 // page on any screen size.
 <div style={{ paddingBottom: "4rem", overflowX: "hidden" }}>
 {/* Back link */}
 <Link
 href="/dashboard/mentor"
 className="inline-flex items-center gap-1.5 text-xs mb-4"
 style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
 >
 <ArrowLeft size={12} /> all mentees
 </Link>

 {/* Mentee header, flex-wrap so the Suspend button drops to its own line
 on mobile instead of clipping off the right edge. min-width:0 on the
 name/email column lets it shrink below content size (otherwise the
 long monospace email forces the row wider than the viewport). */}
 <div className="flex items-start gap-4 mb-6" style={{ flexWrap: "wrap" }}>
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
 <div style={{ flex: 1, minWidth: 0 }}>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", overflowWrap: "anywhere" }}>{mentee.name ?? mentee.email}</h1>
 {/* overflowWrap:anywhere lets the long mentee_xxxxxxx@forge.local
 break mid-string instead of pushing the row off-screen. */}
 <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", overflowWrap: "anywhere", wordBreak: "break-all" }}>{mentee.email}</p>
 <div className="flex flex-wrap gap-4 mt-2" style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
 <span>Tasks {stats.total} · {stats.verified} passed · {stats.failed} failed · {stats.pending} awaiting</span>
 {stats.lastCheckinLabel && (
 <span style={{ color: stats.daysSinceLastCheckin !== null && stats.daysSinceLastCheckin >= 3 ? "var(--yellow)" : "var(--text-secondary)" }}>
 Last check-in <strong style={{ color: stats.daysSinceLastCheckin !== null && stats.daysSinceLastCheckin >= 3 ? "var(--yellow)" : "var(--text-primary)" }}>{stats.lastCheckinLabel}</strong>
 </span>
 )}
 </div>
 </div>
 {/* Suspend only appears on the default Roadmap view, tool drilldowns
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

 {/* Suspension banner, shows when this mentee is currently suspended */}
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
 {suspension.reason ? `, "${suspension.reason}"` : ""}
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

 {/* Appeal, only shows when the mentee sent one */}
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
 This was their one appeal. Reinstate their access above if you accept it, or leave the suspension in place.
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

 {/* Mentor tools, controlled from the contextual sidebar. Only the
 requested tool renders on the page, eliminating the stacked-card
 clutter. Default state (no ?tool) shows nothing here, page goes
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

 {/* Roadmaps, empty state lets the mentor PICK one on their behalf */}
 {roadmaps.length === 0 && (
 <div className="forge-panel" style={{ padding: "1.5rem" }}>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", marginBottom: "0.375rem" }}>
 Assign a roadmap
 </h2>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem", lineHeight: 1.55 }}>
 {mentee.name?.split(" ")[0] ?? "This mentee"} doesn&apos;t have a roadmap yet. Pick one below, every week will start
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

 {/* Roadmap view, hidden when any tool is active so the sidebar drill
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
 <MentorWeekDetail
 task={task}
 menteeId={menteeId}
 menteeName={mentee.name ?? ""}
 busy={posting === task.id}
 onRelease={(mode) => handleRelease(task, mode)}
 onAction={(action) => handleAction(task, action)}
 onChanged={load}
 />
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
