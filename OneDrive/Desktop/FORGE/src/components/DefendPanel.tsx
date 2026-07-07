"use client";

/**
 * The Professor's viva, on the learner's side.
 *
 * When the Professor has reviewed a submission and left defence questions, this
 * panel appears at the top of the Roadmap: the questions (anchored to the
 * learner's real code) and a box to answer each. Submitting grades them
 * strictly and returns the verdict. If there is nothing to defend, it renders
 * nothing.
 */

import { useEffect, useState } from "react";
import { GraduationCap, Loader2, CheckCircle2, XCircle } from "lucide-react";
import ProctorView from "@/components/ProctorView";
import { useProctor } from "@/lib/proctor/useProctor";

// Camera check is ON by default. Set NEXT_PUBLIC_PROCTOR_ENABLED="false" to skip
// it entirely; set NEXT_PUBLIC_PROCTOR_REQUIRED="true" to HARD-block a defence
// when the camera is denied (default is required-with-fallback: allow but flag).
const PROCTOR_ENABLED = process.env.NEXT_PUBLIC_PROCTOR_ENABLED !== "false";
const PROCTOR_REQUIRED = process.env.NEXT_PUBLIC_PROCTOR_REQUIRED === "true";

interface Defence {
 interrogationId: string;
 weekTitle: string;
 questions: { n: number; prompt: string }[];
}
interface Verdict {
 verdict: "verified" | "needs_work" | "rejected";
 passed: boolean;
 feedback: string;
 next_step?: string;
 praised?: string;
}

export default function DefendPanel() {
 const [defence, setDefence] = useState<Defence | null>(null);
 const [answers, setAnswers] = useState<string[]>([]);
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [result, setResult] = useState<Verdict | null>(null);

 // Proctor runs only while actively defending (questions up, not yet graded).
 const proctorOn = PROCTOR_ENABLED && !!defence && !result;
 const proctor = useProctor(proctorOn);
 const proctorFailed =
 proctor.status === "denied" || proctor.status === "unsupported" || proctor.status === "error";

 useEffect(() => {
 let cancelled = false;
 (async () => {
 try {
 const res = await fetch("/api/ai-mentor/defence");
 if (!res.ok) return;
 const data = await res.json();
 if (!cancelled && data.defence?.questions?.length) {
 setDefence(data.defence);
 setAnswers(new Array(data.defence.questions.length).fill(""));
 }
 } catch { /* silent */ }
 })();
 return () => { cancelled = true; };
 }, []);

 const setAnswer = (i: number, v: string) =>
 setAnswers((prev) => prev.map((a, j) => (j === i ? v : a)));

 // Hard-required mode blocks submit while the camera is denied/unavailable.
 const blockedByProctor = PROCTOR_REQUIRED && proctorFailed;
 const ready = defence && answers.every((a) => a.trim().length >= 3) && !submitting && !blockedByProctor;

 const submit = async () => {
 if (!defence || !ready) return;
 setSubmitting(true);
 setError(null);
 try {
 const report = PROCTOR_ENABLED ? proctor.getReport() : undefined;
 const res = await fetch("/api/ai-mentor/defence", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ interrogationId: defence.interrogationId, answers, proctor: report }),
 });
 const data = await res.json().catch(() => ({}));
 if (res.status === 429) { setError(data.message || "Give it a minute — you've hit the rate limit."); return; }
 if (res.status === 501) { setError("The Professor isn't switched on for this account."); return; }
 if (!res.ok) { setError(data.message || data.error || "The Professor couldn't grade this right now."); return; }
 setResult(data);
 } catch {
 setError("Network error. Try again.");
 } finally {
 setSubmitting(false);
 }
 };

 if (!defence) return null;

 /* ── Verdict view ─────────────────────────────────────────────── */
 if (result) {
 const good = result.passed;
 return (
 <section style={{ borderTop: `2px solid ${good ? "var(--green)" : "var(--red)"}`, paddingTop: "1rem", marginBottom: "2rem" }}>
 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
 {good ? <CheckCircle2 size={18} style={{ color: "var(--green)" }} /> : <XCircle size={18} style={{ color: "var(--red)" }} />}
 <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.05em", margin: 0 }}>
 {good ? "Verified — you defended it" : result.verdict === "rejected" ? "Rejected" : "Needs work"}
 </h2>
 </div>
 <div style={{ borderLeft: `3px solid ${good ? "var(--green)" : "var(--red)"}`, paddingLeft: "1rem", color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
 {result.feedback}
 {result.next_step ? `\n\nNext: ${result.next_step}` : ""}
 </div>
 </section>
 );
 }

 /* ── Questions view ───────────────────────────────────────────── */
 return (
 <section style={{ borderTop: "2px solid var(--accent)", paddingTop: "1rem", marginBottom: "2rem" }}>
 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
 <GraduationCap size={18} style={{ color: "var(--accent)" }} />
 <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.05em", margin: 0 }}>
 Defend your work
 </h2>
 </div>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.55, marginBottom: "1.125rem", maxWidth: 680 }}>
 The Professor reviewed <strong style={{ color: "var(--text-primary)" }}>{defence.weekTitle}</strong> and has {defence.questions.length} question{defence.questions.length === 1 ? "" : "s"} about your actual code. Answer honestly and specifically — it marks strictly, and passing this locks in the week.
 </p>

 {PROCTOR_ENABLED && (
 <ProctorView
 status={proctor.status}
 coaching={proctor.coaching}
 flagCount={proctor.flagCount}
 videoRef={proctor.videoRef}
 />
 )}
 {blockedByProctor && (
 <p style={{ marginBottom: "1rem", color: "var(--red)", fontSize: "0.8125rem" }}>
 A working camera is required to defend your work. Enable camera access and reload this page to continue.
 </p>
 )}

 <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
 {defence.questions.map((q, i) => (
 <div key={i}>
 <p style={{ color: "var(--text-primary)", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem", lineHeight: 1.5 }}>
 <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", marginRight: "0.4rem" }}>Q{i + 1}.</span>
 {q.prompt}
 </p>
 <textarea
 value={answers[i] ?? ""}
 onChange={(e) => setAnswer(i, e.target.value)}
 rows={3}
 className="forge-input"
 placeholder="Your answer, in your own words…"
 style={{ resize: "vertical", lineHeight: 1.6, width: "100%" }}
 />
 </div>
 ))}
 </div>

 {error && <p style={{ marginTop: "0.875rem", color: "var(--red)", fontSize: "0.875rem" }}>{error}</p>}

 <div style={{ marginTop: "1rem" }}>
 <button
 type="button"
 onClick={submit}
 disabled={!ready}
 className="forge-btn forge-btn-primary"
 style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", opacity: ready ? 1 : 0.45 }}
 >
 {submitting ? <Loader2 size={15} className="animate-spin" /> : <GraduationCap size={15} />}
 {submitting ? "The Professor is grading…" : "Submit my defence"}
 </button>
 </div>
 </section>
 );
}
