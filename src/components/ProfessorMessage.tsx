"use client";

/**
 * The Professor, speaking first.
 *
 * Polls /api/ai-mentor/latest; when The Professor has left an unread message
 * (a proactive review of work the learner just shipped), it slides in as a
 * fixed pop-up on the dashboard — the mentor reaching out unprompted, not a
 * chatbot waiting to be probed. Dismiss marks it read so it won't return.
 */

import { useEffect, useState } from "react";
import { GraduationCap, X } from "lucide-react";

interface ProfessorMsg {
 id: string;
 title: string;
 body: string;
 href?: string | null;
 createdAt: string;
}

export default function ProfessorMessage() {
 const [msg, setMsg] = useState<ProfessorMsg | null>(null);
 const [shown, setShown] = useState(false);

 useEffect(() => {
 let cancelled = false;
 const load = async () => {
 try {
 const res = await fetch("/api/ai-mentor/latest");
 if (!res.ok) return;
 const data = await res.json();
 if (!cancelled && data.message && (!msg || data.message.id !== msg.id)) {
 setMsg(data.message);
 // next tick so the slide-in transition fires
 requestAnimationFrame(() => setShown(true));
 }
 } catch { /* silent */ }
 };
 load();
 const id = setInterval(load, 60_000);
 return () => { cancelled = true; clearInterval(id); };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const dismiss = async () => {
 if (!msg) return;
 const id = msg.id;
 setShown(false);
 setTimeout(() => setMsg(null), 250);
 try {
 await fetch("/api/ai-mentor/latest", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ id }),
 });
 } catch { /* best effort */ }
 };

 if (!msg) return null;

 return (
 <div
 role="status"
 aria-live="polite"
 style={{
 position: "fixed",
 right: "1.25rem",
 bottom: "1.25rem",
 zIndex: 60,
 width: "min(420px, calc(100vw - 2.5rem))",
 maxHeight: "70vh",
 display: "flex",
 flexDirection: "column",
 background: "var(--bg-panel)",
 border: "1px solid rgba(245,158,11,0.35)",
 borderTop: "3px solid var(--accent)",
 borderRadius: 12,
 boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
 transform: shown ? "translateY(0)" : "translateY(140%)",
 opacity: shown ? 1 : 0,
 transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1), opacity 0.28s",
 }}
 >
 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 1rem 0.5rem" }}>
 <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 8, background: "rgba(245,158,11,0.12)", color: "var(--accent)", flexShrink: 0 }}>
 <GraduationCap size={17} />
 </span>
 <div style={{ minWidth: 0, flex: 1 }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>
 The Professor
 </p>
 <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", margin: "0.1rem 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
 {msg.title}
 </p>
 </div>
 <button
 onClick={dismiss}
 aria-label="Dismiss"
 style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: "0.25rem", flexShrink: 0 }}
 >
 <X size={16} />
 </button>
 </div>

 <div style={{ padding: "0 1rem 0.5rem", overflowY: "auto", color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
 {msg.body}
 </div>

 <div style={{ padding: "0.625rem 1rem 0.875rem", display: "flex", justifyContent: "flex-end" }}>
 <button
 onClick={dismiss}
 className="forge-btn forge-btn-primary"
 style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem" }}
 >
 Got it
 </button>
 </div>
 </div>
 );
}
