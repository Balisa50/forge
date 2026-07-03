"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Award, ChevronDown, ChevronUp, Loader2, ExternalLink, Lock, AlertTriangle, Send, Maximize2, X, PenLine } from "lucide-react";
import CertificateCard from "./CertificateCard";

interface Props {
 menteeId: string;
 menteeName: string;
 roadmapId: string;
 /** Start expanded (used when the card is the main content of a tab). */
 defaultOpen?: boolean;
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
 * Mentor's per-roadmap cert control. Collapsed by default, opens on click.
 * Shows the full preview using the same artwork the mentee will eventually
 * receive, plus a Release button that's only enabled at 100% verified.
 */
export default function MentorCertReleaseCard({ menteeId, menteeName, roadmapId, defaultOpen = false }: Props) {
 const [open, setOpen] = useState(defaultOpen);
 const [status, setStatus] = useState<Status | null>(null);
 const [loading, setLoading] = useState(false);
 const [releasing, setReleasing] = useState(false);
 const [error, setError] = useState<string | null>(null);

 // Release dialog, collects the signature name the mentor wants on the cert
 const [showReleaseDialog, setShowReleaseDialog] = useState(false);
 const [signatureInput, setSignatureInput] = useState("");

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

 // Opens the release dialog, pre-fills the signature input with the
 // mentor's persona name. Mentor can edit before confirming.
 const openReleaseDialog = () => {
 setSignatureInput(status?.signedBy ?? "");
 setShowReleaseDialog(true);
 };

 const confirmRelease = async () => {
 const trimmed = signatureInput.trim();
 if (trimmed.length < 2) return; // basic validation
 setReleasing(true);
 setError(null);
 try {
 const res = await fetch(`/api/mentor/mentees/${menteeId}/release-cert?roadmapId=${encodeURIComponent(roadmapId)}`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ signedBy: trimmed }),
 });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 throw new Error(data.error || "Release failed");
 }
 setShowReleaseDialog(false);
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
 Certificate, release control
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
 <><strong style={{ color: "var(--text-primary)" }}>{status.verified}/{status.total} weeks verified</strong> · {progressPct}%, release unlocks at 100%.</>
 )}
 </div>

 {!status.alreadyIssued && (
 <button
 type="button"
 onClick={openReleaseDialog}
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

 {/* Progress bar, only when not yet released */}
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
 cryptoHash={status.alreadyIssued ? "verified" : ", "}
 preview={!status.alreadyIssued}
 />
 );
 })()}
 </>
 )}
 </div>
 )}

 {/* ─── Release dialog ─── */}
 {showReleaseDialog && (
 <div
 onClick={() => !releasing && setShowReleaseDialog(false)}
 style={{
 position: "fixed", inset: 0, zIndex: 200,
 background: "rgba(0,0,0,0.7)",
 backdropFilter: "blur(4px)",
 display: "grid", placeItems: "center",
 padding: "1rem",
 }}
 >
 <div
 onClick={(e) => e.stopPropagation()}
 role="dialog"
 aria-modal="true"
 style={{
 width: "100%",
 maxWidth: 480,
 background: "var(--bg-panel)",
 border: "1px solid rgba(212,175,55,0.4)",
 borderRadius: 12,
 boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
 overflow: "hidden",
 }}
 >
 <div style={{
 padding: "1.125rem 1.25rem",
 borderBottom: "1px solid var(--border)",
 display: "flex",
 alignItems: "center",
 gap: "0.625rem",
 }}>
 <span style={{
 width: 32, height: 32, borderRadius: 8,
 background: "rgba(212,175,55,0.15)",
 color: "#d4af37",
 display: "grid", placeItems: "center",
 }}>
 <PenLine size={16} />
 </span>
 <h2 style={{
 flex: 1,
 fontFamily: "var(--font-headline)",
 fontSize: "1.125rem",
 letterSpacing: "0.04em",
 color: "var(--text-primary)",
 }}>
 Sign &amp; release certificate
 </h2>
 <button
 type="button"
 onClick={() => setShowReleaseDialog(false)}
 disabled={releasing}
 aria-label="Close"
 style={{
 background: "none", border: "none",
 color: "var(--text-dim)",
 cursor: releasing ? "not-allowed" : "pointer",
 padding: 4, lineHeight: 0,
 }}
 >
 <X size={16} />
 </button>
 </div>

 <div style={{ padding: "1.125rem 1.25rem 1rem" }}>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.55, marginBottom: "1rem" }}>
 You&apos;re about to release the certificate for{" "}
 <strong style={{ color: "var(--text-primary)" }}>{menteeName}</strong>.
 This is permanent, anyone with the public link will see it as verified.
 The name you sign with appears as the cursive signature on the cert.
 </p>

 <label style={{
 display: "block",
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 color: "var(--text-dim)",
 letterSpacing: "0.14em",
 textTransform: "uppercase",
 marginBottom: "0.4rem",
 }}>
 Sign as
 </label>
 <input
 type="text"
 value={signatureInput}
 onChange={(e) => setSignatureInput(e.target.value)}
 placeholder="Your signing name"
 disabled={releasing}
 maxLength={60}
 autoFocus
 className="forge-input"
 style={{
 width: "100%",
 fontFamily: "'Dancing Script', cursive",
 fontSize: "1.5rem",
 letterSpacing: "0.01em",
 padding: "0.5rem 0.75rem",
 }}
 />
 <p style={{
 fontFamily: "var(--font-mono)",
 fontSize: "0.625rem",
 color: "var(--text-dim)",
 letterSpacing: "0.06em",
 marginTop: "0.4rem",
 }}>
 Preview: <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1.125rem", color: "var(--accent)" }}>{signatureInput.trim() || "Your name"}</span>
 {" "}, this is what mentees and the public will see on the cert.
 </p>

 {error && (
 <div style={{
 marginTop: "0.875rem",
 padding: "0.625rem 0.75rem",
 background: "rgba(239,68,68,0.08)",
 border: "1px solid rgba(239,68,68,0.3)",
 borderRadius: 6,
 color: "var(--red)",
 fontSize: "0.8125rem",
 display: "flex",
 gap: "0.5rem",
 alignItems: "flex-start",
 }}>
 <AlertTriangle size={13} style={{ marginTop: 2, flexShrink: 0 }} /> {error}
 </div>
 )}
 </div>

 <div style={{
 padding: "0.875rem 1.25rem 1.125rem",
 display: "flex",
 justifyContent: "flex-end",
 gap: "0.5rem",
 borderTop: "1px solid var(--border)",
 background: "rgba(0,0,0,0.15)",
 }}>
 <button
 type="button"
 onClick={() => setShowReleaseDialog(false)}
 disabled={releasing}
 className="forge-btn forge-btn-ghost"
 style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", minHeight: "unset" }}
 >
 Cancel
 </button>
 <button
 type="button"
 onClick={confirmRelease}
 disabled={releasing || signatureInput.trim().length < 2}
 className="forge-btn"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.5rem",
 padding: "0.5rem 1.125rem",
 fontSize: "0.875rem",
 background: "#d4af37",
 color: "#000",
 border: "none",
 fontWeight: 700,
 minHeight: "unset",
 cursor: signatureInput.trim().length >= 2 && !releasing ? "pointer" : "not-allowed",
 opacity: signatureInput.trim().length >= 2 && !releasing ? 1 : 0.6,
 }}
 >
 {releasing
 ? <><Loader2 size={13} className="animate-spin" /> Releasing…</>
 : <><Send size={13} /> Sign &amp; release</>}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
