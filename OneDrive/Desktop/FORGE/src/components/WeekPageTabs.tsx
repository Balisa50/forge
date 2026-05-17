"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen, ClipboardCheck, Target, Library, HelpCircle, Code2,
  CheckCircle2, Play, FileText, PenLine, Circle, ChevronRight, ArrowRight, Lock,
} from "lucide-react";
import type { RoadmapWeek } from "@/lib/roadmaps";
import { normaliseResource } from "@/lib/normalize-resource";
import ResourceViewer from "@/components/ResourceViewer";

type Tab = "days" | "overview" | "project";

export default function WeekPageTabs({ week, slug }: { week: RoadmapWeek; slug: string }) {
  const hasDays = !!week.days && week.days.length > 0;
  const [tab, setTab] = useState<Tab>(hasDays ? "days" : "overview");
  const [viewer, setViewer] = useState<{ url: string; label: string } | null>(null);

  // Per-item progress in localStorage. Keyed by slug+week+day+itemIndex so
  // every week of every roadmap stays isolated.
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

  // Day-by-day completion + unlock progression
  const dayCompletion = useMemo(() => {
    if (!hasDays || !week.days) return [];
    return week.days.map((d) => {
      const total = d.items.length || 1;
      const completed = d.items.filter((_, i) => done[`d${d.number}-i${i}`]).length;
      return { day: d, total, completed, pct: Math.round((completed / total) * 100) };
    });
  }, [week.days, hasDays, done]);

  const dayUnlocked = (n: number) => {
    if (n === 1) return true;
    const prev = dayCompletion[n - 2];
    return prev ? prev.pct === 100 : false;
  };

  return (
    <div>
      {/* Tab strip */}
      <div role="tablist" aria-label="Week sections" style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--border)", marginBottom: "1.25rem", overflowX: "auto" }}>
        {hasDays && (
          <TabBtn active={tab === "days"} onClick={() => setTab("days")} label="Day by day" />
        )}
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")} label="Overview" />
        <TabBtn active={tab === "project"} onClick={() => setTab("project")} label="Project & exercises" />
      </div>

      {/* ─── DAYS TAB ──────────────────────────────────────────────── */}
      {tab === "days" && hasDays && week.days && (
        <div className="flex flex-col gap-4">
          {week.days.map((d, idx) => {
            const meta = dayCompletion[idx];
            const unlocked = dayUnlocked(d.number);
            return (
              <article key={d.number} className="forge-panel" style={{ padding: "1.25rem", opacity: unlocked ? 1 : 0.55 }}>
                <header className="flex items-center justify-between gap-3" style={{ marginBottom: d.summary ? "0.625rem" : "0.875rem" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: meta && meta.pct === 100 ? "rgba(34,197,94,0.18)" : "rgba(245,158,11,0.12)",
                        color: meta && meta.pct === 100 ? "var(--green)" : "var(--accent)",
                        fontFamily: "var(--font-mono)", fontSize: "0.75rem", display: "grid", placeItems: "center",
                      }}
                    >
                      {meta && meta.pct === 100 ? <CheckCircle2 size={16} /> : !unlocked ? <Lock size={13} /> : `D${d.number}`}
                    </span>
                    <div className="min-w-0">
                      <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Day {d.number} · {d.title}</h3>
                      {d.summary && <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "0.125rem" }}>{d.summary}</p>}
                    </div>
                  </div>
                  {meta && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", flexShrink: 0 }}>
                      {meta.completed}/{meta.total}
                    </span>
                  )}
                </header>

                {unlocked && (
                  <ul className="flex flex-col gap-2">
                    {d.items.map((item, i) => {
                      const key = `d${d.number}-i${i}`;
                      const checked = !!done[key];
                      const Icon = item.kind === "video" ? Play : item.kind === "reading" ? FileText : item.kind === "exercise" ? Code2 : PenLine;
                      const accent = item.kind === "video" ? "#fb7185" : item.kind === "reading" ? "#60a5fa" : item.kind === "exercise" ? "#34d399" : "#c084fc";
                      const clickable = !!item.url;
                      return (
                        <li key={i}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.625rem",
                              padding: "0.625rem 0.75rem",
                              background: checked ? "rgba(34,197,94,0.05)" : "var(--bg-card)",
                              border: checked ? "1px solid rgba(34,197,94,0.25)" : "1px solid var(--border)",
                              borderRadius: 8,
                            }}
                          >
                            <button
                              onClick={() => toggle(key)}
                              style={{ background: "none", border: "none", padding: "0.25rem", cursor: "pointer", flexShrink: 0 }}
                              aria-label={checked ? "Mark not done" : "Mark done"}
                            >
                              {checked
                                ? <CheckCircle2 size={20} style={{ color: "var(--green)" }} />
                                : <Circle size={20} style={{ color: "var(--text-dim)" }} />
                              }
                            </button>
                            <span style={{ width: 26, height: 26, borderRadius: 6, background: `${accent}1a`, color: accent, display: "grid", placeItems: "center", flexShrink: 0 }}>
                              <Icon size={13} />
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <button
                                type="button"
                                onClick={() => clickable && item.url && setViewer({ url: item.url, label: item.title })}
                                style={{
                                  background: "none", border: "none", padding: 0, textAlign: "left",
                                  cursor: clickable ? "pointer" : "default",
                                  display: "block", width: "100%",
                                }}
                              >
                                <span style={{ display: "block", fontSize: "0.9375rem", fontWeight: 500, color: "var(--text-primary)" }}>{item.title}</span>
                                {(item.duration_min || item.creator || item.why) && (
                                  <span style={{ display: "block", color: "var(--text-dim)", fontSize: "0.75rem", marginTop: "0.125rem", fontFamily: "var(--font-mono)" }}>
                                    {item.duration_min ? `${item.duration_min} min · ` : ""}{item.creator ? `${item.creator}` : ""}
                                    {item.why ? `${item.duration_min || item.creator ? " · " : ""}${item.why}` : ""}
                                  </span>
                                )}
                              </button>
                              {item.body && (
                                <p style={{ marginTop: "0.375rem", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                  {item.body}
                                </p>
                              )}
                            </div>
                            {clickable && (
                              <ChevronRight size={16} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {!unlocked && (
                  <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", margin: 0 }}>
                    Finish Day {d.number - 1} to unlock.
                  </p>
                )}
              </article>
            );
          })}

          {/* Bottom CTA when all days done */}
          {dayCompletion.length > 0 && dayCompletion.every((d) => d.pct === 100) && (
            <div className="forge-panel" style={{ padding: "1.25rem", textAlign: "center", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <CheckCircle2 size={28} style={{ color: "var(--green)", margin: "0 auto 0.5rem" }} />
              <p style={{ fontWeight: 600 }}>Week {week.number} complete.</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: "0.25rem 0 1rem" }}>
                Now ship the project and run your check-in.
              </p>
              <button onClick={() => setTab("project")} className="forge-btn forge-btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                Go to project & exercises <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── OVERVIEW TAB ──────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="flex flex-col gap-7">
          {week.context && (
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.6 }}>{week.context}</p>
          )}
          {week.topics.length > 0 && (
            <Section title="What you'll learn this week" icon={BookOpen} accent="#60a5fa">
              <ul className="grid gap-2 md:grid-cols-2">
                {week.topics.map((t, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px]" style={{ color: "var(--text-primary)", lineHeight: 1.55 }}>
                    <span style={{ color: "#60a5fa", flexShrink: 0 }}>•</span><span>{t}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {week.resources.length > 0 && (
            <Section title="Hand-picked resources" icon={Library} accent="#c084fc">
              <ul className="grid gap-2">
                {week.resources.map((raw, i) => {
                  const r = normaliseResource(raw);
                  return (
                    <li key={i}>
                      {r.url ? (
                        <button type="button" onClick={() => setViewer({ url: r.url, label: r.label })}
                          className="group flex w-full items-start gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-3.5 transition hover:border-[#c084fc] text-left">
                          <ChevronRight size={15} className="mt-1 shrink-0" style={{ color: "#c084fc" }} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14.5px] font-medium" style={{ color: "var(--text-primary)" }}>{r.label}</span>
                            {r.note && <span className="mt-0.5 block text-xs" style={{ color: "var(--text-dim)" }}>{r.note}</span>}
                          </span>
                        </button>
                      ) : (
                        <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-3.5 text-[14.5px]" style={{ color: "var(--text-primary)" }}>{r.label}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}
        </div>
      )}

      {/* ─── PROJECT & EXERCISES TAB ───────────────────────────────── */}
      {tab === "project" && (
        <div className="flex flex-col gap-7">
          {week.project && (
            <Section title="Build this — your real-world project" icon={Target} accent="#fb923c">
              <p className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-4 text-[15px]" style={{ color: "var(--text-primary)", lineHeight: 1.65 }}>
                {week.project}
              </p>
            </Section>
          )}
          {week.tasks.length > 0 && (
            <Section title="What to do" icon={ClipboardCheck} accent="#34d399">
              <ol className="space-y-2.5">
                {week.tasks.map((t, i) => (
                  <li key={i} className="flex gap-3 text-[15px]" style={{ color: "var(--text-primary)", lineHeight: 1.55 }}>
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold" style={{ background: "#34d39922", color: "#34d399", fontFamily: "var(--font-mono)" }}>{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}
          {week.exercises.length > 0 && (
            <Section title="Practice — try these" icon={Code2} accent="#38bdf8">
              <ol className="space-y-2.5">
                {week.exercises.map((e, i) => (
                  <li key={i} className="flex gap-3 text-[15px]" style={{ color: "var(--text-primary)", lineHeight: 1.55 }}>
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold" style={{ background: "#38bdf822", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>{i + 1}</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}
          {week.questions.length > 0 && (
            <Section title="Questions to ask yourself" icon={HelpCircle} accent="#f472b6">
              <div className="space-y-3">
                {week.questions.map((q, i) => (
                  <div key={i} className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-4">
                    <p className="mb-1.5 text-xs" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.18em", color: "#f472b6", textTransform: "uppercase" }}>Q{i + 1}</p>
                    <p className="text-[14.5px]" style={{ color: "var(--text-primary)", lineHeight: 1.6 }}>{q}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {week.outputs.length > 0 && (
            <Section title="What you'll have by the end" icon={CheckCircle2} accent="#fbbf24">
              <ul className="space-y-2">
                {week.outputs.map((o, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px]" style={{ color: "var(--text-primary)", lineHeight: 1.55 }}>
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "#fbbf24" }} />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}

      {viewer && <ResourceViewer url={viewer.url} label={viewer.label} onClose={() => setViewer(null)} />}
    </div>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        padding: "0.625rem 1rem",
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        fontSize: "0.875rem",
        color: active ? "var(--accent)" : "var(--text-dim)",
        background: "transparent",
        border: "none",
        borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function Section({
  title, icon: Icon, accent, children,
}: { title: string; icon: typeof BookOpen; accent: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${accent}1f`, color: accent }}>
          <Icon size={16} />
        </span>
        <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", fontWeight: 700 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
