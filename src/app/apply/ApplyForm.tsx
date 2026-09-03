"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Loader2, CheckCircle2, ShieldCheck, Map, Gauge } from "lucide-react";
import { CURATED_ROADMAPS } from "@/lib/curated-roadmaps-client";
import ForgeSelect from "@/components/ForgeSelect";

interface ApplyFormProps {
 mentorId?: string;
 mentorName?: string;
}

export default function ApplyForm({ mentorId, mentorName }: ApplyFormProps) {
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [trackSlug, setTrackSlug] = useState("");
 const [motivation, setMotivation] = useState("");
 const [background, setBackground] = useState("");
 const [commitment, setCommitment] = useState("");
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [done, setDone] = useState(false);

 const motivationOk = motivation.trim().length >= 80;
 const ready =
 name.trim().length >= 2 &&
 /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
 motivationOk;

 const submit = async () => {
 if (!ready || submitting) return;
 setSubmitting(true);
 setError(null);
 try {
 const res = await fetch("/api/apply", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 name,
 email,
 trackSlug: trackSlug || null,
 motivation: `${motivation}\n\nBackground: ${background}`.trim(),
 commitment,
 mentorId: mentorId || null,
 }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || "Could not submit your application.");
 setDone(true);
 } catch (e) {
 setError(e instanceof Error ? e.message : "Something went wrong");
 } finally {
 setSubmitting(false);
 }
 };

 const label: React.CSSProperties = {
 display: "block",
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 letterSpacing: "0.14em",
 textTransform: "uppercase",
 color: "var(--text-dim)",
 marginBottom: "0.5rem",
 };

 /* ── SUCCESS ───────────────────────────────────────────────────── */
 if (done) {
 return (
 <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", display: "grid", placeItems: "center", padding: "2rem 1.25rem" }}>
 <div style={{ maxWidth: 440, textAlign: "center" }}>
 <span style={{ display: "inline-grid", placeItems: "center", width: 56, height: 56, borderRadius: 14, background: "rgba(34,197,94,0.1)", color: "var(--green)", marginBottom: "1.5rem" }}>
 <CheckCircle2 size={28} />
 </span>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
 Application received.
 </h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>
 {mentorName ? `${mentorName} will` : "A mentor will"} review it and reach out by email if you are accepted.
 </p>
 <p style={{ color: "var(--text-dim)", fontSize: "0.875rem", lineHeight: 1.65 }}>
 If accepted, you will receive an <strong style={{ color: "var(--accent)" }}>invite code</strong> by email. That is your key in.
 </p>
 </div>
 </main>
 );
 }

 const charCount = motivation.trim().length;

 const perks: Array<[typeof ShieldCheck, string, string]> = [
 [ShieldCheck, "Real accountability", "A mentor checks your work and tracks your progress."],
 [Map, "A structured path", "A roadmap for your goal, released week by week."],
 [Gauge, "High standards", "Weeks unlock only when the last one is truly done."],
 ];

 /* ── FORM — full-width split: pitch left, form right ───────────── */
 return (
 <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
 <div className="grid lg:grid-cols-2">

 {/* LEFT — pitch (sticky on desktop, sits on the page, no card) */}
 <aside
 className="relative flex flex-col justify-center px-6 py-14 sm:px-10 lg:sticky lg:top-0 lg:h-screen lg:px-16"
 style={{
 borderBottom: "1px solid var(--border)",
 background: "radial-gradient(ellipse 90% 60% at 20% 0%, rgba(245,158,11,0.10) 0%, transparent 70%)",
 }}
 >
 <div className="mx-auto w-full max-w-lg lg:mx-0">
 <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 999, padding: "0.25rem 0.75rem", marginBottom: "1.5rem" }}>
 <Flame size={11} color="var(--accent)" />
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)" }}>
 Invite only
 </span>
 </div>

 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", letterSpacing: "0.03em", lineHeight: 1.05, marginBottom: "1.25rem" }}>
 {mentorName ? (
 <>Apply to train with <span style={{ color: "var(--accent)" }}>{mentorName}.</span></>
 ) : (
 <>Apply to be <span style={{ color: "var(--accent)" }}>Forged.</span></>
 )}
 </h1>

 <p style={{ color: "var(--text-secondary)", fontSize: "1.0625rem", lineHeight: 1.65, marginBottom: "2rem", maxWidth: 460 }}>
 Not a course, a commitment, between you and a mentor who pushes you, checks your work, and holds the standard.
 </p>

 <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem", borderTop: "1px solid var(--border)", paddingTop: "1.75rem" }}>
 {perks.map(([Icon, title, body]) => (
 <div key={title} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
 <Icon size={17} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.55 }}>
 <strong style={{ color: "var(--text-primary)" }}>{title}. </strong>{body}
 </p>
 </div>
 ))}
 </div>
 </div>
 </aside>

 {/* RIGHT — the form */}
 <section className="px-6 py-14 sm:px-10 lg:px-16">
 <div className="mx-auto w-full max-w-md">
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.625rem", letterSpacing: "0.03em", marginBottom: "0.375rem" }}>
 Your application
 </h2>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.75rem" }}>
 A real person reads every word. Write like you mean it.
 </p>

 <div className="flex flex-col gap-5">
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
 <div>
 <label style={label}>Full name</label>
 <input value={name} onChange={(e) => setName(e.target.value)} className="forge-input" placeholder="Your name" />
 </div>
 <div>
 <label style={label}>Email</label>
 <input value={email} onChange={(e) => setEmail(e.target.value)} className="forge-input" placeholder="you@email.com" style={{ fontFamily: "var(--font-mono)" }} />
 </div>
 </div>

 <div>
 <label style={label}>Path</label>
 <ForgeSelect
 value={trackSlug}
 onChange={setTrackSlug}
 ariaLabel="Path"
 options={[
 { value: "", label: "Not sure yet, help me choose" },
 ...CURATED_ROADMAPS.filter((r) => !r.hidden).map((r) => ({ value: r.slug, label: r.title })),
 ]}
 />
 </div>

 <div>
 <label style={label}>Your background <span style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.625rem", color: "var(--text-dim)" }}>(optional)</span></label>
 <textarea
 value={background}
 onChange={(e) => setBackground(e.target.value)}
 rows={2}
 className="forge-input"
 placeholder="Where you are now, and anything you have built."
 style={{ resize: "vertical", lineHeight: 1.6 }}
 />
 </div>

 <div>
 <label style={label}>
 Why do you want this?{" "}
 <span style={{ textTransform: "none", letterSpacing: 0, color: motivationOk ? "var(--green)" : charCount > 0 ? "var(--red)" : "var(--text-dim)", fontSize: "0.625rem" }}>
 {charCount} / 80 min
 </span>
 </label>
 <textarea
 value={motivation}
 onChange={(e) => setMotivation(e.target.value)}
 rows={4}
 className="forge-input"
 placeholder="The real reason. What does getting this right mean for your life? Vague answers get rejected."
 style={{
 resize: "vertical",
 lineHeight: 1.65,
 borderColor: charCount > 0 && !motivationOk ? "rgba(239,68,68,0.4)" : undefined,
 }}
 />
 </div>

 <div>
 <label style={label}>
 Weekly commitment{" "}
 <span style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.625rem" }}>(optional)</span>
 </label>
 <input value={commitment} onChange={(e) => setCommitment(e.target.value)} className="forge-input" placeholder="e.g. 10 hours, evenings and weekends" />
 </div>

 {error && (
 <div style={{ padding: "0.75rem 1rem", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--red)", fontSize: "0.875rem" }}>
 {error}
 </div>
 )}

 <div>
 <button
 type="button"
 onClick={submit}
 disabled={!ready || submitting}
 className="forge-btn forge-btn-primary"
 style={{
 width: "100%",
 padding: "0.9rem 1.5rem",
 fontSize: "1rem",
 display: "inline-flex",
 alignItems: "center",
 justifyContent: "center",
 gap: "0.5rem",
 opacity: ready ? 1 : 0.4,
 letterSpacing: "0.03em",
 }}
 >
 {submitting ? <Loader2 size={17} className="animate-spin" /> : <Flame size={17} />}
 {submitting ? "Submitting..." : "Submit my application"}
 </button>
 <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", marginTop: "0.875rem" }}>
 You will hear back by email.
 </p>
 </div>

 <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", textAlign: "center" }}>
 <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem" }}>
 Already have an invite code?{" "}
 <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>
 Register here →
 </Link>
 </p>
 </div>
 </div>
 </div>
 </section>
 </div>
 </main>
 );
}
