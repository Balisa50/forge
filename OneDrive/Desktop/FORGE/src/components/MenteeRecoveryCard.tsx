"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Copy, Check, RotateCw, AlertTriangle, Loader2, Eye, EyeOff } from "lucide-react";

interface Props {
  menteeId: string;
  menteeName: string | null;
}

/**
 * Inline card on the mentor's mentee drilldown. Shows the mentee's current
 * Personal ID with one-tap COPY and ROTATE actions. This is the in-app
 * replacement for the old "send recovery email" pipeline: faster, no spam
 * risk, no @forge.local edge cases.
 */
export default function MenteeRecoveryCard({ menteeId, menteeName }: Props) {
  const [personalId, setPersonalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shown, setShown] = useState(false);          // privacy: hidden by default
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/mentor/mentees/${menteeId}/personal-id`, { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed (${res.status})`);
      }
      const data = await res.json();
      setPersonalId(data.personalId ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load");
    } finally {
      setLoading(false);
    }
  }, [menteeId]);

  useEffect(() => { load(); }, [load]);

  const handleCopy = async () => {
    if (!personalId) return;
    try {
      await navigator.clipboard.writeText(personalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for old browsers / insecure contexts
      const ta = document.createElement("textarea");
      ta.value = personalId;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 1800); }
      catch { setError("Couldn't copy. Select and copy manually."); }
      document.body.removeChild(ta);
    }
  };

  const handleRotate = async () => {
    setRotating(true);
    setError(null);
    try {
      const res = await fetch(`/api/mentor/mentees/${menteeId}/personal-id`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed (${res.status})`);
      }
      const data = await res.json();
      setPersonalId(data.personalId);
      setShown(true);            // reveal the new one so mentor can copy it
      setConfirmRotate(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rotate failed");
    } finally {
      setRotating(false);
    }
  };

  if (loading) {
    return (
      <div className="forge-panel" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.625rem", color: "var(--text-dim)", fontSize: "0.8125rem" }}>
        <Loader2 size={13} className="animate-spin" /> Loading Personal ID…
      </div>
    );
  }

  return (
    <div className="forge-panel" style={{ padding: "1rem 1.25rem", marginBottom: "1.25rem", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.25)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <KeyRound size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", flex: 1 }}>
          Personal ID — send to {menteeName?.split(" ")[0] ?? "this mentee"} if they lost theirs
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", color: "var(--red)", fontSize: "0.75rem" }}>
          <AlertTriangle size={12} /> {error}
        </div>
      )}

      {!personalId ? (
        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          No Personal ID on file. Click <strong>Generate</strong> to create one.
          <button
            onClick={handleRotate}
            disabled={rotating}
            className="forge-btn forge-btn-primary"
            style={{ marginLeft: "0.75rem", padding: "0.375rem 0.875rem", fontSize: "0.8125rem", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            {rotating ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />}
            Generate
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
          <code
            style={{
              flex: 1,
              minWidth: 200,
              fontFamily: "var(--font-mono)",
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              background: "var(--bg-card)",
              padding: "0.5rem 0.75rem",
              borderRadius: 6,
              border: "1px solid var(--border)",
              letterSpacing: "0.04em",
            }}
          >
            {shown ? personalId : personalId.slice(0, 6) + "•••• ••••"}
          </code>

          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            title={shown ? "Hide" : "Show"}
            className="forge-btn forge-btn-ghost"
            style={{ padding: "0.5rem", minHeight: "unset", display: "inline-flex", alignItems: "center" }}
          >
            {shown ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="forge-btn forge-btn-primary"
            style={{ padding: "0.5rem 0.875rem", minHeight: "unset", display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem" }}
          >
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>

          {!confirmRotate ? (
            <button
              type="button"
              onClick={() => setConfirmRotate(true)}
              title="Generate a new Personal ID — the old one stops working"
              className="forge-btn forge-btn-ghost"
              style={{ padding: "0.5rem 0.75rem", minHeight: "unset", display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--text-dim)" }}
            >
              <RotateCw size={12} /> Rotate
            </button>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
              <button
                type="button"
                onClick={handleRotate}
                disabled={rotating}
                className="forge-btn"
                style={{ padding: "0.5rem 0.75rem", minHeight: "unset", display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", background: "var(--red)", color: "#fff", border: "1px solid var(--red)" }}
              >
                {rotating ? <Loader2 size={12} className="animate-spin" /> : <RotateCw size={12} />}
                Confirm rotate
              </button>
              <button
                type="button"
                onClick={() => setConfirmRotate(false)}
                disabled={rotating}
                className="forge-btn forge-btn-ghost"
                style={{ padding: "0.5rem 0.625rem", minHeight: "unset", fontSize: "0.75rem", color: "var(--text-dim)" }}
              >
                Cancel
              </button>
            </span>
          )}
        </div>
      )}

      <p style={{ fontSize: "0.6875rem", color: "var(--text-dim)", marginTop: "0.625rem", marginBottom: 0, lineHeight: 1.55 }}>
        Send via private channel (text / WhatsApp / in person). <strong>Rotate</strong> only if you suspect the old ID was leaked — it invalidates the previous code and the mentee will need the new one to sign in.
      </p>
    </div>
  );
}
