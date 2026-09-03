import { Info } from "lucide-react";

interface Props {
 totalMentees: number;
 activeToday: number;
 awaitingReview: number;
}

/**
 * One-line stat strip for the mentor home: mentees · active today · awaiting
 * review. Deliberately NOT expandable — the strip already says everything the
 * tiles used to, so the old expand-to-cards behavior was pure noise (and
 * Abdoulie asked for it gone). Server component, zero client JS.
 */
export default function MentorStatRow({ totalMentees, activeToday, awaitingReview }: Props) {
 return (
 <div
 style={{
 marginBottom: "1.5rem",
 padding: "0.75rem 1rem",
 background: "var(--bg-panel)",
 border: "1px solid var(--border)",
 borderRadius: 8,
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 gap: "0.75rem",
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
 <span
 title="A mentee counts as active today if they posted at least one check-in on the current date."
 style={{ color: "var(--text-dim)", display: "inline-flex", cursor: "help" }}
 >
 <Info size={13} />
 </span>
 </div>
 );
}
