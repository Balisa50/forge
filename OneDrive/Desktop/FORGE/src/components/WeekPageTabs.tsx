"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, Play, FileText, PenLine, Circle, Lock, Target, Code2, HelpCircle,
  ExternalLink, ChevronDown, ArrowRight, Sparkles,
} from "lucide-react";
import type { RoadmapWeek } from "@/lib/roadmaps";
import ResourceViewer from "@/components/ResourceViewer";
import ConceptPrimer from "@/components/ConceptPrimer";
import ConceptWidget from "@/components/ConceptWidget";
import VideoEmbed from "@/components/VideoEmbed";
import ForgeMarkdown from "@/components/ForgeMarkdown";

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
 * Iframe embedding is unreliable in 2026: YouTube blocks search URLs, gov
 * sites set X-Frame-Options: DENY, news sites do the same, even Stack
 * Overflow blocks embeds. Rather than guess which ones work, we always
 * open external links in a new tab. Zero embed errors, ever.
 */
function shouldOpenInNewTab(_url: string): boolean {
  return true;
}

export default function WeekPageTabs({ week, slug }: { week: RoadmapWeek; slug: string }) {
  const hasDays = !!week.days && week.days.length > 0;
  const [viewer, setViewer] = useState<{ url: string; label: string } | null>(null);

  const storageKey = `forge:progress:${slug}:w${week.number}`;
  const [done, setDone] = useState<Record<string, boolean>>({});

  // Hydrate from server. Falls back to localStorage if briefly offline.
  // Any local keys the server doesn't yet have are pushed up (one-time
  // migration from the previous localStorage-only world).
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    (async () => {
      let local: Record<string, boolean> = {};
      try { local = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}"); } catch { /* */ }
      try {
        const res = await fetch(`/api/learn/progress?slug=${encodeURIComponent(slug)}&week=${week.number}`);
        if (res.ok) {
          const data = await res.json();
          const server: Record<string, boolean> = {};
          for (const k of (data.items ?? []) as string[]) server[k] = true;
          const localOnly = Object.keys(local).filter((k) => local[k] && !server[k]);
          if (localOnly.length > 0) {
            const sync: Record<string, boolean> = {};
            for (const k of localOnly) { sync[k] = true; server[k] = true; }
            void fetch("/api/learn/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug, week: week.number, items: sync }),
            });
          }
          if (!cancelled) {
            setDone(server);
            window.localStorage.setItem(storageKey, JSON.stringify(server));
          }
          return;
        }
      } catch { /* offline — fall back to local */ }
      if (!cancelled) setDone(local);
    })();
    return () => { cancelled = true; };
  }, [storageKey, slug, week.number]);

  const syncToServer = (items: Record<string, boolean>) => {
    void fetch("/api/learn/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, week: week.number, items }),
    });
  };

  const persist = (next: Record<string, boolean>, changed: Record<string, boolean>) => {
    setDone(next);
    if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(next));
    if (Object.keys(changed).length > 0) syncToServer(changed);
  };
  const toggle = (key: string) => {
    const newVal = !done[key];
    persist({ ...done, [key]: newVal }, { [key]: newVal });
  };

  // Mark every item on a day done (or undo it). Used by the big primary button
  // at the bottom of the current day so the learner doesn't have to click each
  // circle individually.
  const markDay = (dayNumber: number, allDoneTarget: boolean) => {
    if (!week.days) return;
    const d = week.days.find((x) => x.number === dayNumber);
    if (!d) return;
    const next = { ...done };
    const changed: Record<string, boolean> = {};
    d.items.forEach((_, i) => {
      const k = `d${dayNumber}-i${i}`;
      next[k] = allDoneTarget;
      changed[k] = allDoneTarget;
    });
    persist(next, changed);
  };

  // Toast for clicking a locked day. Self-clearing after 2.4s.
  const [lockedToast, setLockedToast] = useState<string | null>(null);
  useEffect(() => {
    if (!lockedToast) return;
    const t = setTimeout(() => setLockedToast(null), 2400);
    return () => clearTimeout(t);
  }, [lockedToast]);

  // Brief "Day N done — Day N+1 unlocked" celebration. Tracks the highest day
  // index we've ever seen complete so we only fire on the rising edge.
  const [justUnlockedDay, setJustUnlockedDay] = useState<number | null>(null);
  const [maxDoneIdx, setMaxDoneIdx] = useState<number>(-1);

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

  // Fire celebration toast when a new day gets completed (current advances).
  // NOTE: only set state here — do NOT start the dismiss timer in this effect.
  // setMaxDoneIdx changes a dependency, so React would run this effect's
  // cleanup (clearing the timer) on the very next render, leaving the toast
  // stuck on screen forever. The auto-dismiss lives in its own effect below.
  useEffect(() => {
    const newlyDone = currentDayIdx - 1; // last index that just hit 100%
    if (newlyDone >= 0 && newlyDone > maxDoneIdx) {
      setMaxDoneIdx(newlyDone);
      // Only celebrate if we've actually loaded progress (avoid first-load fire).
      if (Object.keys(done).length > 0) {
        setJustUnlockedDay(newlyDone + 1); // 1-based day number
      }
    }
  }, [currentDayIdx, maxDoneIdx, done]);

  // Auto-dismiss the celebration toast. Keyed only on justUnlockedDay so the
  // timer survives unrelated re-renders (mirrors the lockedToast pattern).
  useEffect(() => {
    if (justUnlockedDay === null) return;
    const t = setTimeout(() => setJustUnlockedDay(null), 3200);
    return () => clearTimeout(t);
  }, [justUnlockedDay]);

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
    const fbPrimer = week.concept_primer
      || (week.context && week.context.trim().length >= 80 ? week.context : null);
    return (
      <div className="flex flex-col gap-6">
        {fbPrimer && <ConceptPrimer primer={fbPrimer} imageUrl={week.concept_image_url} />}
        {!fbPrimer && week.context && <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.65 }}>{week.context}</p>}
        {/* Interactive concept widget renders even on day-less weeks so the
            simulations reach every week of every path. */}
        {week.concept_widget && (
          <ConceptWidget id={week.concept_widget.id} params={week.concept_widget.params} caption={week.concept_widget.caption} />
        )}
        <WeekResources resources={week.resources} onOpen={openItem} />
        <ShipItSection week={week} />
        {viewer && <ResourceViewer url={viewer.url} label={viewer.label} onClose={() => setViewer(null)} />}
      </div>
    );
  }

  // Concept primer fallback — every week with a substantial `context` paragraph
  // automatically gets the new visual primer treatment, even if no hand-authored
  // `concept_primer` exists in the JSON. This way the new aesthetic ships across
  // all 240 weeks of all 10 paths immediately, without 240 stub backfills.
  //
  // Authored primer takes precedence (mentors can override the fallback by
  // writing `concept_primer` in the week JSON). Sparse weeks (< 80 chars of
  // context) skip the card and render inline.
  const effectivePrimer = week.concept_primer
    || (week.context && week.context.trim().length >= 80 ? week.context : null);
  const showInlineContext = !effectivePrimer && week.context;

  return (
    <div className="flex flex-col gap-3">
      {/* Visual-first concept primer — uses authored content if present,
          otherwise promotes the week's `context` paragraph. */}
      {effectivePrimer && (
        <ConceptPrimer primer={effectivePrimer} imageUrl={week.concept_image_url} />
      )}

      {/* Interactive concept widget — the living simulation for this week.
          Sits right under the primer so the learner plays with the idea
          before reading the day-by-day plan. */}
      {week.concept_widget && (
        <ConceptWidget
          id={week.concept_widget.id}
          params={week.concept_widget.params}
          caption={week.concept_widget.caption}
        />
      )}

      {/* Fallback inline intro for sparse-context weeks */}
      {showInlineContext && (
        <div style={{ marginBottom: "0.5rem" }}>
          <ForgeMarkdown>{week.context}</ForgeMarkdown>
        </div>
      )}

      {/* Curated resources — the videos/readings that teach the week. Surfaced
          here so the learner actually learns, not just copies code from the
          day exercises. */}
      <WeekResources resources={week.resources} onOpen={openItem} />

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
                if (isLocked) {
                  setLockedToast(`Day ${d.number} unlocks when you finish Day ${d.number - 1}`);
                  return;
                }
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
                cursor: isLocked ? "help" : isCurrent ? "default" : "pointer",
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
                {!isLocked && (
                  <>
                    {/* Per-day progress bar — visible at all times for active/done days */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginTop: "0.4rem",
                    }}>
                      <div style={{
                        flex: 1,
                        maxWidth: 220,
                        height: 4,
                        borderRadius: 2,
                        background: "var(--bg-card)",
                        overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: isDone
                            ? "linear-gradient(90deg, #22c55e, #16a34a)"
                            : isCurrent
                              ? "linear-gradient(90deg, var(--accent), #f0c75c)"
                              : "var(--accent)",
                          transition: "width 0.45s cubic-bezier(.16,1,.3,1)",
                          borderRadius: 2,
                        }} />
                      </div>
                      <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6875rem",
                        color: isDone ? "var(--green)" : isCurrent ? "var(--accent)" : "var(--text-dim)",
                        letterSpacing: "0.06em",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}>
                        {d.items.filter((_, i) => done[`d${d.number}-i${i}`]).length}/{d.items.length}
                        {isDone && (
                          <span style={{
                            marginLeft: 6,
                            padding: "1px 6px",
                            borderRadius: 999,
                            background: "rgba(34,197,94,0.12)",
                            border: "1px solid rgba(34,197,94,0.3)",
                            fontSize: "0.5625rem",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                          }}>
                            Sealed
                          </span>
                        )}
                        {isCurrent && !isDone && (
                          <span style={{
                            marginLeft: 6,
                            padding: "1px 6px",
                            borderRadius: 999,
                            background: "rgba(245,158,11,0.1)",
                            border: "1px solid rgba(245,158,11,0.3)",
                            fontSize: "0.5625rem",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                          }}>
                            Today
                          </span>
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {!isLocked && !isCurrent && (
                <ChevronDown size={16} style={{ color: "var(--text-dim)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              )}
            </button>

            {open && !isLocked && (
              <div style={{ padding: "0 1.125rem 1.125rem 1.125rem", borderTop: "1px solid var(--border)" }}>
                {d.summary && (
                  <div style={{ padding: "0.875rem 0 0.25rem" }}>
                    <ForgeMarkdown>{d.summary}</ForgeMarkdown>
                  </div>
                )}

                <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: d.summary ? 0 : "0.875rem" }}>
                  {d.items.map((item, i) => {
                    const key = `d${d.number}-i${i}`;
                    const checked = !!done[key];
                    const Icon = item.kind === "video" ? Play : item.kind === "reading" ? FileText : item.kind === "exercise" ? Code2 : item.kind === "widget" ? Sparkles : PenLine;
                    const accent = item.kind === "video" ? "#fb7185" : item.kind === "reading" ? "#60a5fa" : item.kind === "exercise" ? "#34d399" : item.kind === "widget" ? "#D4AF37" : "#c084fc";
                    const kindLabel = item.kind === "video" ? "Watch" : item.kind === "reading" ? "Read" : item.kind === "exercise" ? "Build" : item.kind === "widget" ? "Explore" : "Reflect";
                    const clickable = !!item.url;

                    return (
                      <li key={i}
                        style={{
                          background: checked ? "rgba(34,197,94,0.06)" : "var(--bg-card)",
                          border: checked ? "1px solid rgba(34,197,94,0.22)" : "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "0.75rem 0.875rem",
                          transition: "background 0.3s, border-color 0.3s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                          <button
                            onClick={() => toggle(key)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              flexShrink: 0,
                              marginTop: "0.125rem",
                              position: "relative",
                              width: 20, height: 20,
                            }}
                            aria-label={checked ? "Mark not done" : "Mark done"}
                          >
                            <span style={{
                              position: "absolute",
                              inset: 0,
                              display: "grid",
                              placeItems: "center",
                              transform: checked ? "scale(1)" : "scale(0)",
                              opacity: checked ? 1 : 0,
                              transition: "transform 0.32s cubic-bezier(.22,1.4,.36,1), opacity 0.2s",
                            }}>
                              <CheckCircle2 size={20} style={{ color: "var(--green)" }} />
                            </span>
                            <span style={{
                              position: "absolute",
                              inset: 0,
                              display: "grid",
                              placeItems: "center",
                              transform: checked ? "scale(0)" : "scale(1)",
                              opacity: checked ? 0 : 1,
                              transition: "transform 0.2s, opacity 0.15s",
                            }}>
                              <Circle size={20} style={{ color: "var(--text-dim)" }} />
                            </span>
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
                              <div style={{ marginTop: "0.5rem" }}>
                                <ForgeMarkdown>{item.body}</ForgeMarkdown>
                              </div>
                            )}
                            {/* Inline interactive widget for widget-kind items.
                                Ticking the item happens via the normal checkbox —
                                playing with it is the engagement, no Open button. */}
                            {item.kind === "widget" && item.widget && (
                              <div style={{ marginTop: "0.625rem" }}>
                                <ConceptWidget
                                  id={item.widget.id}
                                  params={item.widget.params}
                                  caption={item.widget.caption}
                                />
                              </div>
                            )}
                            {/* Inline VideoEmbed for video items with YouTube/Loom URLs.
                                Other resources (readings, exercises) keep the Open button.
                                Video URLs that aren't embeddable (e.g. /search?...) fall
                                through to the VideoEmbed's own external-link fallback. */}
                            {clickable && item.kind === "video" && (
                              <div
                                style={{ marginTop: "0.625rem" }}
                                onClick={() => {
                                  if (!done[key]) persist({ ...done, [key]: true }, { [key]: true });
                                }}
                              >
                                <VideoEmbed url={item.url!} title={undefined} bare lazy />
                              </div>
                            )}
                            {clickable && item.kind !== "video" && (
                              <button
                                type="button"
                                onClick={() => {
                                  openItem(item.url!, item.title);
                                  // Opening a resource auto-ticks the item — engagement
                                  // proof. Mentee can still untick if it was a mis-click.
                                  if (!done[key]) {
                                    persist({ ...done, [key]: true }, { [key]: true });
                                  }
                                }}
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
                                <ExternalLink size={11} />
                                Open
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Day footer: one-click mark done / undo */}
                <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.05em" }}>
                    {d.items.filter((_, i) => done[`d${d.number}-i${i}`]).length}/{d.items.length} items · {pct}%
                  </p>
                  {isDone ? (
                    <button
                      onClick={() => markDay(d.number, false)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "0.375rem",
                        background: "transparent", color: "var(--text-dim)",
                        border: "1px solid var(--border)", borderRadius: 6,
                        padding: "0.4375rem 0.875rem", cursor: "pointer",
                        fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.05em",
                        fontWeight: 600,
                      }}
                    >
                      Undo · re-do Day {d.number}
                    </button>
                  ) : (() => {
                    // Engagement gate: the Mark-done button is ONLY enabled
                    // once every item on the day is individually ticked.
                    // No more bulk-bypass.
                    const allItemsTicked = d.items.every((_, i) => done[`d${d.number}-i${i}`]);
                    const missing = d.items.length - d.items.filter((_, i) => done[`d${d.number}-i${i}`]).length;
                    return (
                      <button
                        onClick={() => allItemsTicked && markDay(d.number, true)}
                        disabled={!allItemsTicked}
                        title={allItemsTicked ? "" : `Tick every item above first (${missing} left). Open the links — they auto-tick when you do.`}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.375rem",
                          background: allItemsTicked ? "var(--accent)" : "var(--bg-card)",
                          color: allItemsTicked ? "#000" : "var(--text-dim)",
                          border: allItemsTicked ? "none" : "1px solid var(--border)",
                          borderRadius: 6,
                          padding: "0.5rem 1rem",
                          cursor: allItemsTicked ? "pointer" : "not-allowed",
                          fontFamily: "var(--font-body)", fontSize: "0.8125rem", letterSpacing: "0.02em",
                          fontWeight: 700,
                          opacity: allItemsTicked ? 1 : 0.7,
                        }}
                      >
                        {allItemsTicked ? <CheckCircle2 size={14} /> : <Lock size={14} />}
                        {allItemsTicked
                          ? `Mark Day ${d.number} done`
                          : `${missing} item${missing === 1 ? "" : "s"} left to tick`}
                        {allItemsTicked && idx + 1 < (week.days?.length ?? 0) && <ArrowRight size={14} />}
                      </button>
                    );
                  })()}
                </div>
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

      {/* Floating toast: locked-day tap */}
      {lockedToast && (
        <div
          role="status"
          style={{
            position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
            background: "var(--bg-panel)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "0.625rem 1rem",
            color: "var(--text-primary)", fontSize: "0.8125rem",
            display: "flex", alignItems: "center", gap: "0.5rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <Lock size={14} style={{ color: "var(--accent)" }} />
          {lockedToast}
        </div>
      )}

      {/* Celebration banner: day just unlocked */}
      {justUnlockedDay !== null && (
        <div
          role="status"
          style={{
            position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
            background: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(245,158,11,0.12))",
            border: "1px solid rgba(34,197,94,0.4)",
            borderRadius: 10, padding: "0.75rem 1.125rem",
            color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600,
            display: "flex", alignItems: "center", gap: "0.5rem",
            boxShadow: "0 8px 32px rgba(34,197,94,0.25)", zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <Sparkles size={16} style={{ color: "var(--green)" }} />
          Day {justUnlockedDay} done
          {(week.days && justUnlockedDay < week.days.length) && (
            <>
              <ArrowRight size={14} style={{ color: "var(--accent)" }} />
              Day {justUnlockedDay + 1} unlocked
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Curated learn-first resources for the week (videos + readings). These live
 *  on the week JSON's `resources` array but were previously only shown on the
 *  roadmap overview — so mentees never saw them and were left copying code from
 *  the day exercises. Surfaced at the top of the week so they learn first. */
function WeekResources({
  resources,
  onOpen,
}: {
  resources?: { label: string; url: string; note?: string }[];
  onOpen: (url: string, label: string) => void;
}) {
  if (!resources || resources.length === 0) return null;
  const isVid = (u: string) => /youtube\.com|youtu\.be|vimeo\.com|loom\.com/.test(u);
  return (
    <div className="forge-panel" style={{ padding: "1.125rem 1.25rem", border: "1px solid rgba(96,165,250,0.28)", background: "linear-gradient(180deg, rgba(96,165,250,0.05), rgba(96,165,250,0.01))" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
        <Play size={16} style={{ color: "#60a5fa" }} />
        <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.0625rem", fontWeight: 700 }}>
          Learn first — watch &amp; read
        </h3>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.08em" }}>
          {resources.length} resources
        </span>
      </div>
      <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: "0.875rem" }}>
        Go through these before the exercises below. Understand the idea first, then build it yourself — don&apos;t just copy the code.
      </p>
      <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", listStyle: "none", padding: 0, margin: 0 }}>
        {resources.map((r, i) => {
          const video = isVid(r.url);
          const accent = video ? "#fb7185" : "#60a5fa";
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onOpen(r.url, r.label)}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  display: "flex", alignItems: "flex-start", gap: "0.75rem",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 8, padding: "0.75rem 0.875rem",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <span style={{ width: 28, height: 28, borderRadius: 7, background: `${accent}1f`, color: accent, display: "grid", placeItems: "center", flexShrink: 0, marginTop: "0.0625rem" }}>
                  {video ? <Play size={14} /> : <FileText size={14} />}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: accent }}>
                      {video ? "Watch" : "Read"}
                    </span>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.35 }}>
                      {r.label}
                    </span>
                  </span>
                  {r.note && (
                    <span style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.8125rem", lineHeight: 1.5, marginTop: "0.2rem" }}>
                      {r.note}
                    </span>
                  )}
                </span>
                <ExternalLink size={13} style={{ color: "var(--text-dim)", flexShrink: 0, marginTop: "0.2rem" }} />
              </button>
            </li>
          );
        })}
      </ul>
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
          <div style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.22)", padding: "0.875rem 1rem 0.125rem", borderRadius: 8 }}>
            <ForgeMarkdown>{week.project}</ForgeMarkdown>
          </div>
        </div>
      )}

      {(week.exercises?.length ?? 0) > 0 && week.exercises && (
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

      {(week.questions?.length ?? 0) > 0 && week.questions && (
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

      {(week.outputs?.length ?? 0) > 0 && week.outputs && (
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
