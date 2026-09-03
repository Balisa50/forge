"use client";

/**
 * Ask The Professor — the solo learner's entry point to the AI mentor.
 *
 * Posts to /api/ai-mentor/ask, which auto-detects the learner's current active
 * week for context, so the student can just type a question. Handles the
 * dormant (501), budget (429) and error states gracefully. Kept deliberately
 * flat, an accent top-rule instead of a heavy card, to match the rest of the app.
 */

import { useState } from "react";
import { GraduationCap, Loader2, Send } from "lucide-react";

export default function AskProfessor() {
 const [question, setQuestion] = useState("");
 const [answer, setAnswer] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const canAsk = question.trim().length >= 5 && !loading;

 const ask = async () => {
 if (!canAsk) return;
 setLoading(true);
 setError(null);
 setAnswer(null);
 try {
 const res = await fetch("/api/ai-mentor/ask", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ question: question.trim() }),
 });
 const data = await res.json().catch(() => ({}));
 if (res.status === 501) {
 setError("The Professor isn't switched on for this account yet.");
 return;
 }
 if (res.status === 429) {
 setError(data.message || "You've reached today's question limit. Come back tomorrow.");
 return;
 }
 if (!res.ok) {
 setError(data.message || data.error || "The Professor couldn't answer right now. Try again.");
 return;
 }
 setAnswer(data.response ?? "");
 } catch {
 setError("Network error. Try again.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <section style={{ borderTop: "2px solid var(--accent)", paddingTop: "1rem", marginBottom: "2rem" }}>
 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
 <GraduationCap size={18} style={{ color: "var(--accent)" }} />
 <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.05em", margin: 0 }}>
 Ask The Professor
 </h2>
 </div>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.55, marginBottom: "0.875rem", maxWidth: 640 }}>
 Your AI mentor. Ask about this week, a concept you&apos;re stuck on, or paste your own code for feedback.
 It already knows which week you&apos;re on, hold nothing back.
 </p>

 <textarea
 value={question}
 onChange={(e) => setQuestion(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask();
 }}
 rows={3}
 className="forge-input"
 placeholder="e.g. I built the API but I'm not sure my error handling is right — here's the code…"
 style={{ resize: "vertical", lineHeight: 1.6, width: "100%" }}
 />

 <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginTop: "0.75rem" }}>
 <button
 type="button"
 onClick={ask}
 disabled={!canAsk}
 className="forge-btn forge-btn-primary"
 style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", opacity: canAsk ? 1 : 0.45 }}
 >
 {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
 {loading ? "The Professor is thinking…" : "Ask"}
 </button>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
 Ctrl/⌘ + Enter to send
 </span>
 </div>

 {error && (
 <p style={{ marginTop: "0.875rem", color: "var(--red)", fontSize: "0.875rem", lineHeight: 1.55 }}>{error}</p>
 )}

 {answer && (
 <div style={{ marginTop: "1.125rem", borderLeft: "3px solid var(--accent)", paddingLeft: "1rem" }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.5rem" }}>
 The Professor
 </p>
 <div style={{ color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
 {answer}
 </div>
 </div>
 )}
 </section>
 );
}
