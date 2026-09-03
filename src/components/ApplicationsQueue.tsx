"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Check, X, Copy, CheckCheck, Inbox, ChevronDown, ChevronUp, CheckSquare, Trash2 } from "lucide-react";
import Dialog, { type DialogConfig } from "@/components/Dialog";

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

/**
 * The mentor's inbound queue: everyone who applied through their apply link
 * (or the global apply page). Lives on the "Add mentees" page alongside the
 * direct-invite tools so growing the roster happens in exactly one place.
 */
export default function ApplicationsQueue() {
 const [apps, setApps] = useState<Application[]>([]);
 const [loading, setLoading] = useState(true);
 const [acting, setActing] = useState<string | null>(null);
 const [approved, setApproved] = useState<Record<string, { code: string; email: string; name: string }>>({});
 const [copied, setCopied] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [expanded, setExpanded] = useState<string | null>(null);
 const [selected, setSelected] = useState<Set<string>>(new Set());
 const [bulkActing, setBulkActing] = useState(false);
 const [dialog, setDialog] = useState<DialogConfig | null>(null);

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

 const allSelected = pending.length > 0 && pending.every((a) => selected.has(a.id));

 const toggleSelect = (id: string) => {
 setSelected((prev) => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id); else next.add(id);
 return next;
 });
 };

 const toggleAll = () => {
 setSelected(allSelected ? new Set() : new Set(pending.map((a) => a.id)));
 };

 const removeReviewed = (app: Application) => {
 setDialog({
 kind: "confirm",
 title: "Remove this application?",
 message: `${app.applicantName}'s reviewed application will disappear from this list. This cannot be undone.`,
 confirmText: "Remove",
 danger: true,
 onConfirm: async () => {
 setActing(app.id);
 setError(null);
 try {
 const res = await fetch(`/api/mentor/applications?id=${encodeURIComponent(app.id)}`, {
 method: "DELETE",
 });
 const data = await res.json().catch(() => ({}));
 if (!res.ok) throw new Error(data.error || "Delete failed");
 await load();
 } catch (e) {
 setError(e instanceof Error ? e.message : "Delete failed");
 } finally {
 setActing(null);
 }
 },
 });
 };

 const bulkAct = async (action: "approve" | "reject") => {
 if (selected.size === 0) return;
 setBulkActing(true);
 setError(null);
 try {
 const res = await fetch("/api/mentor/applications", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ ids: [...selected], action }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || "Bulk action failed");
 setSelected(new Set());
 await load();
 } catch (e) {
 setError(e instanceof Error ? e.message : "Bulk action failed");
 } finally {
 setBulkActing(false);
 }
 };

 return (
 <section>
 <div style={{ display: "flex", alignItems: "baseline", gap: "0.625rem", marginBottom: "0.375rem" }}>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem" }}>Applications</h2>
 {!loading && pending.length > 0 && (
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--accent)" }}>
 {pending.length} pending
 </span>
 )}
 </div>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginBottom: "1rem", lineHeight: 1.55 }}>
 People who applied through your apply link. Approving one generates their name-locked invite automatically.
 </p>

 {error && (
 <div style={{ padding: "0.75rem 1rem", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "var(--red)", marginBottom: "1rem", fontSize: "0.875rem" }}>
 {error}
 </div>
 )}

 {loading ? (
 <div style={{ color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "0.5rem", padding: "1rem 0" }}>
 <Loader2 size={16} className="animate-spin" /> Loading applications…
 </div>
 ) : pending.length === 0 && reviewed.length === 0 ? (
 <div className="forge-panel" style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
 <Inbox size={28} color="var(--text-dim)" style={{ margin: "0 auto 0.625rem" }} />
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>No applications yet.</p>
 <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>
 Share your apply link above and they will show up here.
 </p>
 </div>
 ) : (
 <>
 {pending.length > 0 && (
 <>
 {/* Select all row */}
 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>
 Pending · {pending.length}
 </p>
 <button
 onClick={toggleAll}
 style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: allSelected ? "var(--accent)" : "var(--text-dim)", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "0.375rem" }}
 >
 <span style={{ width: 14, height: 14, border: `1.5px solid ${allSelected ? "var(--accent)" : "var(--border)"}`, borderRadius: 3, display: "inline-grid", placeItems: "center", background: allSelected ? "var(--accent)" : "none" }}>
 {allSelected && <Check size={10} strokeWidth={3} style={{ color: "#000" }} />}
 </span>
 {allSelected ? "Deselect all" : "Select all"}
 </button>
 </div>

 <div className="flex flex-col gap-3" style={{ marginBottom: "2rem" }}>
 {pending.map((a) => {
 const isOpen = expanded === a.id;
 const isSelected = selected.has(a.id);
 return (
 <div key={a.id} className="forge-panel" style={{ overflow: "hidden", borderColor: isSelected ? "rgba(245,158,11,0.4)" : undefined }}>
 {/* Collapsed header: checkbox + summary on ONE row */}
 <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem 1.25rem" }}>
 <button
 onClick={(e) => { e.stopPropagation(); toggleSelect(a.id); }}
 aria-label={isSelected ? "Deselect" : "Select"}
 style={{ flexShrink: 0, width: 18, height: 18, marginTop: 2, border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border)"}`, borderRadius: 4, background: isSelected ? "var(--accent)" : "none", display: "grid", placeItems: "center", cursor: "pointer" }}
 >
 {isSelected && <Check size={12} strokeWidth={3} style={{ color: "#000" }} />}
 </button>
 <button
 onClick={() => setExpanded(isOpen ? null : a.id)}
 style={{ flex: 1, minWidth: 0, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}
 >
 <div style={{ minWidth: 0 }}>
 <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.0625rem" }}>{a.applicantName}</div>
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.125rem", overflowWrap: "anywhere" }}>{a.applicantEmail}</div>
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
 </div>

 {/* Expanded body */}
 {isOpen && (
 <div style={{ padding: "0 1.25rem 1.25rem", borderTop: "1px solid var(--border)" }}>
 <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", padding: "0.875rem 0", marginBottom: "0.5rem" }}>
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

 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: "1.25rem" }}>
 {a.motivation}
 </p>

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
 Email it to {approved[a.id].email}. They register at /register and enter this code as a mentee.
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
 <span style={{ fontSize: "0.875rem", flex: 1, minWidth: 0 }}>{a.applicantName} <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>· {a.applicantEmail}</span></span>
 <span style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: a.status === "approved" ? "var(--green)" : "var(--red)" }}>
 {a.status}{a.status === "approved" && a.inviteCode ? ` · ${a.inviteCode}` : ""}
 </span>
 <button
 type="button"
 onClick={() => removeReviewed(a)}
 disabled={acting === a.id}
 title="Remove from list"
 aria-label="Remove from list"
 style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0.25rem", display: "inline-flex", alignItems: "center", borderRadius: 4 }}
 >
 {acting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
 </button>
 </span>
 </div>
 ))}
 </div>
 </>
 )}
 </>
 )}

 {/* Sticky bulk action bar */}
 {selected.size > 0 && (
 <div style={{
 position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
 display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap",
 background: "var(--bg-panel)", border: "1px solid var(--border)",
 borderRadius: 12, padding: "0.75rem 1.25rem",
 boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
 zIndex: 100,
 maxWidth: "calc(100vw - 2rem)",
 }}>
 <CheckSquare size={16} color="var(--accent)" />
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
 {selected.size} selected
 </span>
 <button
 onClick={() => bulkAct("approve")}
 disabled={bulkActing}
 className="forge-btn forge-btn-primary"
 style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem", minHeight: "unset", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
 >
 {bulkActing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
 Approve all
 </button>
 <button
 onClick={() => bulkAct("reject")}
 disabled={bulkActing}
 className="forge-btn forge-btn-ghost"
 style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem", minHeight: "unset", color: "var(--red)", borderColor: "rgba(239,68,68,0.3)", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
 >
 <X size={14} /> Reject all
 </button>
 <button
 onClick={() => setSelected(new Set())}
 aria-label="Clear selection"
 style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0.25rem" }}
 >
 <X size={14} />
 </button>
 </div>
 )}

 <Dialog config={dialog} onClose={() => setDialog(null)} />
 </section>
 );
}
