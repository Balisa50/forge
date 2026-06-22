"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
 CheckCircle2, Play, FileText, PenLine, Circle, Lock, Target, Code2, HelpCircle,
 ExternalLink, ChevronDown, ArrowLeft, ArrowRight, Sparkles, BookOpen,
} from "lucide-react";
import type { RoadmapWeek } from "@/lib/roadmaps";
import ResourceViewer from "@/components/ResourceViewer";
import ConceptPrimer from "@/components/ConceptPrimer";
import ConceptWidget from "@/components/ConceptWidget";
import VideoEmbed from "@/components/VideoEmbed";
import SwipeCards from "@/components/SwipeCards";
import ConceptCheck from "@/components/ConceptCheck";
import WeekAtAGlance from "@/components/WeekAtAGlance";
import ForgeMarkdown from "@/components/ForgeMarkdown";
import MentorReviewSection from "@/components/MentorReviewSection";

/**
 * Single linear week flow, no tabs, no repetition.
 *
 * ┌─ Day 1 ──── OPEN (the only one you can act on right now)
 * ├─ Day 2 ──── 🔒 collapsed until Day 1 is 100% done
 * ├─ Day 3 ──── 🔒
 * └─ Day 7 ──── 🔒
 * ╰─ When every day is done → "Ship it" section unlocks with project + exercises
 *
 * Past days collapse with ✓, future days collapse with 🔒. The current day, * the first day that isn't 100%, is the only one expanded by default. Users
 * can manually expand a past day to revisit it.
 *
 * Videos that are YouTube SEARCH urls (which YouTube refuses to iframe) open
 * in a new tab. Real watch-URLs embed inline via ResourceViewer.
 */

/**
 * Iframe embedding is unreliable in 2026: YouTube blocks search URLs, gov
 * sites set X-Frame-Options: DENY, news sites do the same, even Stack
 * Overflow blocks embeds. Rather than guess which ones work, we always
 * open external links in a new tab. Zero embed errors, ever.
 */
function shouldOpenInNewTab(_url: string): boolean {
 return true;
}

type ActiveTab = "content" | "submission" | "mentorReview";

interface WeekNeighbour {
 number: number;
 title: string;
}

/** Server-rendered summary of the student's latest submission for this
 * (user, task), passed in so the Submission tab can show "Resubmit"
 * instead of "Submit" and preview what was sent last time. */
export interface SubmissionSummary {
 status: string;
 attemptNum: number;
 evidenceType: string;
 evidenceUrl: string | null;
 submittedAt: string;
 reviewed: boolean;
 passed: boolean | null;
 feedback: string | null;
}

export default function WeekPageTabs({
 week,
 slug,
 taskId,
 prev = null,
 next = null,
 submission = null,
 hasMentor = false,
}: {
 week: RoadmapWeek;
 slug: string;
 taskId?: string | null;
 prev?: WeekNeighbour | null;
 next?: WeekNeighbour | null;
 submission?: SubmissionSummary | null;
 /** True when the viewer has an active mentor link. Solo learners get a
 * trimmed tab set (Content + Submission only) and a self-verify
 * Mark Complete button in place of the mentor-review flow. */
 hasMentor?: boolean;
}) {
 const hasDays = !!week.days && week.days.length > 0;
 const [viewer, setViewer] = useState<{ url: string; label: string } | null>(null);
 // Active tab, defaults to "content" so existing learners see the day stream
 // exactly as before. The tab strip only renders when taskId is set.
 const [activeTab, setActiveTab] = useState<ActiveTab>("content");

 const storageKey = `forge:progress:${slug}:w${week.number}`;
 const [done, setDone] = useState<Record<string, boolean>>({});

 // Hydrate from server. Falls back to localStorage if briefly offline.
 // Any local keys the server doesn't yet have are pushed up (one-time
 // migration from the previous localStorage-only world).
 useEffect(() => {
 if (typeof window === "undefined") return;
 let cancelled = false;
 (async () => {
 let local: Record<string, boolean> = {};
 try { local = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}"); } catch { /* */ }
 try {
 const res = await fetch(`/api/learn/progress?slug=${encodeURIComponent(slug)}&week=${week.number}`);
 if (res.ok) {
 const data = await res.json();
 const server: Record<string, boolean> = {};
 for (const k of (data.items ?? []) as string[]) server[k] = true;
 const localOnly = Object.keys(local).filter((k) => local[k] && !server[k]);
 if (localOnly.length > 0) {
 const sync: Record<string, boolean> = {};
 for (const k of localOnly) { sync[k] = true; server[k] = true; }
 void fetch("/api/learn/progress", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ slug, week: week.number, items: sync }),
 });
 }
 if (!cancelled) {
 setDone(server);
 window.localStorage.setItem(storageKey, JSON.stringify(server));
 }
 return;
 }
 } catch { /* offline, fall back to local */ }
 if (!cancelled) setDone(local);
 })();
 return () => { cancelled = true; };
 }, [storageKey, slug, week.number]);

 const syncToServer = (items: Record<string, boolean>) => {
 void fetch("/api/learn/progress", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ slug, week: week.number, items }),
 });
 };

 const persist = (next: Record<string, boolean>, changed: Record<string, boolean>) => {
 setDone(next);
 if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(next));
 if (Object.keys(changed).length > 0) syncToServer(changed);
 };
 const toggle = (key: string) => {
 const newVal = !done[key];
 persist({ ...done, [key]: newVal }, { [key]: newVal });
 };

 // Mark every item on a day done (or undo it). Used by the big primary button
 // at the bottom of the current day so the learner doesn't have to click each
 // circle individually.
 const markDay = (dayNumber: number, allDoneTarget: boolean) => {
 if (!week.days) return;
 const d = week.days.find((x) => x.number === dayNumber);
 if (!d) return;
 const next = { ...done };
 const changed: Record<string, boolean> = {};
 d.items.forEach((_, i) => {
 const k = `d${dayNumber}-i${i}`;
 next[k] = allDoneTarget;
 changed[k] = allDoneTarget;
 });
 persist(next, changed);
 };

 // Toast for clicking a locked day. Self-clearing after 2.4s.
 const [lockedToast, setLockedToast] = useState<string | null>(null);
 useEffect(() => {
 if (!lockedToast) return;
 const t = setTimeout(() => setLockedToast(null), 2400);
 return () => clearTimeout(t);
 }, [lockedToast]);

 // Brief "Day N done, Day N+1 unlocked" celebration. Tracks the highest day
 // index we've ever seen complete so we only fire on the rising edge.
 const [justUnlockedDay, setJustUnlockedDay] = useState<number | null>(null);
 const [maxDoneIdx, setMaxDoneIdx] = useState<number>(-1);

 // Day completion %s
 const dayPct = useMemo(() => {
 if (!week.days) return [] as number[];
 return week.days.map((d) =>
 d.items.length === 0 ? 100 :
 Math.round((d.items.filter((_, i) => done[`d${d.number}-i${i}`]).length / d.items.length) * 100)
 );
 }, [week.days, done]);

 // Find the "current" day = first day < 100%. Everything before that is done,
 // everything after is locked.
 const currentDayIdx = useMemo(() => {
 const idx = dayPct.findIndex((p) => p < 100);
 return idx === -1 ? dayPct.length : idx; // dayPct.length = all done
 }, [dayPct]);

 // Fire celebration toast when a new day gets completed (current advances).
 // NOTE: only set state here, do NOT start the dismiss timer in this effect.
 // setMaxDoneIdx changes a dependency, so React would run this effect's
 // cleanup (clearing the timer) on the very next render, leaving the toast
 // stuck on screen forever. The auto-dismiss lives in its own effect below.
 useEffect(() => {
 const newlyDone = currentDayIdx - 1; // last index that just hit 100%
 if (newlyDone >= 0 && newlyDone > maxDoneIdx) {
 setMaxDoneIdx(newlyDone);
 // Only celebrate if we've actually loaded progress (avoid first-load fire).
 if (Object.keys(done).length > 0) {
 setJustUnlockedDay(newlyDone + 1); // 1-based day number
 }
 }
 }, [currentDayIdx, maxDoneIdx, done]);

 // Auto-dismiss the celebration toast. Keyed only on justUnlockedDay so the
 // timer survives unrelated re-renders (mirrors the lockedToast pattern).
 useEffect(() => {
 if (justUnlockedDay === null) return;
 const t = setTimeout(() => setJustUnlockedDay(null), 3200);
 return () => clearTimeout(t);
 }, [justUnlockedDay]);

 // Allow the user to manually expand a completed day to revisit it.
 const [manuallyOpen, setManuallyOpen] = useState<Record<number, boolean>>({});
 const isOpen = (idx: number) => idx === currentDayIdx || manuallyOpen[idx];

 // Open video/resource. YouTube always goes to a new tab, its iframe is
 // unreliable. Everything else uses the in-app viewer.
 const openItem = (url: string, label: string) => {
 if (shouldOpenInNewTab(url)) {
 window.open(url, "_blank", "noopener,noreferrer");
 return;
 }
 setViewer({ url, label });
 };

 const allDone = dayPct.length > 0 && dayPct.every((p) => p === 100);

 // ─── Fallback when no days[] exist yet (weeks 2+) ──────────────────────
 if (!hasDays || !week.days) {
 const fbPrimer = week.concept_primer
 || (week.context && week.context.trim().length >= 80 ? week.context : null);
 return (
 <div className="flex flex-col gap-6">
 {fbPrimer && <ConceptPrimer primer={fbPrimer} imageUrl={week.concept_image_url} />}
 {!fbPrimer && week.context && <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.65 }}>{week.context}</p>}
 <ShipItSection week={week} />
 {viewer && <ResourceViewer url={viewer.url} label={viewer.label} onClose={() => setViewer(null)} />}
 </div>
 );
 }

 // Concept primer fallback, every week with a substantial `context` paragraph
 // automatically gets the new visual primer treatment, even if no hand-authored
 // `concept_primer` exists in the JSON. This way the new aesthetic ships across
 // all 240 weeks of all 10 paths immediately, without 240 stub backfills.
 //
 // Authored primer takes precedence (mentors can override the fallback by
 // writing `concept_primer` in the week JSON). Sparse weeks (< 80 chars of
 // context) skip the card and render inline.
 const effectivePrimer = week.concept_primer
 || (week.context && week.context.trim().length >= 80 ? week.context : null);
 const showInlineContext = !effectivePrimer && week.context;

 return (
 <div className="flex flex-col gap-3">
 {/* Three-tab strip, Content / Submission / Mentor Review. Only renders
 when a taskId is in scope (i.e. the user is enrolled in this week).
 The 'mentorReview' tab is hidden for users with no mentor questions
 via state below; submission always goes to /dashboard/checkin. */}
 {taskId && (
 <div
 role="tablist"
 aria-label="Week view"
 style={{
 display: "flex",
 gap: "0.25rem",
 borderBottom: "1px solid var(--border)",
 marginBottom: "0.25rem",
 }}
 >
 {((hasMentor
 ? (["content", "submission", "mentorReview"] as const)
 : (["content", "submission"] as const))
 ).map((t) => {
 const isActive = activeTab === t;
 const label = t === "content" ? "Content" : t === "submission" ? "Submission" : "Mentor Review";
 return (
 <button
 key={t}
 role="tab"
 aria-selected={isActive}
 onClick={() => setActiveTab(t)}
 style={{
 background: "transparent",
 border: "none",
 borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
 color: isActive ? "var(--accent)" : "var(--text-secondary)",
 padding: "0.625rem 1rem",
 fontFamily: "var(--font-mono)",
 fontSize: "0.75rem",
 letterSpacing: "0.16em",
 textTransform: "uppercase",
 cursor: "pointer",
 fontWeight: isActive ? 700 : 500,
 marginBottom: -1,
 }}
 >
 {label}
 </button>
 );
 })}
 </div>
 )}

 {/* Visual-first concept primer, only on the Content tab. */}
 {activeTab === "content" && effectivePrimer && (
 <ConceptPrimer primer={effectivePrimer} imageUrl={week.concept_image_url} />
 )}

 {/* Optional MCQ warm-up (concept_check) - Content tab only. */}
 {activeTab === "content" && week.concept_check && week.concept_check.length > 0 && (
  <ConceptCheck questions={week.concept_check} storageKey={`forge:cc:${slug}:w${week.number}`} />
 )}

 {/* Auto-generated "this week at a glance" overview (Content tab; renders from the week's own days). */}
 {activeTab === "content" && <WeekAtAGlance week={week} />}

 {/* Fallback inline intro for sparse-context weeks, Content tab only. */}
 {activeTab === "content" && showInlineContext && (
 <div style={{ marginBottom: "0.5rem" }}>
 <ForgeMarkdown>{week.context}</ForgeMarkdown>
 </div>
 )}

 {/* Submission tab, branches on hasMentor.
 - hasMentor=true: full submit-and-wait-for-mentor-review flow.
 - hasMentor=false (solo): a self-verify Mark Complete widget. No
 mentor talk in copy, no "your mentor reviewed" affordances. */}
 {activeTab === "submission" && !hasMentor && taskId && (
 <SoloCompletePanel taskId={taskId} alreadyComplete={submission?.status === "passed" && !!submission?.reviewed === false && !!submission} />
 )}

 {activeTab === "submission" && hasMentor && (() => {
 const hasSubmission = !!submission;
 // After a reopen the server sets checkin.status="failed" with the
 // interrogation un-reviewed. That's the "needs revision" state, // the student MUST resubmit, and we surface that copy explicitly.
 const reopenedForRevision =
 !!submission && !submission.reviewed && submission.status === "failed";
 const awaitingReview =
 !!submission && !submission.reviewed && submission.status !== "failed";
 const buttonLabel = hasSubmission
 ? reopenedForRevision || (submission!.reviewed && submission!.passed === false)
 ? "Resubmit your work"
 : "Update submission"
 : "Submit your work for this week";
 return (
 <div
 className="forge-panel"
 style={{
 padding: "1.25rem",
 border: reopenedForRevision
 ? "1px solid rgba(239,68,68,0.45)"
 : "1px solid rgba(212,175,55,0.4)",
 background: reopenedForRevision ? "rgba(239,68,68,0.04)" : undefined,
 overflow: "hidden",
 maxWidth: "100%",
 boxSizing: "border-box",
 }}
 >
 <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", marginBottom: "0.5rem" }}>
 Submit your work for this week
 </h3>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.55, marginBottom: "1rem" }}>
 {reopenedForRevision
 ? "Your mentor reopened this week and asked for revisions. Update your work and resubmit, your previous submission is shown below for reference."
 : awaitingReview
 ? "Your work is in your mentor's queue. You can update your submission while it's still awaiting review."
 : hasSubmission && submission!.passed
 ? "You already passed this week. You can still update your submission if you want to add to the record."
 : "Upload your proof of work, a URL, a GitHub repo, or a file. Your mentor reviews it alongside any questions they've set, then marks it passed."}
 </p>

 {/* Previous submission preview, only when one exists. Shows the
 evidence type + URL + when it was sent + attempt count. */}
 {hasSubmission && (
 <div
 style={{
 marginBottom: "1rem",
 padding: "0.75rem 0.875rem",
 background: "var(--bg-card)",
 border: "1px solid var(--border)",
 borderRadius: 8,
 fontSize: "0.875rem",
 color: "var(--text-secondary)",
 wordBreak: "break-word",
 }}
 >
 <div style={{
 fontFamily: "var(--font-mono)",
 fontSize: "0.625rem",
 letterSpacing: "0.16em",
 textTransform: "uppercase",
 color: "var(--text-dim)",
 marginBottom: "0.375rem",
 }}>
 Your previous submission · attempt {submission!.attemptNum}
 </div>
 <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", alignItems: "baseline" }}>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
 {new Date(submission!.submittedAt).toLocaleString()}
 </span>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--accent)" }}>
 {submission!.evidenceType}
 </span>
 </div>
 {submission!.evidenceUrl && (
 <a
 href={submission!.evidenceUrl}
 target="_blank"
 rel="noopener noreferrer"
 style={{
 display: "inline-block",
 marginTop: "0.5rem",
 color: "var(--blue)",
 fontSize: "0.875rem",
 wordBreak: "break-all",
 }}
 >
 {submission!.evidenceUrl}
 </a>
 )}
 {submission!.feedback && (
 <p style={{
 marginTop: "0.5rem",
 paddingTop: "0.5rem",
 borderTop: "1px solid var(--border)",
 fontSize: "0.8125rem",
 fontStyle: "italic",
 color: submission!.passed === false ? "var(--red)" : "var(--text-dim)",
 }}>
 Mentor note: &ldquo;{submission!.feedback}&rdquo;
 </p>
 )}
 </div>
 )}

 <a
 href="/dashboard/checkin"
 className="forge-btn forge-btn-primary"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.4rem",
 padding: "0.625rem 1.25rem",
 maxWidth: "100%",
 }}
 >
 {buttonLabel}
 </a>
 </div>
 );
 })()}

 {/* Mentor Review tab, the questions/answers/verdict panel. */}
 {activeTab === "mentorReview" && taskId && <MentorReviewSection taskId={taskId} />}

 {/* Day stream, Content tab only */}
 {activeTab === "content" && week.days.map((d, idx) => {
 const pct = dayPct[idx];
 const isDone = pct === 100;
 const isLocked = idx > currentDayIdx;
 const isCurrent = idx === currentDayIdx;
 const open = isOpen(idx);

 return (
 <article
 key={d.number}
 className="forge-panel"
 style={{
 padding: 0,
 border: isCurrent ? "1px solid var(--accent)" : "1px solid var(--border)",
 boxShadow: isCurrent ? "0 0 0 1px var(--accent), 0 6px 24px rgba(245,158,11,0.08)" : "none",
 overflow: "hidden",
 }}
 >
 <button
 onClick={() => {
 if (isLocked) {
 setLockedToast(`Day ${d.number} unlocks when you finish Day ${d.number - 1}`);
 return;
 }
 if (isCurrent) return; // current day can't be collapsed
 setManuallyOpen((m) => ({ ...m, [idx]: !m[idx] }));
 }}
 style={{
 width: "100%",
 display: "flex",
 alignItems: "center",
 gap: "0.875rem",
 padding: "1rem 1.125rem",
 background: "none",
 border: "none",
 cursor: isLocked ? "help" : isCurrent ? "default" : "pointer",
 textAlign: "left",
 color: "var(--text-primary)",
 }}
 >
 <span
 style={{
 width: 32, height: 32, borderRadius: 8, flexShrink: 0,
 background: isDone ? "rgba(34,197,94,0.18)" : isLocked ? "var(--bg-card)" : "rgba(245,158,11,0.15)",
 color: isDone ? "var(--green)" : isLocked ? "var(--text-dim)" : "var(--accent)",
 display: "grid", placeItems: "center",
 fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 600,
 }}
 >
 {isDone ? <CheckCircle2 size={17} /> : isLocked ? <Lock size={13} /> : d.number}
 </span>

 <div style={{ flex: 1, minWidth: 0 }}>
 <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: isLocked ? "var(--text-dim)" : "var(--text-primary)", lineHeight: 1.3 }}>
 Day {d.number}, {d.title.replace(/^Day\s*\d+\s*[-,:]\s*/i, "")}
 </p>
 {isLocked && (
 <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginTop: "0.25rem", fontFamily: "var(--font-mono)" }}>
 Finish Day {d.number - 1} to unlock
 </p>
 )}
 {!isLocked && (
 <>
 {/* Per-day progress bar, visible at all times for active/done days */}
 <div style={{
 display: "flex",
 alignItems: "center",
 gap: "0.5rem",
 marginTop: "0.4rem",
 }}>
 <div style={{
 flex: 1,
 maxWidth: 220,
 height: 4,
 borderRadius: 2,
 background: "var(--bg-card)",
 overflow: "hidden",
 }}>
 <div style={{
 width: `${pct}%`,
 height: "100%",
 background: isDone
 ? "linear-gradient(90deg, #22c55e, #16a34a)"
 : isCurrent
 ? "linear-gradient(90deg, var(--accent), #f0c75c)"
 : "var(--accent)",
 transition: "width 0.45s cubic-bezier(.16,1,.3,1)",
 borderRadius: 2,
 }} />
 </div>
 <span style={{
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 color: isDone ? "var(--green)" : isCurrent ? "var(--accent)" : "var(--text-dim)",
 letterSpacing: "0.06em",
 fontWeight: 600,
 whiteSpace: "nowrap",
 }}>
 {d.items.filter((_, i) => done[`d${d.number}-i${i}`]).length}/{d.items.length}
 {isDone && (
 <span style={{
 marginLeft: 6,
 padding: "1px 6px",
 borderRadius: 999,
 background: "rgba(34,197,94,0.12)",
 border: "1px solid rgba(34,197,94,0.3)",
 fontSize: "0.5625rem",
 letterSpacing: "0.18em",
 textTransform: "uppercase",
 }}>
 Sealed
 </span>
 )}
 {isCurrent && !isDone && (
 <span style={{
 marginLeft: 6,
 padding: "1px 6px",
 borderRadius: 999,
 background: "rgba(245,158,11,0.1)",
 border: "1px solid rgba(245,158,11,0.3)",
 fontSize: "0.5625rem",
 letterSpacing: "0.18em",
 textTransform: "uppercase",
 }}>
 Today
 </span>
 )}
 </span>
 </div>
 </>
 )}
 </div>

 {!isLocked && !isCurrent && (
 <ChevronDown size={16} style={{ color: "var(--text-dim)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
 )}
 </button>

 {open && !isLocked && (
 <div style={{ padding: "0 1.125rem 1.125rem 1.125rem", borderTop: "1px solid var(--border)" }}>
 {d.summary && (
 <div style={{ padding: "0.875rem 0 0.25rem" }}>
 <ForgeMarkdown>{d.summary}</ForgeMarkdown>
 </div>
 )}

 <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: d.summary ? 0 : "0.875rem" }}>
 {d.items.map((item, i) => {
 const key = `d${d.number}-i${i}`;
 const checked = !!done[key];
 const Icon = item.kind === "video" ? Play : item.kind === "reading" ? FileText : item.kind === "lesson" ? BookOpen : item.kind === "exercise" ? Code2 : item.kind === "widget" ? Sparkles : item.kind === "swipe" ? HelpCircle : PenLine;
 const accent = item.kind === "video" ? "#fb7185" : item.kind === "reading" ? "#60a5fa" : item.kind === "lesson" ? "#60a5fa" : item.kind === "exercise" ? "#34d399" : item.kind === "widget" ? "#D4AF37" : item.kind === "swipe" ? "#D4AF37" : "#c084fc";
 const kindLabel = item.kind === "video" ? "Watch" : item.kind === "reading" ? "Read" : item.kind === "lesson" ? "Learn" : item.kind === "exercise" ? "Build" : item.kind === "widget" ? "Explore" : item.kind === "swipe" ? "Quick check" : "Reflect";
 const clickable = !!item.url;

 // Rich content (lesson body, video embed, swipe deck, widget,
 // open button) renders FULL-WIDTH below the header instead of
 // being squeezed into the column right of the check + icon.
 // The old single-flex-row layout cost ~66 px of left space
 // (check 20 + icon 26 + two 10 px gaps), which on a 375 px
 // phone left code blocks unreadably narrow.
 const hasRichBody =
 !!item.body ||
 (item.kind === "widget" && !!item.widget) ||
 (item.kind === "swipe" && !!item.cards && item.cards.length > 0) ||
 (clickable && item.kind === "video") ||
 (clickable && item.kind !== "video");
 return (
 <li key={i}
 style={{
 background: checked ? "rgba(34,197,94,0.06)" : "var(--bg-card)",
 border: checked ? "1px solid rgba(34,197,94,0.22)" : "1px solid var(--border)",
 borderRadius: 8,
 padding: "0.75rem 0.875rem",
 transition: "background 0.3s, border-color 0.3s",
 }}
 >
 {/* Header row, check toggle + kind/icon badge + kind label/title.
 Stays compact; never grows. Title wraps within its column. */}
 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
 <button
 onClick={() => toggle(key)}
 style={{
 background: "none",
 border: "none",
 padding: 0,
 cursor: "pointer",
 flexShrink: 0,
 marginTop: 0,
 position: "relative",
 width: 20, height: 20,
 }}
 aria-label={checked ? "Mark not done" : "Mark done"}
 >
 <span style={{
 position: "absolute",
 inset: 0,
 display: "grid",
 placeItems: "center",
 transform: checked ? "scale(1)" : "scale(0)",
 opacity: checked ? 1 : 0,
 transition: "transform 0.32s cubic-bezier(.22,1.4,.36,1), opacity 0.2s",
 }}>
 <CheckCircle2 size={20} style={{ color: "var(--green)" }} />
 </span>
 <span style={{
 position: "absolute",
 inset: 0,
 display: "grid",
 placeItems: "center",
 transform: checked ? "scale(0)" : "scale(1)",
 opacity: checked ? 0 : 1,
 transition: "transform 0.2s, opacity 0.15s",
 }}>
 <Circle size={20} style={{ color: "var(--text-dim)" }} />
 </span>
 </button>

 <span style={{ width: 26, height: 26, borderRadius: 6, background: `${accent}1f`, color: accent, display: "grid", placeItems: "center", flexShrink: 0 }}>
 <Icon size={13} />
 </span>

 <div style={{ flex: 1, minWidth: 0 }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: "0.25rem" }}>
 {kindLabel}{item.duration_min ? ` · ${item.duration_min} min` : ""}{item.creator ? ` · ${item.creator}` : ""}
 </p>
 <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.4 }}>
 {item.title}
 </p>
 {item.why && (
 <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", marginTop: "0.25rem", fontStyle: "italic" }}>
 {item.why}
 </p>
 )}
 </div>
 </div>

 {/* Body row, renders edge-to-edge of the card so lesson
 text + code blocks + videos use the FULL width. No
 inheritance of the 66 px check+icon gutter. */}
 {hasRichBody && (
 <div style={{ marginTop: "0.625rem", width: "100%", minWidth: 0 }}>
 {item.body && (
 <ForgeMarkdown>{item.body}</ForgeMarkdown>
 )}
 {/* Inline interactive widget for widget-kind items.
 Ticking the item happens via the normal checkbox, playing with it is the engagement, no Open button. */}
 {item.kind === "widget" && item.widget && (
 <div style={{ marginTop: "0.5rem" }}>
 <ConceptWidget
 id={item.widget.id}
 params={item.widget.params}
 caption={item.widget.caption}
 />
 </div>
 )}
 {/* Swipe retention cards, the gamified concept check
 that sits after the lesson, before the coding task. */}
 {item.kind === "swipe" && item.cards && item.cards.length > 0 && (
 <div style={{ marginTop: "0.5rem" }}>
 <SwipeCards
     cards={item.cards}
     storageKey={`forge:swipe:${slug}:w${week.number}:${key}`}
     onComplete={() => { if (!done[key]) persist({ ...done, [key]: true }, { [key]: true }); }}
    />
 </div>
 )}
 {/* Inline VideoEmbed for video items with YouTube/Loom URLs.
 Now full-width, the player has the whole card to fill. */}
 {clickable && item.kind === "video" && (
 <div
 style={{ marginTop: "0.5rem" }}
 onClick={() => {
 if (!done[key]) persist({ ...done, [key]: true }, { [key]: true });
 }}
 >
 <VideoEmbed url={item.url!} title={undefined} bare lazy />
 </div>
 )}
 {clickable && item.kind !== "video" && (
 <button
 type="button"
 onClick={() => {
 openItem(item.url!, item.title);
 if (!done[key]) {
 persist({ ...done, [key]: true }, { [key]: true });
 }
 }}
 style={{
 marginTop: "0.5rem",
 display: "inline-flex", alignItems: "center", gap: "0.375rem",
 background: `${accent}15`, color: accent,
 border: `1px solid ${accent}40`, borderRadius: 6,
 padding: "0.3125rem 0.625rem", cursor: "pointer",
 fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.05em",
 fontWeight: 600,
 }}
 >
 <ExternalLink size={11} />
 Open
 </button>
 )}
 </div>
 )}
 </li>
 );
 })}
 </ul>

 {/* Day footer: one-click mark done / undo */}
 <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.05em" }}>
 {d.items.filter((_, i) => done[`d${d.number}-i${i}`]).length}/{d.items.length} items · {pct}%
 </p>
 {isDone ? (
 <button
 onClick={() => markDay(d.number, false)}
 style={{
 display: "inline-flex", alignItems: "center", gap: "0.375rem",
 background: "transparent", color: "var(--text-dim)",
 border: "1px solid var(--border)", borderRadius: 6,
 padding: "0.4375rem 0.875rem", cursor: "pointer",
 fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.05em",
 fontWeight: 600,
 }}
 >
 Undo · re-do Day {d.number}
 </button>
 ) : (() => {
 // Engagement gate: the Mark-done button is ONLY enabled
 // once every item on the day is individually ticked.
 // No more bulk-bypass.
 const allItemsTicked = d.items.every((_, i) => done[`d${d.number}-i${i}`]);
 const missing = d.items.length - d.items.filter((_, i) => done[`d${d.number}-i${i}`]).length;
 return (
 <button
 onClick={() => allItemsTicked && markDay(d.number, true)}
 disabled={!allItemsTicked}
 title={allItemsTicked ? "" : `Tick every item above first (${missing} left). Open the links, they auto-tick when you do.`}
 style={{
 display: "inline-flex", alignItems: "center", gap: "0.375rem",
 background: allItemsTicked ? "var(--accent)" : "var(--bg-card)",
 color: allItemsTicked ? "#000" : "var(--text-dim)",
 border: allItemsTicked ? "none" : "1px solid var(--border)",
 borderRadius: 6,
 padding: "0.5rem 1rem",
 cursor: allItemsTicked ? "pointer" : "not-allowed",
 fontFamily: "var(--font-body)", fontSize: "0.8125rem", letterSpacing: "0.02em",
 fontWeight: 700,
 opacity: allItemsTicked ? 1 : 0.7,
 }}
 >
 {allItemsTicked ? <CheckCircle2 size={14} /> : <Lock size={14} />}
 {allItemsTicked
 ? `Mark Day ${d.number} done`
 : `${missing} item${missing === 1 ? "" : "s"} left to tick`}
 {allItemsTicked && idx + 1 < (week.days?.length ?? 0) && <ArrowRight size={14} />}
 </button>
 );
 })()}
 </div>
 </div>
 )}
 </article>
 );
 })}

 {/* Previous / Next week navigation, CONTENT TAB ONLY, and only for SOLO
 learners. Mentees get their weeks released one at a time by the mentor,
 so free week-to-week jumping doesn't apply to them — it just clutters
 the page and lets them wander into locked weeks. Hidden when hasMentor. */}
 {activeTab === "content" && !hasMentor && (prev || next) && (
 <nav
 aria-label="Week navigation"
 style={{
 marginTop: "1.5rem",
 paddingTop: "1rem",
 borderTop: "1px solid var(--border)",
 display: "flex",
 justifyContent: "space-between",
 alignItems: "stretch",
 gap: "0.75rem",
 flexWrap: "wrap",
 }}
 >
 {prev ? (
 <Link
 href={`/learn/${slug}/${prev.number}`}
 className="forge-panel-link"
 style={{
 flex: "0 1 auto",
 maxWidth: "22rem",
 display: "inline-flex",
 alignItems: "center",
 gap: "0.75rem",
 padding: "0.75rem 1rem",
 borderRadius: 10,
 border: "1px solid var(--border)",
 background: "var(--bg-panel)",
 color: "var(--text-primary)",
 textDecoration: "none",
 minWidth: 0,
 }}
 >
 <ArrowLeft size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
 <span style={{ minWidth: 0, display: "block" }}>
 <span style={{
 display: "block",
 fontFamily: "var(--font-mono)",
 fontSize: "0.625rem",
 letterSpacing: "0.18em",
 textTransform: "uppercase",
 color: "var(--text-dim)",
 lineHeight: 1,
 marginBottom: "0.25rem",
 }}>Previous</span>
 <span style={{
 display: "block",
 fontFamily: "var(--font-body)",
 fontSize: "0.875rem",
 fontWeight: 500,
 lineHeight: 1.25,
 whiteSpace: "nowrap",
 overflow: "hidden",
 textOverflow: "ellipsis",
 color: "var(--text-primary)",
 }}>Week {prev.number}: {prev.title}</span>
 </span>
 </Link>
 ) : <span aria-hidden />}

 {next ? (
 <Link
 href={`/learn/${slug}/${next.number}`}
 className="forge-panel-link"
 style={{
 flex: "0 1 auto",
 maxWidth: "22rem",
 display: "inline-flex",
 alignItems: "center",
 gap: "0.75rem",
 padding: "0.75rem 1rem",
 borderRadius: 10,
 border: "1px solid var(--border)",
 background: "var(--bg-panel)",
 color: "var(--text-primary)",
 textDecoration: "none",
 minWidth: 0,
 marginLeft: prev ? 0 : "auto",
 }}
 >
 <span style={{ minWidth: 0, display: "block", textAlign: "right" }}>
 <span style={{
 display: "block",
 fontFamily: "var(--font-mono)",
 fontSize: "0.625rem",
 letterSpacing: "0.18em",
 textTransform: "uppercase",
 color: "var(--text-dim)",
 lineHeight: 1,
 marginBottom: "0.25rem",
 }}>Next</span>
 <span style={{
 display: "block",
 fontFamily: "var(--font-body)",
 fontSize: "0.875rem",
 fontWeight: 500,
 lineHeight: 1.25,
 whiteSpace: "nowrap",
 overflow: "hidden",
 textOverflow: "ellipsis",
 color: "var(--text-primary)",
 }}>Week {next.number}: {next.title}</span>
 </span>
 <ArrowRight size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
 </Link>
 ) : null}
 </nav>
 )}

 {/* Ship-it section, Content tab, only when every day is done */}
 {activeTab === "content" && allDone && (
 <div className="forge-panel" style={{ padding: "1.25rem", border: "1px solid rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.05)" }}>
 <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
 <CheckCircle2 size={22} style={{ color: "var(--green)" }} />
 <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", fontWeight: 700 }}>
 All 7 days done, now ship Week {week.number}
 </h3>
 </div>
 <ShipItSection week={week} />
 </div>
 )}
 {/* Mentor Review now lives in its own dedicated tab above, no duplicate
 rendering at the bottom of the Content tab. */}

 {viewer && <ResourceViewer url={viewer.url} label={viewer.label} onClose={() => setViewer(null)} />}

 {/* Floating toast: locked-day tap */}
 {lockedToast && (
 <div
 role="status"
 style={{
 position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
 background: "var(--bg-panel)", border: "1px solid var(--border)",
 borderRadius: 10, padding: "0.625rem 1rem",
 color: "var(--text-primary)", fontSize: "0.8125rem",
 display: "flex", alignItems: "center", gap: "0.5rem",
 boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 9999,
 pointerEvents: "none",
 }}
 >
 <Lock size={14} style={{ color: "var(--accent)" }} />
 {lockedToast}
 </div>
 )}

 {/* Celebration banner: day just unlocked */}
 {justUnlockedDay !== null && (
 <div
 role="status"
 style={{
 position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
 background: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(245,158,11,0.12))",
 border: "1px solid rgba(34,197,94,0.4)",
 borderRadius: 10, padding: "0.75rem 1.125rem",
 color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600,
 display: "flex", alignItems: "center", gap: "0.5rem",
 boxShadow: "0 8px 32px rgba(34,197,94,0.25)", zIndex: 9999,
 pointerEvents: "none",
 }}
 >
 <Sparkles size={16} style={{ color: "var(--green)" }} />
 Day {justUnlockedDay} done
 {(week.days && justUnlockedDay < week.days.length) && (
 <>
 <ArrowRight size={14} style={{ color: "var(--accent)" }} />
 Day {justUnlockedDay + 1} unlocked
 </>
 )}
 </div>
 )}
 </div>
 );
}

/** End-of-week summary: project + exercises + reflection. Compact, no tabs. */
/** Solo-learner self-verify widget. No mentor copy. Optional URL field so the
 * learner can store a link to what they shipped; click Mark Complete and the
 * current Task flips to verified, the Journal logs a row, and the next week
 * unlocks (since gating is based on Task.status). */
function SoloCompletePanel({ taskId, alreadyComplete }: { taskId: string; alreadyComplete: boolean }) {
 const [evidenceUrl, setEvidenceUrl] = useState("");
 const [submitting, setSubmitting] = useState(false);
 const [done, setDone] = useState(alreadyComplete);
 const [error, setError] = useState<string | null>(null);

 const submit = async () => {
 setSubmitting(true);
 setError(null);
 try {
 const res = await fetch("/api/me/mark-week-complete", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ taskId, evidenceUrl: evidenceUrl.trim() || null }),
 });
 if (!res.ok) {
 const j = await res.json().catch(() => ({}));
 setError(j.error ?? "Could not mark complete.");
 return;
 }
 setDone(true);
 } catch {
 setError("Network error. Try again.");
 } finally {
 setSubmitting(false);
 }
 };

 if (done) {
 return (
 <div
 className="forge-panel"
 style={{
 padding: "1.25rem",
 border: "1px solid rgba(34,197,94,0.4)",
 background: "rgba(34,197,94,0.05)",
 }}
 >
 <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", marginBottom: "0.375rem", color: "var(--green)" }}>
 Week complete
 </h3>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.55, marginBottom: "0.75rem" }}>
 You marked this week done. The next week is unlocked on your roadmap.
 </p>
 <a href="/dashboard/roadmap" className="forge-btn forge-btn-ghost" style={{ padding: "0.5rem 1rem" }}>
 Open the next week →
 </a>
 </div>
 );
 }

 return (
 <div
 className="forge-panel"
 style={{
 padding: "1.25rem",
 border: "1px solid rgba(212,175,55,0.4)",
 overflow: "hidden",
 maxWidth: "100%",
 boxSizing: "border-box",
 }}
 >
 <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", marginBottom: "0.5rem" }}>
 Mark this week complete
 </h3>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.55, marginBottom: "1rem" }}>
 Solo mode, you are your own bar. When you have finished the work for this week,
 click Mark Complete. The next week unlocks immediately.
 Optional: paste a URL (your repo, demo, or notes) so it lives in your Journal.
 </p>

 <label style={{
 display: "block",
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 color: "var(--text-dim)",
 letterSpacing: "0.12em",
 textTransform: "uppercase",
 marginBottom: "0.375rem",
 }}>
 Proof URL (optional)
 </label>
 <input
 type="url"
 value={evidenceUrl}
 onChange={(e) => setEvidenceUrl(e.target.value)}
 placeholder="https://github.com/you/your-repo · https://your-demo.app · blank is fine"
 style={{
 width: "100%",
 boxSizing: "border-box",
 padding: "0.625rem 0.75rem",
 background: "var(--bg-card)",
 border: "1px solid var(--border)",
 borderRadius: 8,
 color: "var(--text-primary)",
 fontSize: "0.9375rem",
 marginBottom: "1rem",
 fontFamily: "var(--font-body)",
 }}
 />

 <button
 type="button"
 onClick={submit}
 disabled={submitting}
 className="forge-btn forge-btn-primary"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.4rem",
 padding: "0.625rem 1.25rem",
 opacity: submitting ? 0.7 : 1,
 }}
 >
 {submitting ? "Marking…" : "Mark complete"}
 </button>

 {error && (
 <p style={{ marginTop: "0.75rem", color: "var(--red)", fontSize: "0.875rem" }} role="alert">
 {error}
 </p>
 )}
 </div>
 );
}

function ShipItSection({ week }: { week: RoadmapWeek }) {
 return (
 <div className="flex flex-col gap-5">
 {week.project && (
 <div>
 <h4 style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
 <Target size={16} style={{ color: "#fb923c" }} /> Build this week
 </h4>
 <div style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.22)", padding: "0.875rem 1rem 0.125rem", borderRadius: 8 }}>
 <ForgeMarkdown>{week.project}</ForgeMarkdown>
 </div>
 </div>
 )}

 {(week.exercises?.length ?? 0) > 0 && week.exercises && (
 <div>
 <h4 style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
 <Code2 size={16} style={{ color: "#38bdf8" }} /> Practice
 </h4>
 <ol style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: 0, listStyle: "none" }}>
 {week.exercises.map((e, i) => (
 <li key={i} style={{ display: "flex", gap: "0.625rem", fontSize: "0.9375rem", color: "var(--text-primary)", lineHeight: 1.55 }}>
 <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: "#38bdf822", color: "#38bdf8", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", display: "grid", placeItems: "center", fontWeight: 700 }}>
 {i + 1}
 </span>
 <span>{e}</span>
 </li>
 ))}
 </ol>
 </div>
 )}

 {(week.questions?.length ?? 0) > 0 && week.questions && (
 <div>
 <h4 style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
 <HelpCircle size={16} style={{ color: "#f472b6" }} /> Reflect
 </h4>
 <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
 {week.questions.map((q, i) => (
 <div key={i} style={{ background: "rgba(244,114,182,0.06)", border: "1px solid rgba(244,114,182,0.18)", borderRadius: 8, padding: "0.75rem 0.875rem" }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#f472b6", marginBottom: "0.25rem" }}>Q{i + 1}</p>
 <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.6 }}>{q}</p>
 </div>
 ))}
 </div>
 </div>
 )}

 {(week.outputs?.length ?? 0) > 0 && week.outputs && (
 <div>
 <h4 style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
 <CheckCircle2 size={16} style={{ color: "#fbbf24" }} /> By the end you have
 </h4>
 <ul style={{ display: "flex", flexDirection: "column", gap: "0.375rem", paddingLeft: 0, listStyle: "none" }}>
 {week.outputs.map((o, i) => (
 <li key={i} style={{ display: "flex", gap: "0.5rem", fontSize: "0.9375rem", color: "var(--text-primary)", lineHeight: 1.55 }}>
 <CheckCircle2 size={15} style={{ color: "#fbbf24", flexShrink: 0, marginTop: "0.1875rem" }} />
 <span>{o}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 );
}
