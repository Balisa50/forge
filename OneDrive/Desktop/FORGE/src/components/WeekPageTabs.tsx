"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, Play, FileText, PenLine, Circle, Lock, Target, Code2, HelpCircle,
  ExternalLink, ChevronDown,
} from "lucide-react";
import type { RoadmapWeek } from "@/lib/roadmaps";
import ResourceViewer from "@/components/ResourceViewer";

/**
 * Single linear week flow — no tabs, no repetition.
 *
 *  ┌─ Day 1 ──── OPEN (the only one you can act on right now)
 *  ├─ Day 2 ──── 🔒 collapsed until Day 1 is 100% done
 *  ├─ Day 3 ──── 🔒
 *  └─ Day 7 ──── 🔒
 *  ╰─ When every day is done → "Ship it" section unlocks with project + exercises
 *
 * Past days collapse with ✓, future days collapse with 🔒. The current day —
 * the first day that isn't 100% — is the only one expanded by default. Users
 * can manually expand a past day to revisit it.
 *
 * Videos that are YouTube SEARCH urls (which YouTube refuses to iframe) open
 * in a new tab. Real watch-URLs embed inline via ResourceViewer.
 */

/**
 * YouTube embedding is a permanent source of pain: wrong video IDs, deleted
 * videos, channel "embedding disabled" flags, search-URLs that can't iframe,
 * and the dreaded "Error 153 — Video player configuration error". We bail on
 * the whole thing. Every YouTube link opens in a new tab; only docs / PDFs
 * / non-YouTube URLs go through the in-app viewer.
 */
function shouldOpenInNewTab(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
  } catch { return false; }
}

export default function WeekPageTabs({ week, slug }: { week: RoadmapWeek; slug: string }) {
  const hasDays = !!week.days && week.days.length > 0;
  const [viewer, setViewer] = useState<{ url: string; label: string } | null>(null);

  const storageKey = `forge:progress:${slug}:w${week.number}`;
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { setDone(JSON.parse(window.localStorage.getItem(storageKey) ?? "{}")); } catch { /* */ }
  }, [storageKey]);
  const toggle = (key: string) => {
    const next = { ...done, [key]: !done[key] };
    setDone(next);
    if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

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

  // Allow the user to manually expand a completed day to revisit it.
  const [manuallyOpen, setManuallyOpen] = useState<Record<number, boolean>>({});
  const isOpen = (idx: number) => idx === currentDayIdx || manuallyOpen[idx];

  // Open video/resource. YouTube always goes to a new tab — its iframe is
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
    return (
      <div className="flex flex-col gap-6">
        {week.context && <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.65 }}>{week.context}</p>}
        <ShipItSection week={week} />
        {viewer && <ResourceViewer url={viewer.url} label={viewer.label} onClose={() => setViewer(null)} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Intro: one paragraph, no headings, no repetition */}
      {week.context && (
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65, marginBottom: "0.5rem" }}>
          {week.context}
        </p>
      )}

      {/* Day stream */}
      {week.days.map((d, idx) => {
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
                if (isLocked) return;
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
                cursor: isLocked ? "not-allowed" : isCurrent ? "default" : "pointer",
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
                  Day {d.number} — {d.title}
                </p>
                {isLocked && (
                  <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginTop: "0.25rem", fontFamily: "var(--font-mono)" }}>
                    Finish Day {d.number - 1} to unlock
                  </p>
                )}
                {!isLocked && isCurrent && (
                  <p style={{ color: "var(--accent)", fontSize: "0.75rem", marginTop: "0.25rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Today
                  </p>
                )}
                {!isLocked && isDone && !isCurrent && (
                  <p style={{ color: "var(--green)", fontSize: "0.75rem", marginTop: "0.25rem", fontFamily: "var(--font-mono)" }}>
                    Done
                  </p>
                )}
              </div>

              {!isLocked && !isCurrent && (
                <ChevronDown size={16} style={{ color: "var(--text-dim)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              )}
            </button>

            {open && !isLocked && (
              <div style={{ padding: "0 1.125rem 1.125rem 1.125rem", borderTop: "1px solid var(--border)" }}>
                {d.summary && (
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.55, padding: "0.875rem 0 0.75rem" }}>
                    {d.summary}
                  </p>
                )}

                <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: d.summary ? 0 : "0.875rem" }}>
                  {d.items.map((item, i) => {
                    const key = `d${d.number}-i${i}`;
                    const checked = !!done[key];
                    const Icon = item.kind === "video" ? Play : item.kind === "reading" ? FileText : item.kind === "exercise" ? Code2 : PenLine;
                    const accent = item.kind === "video" ? "#fb7185" : item.kind === "reading" ? "#60a5fa" : item.kind === "exercise" ? "#34d399" : "#c084fc";
                    const kindLabel = item.kind === "video" ? "Watch" : item.kind === "reading" ? "Read" : item.kind === "exercise" ? "Build" : "Reflect";
                    const clickable = !!item.url;

                    return (
                      <li key={i}
                        style={{
                          background: checked ? "rgba(34,197,94,0.06)" : "var(--bg-card)",
                          border: checked ? "1px solid rgba(34,197,94,0.22)" : "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "0.75rem 0.875rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                          <button
                            onClick={() => toggle(key)}
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0, marginTop: "0.125rem" }}
                            aria-label={checked ? "Mark not done" : "Mark done"}
                          >
                            {checked
                              ? <CheckCircle2 size={20} style={{ color: "var(--green)" }} />
                              : <Circle size={20} style={{ color: "var(--text-dim)" }} />}
                          </button>

                          <span style={{ width: 26, height: 26, borderRadius: 6, background: `${accent}1f`, color: accent, display: "grid", placeItems: "center", flexShrink: 0, marginTop: "0.0625rem" }}>
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
                            {item.body && (
                              <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                {item.body}
                              </p>
                            )}
                            {clickable && (
                              <button
                                type="button"
                                onClick={() => openItem(item.url!, item.title)}
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
                                {item.kind === "video" ? <Play size={11} /> : <ExternalLink size={11} />}
                                {item.kind === "video" ? "Play video" : "Open"}
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </article>
        );
      })}

      {/* Ship-it section — only when every day is done */}
      {allDone && (
        <div className="forge-panel" style={{ padding: "1.25rem", border: "1px solid rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
            <CheckCircle2 size={22} style={{ color: "var(--green)" }} />
            <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", fontWeight: 700 }}>
              All 7 days done — now ship Week {week.number}
            </h3>
          </div>
          <ShipItSection week={week} />
        </div>
      )}

      {viewer && <ResourceViewer url={viewer.url} label={viewer.label} onClose={() => setViewer(null)} />}
    </div>
  );
}

/** End-of-week summary: project + exercises + reflection. Compact, no tabs. */
function ShipItSection({ week }: { week: RoadmapWeek }) {
  return (
    <div className="flex flex-col gap-5">
      {week.project && (
        <div>
          <h4 style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Target size={16} style={{ color: "#fb923c" }} /> Build this week
          </h4>
          <p style={{ color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.65, background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.22)", padding: "0.875rem 1rem", borderRadius: 8 }}>
            {week.project}
          </p>
        </div>
      )}

      {week.exercises.length > 0 && (
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

      {week.questions.length > 0 && (
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

      {week.outputs.length > 0 && (
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
