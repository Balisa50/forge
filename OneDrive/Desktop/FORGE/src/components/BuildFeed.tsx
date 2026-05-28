"use client";

/**
 * BuildFeed — quiet real-time stream of what other Forge learners are
 * building right now. No likes, no comments, no followers. Just presence.
 *
 *   "Kofi completed his Excel dashboard — Data Analysis, Week 1"
 *   "Anonymous learner submitted a TaxiPulse build — Data Science, Week 4"
 *
 * Anonymous by default. Names appear only for learners who opted in
 * (User.showInFeed = true).
 *
 * Polls /api/feed every 60s — no websocket overhead.
 *
 * This kills isolation — the #1 reason people quit self-paced learning —
 * without becoming a distraction machine.
 */

import { useEffect, useState } from "react";
import { Activity, GitBranch, CheckCircle2, Send } from "lucide-react";

export interface FeedEntry {
  id: string;
  /** Display name. "Anonymous learner" when opted-out. */
  name: string;
  /** Type of activity */
  kind: "verified" | "submitted" | "completed_week" | "started";
  /** Roadmap title */
  program: string;
  /** Week label e.g. "Week 4" */
  weekLabel: string;
  /** ISO timestamp */
  at: string;
}

function relative(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function kindIcon(kind: FeedEntry["kind"]) {
  switch (kind) {
    case "verified": return <CheckCircle2 size={11} color="var(--green)" />;
    case "submitted": return <Send size={11} color="var(--orange)" />;
    case "completed_week": return <GitBranch size={11} color="var(--accent)" />;
    case "started": return <Activity size={11} color="var(--blue)" />;
  }
}

function kindVerb(kind: FeedEntry["kind"]): string {
  switch (kind) {
    case "verified": return "had a week verified";
    case "submitted": return "submitted work";
    case "completed_week": return "completed";
    case "started": return "started";
  }
}

export default function BuildFeed() {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/feed", { cache: "no-store" });
        if (!res.ok) throw new Error("Feed unavailable");
        const data = await res.json();
        if (!cancelled) {
          setEntries(data.entries ?? []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    const id = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (loading && entries.length === 0) {
    return null; // Silent during first load — don't show empty state churn
  }

  if (entries.length === 0 && !error) return null;

  return (
    <div className="forge-panel" style={{
      padding: "1rem 1.125rem",
      marginBottom: "1.25rem",
      background: "rgba(255,255,255,0.02)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "0.875rem",
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          letterSpacing: "0.2em",
          color: "var(--text-dim)",
          textTransform: "uppercase",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--green)",
            animation: "forgeFeedPulse 2s ease-in-out infinite",
          }} />
          In the forge right now
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.1em" }}>
          live · refreshes every 60s
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {entries.slice(0, 8).map((e) => (
          <div key={e.id} style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
            lineHeight: 1.4,
          }}>
            <span style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 18, height: 18 }}>
              {kindIcon(e.kind)}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{e.name}</span>
              {" "}{kindVerb(e.kind)}{" "}
              <span style={{ color: "var(--accent)" }}>{e.program}</span>
              <span style={{ color: "var(--text-dim)" }}> · {e.weekLabel}</span>
            </span>
            <span style={{
              flexShrink: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "0.625rem",
              color: "var(--text-dim)",
              letterSpacing: "0.05em",
            }}>
              {relative(e.at)}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes forgeFeedPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
