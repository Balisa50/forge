"use client";

/**
 * SwipeCards, a reusable, gamified retention check that lives at the END of a
 * day's teaching (after the lesson + examples, before the coding task).
 *
 * The learner reads a claim about the concept they just learned and swipes:
 * • RIGHT = "true / yes" • LEFT = "false / no"
 * On answer the card reveals whether they were right and a tiny live
 * "simulation" of the concept (the `sim` snippet), so understanding is tested
 * the instant it's formed, and it feels like a game, not a quiz.
 *
 * Works with mouse drag, touch swipe, the on-screen buttons, and arrow keys.
 * Entirely data-driven (cards come from the roadmap JSON) so the same component
 * powers every day of every track.
 */

import { useState, useRef, useCallback } from "react";
import { Check, X, ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import type { SwipeCard } from "@/lib/roadmaps";

export default function SwipeCards({ cards }: { cards: SwipeCard[] }) {
 const [idx, setIdx] = useState(0);
 const [picked, setPicked] = useState<boolean | null>(null); // learner's answer (true=right)
 const [drag, setDrag] = useState(0); // px offset while dragging
 const [score, setScore] = useState(0);
 const startX = useRef<number | null>(null);

 const total = cards.length;
 const card = cards[idx];
 const done = idx >= total;

 const answer = useCallback(
 (saidTrue: boolean) => {
 if (picked !== null || done) return;
 setPicked(saidTrue);
 if (saidTrue === card.answer) setScore((s) => s + 1);
 },
 [picked, done, card],
 );

 const next = () => {
 setPicked(null);
 setDrag(0);
 setIdx((i) => i + 1);
 };

 const restart = () => {
 setIdx(0);
 setPicked(null);
 setDrag(0);
 setScore(0);
 };

 // ----- pointer / touch drag -----
 const onDown = (x: number) => { if (picked === null) startX.current = x; };
 const onMove = (x: number) => { if (startX.current !== null) setDrag(x - startX.current); };
 const onUp = () => {
 if (startX.current === null) return;
 const d = drag;
 startX.current = null;
 if (d > 70) answer(true);
 else if (d < -70) answer(false);
 else setDrag(0);
 };

 if (done) {
 const perfect = score === total;
 return (
 <div style={{ textAlign: "center", padding: "1.25rem", border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-card)" }}>
 <Sparkles size={22} style={{ color: perfect ? "var(--green)" : "var(--accent)", margin: "0 auto 0.5rem", display: "block" }} />
 <p style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.25rem" }}>
 {score} / {total} {perfect ? ", locked in" : ", good check"}
 </p>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.875rem" }}>
 {perfect ? "You've got this concept. Now write it yourself below." : "Re-read the spots you missed, then try the coding task below."}
 </p>
 <button onClick={restart} style={btnGhost}>
 <RotateCcw size={13} /> Swipe again
 </button>
 </div>
 );
 }

 const correct = picked !== null && picked === card.answer;
 const rot = Math.max(-12, Math.min(12, drag / 12));
 const hintRight = drag > 30;
 const hintLeft = drag < -30;

 return (
 <div>
 {/* progress dots */}
 <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: "0.75rem" }}>
 {cards.map((_, i) => (
 <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < idx ? "var(--green)" : i === idx ? "var(--accent)" : "var(--border)" }} />
 ))}
 </div>

 <div
 onMouseDown={(e) => onDown(e.clientX)}
 onMouseMove={(e) => startX.current !== null && onMove(e.clientX)}
 onMouseUp={onUp}
 onMouseLeave={onUp}
 onTouchStart={(e) => onDown(e.touches[0].clientX)}
 onTouchMove={(e) => onMove(e.touches[0].clientX)}
 onTouchEnd={onUp}
 style={{
 position: "relative",
 userSelect: "none",
 touchAction: "pan-y",
 cursor: picked === null ? "grab" : "default",
 transform: `translateX(${drag}px) rotate(${rot}deg)`,
 transition: startX.current === null ? "transform 0.25s cubic-bezier(.16,1,.3,1)" : "none",
 borderRadius: 14,
 border: `1px solid ${picked !== null ? (correct ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)") : "var(--border)"}`,
 background: "linear-gradient(180deg, var(--bg-panel), var(--bg-card))",
 padding: "1.25rem",
 minHeight: 150,
 }}
 >
 {/* swipe hints */}
 <span style={{ position: "absolute", top: 12, left: 12, display: "inline-flex", alignItems: "center", gap: "0.25rem", opacity: hintLeft ? 1 : 0.25, color: "#ef4444", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", fontWeight: 700, transition: "opacity 0.1s" }}><X size={13} /> FALSE</span>
 <span style={{ position: "absolute", top: 12, right: 12, display: "inline-flex", alignItems: "center", gap: "0.25rem", opacity: hintRight ? 1 : 0.25, color: "#22c55e", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", fontWeight: 700, transition: "opacity 0.1s" }}>TRUE <Check size={13} /></span>

 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)", textAlign: "center", margin: "0.5rem 0 0.75rem" }}>
 Retention check {idx + 1}/{total}
 </p>
 <p style={{ fontSize: "1rem", lineHeight: 1.55, color: "var(--text-primary)", textAlign: "center" }}>
 {card.prompt}
 </p>

 {/* reveal */}
 {picked !== null && (
 <div style={{ marginTop: "0.875rem", paddingTop: "0.875rem", borderTop: "1px solid var(--border)" }}>
 <p style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center", fontWeight: 700, color: correct ? "var(--green)" : "#ef4444", marginBottom: "0.5rem" }}>
 {correct ? <Check size={16} /> : <X size={16} />}
 {correct ? "Correct" : "Not quite"}
 </p>
 <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.55, textAlign: "center" }}>
 {correct ? card.whenRight : card.whenWrong}
 </p>
 {card.sim && (
 <pre style={{ marginTop: "0.75rem", background: "#0b0e14", border: "1px solid var(--border)", borderRadius: 8, padding: "0.75rem", overflowX: "auto", fontFamily: "var(--font-mono)", fontSize: "0.75rem", lineHeight: 1.6, color: "#e6e1d6", animation: "swipeSimIn 0.4s ease" }}>
 {card.sim}
 </pre>
 )}
 </div>
 )}
 </div>

 {/* controls */}
 <div style={{ display: "flex", gap: "0.625rem", justifyContent: "center", marginTop: "0.875rem" }}>
 {picked === null ? (
 <>
 <button onClick={() => answer(false)} style={{ ...btnGhost, borderColor: "rgba(239,68,68,0.4)", color: "#ef4444" }}>
 <ArrowLeft size={14} /> False
 </button>
 <button onClick={() => answer(true)} style={{ ...btnGhost, borderColor: "rgba(34,197,94,0.4)", color: "#22c55e" }}>
 True <ArrowRight size={14} />
 </button>
 </>
 ) : (
 <button onClick={next} style={btnPrimary}>
 {idx + 1 >= total ? "See result" : "Next card"} <ArrowRight size={14} />
 </button>
 )}
 </div>

 <style>{`@keyframes swipeSimIn { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
 </div>
 );
}

const btnGhost: React.CSSProperties = {
 display: "inline-flex", alignItems: "center", gap: "0.375rem",
 padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer",
 background: "transparent", border: "1px solid var(--border)",
 color: "var(--text-secondary)", fontFamily: "var(--font-body)",
 fontSize: "0.8125rem", fontWeight: 600,
};
const btnPrimary: React.CSSProperties = {
 display: "inline-flex", alignItems: "center", gap: "0.375rem",
 padding: "0.5rem 1.25rem", borderRadius: 8, cursor: "pointer",
 background: "var(--accent)", border: "none", color: "#000",
 fontFamily: "var(--font-body)", fontSize: "0.8125rem", fontWeight: 700,
};
