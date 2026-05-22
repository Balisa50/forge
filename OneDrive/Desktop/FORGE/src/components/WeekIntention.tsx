"use client";

/**
 * WeekIntention - the implementation-intention gate.
 *
 * When a week is released but the learner has not yet committed their
 * plan, this blocks "Open this week" and asks three if-then questions.
 * Once locked, it collapses into a quiet reminder of the plan.
 *
 * Behavioural basis: Gollwitzer's implementation intentions - committing
 * to WHEN / WHERE / WHAT-FIRST roughly doubles follow-through.
 */

import { useState } from "react";
import { Target, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  taskId: string;
  weekTitle: string;
  /** Pre-set values if the intention was already locked. */
  initial?: { when: string; where: string; first: string } | null;
  /** Called after the plan is locked so the parent can reveal "Open this week". */
  onLocked?: () => void;
}

export default function WeekIntention({ taskId, weekTitle, initial, onLocked }: Props) {
  const [locked, setLocked] = useState(!!initial);
  const [when, setWhen] = useState(initial?.when ?? "");
  const [where, setWhere] = useState(initial?.where ?? "");
  const [first, setFirst] = useState(initial?.first ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = when.trim().length >= 3 && where.trim().length >= 3 && first.trim().length >= 5;

  const lockIn = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/intentions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, when, where, first }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not lock in your plan.");
      setLocked(true);
      onLocked?.();
      // Reload so the server re-renders with the plan locked and "Open this
      // week" revealed.
      setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Locked state - quiet reminder of the committed plan.
  if (locked) {
    return (
      <div
        style={{
          padding: "0.875rem 1rem",
          borderRadius: 10,
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.22)",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.5rem" }}>
          <CheckCircle2 size={13} color="var(--green)" />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--green)" }}>
            Your plan for this week
          </span>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text-primary)" }}>{when}</strong>, at{" "}
          <strong style={{ color: "var(--text-primary)" }}>{where}</strong>. First action:{" "}
          <strong style={{ color: "var(--text-primary)" }}>{first}</strong>
        </p>
      </div>
    );
  }

  // Gate state - must commit a plan before the week opens.
  const inputStyle: React.CSSProperties = { fontSize: "0.875rem" };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: "0.625rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-dim)",
    marginBottom: "0.3rem",
  };

  return (
    <div
      style={{
        padding: "1.125rem 1.25rem",
        borderRadius: 12,
        background: "var(--bg-card)",
        border: "1px solid rgba(245,158,11,0.3)",
        marginBottom: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
        <Target size={16} color="var(--accent)" />
        <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1rem" }}>Before you open {weekTitle}</h3>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", lineHeight: 1.55, marginBottom: "1rem" }}>
        Commit your plan first. People who decide exactly when, where, and what-first are roughly twice as
        likely to actually do the work. Two minutes now. Be specific.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div>
          <label style={labelStyle}>When this week will you work?</label>
          <input
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            placeholder="e.g. Tuesday and Thursday, 7-9pm"
            className="forge-input"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Where?</label>
          <input
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="e.g. the library, desk by the window"
            className="forge-input"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>What is the very first action?</label>
          <input
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            placeholder="e.g. download the dataset and open Day 1's video"
            className="forge-input"
            style={inputStyle}
          />
        </div>
        {error && (
          <p style={{ color: "var(--red)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>{error}</p>
        )}
        <button
          type="button"
          onClick={lockIn}
          disabled={!ready || submitting}
          className="forge-btn forge-btn-primary"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.625rem 1rem", fontSize: "0.875rem", opacity: ready ? 1 : 0.5 }}
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
          Lock in my plan
        </button>
      </div>
    </div>
  );
}
