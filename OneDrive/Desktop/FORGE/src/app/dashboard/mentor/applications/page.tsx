"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Check, X, Copy, CheckCheck, Inbox, Link2, ChevronDown, ChevronUp } from "lucide-react";

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  trackSlug: string | null;
  motivation: string;
  commitment: string | null;
  status: string;
  inviteCode: string | null;
  mentorId: string | null;
  createdAt: string;
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [approved, setApproved] = useState<Record<string, { code: string; email: string; name: string }>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mentor/applications");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setApps(data.applications);
      if (data.mentorId) setMentorId(data.mentorId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const applyLink = mentorId
    ? `${typeof window !== "undefined" ? window.location.origin : "https://forge-ab.vercel.app"}/apply/${mentorId}`
    : null;

  const copyLink = () => {
    if (!applyLink) return;
    navigator.clipboard.writeText(applyLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  const act = async (id: string, action: "approve" | "reject") => {
    setActing(id);
    setError(null);
    try {
      const res = await fetch("/api/mentor/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      if (action === "approve" && data.inviteCode) {
        setApproved((p) => ({ ...p, [id]: { code: data.inviteCode, email: data.applicantEmail, name: data.applicantName } }));
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActing(null);
    }
  };

  const pending  = apps.filter((a) => a.status === "pending");
  const reviewed = apps.filter((a) => a.status !== "pending");

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <Link
        href="/dashboard/mentor"
        className="inline-flex items-center gap-1.5 text-xs mb-4"
        style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
      >
        <ArrowLeft size={12} /> mentor overview
      </Link>

      <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", marginBottom: "0.5rem" }}>
        Applications
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "1.5rem", lineHeight: 1.55, maxWidth: 640 }}>
        People who applied to train with you. Tap a card to read their full application.
      </p>

      {/* ── Personal Apply Link ─────────────────────────────────── */}
      {applyLink && (
        <div style={{ marginBottom: "1.75rem", padding: "1rem 1.25rem", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Link2 size={14} color="var(--accent)" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)" }}>
              Your personal apply link
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
            <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-primary)", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6, padding: "0.375rem 0.625rem", wordBreak: "break-all", flex: 1 }}>
              {applyLink}
            </code>
            <button
              onClick={copyLink}
              className="forge-btn forge-btn-ghost"
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", minHeight: "unset", display: "inline-flex", alignItems: "center", gap: "0.3rem", flexShrink: 0 }}
            >
              {linkCopied ? <CheckCheck size={13} /> : <Copy size={13} />}
              {linkCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "var(--red)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      ) : pending.length === 0 && reviewed.length === 0 ? (
        <div className="forge-panel" style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
          <Inbox size={32} color="var(--text-dim)" style={{ margin: "0 auto 0.75rem" }} />
          <p style={{ color: "var(--text-secondary)" }}>No applications yet.</p>
          <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>
            Share your apply link above and they will show up here.
          </p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.75rem" }}>
                Pending — {pending.length}
              </p>
              <div className="flex flex-col gap-3" style={{ marginBottom: "2rem" }}>
                {pending.map((a) => {
                  const isOpen = expanded === a.id;
                  return (
                    <div key={a.id} className="forge-panel" style={{ overflow: "hidden" }}>

                      {/* ── Collapsed header — always visible, tap to expand ── */}
                      <button
                        onClick={() => setExpanded(isOpen ? null : a.id)}
                        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "1.25rem 1.5rem", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.0625rem" }}>{a.applicantName}</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.125rem" }}>{a.applicantEmail}</div>
                          {!isOpen && (
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "0.375rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                              {a.motivation.slice(0, 80)}{a.motivation.length > 80 ? "…" : ""}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", flexShrink: 0 }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
                            {new Date(a.createdAt).toLocaleDateString()}
                          </span>
                          {isOpen ? <ChevronUp size={16} color="var(--text-dim)" /> : <ChevronDown size={16} color="var(--text-dim)" />}
                        </div>
                      </button>

                      {/* ── Expanded body ── */}
                      {isOpen && (
                        <div style={{ padding: "0 1.5rem 1.5rem", borderTop: "1px solid var(--border)" }}>

                          {/* Meta */}
                          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", padding: "0.875rem 0", marginBottom: "0.875rem" }}>
                            {a.trackSlug && (
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--accent)", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 999, padding: "0.2rem 0.625rem" }}>
                                {a.trackSlug}
                              </span>
                            )}
                            {a.commitment && (
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
                                ⏱ {a.commitment}
                              </span>
                            )}
                            {!a.mentorId && (
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
                                via global apply
                              </span>
                            )}
                          </div>

                          {/* Full motivation */}
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: "1.25rem" }}>
                            {a.motivation}
                          </p>

                          {/* Actions */}
                          {approved[a.id] ? (
                            <div style={{ padding: "0.875rem 1rem", borderRadius: 8, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.3)" }}>
                              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--green)", marginBottom: "0.375rem" }}>
                                Approved — send this code to {approved[a.id].name}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                <code style={{ fontFamily: "var(--font-mono)", fontSize: "1.125rem", color: "var(--accent)", letterSpacing: "0.05em" }}>
                                  {approved[a.id].code}
                                </code>
                                <button
                                  onClick={() => { navigator.clipboard.writeText(approved[a.id].code); setCopied(a.id); setTimeout(() => setCopied(null), 1500); }}
                                  className="forge-btn forge-btn-ghost"
                                  style={{ padding: "0.3rem 0.625rem", fontSize: "0.75rem", minHeight: "unset", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                >
                                  {copied === a.id ? <CheckCheck size={12} /> : <Copy size={12} />}
                                  {copied === a.id ? "Copied" : "Copy"}
                                </button>
                              </div>
                              <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                                Email it to {approved[a.id].email}. They register at /register then enter this code as a Mentee.
                              </p>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                onClick={() => act(a.id, "approve")}
                                disabled={acting === a.id}
                                className="forge-btn forge-btn-primary"
                                style={{ flex: 1, padding: "0.75rem", fontSize: "0.9375rem", minHeight: "unset", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}
                              >
                                {acting === a.id ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                Approve
                              </button>
                              <button
                                onClick={() => act(a.id, "reject")}
                                disabled={acting === a.id}
                                className="forge-btn forge-btn-ghost"
                                style={{ flex: 1, padding: "0.75rem", fontSize: "0.9375rem", minHeight: "unset", color: "var(--red)", borderColor: "rgba(239,68,68,0.3)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}
                              >
                                <X size={15} /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {reviewed.length > 0 && (
            <>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.75rem" }}>
                Reviewed
              </p>
              <div className="flex flex-col gap-2">
                {reviewed.map((a) => (
                  <div key={a.id} className="forge-panel" style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.875rem" }}>{a.applicantName} <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>· {a.applicantEmail}</span></span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: a.status === "approved" ? "var(--green)" : "var(--red)" }}>
                      {a.status}{a.status === "approved" && a.inviteCode ? ` · ${a.inviteCode}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
