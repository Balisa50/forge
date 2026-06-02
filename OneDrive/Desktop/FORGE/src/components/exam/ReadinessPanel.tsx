"use client";

/**
 * ReadinessPanel — exam-readiness intelligence (prompt #7).
 *
 * Reads the learner's per-concept mastery data (best score, mastered flag,
 * attempts, timestamps) that the mastery gate already records, and turns it
 * into the three things the student needs to see:
 *   1. a Readiness score (0–100%) for the whole paper, weighted by each
 *      module's official exam weight
 *   2. Weak-concept alerts — the concepts dragging the score down, with a
 *      direct "review" link
 *   3. an Estimated readiness date from the student's actual mastery pace
 *
 * Pure client-side off the existing localStorage progress — no new tables.
 */

import Link from "next/link";
import { useMemo } from "react";
import { Gauge, AlertTriangle, CalendarClock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useExamProgress, getConcept } from "@/lib/examProgress";

interface ConceptLite { id: string; title: string }
interface ModuleLite { id: string; title: string; weight: string; concepts: ConceptLite[] }

/** Parse an SOA weight band like "23–30%" / "44-50%" / "10%" into a fraction. */
function parseWeight(w: string): number {
  const nums = (w.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  if (nums.length === 0) return 1;
  const mid = nums.reduce((a, b) => a + b, 0) / nums.length;
  return mid / 100;
}

const DAY = 86_400_000;

export default function ReadinessPanel({ slug, modules }: { slug: string; modules: ModuleLite[] }) {
  const { progress } = useExamProgress(slug);

  const r = useMemo(() => {
    const allConcepts = modules.flatMap((m) => m.concepts);
    const total = allConcepts.length;

    // Per-module mean "readiness" (best score, with mastered guaranteed ≥ its best).
    let weightSum = 0;
    let weighted = 0;
    for (const m of modules) {
      const w = parseWeight(m.weight);
      weightSum += w;
      const scores = m.concepts.map((c) => getConcept(progress, c.id).best);
      const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      weighted += w * mean;
    }
    const readiness = weightSum > 0 ? weighted / weightSum : 0;

    // Mastery + activity stats.
    let mastered = 0, attempted = 0, earliest = Infinity;
    const weak: { id: string; title: string; best: number; attempts: number }[] = [];
    for (const m of modules) {
      for (const c of m.concepts) {
        const cp = getConcept(progress, c.id);
        if (cp.status === "mastered") mastered++;
        if (cp.attempts > 0) attempted++;
        if (cp.lastSeen) earliest = Math.min(earliest, cp.lastSeen);
        // weak = attempted but not yet mastered, OR mastered-but-shaky best < 0.7
        if ((cp.attempts > 0 && cp.status !== "mastered") || (cp.status === "mastered" && cp.best < 0.7)) {
          weak.push({ id: c.id, title: c.title, best: cp.best, attempts: cp.attempts });
        }
      }
    }
    weak.sort((a, b) => a.best - b.best);

    // ETA from actual pace: mastered concepts over elapsed study span.
    let eta: string | null = null;
    if (mastered >= 1 && earliest < Infinity) {
      const elapsedDays = Math.max((Date.now() - earliest) / DAY, 1);
      const perDay = mastered / elapsedDays;
      const remaining = total - mastered;
      if (remaining <= 0) eta = "All concepts mastered — you're exam-ready.";
      else if (perDay > 0) {
        const daysToGo = Math.ceil(remaining / perDay);
        const date = new Date(Date.now() + daysToGo * DAY);
        eta = date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      }
    }

    return { readiness, mastered, attempted, total, weak: weak.slice(0, 3), eta };
  }, [progress, modules]);

  const pctNum = Math.round(r.readiness * 100);
  const tone = pctNum >= 75 ? "#34d399" : pctNum >= 45 ? "var(--accent)" : "#f87171";
  const band = pctNum >= 75 ? "Exam-ready" : pctNum >= 45 ? "Getting there" : "Early days";

  return (
    <div className="rounded-2xl border border-[color:var(--border)]" style={{ background: "var(--bg-panel)", padding: "1.25rem 1.375rem", marginBottom: "1.5rem" }}>
      <div className="flex items-center gap-2" style={{ marginBottom: "0.875rem" }}>
        <Gauge size={16} style={{ color: "var(--accent)" }} />
        <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.0625rem", fontWeight: 700 }}>Your exam readiness</h2>
      </div>

      {r.attempted === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
          Clear a concept&apos;s mastery gate and this panel starts tracking your readiness for Exam — a weighted score, the concepts to shore up, and an estimated ready-by date from your own pace.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Readiness score */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
              <span style={{ fontFamily: "var(--font-headline)", fontSize: "2.25rem", fontWeight: 800, color: tone, lineHeight: 1 }}>{pctNum}%</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: tone, letterSpacing: "0.08em", textTransform: "uppercase" }}>{band}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "var(--bg-card)", overflow: "hidden", margin: "0.5rem 0 0.4rem" }}>
              <div style={{ width: `${pctNum}%`, height: "100%", background: tone, transition: "width 0.5s" }} />
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
              {r.mastered}/{r.total} concepts mastered · weighted by exam %
            </p>
          </div>

          {/* Weak concepts */}
          <div>
            <p style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.14em", textTransform: "uppercase", color: r.weak.length ? "#f87171" : "#34d399", marginBottom: "0.5rem" }}>
              {r.weak.length ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />} {r.weak.length ? "Shore these up" : "No weak spots"}
            </p>
            {r.weak.length === 0 ? (
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>Everything you&apos;ve attempted is holding. Keep widening coverage.</p>
            ) : (
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {r.weak.map((c) => (
                  <li key={c.id}>
                    <Link href={`/learn/exam/${slug}/${c.id}`} className="group inline-flex items-center gap-1.5" style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--text-primary)" }}>{c.title}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "#f87171" }}>{Math.round(c.best * 100)}%</span>
                      <ArrowRight size={11} style={{ color: "var(--accent)" }} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ETA */}
          <div>
            <p style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.5rem" }}>
              <CalendarClock size={11} /> Ready by (est.)
            </p>
            <p style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
              {r.eta ?? "Master a concept to estimate"}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", lineHeight: 1.5, marginTop: "0.25rem" }}>
              Projected from your current mastery pace. Keep clearing gates to pull it in.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
