"use client";

/**
 * PathMap — the concept index for one exam path, progress-aware.
 *
 * The server hands down a trimmed, fully-serializable view of the path
 * (modules → concepts). All mastery state lives in localStorage, so this is a
 * client component: it reads live progress via useExamProgress and paints each
 * concept with its status (not-started / in-progress / mastered) and a "review
 * due" flag when spaced repetition has resurfaced it.
 */

import Link from "next/link";
import { CheckCircle2, Circle, CircleDot, AlarmClock } from "lucide-react";
import { useExamProgress, getConcept, summarize, type ConceptStatus } from "@/lib/examProgress";

export interface PathMapConcept {
  id: string;
  title: string;
  tagline: string;
  minutes: number;
}
export interface PathMapModule {
  id: string;
  title: string;
  weight: string;
  blurb: string;
  concepts: PathMapConcept[];
}
interface Props {
  slug: string;
  gradient: string;
  modules: PathMapModule[];
}

const STATUS_META: Record<ConceptStatus, { label: string; color: string }> = {
  "not-started": { label: "Not started", color: "var(--text-dim)" },
  "in-progress": { label: "In progress", color: "#d4af37" },
  mastered: { label: "Mastered", color: "#34d399" },
};

export default function PathMap({ slug, gradient, modules }: Props) {
  const { progress, ready } = useExamProgress(slug);
  const stats = summarize(progress);
  const total = modules.reduce((s, m) => s + m.concepts.length, 0);
  const pct = total ? Math.round((stats.mastered / total) * 100) : 0;

  return (
    <div>
      {/* Live overall progress */}
      <div
        className="mb-10 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-5"
        style={{ opacity: ready ? 1 : 0.6, transition: "opacity 0.3s" }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.18em", color: "var(--accent)", textTransform: "uppercase" }}>
            Your mastery
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            {stats.mastered}/{total} concepts · {pct}%
          </p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div className={`h-full bg-gradient-to-r ${gradient}`} style={{ width: `${pct}%`, transition: "width 0.5s ease" }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-4" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
          <span className="inline-flex items-center gap-1.5"><CircleDot size={12} style={{ color: "#d4af37" }} /> {stats.inProgress} in progress</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={12} style={{ color: "#34d399" }} /> {stats.mastered} mastered</span>
          {stats.dueCount > 0 && (
            <span className="inline-flex items-center gap-1.5" style={{ color: "#f59e0b" }}>
              <AlarmClock size={12} /> {stats.dueCount} due for review
            </span>
          )}
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-12">
        {modules.map((m, mi) => (
          <div key={m.id}>
            <div className="mb-5 flex flex-wrap items-baseline gap-3">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.24em", color: "var(--accent)", textTransform: "uppercase" }}>
                Module {mi + 1}
              </span>
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.375rem", fontWeight: 700 }}>{m.title}</h2>
              <span
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", border: "1px solid var(--border)", borderRadius: 999, padding: "1px 8px" }}
              >
                SOA weight {m.weight}
              </span>
            </div>
            <p className="mb-4" style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.55, maxWidth: 720 }}>
              {m.blurb}
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {m.concepts.map((c) => {
                const cp = getConcept(progress, c.id);
                const due = cp.status === "mastered" && cp.dueAt != null && cp.dueAt <= Date.now();
                const sm = STATUS_META[cp.status];
                const Icon = cp.status === "mastered" ? CheckCircle2 : cp.status === "in-progress" ? CircleDot : Circle;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/learn/exam/${slug}/${c.id}`}
                      className="group flex h-full items-start gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-4 transition hover:border-[color:var(--accent)] hover:bg-[color:var(--bg-elev)]"
                    >
                      <Icon size={18} style={{ color: sm.color, flexShrink: 0, marginTop: 2 }} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate" style={{ fontSize: "1rem", fontWeight: 600 }}>{c.title}</h3>
                          {due && (
                            <span
                              className="inline-flex items-center gap-1 shrink-0"
                              style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", letterSpacing: "0.1em", color: "#f59e0b", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 999, padding: "1px 6px", textTransform: "uppercase" }}
                            >
                              <AlarmClock size={9} /> review
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5" style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", lineHeight: 1.5 }}>
                          {c.tagline}
                        </p>
                        <p className="mt-2 flex items-center gap-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)" }}>
                          <span>{c.minutes} min</span>
                          <span style={{ color: sm.color }}>{sm.label}</span>
                          {cp.best > 0 && <span>best {Math.round(cp.best * 100)}%</span>}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
