"use client";

/**
 * /dashboard/mentor/applications - the mentor's application review queue.
 * Pending applications first; approve generates an invite code to hand over,
 * reject closes it.
 */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Check, X, Copy, CheckCheck, Inbox } from "lucide-react";

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  trackSlug: string | null;
  motivation: string;
  commitment: string | null;
  status: string;
  inviteCode: string | null;
  createdAt: string;
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [approved, setApproved] = useState<Record<string, { code: string; email: string; name: string }>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mentor/applications");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setApps(data.applications);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const pending = apps.filter((a) => a.status === "pending");
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
        People who applied to learn on FORGE. Read why they want it. Approve to generate their invite code,
        or reject. Share the FORGE apply link: <strong style={{ color: "var(--accent)" }}>/apply</strong>
      </p>

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
            Share your apply link and they will show up here.
          </p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.75rem" }}>
                Pending - {pending.length}
              </p>
              <div className="flex flex-col gap-3" style={{ marginBottom: "2rem" }}>
                {pending.map((a) => (
                  <div key={a.id} className="forge-panel" style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "0.625rem" }}>
                      <div>
                        <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.0625rem" }}>{a.applicantName}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>{a.applicantEmail}</div>
                      </div>
                      <div style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                        {a.trackSlug ?? "undecided"} · {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: a.commitment ? "0.5rem" : "0.875rem", whiteSpace: "pre-wrap" }}>
                      {a.motivation}
                    </p>
                    {a.commitment && (
                      <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", marginBottom: "0.875rem" }}>
                        Commitment: {a.commitment}
                      </p>
                    )}

                    {approved[a.id] ? (
                      <div style={{ padding: "0.875rem 1rem", borderRadius: 8, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.3)" }}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--green)", marginBottom: "0.375rem" }}>
                          Approved - send this code to {approved[a.id].name}
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
                          Email it to {approved[a.id].email}. They register at /register with this code.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => act(a.id, "approve")}
                          disabled={acting === a.id}
                          className="forge-btn forge-btn-primary"
                          style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", minHeight: "unset", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                        >
                          {acting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                          Approve
                        </button>
                        <button
                          onClick={() => act(a.id, "reject")}
                          disabled={acting === a.id}
                          className="forge-btn forge-btn-ghost"
                          style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", minHeight: "unset", color: "var(--red)", borderColor: "rgba(239,68,68,0.3)", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                        >
                          <X size={13} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
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
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: a.status === "approved" ? "var(--green)" : "var(--text-dim)" }}>
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
