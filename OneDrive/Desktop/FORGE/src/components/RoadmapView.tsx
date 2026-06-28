"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Clock, Zap, Search, CheckCircle2, XCircle, ChevronDown, ChevronUp, ExternalLink, BookOpen, BookMarked, Target, ClipboardCheck, Code2, HelpCircle as HelpIcon, Play } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { parseTaskDetail } from "@/lib/parse-task-detail";
import ResourceViewer from "@/components/ResourceViewer";
import WeekPageTabs from "@/components/WeekPageTabs";
import RoadmapNodeMap, { type NodeMapWeek } from "@/components/RoadmapNodeMap";
import type { RoadmapWeek } from "@/lib/roadmaps";

interface Task {
 id: string;
 title: string;
 detail: string;
 why?: string | null;
 milestone?: string | null;
 status: string;
 estimatedHours?: number | null;
 verifiedAt?: Date | string | null;
 resources?: string[];
}

interface Phase {
 id: string;
 title: string;
 tasks: Task[];
}

interface Track {
 id: string;
 title: string;
 color: string;
 phases: Phase[];
}

interface Roadmap {
 id: string;
 title: string;
 tracks: Track[];
}

const TASK_STATUS: Record<string, { Icon: LucideIcon; color: string; label: string }> = {
 locked: { Icon: Lock, color: "var(--text-dim)", label: "Locked" },
 available: { Icon: Clock, color: "var(--yellow)", label: "Ready" },
 in_progress: { Icon: Zap, color: "var(--blue)", label: "In Progress" },
 pending_verification: { Icon: Search, color: "var(--orange)", label: "Pending" },
 verified: { Icon: CheckCircle2, color: "var(--green)", label: "Verified" },
 failed: { Icon: XCircle, color: "var(--red)", label: "Failed" },
};

/** Resource strings from curated roadmaps come in three shapes:
 * "Label, https://url (note)", curated (new)
 * "Label, https://url", curated (no note)
 * "YouTube: Channel, Topic", AI-generated
 * "Book: Title", AI-generated
 * "https://full-url", raw URL
 * "domain.com/path", embedded domain
 *
 * parseResource returns a uniform shape the UI can render.
 */
function parseResource(resource: string): { type: "url" | "youtube" | "book" | "text"; label: string; href?: string; note?: string } {
 // Curated format: "Label, https://url" or "Label, https://url (note)"
 const curatedMatch = resource.match(/^(.+?)\s+[, , -]\s+(https?:\/\/\S+?)(?:\s*\(([^)]+)\))?$/);
 if (curatedMatch) {
 return {
 type: "url",
 label: curatedMatch[1].trim(),
 href: curatedMatch[2].trim(),
 note: curatedMatch[3]?.trim(),
 };
 }

 // YouTube reference (AI-generated)
 const ytMatch = resource.match(/^YouTube:\s*(.+?)(?:\s*[, , -]\s*(.+))?$/i);
 if (ytMatch) {
 const channel = ytMatch[1].trim();
 const topic = ytMatch[2]?.trim();
 const query = topic ? `${channel} ${topic}` : channel;
 return {
 type: "youtube",
 label: topic ? `${channel}, ${topic}` : channel,
 href: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
 };
 }

 // Book reference
 if (resource.startsWith("Book:")) {
 return { type: "book", label: resource.replace(/^Book:\s*/, "") };
 }

 // Raw URL
 if (resource.startsWith("http://") || resource.startsWith("https://")) {
 try {
 const url = new URL(resource);
 const host = url.hostname.replace("www.", "");
 return { type: "url", label: host + (url.pathname.length > 1 ? url.pathname.slice(0, 40) : ""), href: resource };
 } catch {
 return { type: "url", label: resource.slice(0, 60), href: resource };
 }
 }

 // Embedded domain (e.g. "kaggle.com/datasets/...")
 const domainMatch = resource.match(/^(?:[^\s(]*?\b)?((?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)]*)?)/i);
 if (domainMatch) {
 const url = domainMatch[1].startsWith("http") ? domainMatch[1] : `https://${domainMatch[1]}`;
 return { type: "url", label: resource, href: url };
 }

 return { type: "text", label: resource };
}

/** Render a task's detail. If it parses into the curated 5-section shape,
 * render each section nicely. Otherwise fall back to a plain paragraph. */
function TaskDetailContent({ detail, isLocked }: { detail: string; isLocked: boolean }) {
 const parsed = parseTaskDetail(detail);
 const hasStructure = parsed.topics.length || parsed.tasks.length || parsed.project || parsed.questions.length || parsed.exercises.length;

 if (!hasStructure) {
 return (
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "0.5rem" }}>
 {detail}
 </p>
 );
 }

 return (
 <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "0.5rem", opacity: isLocked ? 0.7 : 1 }}>
 {parsed.context && (
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.55 }}>
 {parsed.context}
 </p>
 )}

 {parsed.topics.length > 0 && (
 <DetailBlock title="What you'll learn" icon={BookOpen} accent="#60a5fa">
 <ul className="grid gap-1.5 md:grid-cols-2">
 {parsed.topics.map((t, i) => (
 <li key={i} style={{ display: "flex", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
 <span style={{ color: "#60a5fa", flexShrink: 0 }}>•</span>
 <span>{t}</span>
 </li>
 ))}
 </ul>
 </DetailBlock>
 )}

 {parsed.tasks.length > 0 && (
 <DetailBlock title="What to do" icon={ClipboardCheck} accent="#34d399">
 <ol style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
 {parsed.tasks.map((t, i) => (
 <li key={i} style={{ display: "flex", gap: "0.625rem", fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.55 }}>
 <span style={{ flexShrink: 0, width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: "#34d39922", color: "#34d399", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", display: "grid", placeItems: "center", fontWeight: 600 }}>
 {i + 1}
 </span>
 <span>{t}</span>
 </li>
 ))}
 </ol>
 </DetailBlock>
 )}

 {parsed.project && (
 <DetailBlock title="Real-world project to build" icon={Target} accent="#fb923c">
 <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", lineHeight: 1.65, background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.18)", padding: "0.875rem 1rem", borderRadius: 8 }}>
 {parsed.project}
 </p>
 </DetailBlock>
 )}

 {parsed.questions.length > 0 && (
 <DetailBlock title="Think for yourself" icon={HelpIcon} accent="#f472b6">
 <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
 {parsed.questions.map((q, i) => (
 <div key={i} style={{ background: "rgba(244,114,182,0.05)", border: "1px solid rgba(244,114,182,0.15)", padding: "0.75rem 0.875rem", borderRadius: 8 }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", color: "#f472b6", textTransform: "uppercase", marginBottom: "0.25rem" }}>Q{i + 1}</p>
 <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.55 }}>{q}</p>
 </div>
 ))}
 </div>
 </DetailBlock>
 )}

 {parsed.exercises.length > 0 && (
 <DetailBlock title="Practice exercises" icon={Code2} accent="#38bdf8">
 <ol style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
 {parsed.exercises.map((e, i) => (
 <li key={i} style={{ display: "flex", gap: "0.625rem", fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.55 }}>
 <span style={{ flexShrink: 0, width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: "#38bdf822", color: "#38bdf8", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", display: "grid", placeItems: "center", fontWeight: 600 }}>
 {i + 1}
 </span>
 <span>{e}</span>
 </li>
 ))}
 </ol>
 </DetailBlock>
 )}
 </div>
 );
}

function DetailBlock({
 title,
 icon: Icon,
 accent,
 children,
}: {
 title: string;
 icon: LucideIcon;
 accent: string;
 children: React.ReactNode;
}) {
 return (
 <section>
 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
 <span style={{ width: 24, height: 24, borderRadius: 6, background: `${accent}1f`, color: accent, display: "grid", placeItems: "center" }}>
 <Icon size={13} strokeWidth={2} />
 </span>
 <h4 style={{ fontFamily: "var(--font-headline)", fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)" }}>{title}</h4>
 </div>
 {children}
 </section>
 );
}

export default function RoadmapView({
 roadmap,
 curatedSlug,
}: {
 roadmap: Roadmap;
 curatedSlug?: string | null;
 /** Deprecated, used to inline WeekPageTabs inside each task on this
 * page. That duplicated the week page content; the inline expansion
 * is gone. Prop kept on the signature so the dashboard/roadmap server
 * page does not need to change shape. */
 weekByTaskId?: Record<string, RoadmapWeek>;
}) {

 // Build the flat node-map list across ALL tracks so the journey reads end-to-end,
 // not per-track. Each task is one week.
 const nodeMapWeeks: NodeMapWeek[] = roadmap.tracks.flatMap((tr) =>
 tr.phases.flatMap((p) =>
 p.tasks.map((t, idx) => ({
 id: t.id,
 // Try to parse "Week N: ..." from title, else fall back to position
 number: (() => {
 const m = t.title.match(/^Week\s+(\d+)/i);
 return m ? parseInt(m[1], 10) : idx + 1;
 })(),
 title: t.title,
 trackTitle: roadmap.tracks.length > 1 ? tr.title : undefined,
 status: t.status as NodeMapWeek["status"],
 verifiedAt: t.verifiedAt,
 })),
 ),
 );

 // Journey card only. The previous track-tabs + phase-accordion + per-task
 // inline-week-tabs structure was removed because it duplicated the lesson
 // content that already lives on /learn/<slug>/<weekNum>. One source of
 // truth: the week page itself. Clicking a node here navigates there.
 return (
 <div>
 <RoadmapNodeMap weeks={nodeMapWeeks} slugForLinks={curatedSlug ?? null} />
 </div>
 );
}

// The legacy track-tabs + phase-accordion renderer is kept below in case
// we want to expose it again from a debug page, but it is not used.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyTracksAccordion({
 roadmap,
 curatedSlug,
 weekByTaskId,
}: {
 roadmap: Roadmap;
 curatedSlug?: string | null;
 weekByTaskId?: Record<string, RoadmapWeek>;
}) {
 const [activeTrack, setActiveTrack] = useState(roadmap.tracks[0]?.id ?? "");
 const [expandedPhase, setExpandedPhase] = useState<string | null>(roadmap.tracks[0]?.phases[0]?.id ?? null);
 const [viewer, setViewer] = useState<{ url: string; label: string } | null>(null);

 const track = roadmap.tracks.find((t) => t.id === activeTrack);

 return (
 <div>
 {/* (legacy) */}
 <span style={{ display: "none" }} />

 {/* Track tabs */}
 {roadmap.tracks.length > 1 && (
 <div className="flex gap-2 mb-6" style={{ flexWrap: "wrap" }}>
 {roadmap.tracks.map((t) => {
 const total = t.phases.reduce((s, p) => s + p.tasks.length, 0);
 const done = t.phases.reduce((s, p) => s + p.tasks.filter((tk) => tk.status === "verified").length, 0);
 const pct = total > 0 ? Math.round((done / total) * 100) : 0;
 return (
 <button
 key={t.id}
 onClick={() => setActiveTrack(t.id)}
 style={{
 padding: "0.5rem 1.25rem",
 borderRadius: "6px",
 fontFamily: "var(--font-body)",
 fontWeight: 600,
 fontSize: "0.875rem",
 border: activeTrack === t.id ? `1px solid ${t.color}` : "1px solid var(--border)",
 background: activeTrack === t.id ? `${t.color}15` : "transparent",
 color: activeTrack === t.id ? t.color : "var(--text-secondary)",
 cursor: "pointer",
 transition: "all 0.15s",
 display: "flex",
 alignItems: "center",
 gap: "0.5rem",
 }}
 >
 {t.title}
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", opacity: 0.7 }}>
 {pct}%
 </span>
 </button>
 );
 })}
 </div>
 )}

 {/* Phases */}
 {track ? (
 <div className="flex flex-col gap-4">
 {track.phases.map((phase, pi) => {
 const total = phase.tasks.length;
 const done = phase.tasks.filter((t) => t.status === "verified").length;
 const pct = total > 0 ? Math.round((done / total) * 100) : 0;
 const isExpanded = expandedPhase === phase.id;

 return (
 <div key={phase.id} className="forge-panel">
 {/* Phase header */}
 <button
 onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
 style={{
 width: "100%",
 padding: "1.25rem 1.5rem",
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 background: "none",
 border: "none",
 cursor: "pointer",
 color: "var(--text-primary)",
 gap: "1rem",
 }}
 >
 <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: 0 }}>
 <div style={{
 width: "28px",
 height: "28px",
 borderRadius: "50%",
 background: pct === 100 ? "var(--green)" : "var(--border)",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 fontFamily: "var(--font-mono)",
 fontSize: "0.75rem",
 color: pct === 100 ? "#000" : "var(--text-dim)",
 flexShrink: 0,
 }}>
 {pct === 100 ? <CheckCircle2 size={16} /> : pi + 1}
 </div>
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", fontWeight: 600, textAlign: "left" }}>{phase.title}</div>
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", marginTop: "0.25rem" }}>
 {done}/{total} tasks
 </div>
 </div>
 </div>
 <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
 <div style={{ width: "80px", height: "3px", background: "var(--border)", borderRadius: "2px" }}>
 <div style={{ height: "100%", width: `${pct}%`, background: track.color, borderRadius: "2px" }} />
 </div>
 {isExpanded
 ? <ChevronUp size={16} color="var(--text-dim)" />
 : <ChevronDown size={16} color="var(--text-dim)" />
 }
 </div>
 </button>

 {/* Tasks */}
 <AnimatePresence>
 {isExpanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 style={{ overflow: "hidden" }}
 >
 <div style={{ borderTop: "1px solid var(--border)" }}>
 {phase.tasks.map((task, ti) => {
 const s = TASK_STATUS[task.status] ?? { Icon: Clock, color: "var(--text-dim)", label: "Unknown" };
 const isVerified = task.status === "verified";
 const isLocked = task.status === "locked";

 return (
 <div
 key={task.id}
 style={{
 padding: "1.25rem 1.5rem",
 borderBottom: ti < phase.tasks.length - 1 ? "1px solid var(--border)" : "none",
 opacity: isLocked ? 0.4 : 1,
 position: "relative",
 }}
 >
 {/* Status circle, top right */}
 <div
 style={{
 position: "absolute",
 top: "1rem",
 right: "1.25rem",
 width: "28px",
 height: "28px",
 borderRadius: "50%",
 border: isVerified
 ? "2px solid var(--green)"
 : isLocked
 ? "2px solid var(--border)"
 : `2px solid ${s.color}`,
 background: isVerified ? "rgba(34,197,94,0.1)" : "transparent",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 }}
 title={s.label}
 >
 {isVerified ? (
 <CheckCircle2 size={16} color="var(--green)" strokeWidth={2.5} />
 ) : isLocked ? (
 <Lock size={12} color="var(--text-dim)" />
 ) : (
 <s.Icon size={14} color={s.color} strokeWidth={2} />
 )}
 </div>

 <div style={{ paddingRight: "2.5rem" }}>
 {/* Task title */}
 <div style={{
 fontFamily: "var(--font-body)",
 fontWeight: 700,
 fontSize: "1.0625rem",
 color: isVerified ? "var(--green)" : isLocked ? "var(--text-dim)" : "var(--text-primary)",
 textDecoration: isVerified ? "line-through" : "none",
 textDecorationColor: "rgba(34,197,94,0.3)",
 marginBottom: "0.5rem",
 }}>
 {task.title}
 </div>

 {/* Detail, when a matching curriculum week exists, render the
 rich Day-by-Day tabs UI (videos, unlockable days, progress).
 Otherwise fall back to the parsed legacy view. */}
 {(() => {
 const curatedWeek = weekByTaskId?.[task.id];
 if (curatedWeek && curatedSlug && !isLocked) {
 return (
 <div style={{ marginBottom: "0.75rem" }}>
 <WeekPageTabs week={curatedWeek} slug={curatedSlug} />
 </div>
 );
 }
 return <TaskDetailContent detail={task.detail} isLocked={isLocked} />;
 })()}
 {/* legacy spacer compatibility */}
 <span style={{ display: "none" }}>{task.why || task.milestone ? "" : ""}</span>

 {/* Why */}
 {task.why && (
 <div style={{
 fontSize: "0.8125rem",
 color: "var(--accent)",
 fontStyle: "italic",
 lineHeight: 1.5,
 marginBottom: "0.375rem",
 paddingLeft: "0.75rem",
 borderLeft: "2px solid var(--accent)",
 }}>
 {task.why}
 </div>
 )}

 {/* Milestone */}
 {task.milestone && (
 <div style={{
 marginTop: "0.5rem",
 padding: "0.5rem 0.75rem",
 background: isVerified ? "rgba(34,197,94,0.06)" : "rgba(245,158,11,0.04)",
 border: isVerified ? "1px solid rgba(34,197,94,0.15)" : "1px solid rgba(245,158,11,0.1)",
 borderRadius: "6px",
 display: "flex",
 alignItems: "flex-start",
 gap: "0.5rem",
 }}>
 <Target size={13} color={isVerified ? "var(--green)" : "var(--accent)"} strokeWidth={2} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
 <span style={{
 fontFamily: "var(--font-mono)",
 fontSize: "0.75rem",
 color: isVerified ? "var(--green)" : "var(--text-secondary)",
 }}>
 {task.milestone}
 </span>
 </div>
 )}

 {/* Verified date */}
 {task.verifiedAt && (
 <div style={{ marginTop: "0.375rem", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--green)" }}>
 Verified {new Date(task.verifiedAt).toLocaleDateString()}
 </div>
 )}

 {/* Action row, only for active tasks */}
 {(task.status === "available" || task.status === "in_progress") && (
 <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
 {/* Check In Now */}
 <a
 href="/dashboard/checkin"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.375rem",
 background: "var(--accent)",
 border: "none",
 borderRadius: "6px",
 padding: "0.375rem 0.875rem",
 cursor: "pointer",
 fontFamily: "var(--font-body)",
 fontWeight: 700,
 fontSize: "0.8125rem",
 color: "#000",
 textDecoration: "none",
 letterSpacing: "0.02em",
 transition: "all 0.15s",
 }}
 onMouseEnter={(e) => {
 (e.currentTarget as HTMLAnchorElement).style.background = "#fbbf24";
 (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 18px rgba(245,158,11,0.3)";
 }}
 onMouseLeave={(e) => {
 (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent)";
 (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
 }}
 >
 <Zap size={12} />
 Check In Now
 </a>

 </div>
 )}

 {/* Estimated hours */}
 {task.estimatedHours && !isLocked && (
 <div style={{
 marginTop: "0.5rem",
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 color: "var(--text-dim)",
 display: "flex",
 alignItems: "center",
 gap: "0.25rem",
 }}>
 <Clock size={11} /> ~{task.estimatedHours}h estimated
 </div>
 )}

 {/* Resources */}
 {!isLocked && task.resources && task.resources.length > 0 && (
 <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
 <div style={{
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 color: "var(--text-dim)",
 letterSpacing: "0.1em",
 textTransform: "uppercase",
 display: "flex",
 alignItems: "center",
 gap: "0.375rem",
 marginBottom: "0.125rem",
 }}>
 <BookOpen size={11} /> Resources
 </div>
 {task.resources.map((resource, ri) => {
 const parsed = parseResource(resource);

 if (parsed.type === "youtube" && parsed.href) {
 const href = parsed.href;
 return (
 <button
 key={ri}
 type="button"
 onClick={() => setViewer({ url: href, label: parsed.label })}
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.375rem",
 fontSize: "0.8125rem",
 color: "#ff4444",
 background: "transparent",
 border: "none",
 padding: 0,
 cursor: "pointer",
 fontFamily: "var(--font-body)",
 textAlign: "left",
 }}
 >
 <Play size={13} />
 {parsed.label}
 </button>
 );
 }

 if (parsed.type === "url" && parsed.href) {
 const href = parsed.href;
 return (
 <button
 key={ri}
 type="button"
 onClick={() => setViewer({ url: href, label: parsed.label })}
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.375rem",
 fontSize: "0.8125rem",
 color: "var(--blue)",
 background: "transparent",
 border: "none",
 padding: 0,
 cursor: "pointer",
 fontFamily: "var(--font-body)",
 textAlign: "left",
 }}
 >
 <ExternalLink size={12} />
 {parsed.label}
 </button>
 );
 }

 if (parsed.type === "book") {
 return (
 <span
 key={ri}
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.375rem",
 fontSize: "0.8125rem",
 color: "var(--text-secondary)",
 fontFamily: "var(--font-body)",
 }}
 >
 <BookMarked size={12} color="var(--accent)" />
 {parsed.label}
 </span>
 );
 }

 return (
 <span key={ri} style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
 {parsed.label}
 </span>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
 })}
 </div>
 ) : (
 <p style={{ color: "var(--text-secondary)" }}>No tracks found.</p>
 )}

 {/* Resource viewer modal */}
 {viewer && <ResourceViewer url={viewer.url} label={viewer.label} onClose={() => setViewer(null)} />}
 </div>
 );
}
