"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Award, ChevronDown, ChevronUp, Loader2, ExternalLink, Lock, AlertTriangle, Send, Maximize2 } from "lucide-react";
import CertificateCard from "./CertificateCard";

interface Props {
  menteeId: string;
  menteeName: string;
  roadmapId: string;
}

interface Status {
  alreadyIssued: boolean;
  eligible: boolean;
  verifyCode?: string;
  verified?: number;
  total?: number;
  title?: string;
  passRate?: number;
  totalHours?: number;
  signedBy?: string | null;
  cohort?: string | null;
}

/**
 * Mentor's per-roadmap cert control. Collapsed by default — opens on click.
 * Shows the full preview using the same artwork the mentee will eventually
 * receive, plus a Release button that's only enabled at 100% verified.
 */
export default function MentorCertReleaseCard({ menteeId, menteeName, roadmapId }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mentor/mentees/${menteeId}/release-cert?roadmapId=${encodeURIComponent(roadmapId)}`, { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load cert status");
      }
      setStatus(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [menteeId, roadmapId]);

  useEffect(() => {
    if (open && !status && !loading) load();
  }, [open, status, loading, load]);

  const release = async () => {
    if (!confirm(`Release the certificate for ${menteeName}? This is permanent — every public viewer at /verify/cert/[code] will see it as issued.`)) return;
    setReleasing(true);
    setError(null);
    try {
      const res = await fetch(`/api/mentor/mentees/${menteeId}/release-cert?roadmapId=${encodeURIComponent(roadmapId)}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Release failed");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Release failed");
    } finally {
      setReleasing(false);
    }
  };

  const progressPct = status && status.total && status.total > 0
    ? Math.round(((status.verified ?? 0) / status.total) * 100)
    : 0;

  return (
    <div className="forge-panel" style={{ marginBottom: "1.25rem", background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.3)", overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", padding: "0.875rem 1.125rem", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.625rem", textAlign: "left" }}
        aria-expanded={open}
      >
        <Award size={15} style={{ color: "#d4af37", flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.14em", textTransform: "uppercase", flex: 1 }}>
          Certificate — release control
        </span>
        {status?.alreadyIssued && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--green)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Released
          </span>
        )}
        {!status?.alreadyIssued && status?.eligible && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "#d4af37", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Ready to release
          </span>
        )}
        {open ? <ChevronUp size={14} color="var(--text-dim)" /> : <ChevronDown size={14} color="var(--text-dim)" />}
      </button>

      {open && (
        <div style={{ padding: "0 1.125rem 0.5rem" }}>
          <Link
            href={`/dashboard/mentor/${menteeId}/preview-cert?roadmapId=${encodeURIComponent(roadmapId)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.375rem",
              fontFamily: "var(--font-mono)", fontSize: "0.6875rem",
              color: "#d4af37", textDecoration: "none",
              padding: "0.4rem 0.75rem",
              border: "1px solid rgba(212,175,55,0.4)", borderRadius: 6,
              background: "rgba(212,175,55,0.06)",
              marginBottom: "0.75rem",
            }}
          >
            <Maximize2 size={11} /> Open full preview (new tab)
          </Link>
        </div>
      )}

      {open && (
        <div style={{ padding: "0 1.125rem 1.125rem" }}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-dim)", fontSize: "0.8125rem", padding: "0.75rem 0" }}>
              <Loader2 size={13} className="animate-spin" /> Loading…
            </div>
          )}
          {error && (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", color: "var(--red)", fontSize: "0.8125rem", padding: "0.625rem 0" }}>
              <AlertTriangle size={13} style={{ marginTop: 2, flexShrink: 0 }} /> {error}
            </div>
          )}

          {status && !loading && (
            <>
              {/* Status summary */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200, fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {status.alreadyIssued ? (
                    <>Certificate was already released. <Link href={`/verify/cert/${status.verifyCode}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>View live <ExternalLink size={11} /></Link></>
                  ) : status.eligible ? (
                    <>Every week is verified. Release the certificate to make it official.</>
                  ) : (
                    <><strong style={{ color: "var(--text-primary)" }}>{status.verified}/{status.total} weeks verified</strong> · {progressPct}% — release unlocks at 100%.</>
                  )}
                </div>

                {!status.alreadyIssued && (
                  <button
                    type="button"
                    onClick={release}
                    disabled={!status.eligible || releasing}
                    className="forge-btn"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.625rem 1.125rem",
                      background: status.eligible ? "#d4af37" : "var(--bg-card)",
                      color: status.eligible ? "#000" : "var(--text-dim)",
                      border: status.eligible ? "none" : "1px solid var(--border)",
                      fontWeight: 700,
                      cursor: status.eligible ? "pointer" : "not-allowed",
                      opacity: status.eligible ? 1 : 0.6,
                    }}
                  >
                    {releasing
                      ? <><Loader2 size={13} className="animate-spin" /> Releasing…</>
                      : status.eligible
                        ? <><Send size={13} /> Release certificate</>
                        : <><Lock size={13} /> Not yet eligible</>}
                  </button>
                )}
              </div>

              {/* Progress bar — only when not yet released */}
              {!status.alreadyIssued && (
                <div style={{ width: "100%", height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginBottom: "1rem" }}>
                  <div style={{ width: `${progressPct}%`, height: "100%", background: status.eligible ? "linear-gradient(90deg, #d4af37, #f0c75c)" : "var(--accent)", borderRadius: 3, transition: "width 0.4s" }} />
                </div>
              )}

              {/* The actual cert preview */}
              {(() => {
                const now = new Date();
                const year = now.getFullYear();
                const verifyCode = status.verifyCode ?? "preview";
                return (
                  <CertificateCard
                    learnerName={menteeName}
                    programName={status.title ?? ""}
                    issueDate={now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    certId={status.alreadyIssued ? `TF-${year}-${verifyCode.slice(-8).toUpperCase()}` : `TF-${year}-PREVIEW`}
                    mentorName={status.signedBy ?? "The Forge"}
                    mentorTitle="Program Director, The Forge"
                    verifyUrl={`forge-ab.vercel.app/verify/cert/${verifyCode}`}
                    cohort={status.cohort ?? ""}
                    curriculumYear={String(year)}
                    cryptoHash={status.alreadyIssued ? "verified" : "—"}
                    preview={!status.alreadyIssued}
                  />
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
