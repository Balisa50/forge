"use client";

/**
 * WeekAtAGlance, an auto-generated "this week at a glance" overview shown at the
 * top of every week (Content tab). It is built from the week's OWN data, the
 * day list (the arc + each day's goal, taken from each day's summary) and the
 * project/outputs (the deliverable), so it is always accurate and in sync with
 * the content, with zero per-week text to author or maintain. One platform
 * change gives every week of every track a clear overview.
 *
 * Renders nothing when there are too few days, or when the week already hand-
 * authored an "...at a glance" lesson (so we never show two overviews).
 */

import type { RoadmapWeek } from "@/lib/roadmaps";

// Some day titles already start with "Day 3 - ..." / "Day 0: ...". Strip that
// so the rendered line ("Day 3 — <title>") never doubles up the day number.
const stripDayPrefix = (t: string) => (t || "").replace(/^day\s+\d+\s*[-:–—]\s*/i, "").trim();

export default function WeekAtAGlance({ week }: { week: RoadmapWeek }) {
  const days = (week.days || []).slice().sort((a, b) => a.number - b.number);
  if (days.length < 3) return null; // nothing meaningful to summarise

  // Do not duplicate a hand-authored overview lesson (e.g. AI-Eng W1 "Week 1 at a glance").
  const hasAuthoredOverview = days.some((d) => (d.items || []).some((it) => /at a glance/i.test(it.title || "")));
  if (hasAuthoredOverview) return null;

  const deliverable =
    (week.project && week.project.trim()) ||
    (Array.isArray(week.outputs) && week.outputs.length ? week.outputs.join(" · ") : "");

  return (
    <details
      open
      style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-card)", padding: "1rem 1.125rem" }}
    >
      <summary
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        This week at a glance · {days.length} days
      </summary>

      <ol style={{ listStyle: "none", margin: "0.75rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {days.map((d) => (
          <li key={d.number} style={{ display: "flex", gap: "0.625rem", alignItems: "baseline" }}>
            <span style={{ flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--accent)", minWidth: 46 }}>
              Day {d.number}
            </span>
            <span style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
              <strong>{stripDayPrefix(d.title) || `Day ${d.number}`}</strong>
              {d.summary ? <span style={{ color: "var(--text-secondary)" }}>{" — " + d.summary}</span> : null}
            </span>
          </li>
        ))}
      </ol>

      {deliverable && (
        <p style={{ marginTop: "0.875rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--text-primary)" }}>By the end of the week:</strong> {deliverable}
        </p>
      )}
    </details>
  );
}
