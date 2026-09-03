"use client";

/**
 * Linear vertical node map of the learner's full roadmap.
 *
 * ●─── verified gold filled (gold connector line above)
 * │
 * ◉─── active pulsing gold outline (current released week)
 * │
 * ○─── locked, releasable next (faint outline)
 * │
 * ✕─── closed without verification (visible gap, the broken streak)
 *
 * Renders the journey itself, top to bottom. Every node shows the
 * week number left and the title right. Hover reveals verified date /
 * deadline / status detail.
 *
 * This is meant to be screenshotted. Learners will post it.
 */

import Link from "next/link";
import { useState } from "react";
import { Check, Lock, Clock, X, Sparkles } from "lucide-react";

export interface NodeMapWeek {
 id: string;
 number: number; // 1-indexed week number within the roadmap
 title: string; // full title, "Week 1: Excel foundations"
 trackTitle?: string; // optional track label
 status: "locked" | "available" | "in_progress" | "pending_verification" | "verified" | "failed";
 releasedAt?: Date | string | null;
 closedAt?: Date | string | null;
 verifiedAt?: Date | string | null;
 deadline?: Date | string | null;
}

interface Props {
 weeks: NodeMapWeek[];
 /** Total weeks expected (so the bar caps at "Week 27 of 27") */
 totalWeeks?: number;
 /** When set, unlocked weeks become Links to /learn/<slug>/<weekNumber>.
 * Locked weeks render as a plain div (no nav). */
 slugForLinks?: string | null;
}

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f0c75c";
const GOLD_DIM = "rgba(212,175,55,0.25)";

function stripWeekPrefix(title: string): string {
 // "Week 3: Data cleaning" → "Data cleaning"
 return title.replace(/^Week\s+\d+\s*[:\-]\s*/i, "").trim();
}

function statusColor(s: NodeMapWeek["status"], closed: boolean) {
 if (closed) return "#7f1d1d";
 if (s === "verified") return GOLD;
 if (s === "in_progress") return "var(--blue)";
 if (s === "available") return GOLD_LIGHT;
 if (s === "pending_verification") return "var(--orange)";
 if (s === "failed") return "var(--red)";
 return "var(--text-dim)";
}

function statusLabel(s: NodeMapWeek["status"], closed: boolean) {
 if (closed && s !== "verified") return "Closed";
 switch (s) {
 case "verified": return "Verified";
 case "in_progress": return "In progress";
 case "available": return "Active";
 case "pending_verification": return "Pending";
 case "failed": return "Reopen needed";
 default: return "Locked";
 }
}

function NodeIcon({ week }: { week: NodeMapWeek }) {
 const closed = !!week.closedAt && week.status !== "verified";
 const color = statusColor(week.status, closed);
 const active = week.status === "available" || week.status === "in_progress";

 // Filled gold node for verified
 if (week.status === "verified") {
 return (
 <div style={{
 width: 44, height: 44, borderRadius: "50%",
 background: `radial-gradient(circle at 30% 30%, ${GOLD_LIGHT}, ${GOLD})`,
 display: "grid", placeItems: "center",
 boxShadow: `0 0 0 4px rgba(212,175,55,0.12), 0 8px 24px -6px rgba(212,175,55,0.4)`,
 color: "#1a1410",
 flexShrink: 0,
 }}>
 <Check size={20} strokeWidth={3} />
 </div>
 );
 }

 // Closed (broken streak)
 if (closed) {
 return (
 <div style={{
 width: 44, height: 44, borderRadius: "50%",
 background: "rgba(127,29,29,0.18)",
 border: "1.5px dashed rgba(239,68,68,0.5)",
 display: "grid", placeItems: "center",
 color: "var(--red)",
 flexShrink: 0,
 }}>
 <X size={18} strokeWidth={2.5} />
 </div>
 );
 }

 // Active (pulsing gold outline)
 if (active) {
 return (
 <div style={{
 width: 44, height: 44, borderRadius: "50%",
 background: "rgba(212,175,55,0.08)",
 border: `2px solid ${GOLD}`,
 display: "grid", placeItems: "center",
 color: GOLD,
 flexShrink: 0,
 animation: "forgeNodePulse 2.2s ease-in-out infinite",
 }}>
 <Sparkles size={18} strokeWidth={2.2} />
 </div>
 );
 }

 // Pending verification
 if (week.status === "pending_verification") {
 return (
 <div style={{
 width: 44, height: 44, borderRadius: "50%",
 background: "rgba(249,115,22,0.1)",
 border: "2px solid var(--orange)",
 display: "grid", placeItems: "center",
 color: "var(--orange)",
 flexShrink: 0,
 }}>
 <Clock size={18} strokeWidth={2.2} />
 </div>
 );
 }

 // Locked
 return (
 <div style={{
 width: 44, height: 44, borderRadius: "50%",
 background: "transparent",
 border: "1.5px solid var(--border)",
 display: "grid", placeItems: "center",
 color: "var(--text-dim)",
 flexShrink: 0,
 }}>
 <Lock size={14} strokeWidth={2} />
 </div>
 );
}

function ConnectorLine({ aboveVerified, belowVerified }: { aboveVerified: boolean; belowVerified: boolean }) {
 // Gold connector when both ends are verified; dimmed otherwise.
 const filled = aboveVerified && belowVerified;
 return (
 <div style={{
 position: "absolute",
 left: 21, // 22-1 to center under 44px node
 top: 44, // start below the node
 bottom: -8,
 width: 2,
 background: filled
 ? `linear-gradient(180deg, ${GOLD}, ${GOLD})`
 : `linear-gradient(180deg, ${GOLD_DIM}, var(--border))`,
 borderRadius: 1,
 }} />
 );
}

export default function RoadmapNodeMap({ weeks, totalWeeks, slugForLinks = null }: Props) {
 const [hoverIdx, setHoverIdx] = useState<number | null>(null);

 if (weeks.length === 0) return null;
 const total = totalWeeks ?? weeks.length;
 const verifiedCount = weeks.filter((w) => w.status === "verified").length;
 const activeIdx = weeks.findIndex((w) => w.status === "available" || w.status === "in_progress");

 return (
 <div className="forge-panel" style={{
 padding: "1.5rem 1.25rem 0.5rem",
 marginBottom: "1.5rem",
 background: "linear-gradient(180deg, rgba(212,175,55,0.04), rgba(212,175,55,0.0))",
 borderColor: "var(--border)",
 }}>
 {/* Header */}
 <div style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 gap: "1rem",
 marginBottom: "1.25rem",
 flexWrap: "wrap",
 }}>
 <div>
 <div style={{
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 letterSpacing: "0.22em",
 color: "var(--text-dim)",
 textTransform: "uppercase",
 marginBottom: "0.25rem",
 }}>
 The journey
 </div>
 <div style={{
 fontFamily: "var(--font-headline)",
 fontSize: "1.25rem",
 color: "var(--text-primary)",
 letterSpacing: "0.02em",
 }}>
 Week {Math.max(1, activeIdx >= 0 ? activeIdx + 1 : verifiedCount + 1)} of {total}
 {" · "}
 <span style={{ color: GOLD }}>{verifiedCount} verified</span>
 </div>
 </div>

 {/* Legend */}
 <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap", fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase" }}>
 <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
 <span style={{ width: 8, height: 8, borderRadius: "50%", background: GOLD }} /> Verified
 </span>
 <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
 <span style={{ width: 8, height: 8, borderRadius: "50%", background: "transparent", border: `1.5px solid ${GOLD}` }} /> Active
 </span>
 <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
 <span style={{ width: 8, height: 8, borderRadius: "50%", background: "transparent", border: "1.5px solid var(--border)" }} /> Locked
 </span>
 </div>
 </div>

 {/* Nodes */}
 <div style={{ position: "relative", paddingLeft: "0.5rem", paddingBottom: "0.5rem" }}>
 {weeks.map((week, idx) => {
 const aboveV = idx > 0 && weeks[idx - 1].status === "verified";
 const below = weeks[idx + 1];
 const belowV = !!below && below.status === "verified";
 const closed = !!week.closedAt && week.status !== "verified";
 const hovered = hoverIdx === idx;

 const clickable = !!slugForLinks && week.status !== "locked";
 const innerBody = (
 <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
 {/* Node */}
 <NodeIcon week={week} />

 {/* Body */}
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{
 fontFamily: "var(--font-mono)",
 fontSize: "0.625rem",
 letterSpacing: "0.2em",
 color: closed ? "var(--red)" : week.status === "verified" ? GOLD : "var(--text-dim)",
 textTransform: "uppercase",
 marginBottom: "0.2rem",
 }}>
 Week {week.number} · {statusLabel(week.status, closed)}
 {week.trackTitle && <span style={{ color: "var(--text-dim)" }}> · {week.trackTitle}</span>}
 </div>
 <div style={{
 fontFamily: "var(--font-body)",
 fontSize: "0.9375rem",
 fontWeight: 600,
 color: week.status === "locked"
 ? "var(--text-dim)"
 : "var(--text-primary)",
 lineHeight: 1.35,
 opacity: week.status === "locked" ? 0.7 : 1,
 }}>
 {stripWeekPrefix(week.title)}
 </div>
 {/* Hover detail */}
 {hovered && (
 <div style={{
 fontFamily: "var(--font-mono)",
 fontSize: "0.625rem",
 color: "var(--text-secondary)",
 letterSpacing: "0.06em",
 marginTop: "0.35rem",
 }}>
 {week.status === "verified" && week.verifiedAt && (
 <>Verified {new Date(week.verifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
 )}
 {(week.status === "available" || week.status === "in_progress") && week.deadline && (
 <>Deadline {new Date(week.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
 )}
 {week.status === "locked" && <>Locked, finish earlier weeks first.</>}
 {closed && <>Closed without verification, ask your mentor to extend.</>}
 </div>
 )}
 </div>
 </div>
 );

 return (
 <div
 key={week.id}
 style={{ position: "relative", paddingBottom: idx === weeks.length - 1 ? 0 : "1.25rem" }}
 onMouseEnter={() => setHoverIdx(idx)}
 onMouseLeave={() => setHoverIdx(null)}
 >
 {idx < weeks.length - 1 && (
 <ConnectorLine aboveVerified={week.status === "verified"} belowVerified={belowV} />
 )}
 {clickable ? (
 <Link
 href={`/learn/${slugForLinks}/${week.number}`}
 style={{ textDecoration: "none", color: "inherit", display: "block", borderRadius: 8 }}
 >
 {innerBody}
 </Link>
 ) : (
 innerBody
 )}
 </div>
 );
 })}
 </div>

 <style>{`
 @keyframes forgeNodePulse {
 0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.45), 0 0 0 0 rgba(212,175,55,0); }
 50% { box-shadow: 0 0 0 10px rgba(212,175,55,0.08), 0 8px 24px -6px rgba(212,175,55,0.4); }
 }
 `}</style>
 </div>
 );
}
