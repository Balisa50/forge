"use client";

import { useState } from "react";

/**
 * Org-admin switch for whether suspended mentees may appeal. Writes to
 * PATCH /api/org (owner/admin only). When OFF it overrides each mentor's
 * per-suspension appeal flag — no appeals possible org-wide.
 */
export default function OrgAppealToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const toggle = async () => {
    if (saving) return;
    const next = !on;
    setSaving(true);
    setErr(null);
    setOn(next); // optimistic
    try {
      const res = await fetch("/api/org", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowMenteeAppeals: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save");
      }
    } catch (e) {
      setOn(!next); // revert on failure
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9375rem" }}>
          Allow mentee appeals
        </span>
        <button
          role="switch"
          aria-checked={on}
          aria-label="Allow mentee appeals"
          onClick={toggle}
          disabled={saving}
          style={{
            width: 46,
            height: 26,
            borderRadius: 13,
            border: "none",
            cursor: saving ? "wait" : "pointer",
            padding: 3,
            background: on ? "var(--green)" : "var(--border)",
            transition: "background 0.2s",
            flexShrink: 0,
            opacity: saving ? 0.7 : 1,
          }}
        >
          <span
            style={{
              display: "block",
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#fff",
              transform: on ? "translateX(20px)" : "translateX(0)",
              transition: "transform 0.2s",
            }}
          />
        </button>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", lineHeight: 1.5, marginTop: "0.625rem" }}>
        {on
          ? "Suspended mentees can send their mentor a one-time appeal — if that mentor also enabled it for the suspension."
          : "Appeals are turned off across the whole organization. Mentors cannot re-enable them per-suspension."}
      </p>
      {err && (
        <p style={{ color: "var(--red)", fontSize: "0.75rem", marginTop: "0.5rem" }}>{err}</p>
      )}
    </div>
  );
}
