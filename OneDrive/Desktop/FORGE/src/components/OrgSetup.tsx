"use client";

import { useState } from "react";
import { Building2, Users, ArrowRight } from "lucide-react";

export default function OrgSetup() {
 const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 // Create form
 const [orgName, setOrgName] = useState("");
 const [orgDesc, setOrgDesc] = useState("");
 const [orgWebsite, setOrgWebsite] = useState("");

 // Join form
 const [inviteCode, setInviteCode] = useState("");

 const handleCreate = async () => {
 if (!orgName.trim()) { setError("Organization name is required."); return; }
 setLoading(true);
 setError("");
 const res = await fetch("/api/org", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ name: orgName, description: orgDesc, website: orgWebsite }),
 });
 const data = await res.json();
 if (res.ok) {
 window.location.reload();
 } else {
 setError(data.error ?? "Failed to create organization.");
 setLoading(false);
 }
 };

 const handleJoin = async () => {
 if (!inviteCode.trim()) { setError("Invite code is required."); return; }
 setLoading(true);
 setError("");
 const res = await fetch("/api/org/join", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ inviteCode: inviteCode.trim() }),
 });
 const data = await res.json();
 if (res.ok) {
 window.location.reload();
 } else {
 setError(data.error ?? "Failed to join organization.");
 setLoading(false);
 }
 };

 // ─── Choose Mode ────────────────────────────────────────────────────
 if (mode === "choose") {
 return (
 <div>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Organization</h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "2.5rem" }}>
 Create your own organization or join an existing one with an invite code.
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: "700px" }}>
 {/* Create */}
 <button
 onClick={() => setMode("create")}
 className="forge-panel"
 style={{
 padding: "2rem 1.5rem",
 textAlign: "left",
 cursor: "pointer",
 border: "1px solid var(--border)",
 background: "var(--bg-panel)",
 transition: "border-color 0.15s, box-shadow 0.15s",
 }}
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(245,158,11,0.1)"; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
 >
 <div style={{
 width: "48px", height: "48px", borderRadius: "12px",
 background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
 display: "flex", alignItems: "center", justifyContent: "center",
 marginBottom: "1.25rem",
 }}>
 <Building2 size={24} color="var(--accent)" strokeWidth={1.5} />
 </div>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Create Organization</h2>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem" }}>
 For bootcamps, schools, and teams. Set up cohorts, manage students, upload resources, and track progress.
 </p>
 <div className="flex items-center gap-1" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}>
 Get started <ArrowRight size={14} />
 </div>
 </button>

 {/* Join */}
 <button
 onClick={() => setMode("join")}
 className="forge-panel"
 style={{
 padding: "2rem 1.5rem",
 textAlign: "left",
 cursor: "pointer",
 border: "1px solid var(--border)",
 background: "var(--bg-panel)",
 transition: "border-color 0.15s, box-shadow 0.15s",
 }}
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(59,130,246,0.1)"; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
 >
 <div style={{
 width: "48px", height: "48px", borderRadius: "12px",
 background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
 display: "flex", alignItems: "center", justifyContent: "center",
 marginBottom: "1.25rem",
 }}>
 <Users size={24} color="var(--blue)" strokeWidth={1.5} />
 </div>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Join Organization</h2>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem" }}>
 Your bootcamp or mentor gave you an invite code? Enter it here to join their organization.
 </p>
 <div className="flex items-center gap-1" style={{ color: "var(--blue)", fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}>
 Enter code <ArrowRight size={14} />
 </div>
 </button>
 </div>
 </div>
 );
 }

 // ─── Create Form ────────────────────────────────────────────────────
 if (mode === "create") {
 return (
 <div style={{ maxWidth: "520px" }}>
 <button
 onClick={() => { setMode("choose"); setError(""); }}
 style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "1.5rem", padding: 0 }}
 >
 ← Back
 </button>

 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Create Organization</h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "2rem" }}>
 Set up your bootcamp, school, or team on The Forge.
 </p>

 <div className="forge-panel" style={{ padding: "1.5rem" }}>
 <div className="flex flex-col gap-4">
 {error && (
 <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid var(--red)", borderRadius: "6px", padding: "0.625rem 1rem", color: "var(--red)", fontSize: "0.875rem" }}>
 {error}
 </div>
 )}

 <div>
 <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Organization Name *</label>
 <input
 type="text"
 className="forge-input"
 placeholder="e.g. Lambda School, Andela, ALX"
 value={orgName}
 onChange={(e) => setOrgName(e.target.value)}
 autoFocus
 />
 </div>

 <div>
 <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Description</label>
 <textarea
 className="forge-input"
 placeholder="What does your organization teach?"
 value={orgDesc}
 onChange={(e) => setOrgDesc(e.target.value)}
 rows={3}
 style={{ resize: "vertical" }}
 />
 </div>

 <div>
 <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Website</label>
 <input
 type="url"
 className="forge-input"
 placeholder="https://yourbootcamp.com"
 value={orgWebsite}
 onChange={(e) => setOrgWebsite(e.target.value)}
 />
 </div>

 <button onClick={handleCreate} className="forge-btn forge-btn-primary" disabled={loading} style={{ marginTop: "0.5rem" }}>
 {loading ? "Creating..." : "Create Organization"}
 </button>
 </div>
 </div>
 </div>
 );
 }

 // ─── Join Form ──────────────────────────────────────────────────────
 return (
 <div style={{ maxWidth: "520px" }}>
 <button
 onClick={() => { setMode("choose"); setError(""); }}
 style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "1.5rem", padding: 0 }}
 >
 ← Back
 </button>

 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Join Organization</h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "2rem" }}>
 Enter the invite code provided by your bootcamp, school, or mentor.
 </p>

 <div className="forge-panel" style={{ padding: "1.5rem" }}>
 <div className="flex flex-col gap-4">
 {error && (
 <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid var(--red)", borderRadius: "6px", padding: "0.625rem 1rem", color: "var(--red)", fontSize: "0.875rem" }}>
 {error}
 </div>
 )}

 <div>
 <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Invite Code *</label>
 <input
 type="text"
 className="forge-input"
 placeholder="Paste your invite code here"
 value={inviteCode}
 onChange={(e) => setInviteCode(e.target.value)}
 autoFocus
 style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", letterSpacing: "0.1em" }}
 />
 </div>

 <button onClick={handleJoin} className="forge-btn forge-btn-blue" disabled={loading} style={{ marginTop: "0.5rem" }}>
 {loading ? "Joining..." : "Join Organization"}
 </button>
 </div>
 </div>
 </div>
 );
}
