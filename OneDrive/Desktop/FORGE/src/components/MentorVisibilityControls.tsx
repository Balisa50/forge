"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { DEFAULT_VISIBILITY, type VisibilityKey, type VisibilityMap } from "@/lib/visibility";

const LABELS: Record<VisibilityKey, { title: string; desc: string }> = {
  pod:          { title: "My Pod",        desc: "Group-accountability section" },
  certificates: { title: "Certificates",  desc: "Completed roadmap certificates" },
  analytics:    { title: "Analytics",     desc: "Charts, streaks, pass rates" },
  journal:      { title: "Journal",       desc: "Chronological build log" },
  leaderboard:  { title: "Leaderboard",   desc: "Public ranking section" },
  calendar:     { title: "Calendar",      desc: "90-day check-in heatmap" },
  notes:        { title: "Mentor Notes",  desc: "Your conversation thread" },
};

export default function MentorVisibilityControls({ menteeId, menteeName }: { menteeId: string; menteeName: string }) {
  const [visibility, setVisibility] = useState<VisibilityMap | null>(null);
  const [saving, setSaving] = useState<VisibilityKey | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/mentor/visibility?menteeId=${menteeId}`);
    if (res.ok) {
      const data = await res.json();
      setVisibility({ ...DEFAULT_VISIBILITY, ...data.visibility });
    }
  }, [menteeId]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (key: VisibilityKey) => {
    if (!visibility) return;
    const next = !visibility[key];
    setVisibility({ ...visibility, [key]: next });
    setSaving(key);
    try {
      await fetch("/api/mentor/visibility", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menteeId, visibility: { [key]: next } }),
      });
    } finally {
      setSaving(null);
    }
  };

  if (!visibility) {
    return (
      <section className="forge-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Loader2 size={14} className="animate-spin" /> Loading visibility…
        </div>
      </section>
    );
  }

  return (
    <section className="forge-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1rem" }}>What {menteeName.split(" ")[0] || "they"} can see</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "0.125rem" }}>
          Toggle off any section you don&apos;t want this mentee to see in their dashboard. Useful when you want to keep them focused.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.625rem" }}>
        {(Object.keys(LABELS) as VisibilityKey[]).map((k) => {
          const on = visibility[k];
          const meta = LABELS[k];
          const isSaving = saving === k;
          return (
            <button
              key={k}
              onClick={() => toggle(k)}
              disabled={isSaving}
              style={{
                padding: "0.75rem 0.875rem",
                background: on ? "rgba(34,197,94,0.06)" : "var(--bg-card)",
                border: on ? "1px solid rgba(34,197,94,0.25)" : "1px solid var(--border)",
                borderRadius: 8,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                transition: "all 0.15s",
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: 6,
                background: on ? "rgba(34,197,94,0.15)" : "rgba(120,120,130,0.15)",
                color: on ? "var(--green)" : "var(--text-dim)",
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>
                {isSaving ? <Loader2 size={13} className="animate-spin" /> : on ? <Eye size={13} /> : <EyeOff size={13} />}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: on ? "var(--text-primary)" : "var(--text-secondary)" }}>{meta.title}</span>
                <span style={{ display: "block", fontSize: "0.6875rem", color: "var(--text-dim)" }}>{meta.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
