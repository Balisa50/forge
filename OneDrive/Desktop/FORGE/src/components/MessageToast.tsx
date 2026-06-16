"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, X } from "lucide-react";

/**
 * Global live-message toast. Mounted once in the dashboard layout. Polls the
 * Messages view of the notification feed every ~12s and, when a NEW message
 * arrives while you're using the app, slides a toast in at the top. Clicking it
 * jumps to the thread. Near-live (no websockets/SSE), so it works fine on
 * Vercel's serverless model.
 *
 * On first poll it just records the newest existing message as a baseline and
 * stays quiet — you only get toasted for messages that land AFTER the page
 * loads. Anything you missed while away is still counted by the Messages inbox
 * badge.
 */
interface MsgNotif {
 id: string;
 title: string;
 body?: string | null;
 href?: string | null;
 createdAt: string;
}

export default function MessageToast() {
 const router = useRouter();
 const [toast, setToast] = useState<MsgNotif | null>(null);
 const lastSeen = useRef<number>(Date.now()); // newest message timestamp handled
 const seeded = useRef(false);
 const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

 const show = useCallback((n: MsgNotif) => {
 setToast(n);
 if (hideTimer.current) clearTimeout(hideTimer.current);
 hideTimer.current = setTimeout(() => setToast(null), 6500);
 }, []);

 const poll = useCallback(async () => {
 try {
 const res = await fetch("/api/notifications?view=messages");
 if (!res.ok) return;
 const data = await res.json();
 const newest: MsgNotif | undefined = (data.notifications ?? [])[0];
 if (!newest) return;
 const t = new Date(newest.createdAt).getTime();
 // First poll just establishes the baseline so we don't toast a backlog.
 if (!seeded.current) {
 lastSeen.current = Math.max(lastSeen.current, t);
 seeded.current = true;
 return;
 }
 if (t > lastSeen.current) {
 lastSeen.current = t;
 show(newest);
 }
 } catch { /* silent */ }
 }, [show]);

 useEffect(() => {
 poll();
 const id = setInterval(poll, 12_000);
 return () => {
 clearInterval(id);
 if (hideTimer.current) clearTimeout(hideTimer.current);
 };
 }, [poll]);

 const open = () => {
 const href = toast?.href;
 setToast(null);
 if (href) router.push(href);
 };

 if (!toast) return null;

 return (
 <div
 style={{
 position: "fixed",
 top: "1rem",
 left: "50%",
 transform: "translateX(-50%)",
 zIndex: 9997,
 width: "min(420px, calc(100vw - 1.5rem))",
 animation: "forge-toast-in 0.22s ease",
 }}
 className="forge-msg-toast"
 >
 <div
 role="button"
 tabIndex={0}
 onClick={open}
 onKeyDown={(e) => { if (e.key === "Enter") open(); }}
 style={{
 display: "flex",
 alignItems: "flex-start",
 gap: "0.75rem",
 padding: "0.875rem 1rem",
 background: "var(--bg-panel)",
 border: "1px solid var(--accent)",
 borderRadius: 12,
 boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
 cursor: "pointer",
 }}
 >
 <span
 style={{
 width: 30, height: 30, borderRadius: 8, flexShrink: 0,
 background: "rgba(245,158,11,0.14)", color: "var(--accent)",
 display: "grid", placeItems: "center",
 }}
 >
 <MessageSquare size={16} />
 </span>
 <div style={{ flex: 1, minWidth: 0 }}>
 <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
 {toast.title}
 </p>
 {toast.body && (
 <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
 {toast.body}
 </p>
 )}
 </div>
 <button
 onClick={(e) => { e.stopPropagation(); setToast(null); }}
 aria-label="Dismiss"
 style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0.15rem", display: "flex" }}
 >
 <X size={15} />
 </button>
 </div>

 <style>{`
 @keyframes forge-toast-in {
 from { opacity: 0; transform: translate(-50%, -12px); }
 to { opacity: 1; transform: translate(-50%, 0); }
 }
 /* On mobile the fixed top bar occupies the top 3.5rem; drop the toast
 below it so it doesn't cover the logo/icons. */
 @media (max-width: 768px) {
 .forge-msg-toast { top: 4.25rem !important; }
 }
 `}</style>
 </div>
 );
}
