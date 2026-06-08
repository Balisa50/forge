"use client";

import { useState } from "react";
import { ClipboardList, Check, Loader2 } from "lucide-react";
import {
  SUBMISSION_CONFIG_OPTIONS,
  normalizeSubmissionConfig,
  type SubmissionConfigType,
} from "@/lib/submission-types";

/**
 * Mentor control: choose what a mentee must submit for this week (Task).
 * Persists to PUT /api/mentor/tasks/:id/submission-config. Optimistic — the
 * <select> updates immediately and a saved/error pill confirms the write.
 */
export default function SubmissionConfigPicker({
  taskId,
  initialConfig,
}: {
  taskId: string;
  initialConfig: unknown;
}) {
  const [type, setType] = useState<SubmissionConfigType>(
    normalizeSubmissionConfig(initialConfig).type,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const help = SUBMISSION_CONFIG_OPTIONS.find((o) => o.type === type)?.help ?? "";

  const onChange = async (next: SubmissionConfigType) => {
    const prev = type;
    setType(next);
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch(`/api/mentor/tasks/${taskId}/submission-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Save failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setType(prev); // roll back the optimistic change
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: "0.875rem" }}>
      <p style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.5rem" }}>
        <ClipboardList size={12} /> Submission requirement
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <select
          value={type}
          disabled={saving}
          onChange={(e) => onChange(e.target.value as SubmissionConfigType)}
          style={{
            flex: "1 1 220px",
            minWidth: 0,
            padding: "0.5rem 0.75rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            cursor: saving ? "wait" : "pointer",
          }}
        >
          {SUBMISSION_CONFIG_OPTIONS.map((o) => (
            <option key={o.type} value={o.type}>{o.label}</option>
          ))}
        </select>
        {saving && <Loader2 size={14} className="animate-spin" style={{ color: "var(--text-dim)" }} />}
        {saved && !saving && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--green)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
            <Check size={13} /> saved
          </span>
        )}
      </div>
      <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginTop: "0.375rem", lineHeight: 1.5 }}>{help}</p>
      {error && (
        <p style={{ color: "var(--red)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", marginTop: "0.25rem" }}>{error}</p>
      )}
    </div>
  );
}
