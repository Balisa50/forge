"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Users, Eye, ClipboardCheck, Info } from "lucide-react";

interface Props {
 totalMentees: number;
 activeToday: number;
 awaitingReview: number;
}

/**
 * Collapsible stat row for the mentor home. Collapsed by default, the
 * mentor sees a one-line summary at the top of the page and can expand
 * the three tiles when they want detail. Keeps the dashboard scannable
 * instead of a wall of cards on every visit.
 */
export default function MentorStatRow({ totalMentees, activeToday, awaitingReview }: Props) {
 const [open, setOpen] = useState(false);
 const [showTip, setShowTip] = useState(false);

 return (
 <div style={{ marginBottom: "1.5rem" }}>
 {/* One-line summary + expand toggle */}
 <button
 onClick={() => setOpen((o) => !o)}
 style={{
 width: "100%",
 padding: "0.75rem 1rem",
 background: "var(--bg-panel)",
 border: "1px solid var(--border)",
 borderRadius: 8,
 cursor: "pointer",
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 color: "var(--text-secondary)",
 fontFamily: "var(--font-mono)",
 fontSize: "0.8125rem",
 }}
 >
 <span style={{ display: "inline-flex", alignItems: "center", gap: "0.875rem", flexWrap: "wrap" }}>
 <span><strong style={{ color: "var(--text-primary)" }}>{totalMentees}</strong> mentees</span>
 <span style={{ color: "var(--text-dim)" }}>·</span>
 <span><strong style={{ color: activeToday === totalMentees && totalMentees > 0 ? "var(--green)" : "var(--yellow)" }}>{activeToday}/{totalMentees}</strong> active today</span>
 <span style={{ color: "var(--text-dim)" }}>·</span>
 <span><strong style={{ color: awaitingReview > 0 ? "var(--yellow)" : "var(--text-dim)" }}>{awaitingReview}</strong> awaiting review</span>
 </span>
 {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
 </button>

 {/* Expanded tiles, only render when open */}
 {open && (
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4" style={{ marginTop: "0.75rem" }}>
 <div className="forge-panel" style={{ padding: "1.25rem 1.5rem" }}>
 <div className="flex items-center gap-2 mb-2">
 <Users size={14} color="var(--blue)" />
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Total Mentees</div>
 </div>
 <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", color: "var(--blue)", lineHeight: 1 }}>{totalMentees}</div>
 </div>

 <div className="forge-panel" style={{ padding: "1.25rem 1.5rem", position: "relative" }}>
 <div className="flex items-center gap-2 mb-2">
 <Eye size={14} color={activeToday === totalMentees && totalMentees > 0 ? "var(--green)" : "var(--yellow)"} />
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
 Active Today
 <button
 type="button"
 onClick={(e) => { e.stopPropagation(); setShowTip((v) => !v); }}
 onBlur={() => setShowTip(false)}
 style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--text-dim)", display: "inline-flex" }}
 aria-label="What counts as active today?"
 >
 <Info size={11} />
 </button>
 </div>
 </div>
 <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", color: activeToday === totalMentees && totalMentees > 0 ? "var(--green)" : "var(--yellow)", lineHeight: 1 }}>{activeToday}/{totalMentees}</div>
 {showTip && (
 <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "0.375rem", padding: "0.625rem 0.75rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-secondary)", lineHeight: 1.5, zIndex: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
 A mentee counts as <strong>active today</strong> if they posted at least one check-in on the current date (their local timezone, midnight reset).
 </div>
 )}
 </div>

 <div className="forge-panel" style={{ padding: "1.25rem 1.5rem" }}>
 <div className="flex items-center gap-2 mb-2">
 <ClipboardCheck size={14} color={awaitingReview > 0 ? "var(--yellow)" : "var(--text-dim)"} />
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Awaiting Review</div>
 </div>
 <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", color: awaitingReview > 0 ? "var(--yellow)" : "var(--text-dim)", lineHeight: 1 }}>{awaitingReview}</div>
 </div>
 </div>
 )}
 </div>
 );
}
