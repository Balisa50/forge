"use client";

/**
 * ConceptStatusBar — the live status strip at the top of a concept page.
 *
 * Two jobs: (1) mark the concept opened on mount (not-started → in-progress)
 * so the path map reflects that it's been touched; (2) show the current state —
 * best score, attempts, and the next spaced-repetition review date once
 * mastered. Reads live so it updates the instant the quiz below records a pass.
 */

import { useEffect } from "react";
import { CheckCircle2, CircleDot, Circle, CalendarClock } from "lucide-react";
import { useExamProgress, getConcept, markOpened } from "@/lib/examProgress";

function fmtDue(dueAt: number): string {
  const ms = dueAt - Date.now();
  if (ms <= 0) return "due now";
  const days = Math.round(ms / 86_400_000);
  if (days >= 1) return `in ${days} day${days === 1 ? "" : "s"}`;
  const hrs = Math.max(1, Math.round(ms / 3_600_000));
  return `in ${hrs} hr${hrs === 1 ? "" : "s"}`;
}

export default function ConceptStatusBar({ slug, conceptId }: { slug: string; conceptId: string }) {
  const { progress, ready } = useExamProgress(slug);

  useEffect(() => {
    markOpened(slug, conceptId);
  }, [slug, conceptId]);

  const c = getConcept(progress, conceptId);
  const Icon = c.status === "mastered" ? CheckCircle2 : c.status === "in-progress" ? CircleDot : Circle;
  const color = c.status === "mastered" ? "#34d399" : c.status === "in-progress" ? "#d4af37" : "var(--text-dim)";
  const label = c.status === "mastered" ? "Mastered" : c.status === "in-progress" ? "In progress" : "Not started";

  return (
    <div
      className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] px-4 py-2.5"
      style={{ opacity: ready ? 1 : 0.5, transition: "opacity 0.3s" }}
    >
      <span className="inline-flex items-center gap-1.5" style={{ fontSize: "0.8125rem", fontWeight: 600, color }}>
        <Icon size={15} /> {label}
      </span>
      {c.attempts > 0 && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
          best {Math.round(c.best * 100)}% · {c.attempts} attempt{c.attempts === 1 ? "" : "s"}
        </span>
      )}
      {c.status === "mastered" && c.dueAt != null && (
        <span className="inline-flex items-center gap-1.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: c.dueAt <= Date.now() ? "#f59e0b" : "var(--text-dim)" }}>
          <CalendarClock size={12} /> review {fmtDue(c.dueAt)}
        </span>
      )}
    </div>
  );
}
