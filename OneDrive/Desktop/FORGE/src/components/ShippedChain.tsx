/**
 * ShippedChain - the visible record of weeks shipped.
 *
 * A row of segments: solid for every week verified, hollow for what's
 * left. Behavioural basis: loss aversion + the goal-gradient effect.
 * A chain you can SEE is a chain you do not want to break, and a finish
 * line you can see pulls you toward it.
 *
 * Pure presentational - the dashboard passes in the counts.
 */

import { Flame } from "lucide-react";

interface Props {
  shipped: number;
  total: number;
  /** Current consecutive-week streak. */
  streak: number;
}

export default function ShippedChain({ shipped, total, streak }: Props) {
  if (total === 0) return null;
  const pct = Math.round((shipped / total) * 100);

  return (
    <section
      className="forge-panel"
      style={{ padding: "1.125rem 1.25rem", marginBottom: "1.5rem" }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "var(--font-headline)", fontSize: "1.0625rem", color: "var(--text-primary)" }}>
            {shipped} {shipped === 1 ? "week" : "weeks"} shipped
          </span>
          {streak >= 2 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                letterSpacing: "0.08em",
                color: "var(--accent)",
                background: "rgba(245,158,11,0.12)",
                padding: "0.2rem 0.5rem",
                borderRadius: 6,
              }}
            >
              <Flame size={11} /> {streak} in a row
            </span>
          )}
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
          {pct}% of {total}
        </span>
      </div>

      {/* The chain */}
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            title={i < shipped ? `Week ${i + 1} - shipped` : `Week ${i + 1}`}
            style={{
              flex: "1 1 10px",
              minWidth: 8,
              height: 10,
              borderRadius: 3,
              background: i < shipped ? "var(--accent)" : "var(--bg-card)",
              border: i < shipped ? "1px solid var(--accent)" : "1px solid var(--border)",
            }}
          />
        ))}
      </div>

      <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginTop: "0.75rem", lineHeight: 1.5 }}>
        {shipped === 0
          ? "Your chain starts with the first verified week. Nobody can build it for you."
          : shipped === total
            ? "Every week shipped. This record is permanent. It is yours."
            : "The chain is yours to keep - or to break. The record stays honest either way."}
      </p>
    </section>
  );
}
