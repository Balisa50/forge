"use client";

/**
 * One-time intro card shown on the mentor dashboard until dismissed.
 * Walks new mentors through the 3 actions they care about: invite,
 * release, verify. Dismiss is tracked in localStorage so it shows once.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, UserPlus, Send, ShieldCheck, X } from "lucide-react";

const KEY = "forge.mentorOnboardingDismissed";

export default function MentorOnboardingCard({ mentorName }: { mentorName: string | null }) {
 const [show, setShow] = useState(false);

 useEffect(() => {
 try {
 const dismissed = localStorage.getItem(KEY) === "true";
 setShow(!dismissed);
 } catch {
 setShow(true);
 }
 }, []);

 const dismiss = () => {
 try { localStorage.setItem(KEY, "true"); } catch {}
 setShow(false);
 };

 if (!show) return null;

 const first = mentorName?.split(" ")[0] ?? "there";

 return (
 <div
 className="forge-panel"
 style={{
 padding: "1.25rem 1.5rem",
 marginBottom: "1.5rem",
 background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.02) 100%)",
 border: "1px solid rgba(245,158,11,0.3)",
 position: "relative",
 }}
 >
 <button
 type="button"
 onClick={dismiss}
 aria-label="Dismiss"
 style={{
 position: "absolute",
 top: "0.75rem",
 right: "0.75rem",
 background: "none",
 border: "none",
 color: "var(--text-dim)",
 cursor: "pointer",
 padding: "0.25rem",
 minHeight: "unset",
 }}
 >
 <X size={14} />
 </button>
 <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
 <Sparkles size={16} color="var(--accent)" />
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", color: "var(--accent)" }}>
 Welcome to FORGE, {first}
 </h2>
 </div>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.125rem" }}>
 Your job as a mentor is three actions. Everything else is detail.
 </p>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
 <Link
 href="/dashboard/mentor/invite"
 className="forge-panel"
 style={{ padding: "0.875rem 1rem", textDecoration: "none", color: "var(--text-primary)", display: "block" }}
 >
 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
 <UserPlus size={14} color="var(--accent)" />
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}>1. Invite</span>
 </div>
 <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
 Generate a name-locked code with a learning path. Send it. Your mentee joins, gets the
 roadmap auto-seeded, and lands on a dashboard saying &quot;waiting for your first week.&quot;
 </p>
 </Link>
 <Link
 href="/dashboard/mentor/release"
 className="forge-panel"
 style={{ padding: "0.875rem 1rem", textDecoration: "none", color: "var(--text-primary)", display: "block" }}
 >
 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
 <Send size={14} color="var(--accent)" />
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}>2. Release</span>
 </div>
 <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
 Open a mentee. Click &quot;Release with deadline&quot; on the next locked week. Set a date,
 add a personal note. Or use the bulk page to release to multiple mentees at once.
 </p>
 </Link>
 <Link
 href="/dashboard/mentor/reviews"
 className="forge-panel"
 style={{ padding: "0.875rem 1rem", textDecoration: "none", color: "var(--text-primary)", display: "block" }}
 >
 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
 <ShieldCheck size={14} color="var(--green)" />
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green)" }}>3. Verify</span>
 </div>
 <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
 When they finish a week and submit check-ins, you review. If the mastery checkpoints look
 good, click &quot;Verify directly&quot; and they get a confetti celebration.
 </p>
 </Link>
 </div>
 </div>
 );
}
