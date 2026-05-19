"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, EyeOff, Loader2, ChevronDown, ChevronRight, EyeIcon } from "lucide-react";
import { DEFAULT_VISIBILITY, type VisibilityKey, type VisibilityMap } from "@/lib/visibility";

// Sections that have an actual route the mentee can navigate to. Toggling
// these off truly hides the section from the mentee's sidebar.
// (Leaderboard was removed - no /dashboard/leaderboard page exists yet,
// so the toggle was a no-op and confused mentors.)
type ActiveKey = Exclude<VisibilityKey, "leaderboard">;

const LABELS: Record<ActiveKey, { title: string; desc: string }> = {
  pod:          { title: "My Pod",        desc: "Group-accountability section" },
  certificates: { title: "Certificates",  desc: "Completed roadmap certificates" },
  analytics:    { title: "Analytics",     desc: "Charts, streaks, pass rates" },
  journal:      { title: "Journal",       desc: "Chronological build log" },
  calendar:     { title: "Calendar",      desc: "90-day check-in heatmap" },
  notes:        { title: "Mentor Notes",  desc: "Your conversation thread" },
};
const ACTIVE_KEYS = Object.keys(LABELS) as ActiveKey[];

export default function MentorVisibilityControls({ menteeId, menteeName }: { menteeId: string; menteeName: string }) {
  const [visibility, setVisibility] = useState<VisibilityMap | null>(null);
  const [saving, setSaving] = useState<VisibilityKey | null>(null);
  // Collapsed by default so the mentor's mentee page does not eat the screen
  // with a section they only configure once. Click the header to toggle.
  const [open, setOpen] = useState(false);

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

  // Count how many sections are currently hidden so the collapsed header
  // surfaces the state at a glance ("3 hidden") instead of being silent.
  const hiddenCount = visibility
    ? ACTIVE_KEYS.filter((k) => visibility[k] === false).length
    : 0;
  const firstName = menteeName.split(" ")[0] || "they";

  return (
    <section className="forge-panel" style={{ padding: 0, marginBottom: "1.5rem", overflow: "hidden" }}>
      {/* Always-visible header - acts as the toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "1.125rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          cursor: "pointer",
          textAlign: "left",
          minHeight: "unset",
        }}
      >
        <span style={{ flexShrink: 0, color: "var(--text-dim)", display: "flex" }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span style={{ flexShrink: 0, color: "var(--accent)", display: "flex" }}>
          <EyeIcon size={15} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: "var(--font-headline)", fontSize: "1rem", color: "var(--text-primary)" }}>
            What {firstName} can see
          </span>
          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.125rem" }}>
            {visibility
              ? hiddenCount === 0
                ? `All ${ACTIVE_KEYS.length} sections visible to ${firstName}`
                : `${hiddenCount} hidden, ${ACTIVE_KEYS.length - hiddenCount} visible`
              : "Loading visibility..."}
          </span>
        </span>
      </button>

      {/* Body - only rendered when expanded */}
      {open && (
        <div style={{ padding: "0 1.5rem 1.5rem", borderTop: "1px solid var(--border)" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", margin: "1rem 0 1rem", lineHeight: 1.55 }}>
            Toggle off any section you don&apos;t want {firstName} to see in their dashboard sidebar. Hidden sections disappear from their navigation - they can&apos;t click into them. Useful when you want to keep them focused on just the released week.
          </p>

          {!visibility ? (
            <div style={{ color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Loader2 size={14} className="animate-spin" /> Loading...
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.625rem" }}>
              {ACTIVE_KEYS.map((k) => {
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
                      minHeight: "unset",
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
          )}
        </div>
      )}
    </section>
  );
}
