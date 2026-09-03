"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function ForgotCodePage() {
 const [name, setName] = useState("");
 const [mentor, setMentor] = useState("");
 const [submitting, setSubmitting] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [mentorFirstName, setMentorFirstName] = useState<string | null>(null);
 const [error, setError] = useState("");

 const submit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError("");
 if (!name.trim() || !mentor.trim()) return;
 setSubmitting(true);
 try {
 const res = await fetch("/api/mentee/recovery", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ name: name.trim(), mentorIdentifier: mentor.trim() }),
 });
 const data = await res.json().catch(() => ({}));
 if (!res.ok) {
 setError(data.error || "Couldn't submit your request.");
 setSubmitting(false);
 return;
 }
 setMentorFirstName(data.mentorFirstName ?? null);
 setSubmitted(true);
 } catch {
 setError("Network error. Try again.");
 setSubmitting(false);
 }
 };

 return (
 <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", display: "grid", placeItems: "center", padding: "1.5rem" }}>
 <div style={{ width: "100%", maxWidth: 460 }}>
 <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", marginBottom: "1rem", textDecoration: "none" }}>
 <ArrowLeft size={14} /> Back to sign in
 </Link>

 <div className="forge-panel" style={{ padding: "2rem" }}>
 {submitted ? (
 <div style={{ textAlign: "center" }}>
 <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(34,197,94,0.15)", display: "grid", placeItems: "center", margin: "0 auto 1rem" }}>
 <CheckCircle2 size={26} color="var(--green)" />
 </div>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
 Mentor pinged
 </h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
 {mentorFirstName ?? "Your mentor"} got a notification. The fastest path: message them on WhatsApp / SMS too, they&apos;ll Copy your Personal ID from their dashboard and send it back in seconds.
 </p>
 <Link href="/login" className="forge-btn forge-btn-primary" style={{ display: "inline-block", padding: "0.625rem 1.25rem" }}>
 Back to sign in
 </Link>
 </div>
 ) : (
 <>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.625rem", marginBottom: "0.5rem" }}>Forgot your Personal ID?</h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
 Tell us your full name + your mentor&apos;s name (or email). They&apos;ll get a notification and can resend your ID.
 </p>

 {error && (
 <div style={{ background: "rgba(255,45,45,0.1)", border: "1px solid var(--red)", borderRadius: 4, padding: "0.625rem 0.875rem", marginBottom: "1rem", color: "var(--red)", fontSize: "0.8125rem" }}>
 {error}
 </div>
 )}

 <form onSubmit={submit} className="flex flex-col gap-3">
 <div>
 <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.375rem" }}>Your full name</label>
 <input
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="forge-input"
 placeholder="Same name your mentor registered for you"
 autoFocus
 />
 </div>
 <div>
 <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.375rem" }}>Mentor&apos;s name or email</label>
 <input
 value={mentor}
 onChange={(e) => setMentor(e.target.value)}
 className="forge-input"
 placeholder="The person who invited you"
 />
 </div>
 <button
 type="submit"
 disabled={submitting || !name.trim() || !mentor.trim()}
 className="forge-btn forge-btn-primary"
 style={{ marginTop: "0.5rem", padding: "0.625rem", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "0.375rem" }}
 >
 <Send size={13} /> {submitting ? "Sending..." : "Request my Personal ID"}
 </button>
 </form>
 </>
 )}
 </div>
 </div>
 </main>
 );
}
