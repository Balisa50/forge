"use client";

/**
 * Shown when SOLO_MODE_ENABLED is off and a user has landed without a
 * mentor (no MentorLink) and is not a mentor themselves. FORGE is
 * mentor-required in this state - every learner needs a human.
 *
 * The user can redeem a mentor invite code here, or sign out.
 */

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, KeyRound, Loader2, ArrowRight } from "lucide-react";

export default function InviteRequired() {
 const [code, setCode] = useState("");
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const redeem = async () => {
 const c = code.trim();
 if (!c || submitting) return;
 setSubmitting(true);
 setError(null);
 try {
 const res = await fetch("/api/mentor/invites/redeem", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ code: c }),
 });
 const data = await res.json().catch(() => ({}));
 if (!res.ok) throw new Error(data.error || "That code didn't work. Ask your mentor for a fresh one.");
 // Success - reload into the dashboard, now linked to a mentor.
 window.location.href = "/dashboard";
 } catch (e) {
 setError(e instanceof Error ? e.message : "Something went wrong");
 setSubmitting(false);
 }
 };

 return (
 <div
 style={{
 minHeight: "100vh",
 background: "var(--bg-base)",
 color: "var(--text-primary)",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 padding: "1.5rem",
 }}
 >
 <div
 style={{
 maxWidth: 480,
 width: "100%",
 background: "var(--bg-panel)",
 border: "1px solid var(--border)",
 borderRadius: 14,
 padding: "2.25rem 2rem",
 boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
 }}
 >
 <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
 <span
 style={{
 width: 44,
 height: 44,
 borderRadius: 10,
 background: "rgba(245,158,11,0.12)",
 color: "var(--accent)",
 display: "grid",
 placeItems: "center",
 flexShrink: 0,
 }}
 >
 <KeyRound size={22} />
 </span>
 <h1
 style={{
 fontFamily: "var(--font-headline)",
 fontSize: "1.5rem",
 letterSpacing: "0.04em",
 color: "var(--text-primary)",
 }}
 >
 FORGE is invite-only
 </h1>
 </div>

 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>
 Right now, every learner on FORGE has a real human mentor holding them accountable. There is no
 self-paced solo mode yet. To begin, enter the invite code your mentor gave you.
 </p>

 <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
 <label
 style={{
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 color: "var(--text-dim)",
 letterSpacing: "0.12em",
 textTransform: "uppercase",
 }}
 >
 Mentor invite code
 </label>
 <input
 value={code}
 onChange={(e) => setCode(e.target.value)}
 onKeyDown={(e) => e.key === "Enter" && redeem()}
 placeholder="e.g. FORGE-A1B2C3"
 className="forge-input"
 style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
 disabled={submitting}
 autoFocus
 />
 {error && (
 <p style={{ color: "var(--red)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)" }}>{error}</p>
 )}
 <button
 type="button"
 onClick={redeem}
 disabled={!code.trim() || submitting}
 className="forge-btn forge-btn-primary"
 style={{ marginTop: "0.5rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem 1.25rem" }}
 >
 {submitting ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
 Join my mentor
 </button>
 </div>

 <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", lineHeight: 1.6, marginTop: "1.5rem" }}>
 Don&apos;t have a code? You need a mentor to invite you. If you want to mentor learners yourself,
 sign out and create your account as a Mentor.
 </p>

 <button
 onClick={() => signOut({ callbackUrl: "/" })}
 className="forge-btn forge-btn-ghost"
 style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem", minHeight: "unset" }}
 >
 <LogOut size={14} /> Sign out
 </button>
 </div>
 </div>
 );
}
