"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Trash2, X } from "lucide-react";

interface Notif {
 id: string;
 kind: string;
 title: string;
 body?: string | null;
 href?: string | null;
 readAt?: string | null;
 createdAt: string;
}

function timeAgo(iso: string) {
 const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
 if (s < 60) return "just now";
 if (s < 3600) return `${Math.floor(s / 60)}m ago`;
 if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
 return `${Math.floor(s / 86400)}d ago`;
}

/**
 * One notification row. Supports swipe-left-to-delete on touch devices and a
 * hover trash button on desktop (where there's no swipe gesture). The red
 * "delete" backdrop is revealed as the foreground slides left; releasing past
 * the threshold animates the row out and calls onDismiss.
 */
function NotifRow({
 n,
 onOpen,
 onDismiss,
}: {
 n: Notif;
 onOpen: (n: Notif) => void;
 onDismiss: (n: Notif) => void;
}) {
 const [dx, setDx] = useState(0);
 const [animate, setAnimate] = useState(false);
 const startX = useRef<number | null>(null);
 const startY = useRef<number | null>(null);
 const swiping = useRef(false);

 const THRESHOLD = 80; // px of left-swipe needed to delete

 const onTouchStart = (e: React.TouchEvent) => {
 startX.current = e.touches[0].clientX;
 startY.current = e.touches[0].clientY;
 swiping.current = false;
 setAnimate(false);
 };

 const onTouchMove = (e: React.TouchEvent) => {
 if (startX.current == null) return;
 const moveX = e.touches[0].clientX - startX.current;
 const moveY = e.touches[0].clientY - (startY.current ?? 0);
 // Lock into a horizontal swipe only once the gesture is clearly sideways,
 // so vertical scrolling of the list still works.
 if (!swiping.current && Math.abs(moveX) > 10 && Math.abs(moveX) > Math.abs(moveY)) {
 swiping.current = true;
 }
 if (swiping.current) {
 setDx(Math.min(0, moveX)); // only reveal the delete action on left-swipe
 }
 };

 const onTouchEnd = () => {
 setAnimate(true);
 if (swiping.current && dx < -THRESHOLD) {
 setDx(-window.innerWidth); // slide fully off, then remove
 setTimeout(() => onDismiss(n), 180);
 } else {
 setDx(0); // snap back
 }
 startX.current = null;
 swiping.current = false;
 };

 return (
 <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border)" }} className="notif-row">
 {/* Red delete backdrop, revealed as the row slides left */}
 <div
 aria-hidden
 style={{
 position: "absolute",
 inset: 0,
 background: "var(--red)",
 display: "flex",
 alignItems: "center",
 justifyContent: "flex-end",
 paddingRight: "1.25rem",
 color: "#fff",
 gap: "0.4rem",
 }}
 >
 <Trash2 size={16} />
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Delete</span>
 </div>

 {/* Foreground, draggable content. Opaque background so it fully covers the
 backdrop when not swiped; unread rows get a subtle accent tint layered
 over the panel colour. */}
 <div
 onTouchStart={onTouchStart}
 onTouchMove={onTouchMove}
 onTouchEnd={onTouchEnd}
 style={{
 position: "relative",
 transform: `translateX(${dx}px)`,
 transition: animate ? "transform 0.18s ease" : "none",
 background: n.readAt
 ? "var(--bg-panel)"
 : "linear-gradient(rgba(245,158,11,0.05),rgba(245,158,11,0.05)), var(--bg-panel)",
 display: "flex",
 gap: "0.625rem",
 alignItems: "flex-start",
 padding: "0.875rem 1rem",
 touchAction: "pan-y", // let vertical scroll through, we handle horizontal
 }}
 >
 {/* Clickable content (open / mark read) */}
 <div
 role="button"
 tabIndex={0}
 onClick={() => { if (!swiping.current) onOpen(n); }}
 onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(n); } }}
 style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start", flex: 1, minWidth: 0, cursor: "pointer", textAlign: "left" }}
 >
 {/* Unread dot */}
 <span style={{
 width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 5,
 background: n.readAt ? "var(--border)" : "var(--accent)",
 }} />
 <div style={{ flex: 1, minWidth: 0 }}>
 <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-primary)", fontWeight: n.readAt ? 400 : 600, lineHeight: 1.4 }}>
 {n.title}
 </p>
 {n.body && (
 <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
 {n.body}
 </p>
 )}
 <p style={{ margin: "0.25rem 0 0", fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.05em" }}>
 {timeAgo(n.createdAt)}
 </p>
 </div>
 </div>

 {/* Desktop delete affordance, appears on hover (touch users swipe instead) */}
 <button
 className="notif-dismiss-btn"
 aria-label="Delete notification"
 onClick={(e) => { e.stopPropagation(); onDismiss(n); }}
 style={{
 flexShrink: 0,
 alignSelf: "center",
 background: "none",
 border: "none",
 cursor: "pointer",
 color: "var(--text-dim)",
 padding: "0.25rem",
 borderRadius: 6,
 display: "flex",
 transition: "color 0.12s, background 0.12s",
 }}
 onMouseEnter={(e) => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
 onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.background = "none"; }}
 >
 <X size={15} />
 </button>
 </div>
 </div>
 );
}

export default function NotificationBell({
 align = "right",
 direction = "down",
}: {
 align?: "left" | "right";
 direction?: "up" | "down";
}) {
 const router = useRouter();
 const [notifs, setNotifs] = useState<Notif[]>([]);
 const [unread, setUnread] = useState(0);
 const [open, setOpen] = useState(false);
 const ref = useRef<HTMLDivElement>(null);

 const load = useCallback(async () => {
 try {
 const res = await fetch("/api/notifications");
 if (!res.ok) return;
 const data = await res.json();
 setNotifs(data.notifications ?? []);
 setUnread(data.unread ?? 0);
 } catch { /* silent */ }
 }, []);

 // Poll every 30 seconds
 useEffect(() => {
 load();
 const id = setInterval(load, 30_000);
 return () => clearInterval(id);
 }, [load]);

 // Close on outside click
 useEffect(() => {
 const handler = (e: MouseEvent) => {
 if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
 };
 document.addEventListener("mousedown", handler);
 return () => document.removeEventListener("mousedown", handler);
 }, []);

 const markAllRead = async () => {
 await fetch("/api/notifications", { method: "PATCH" });
 setNotifs((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
 setUnread(0);
 };

 const clearAll = async () => {
 setNotifs([]);
 setUnread(0);
 setOpen(false);
 try { await fetch("/api/notifications", { method: "DELETE" }); } catch { /* best-effort */ }
 };

 // Dismiss a single notification. Optimistic: drop it from the list and adjust
 // the unread count immediately, then tell the server (best-effort).
 const dismiss = useCallback(async (n: Notif) => {
 setNotifs((prev) => prev.filter((x) => x.id !== n.id));
 if (!n.readAt) setUnread((c) => Math.max(0, c - 1));
 try { await fetch(`/api/notifications?id=${n.id}`, { method: "DELETE" }); } catch { /* best-effort */ }
 }, []);

 const handleClick = useCallback(async (n: Notif) => {
 if (!n.readAt) {
 await fetch(`/api/notifications?id=${n.id}`, { method: "PATCH" });
 setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x));
 setUnread((c) => Math.max(0, c - 1));
 }
 setOpen(false);
 if (n.href) router.push(n.href);
 }, [router]);

 return (
 <div ref={ref} style={{ position: "relative" }}>
 <button
 onClick={() => { setOpen((o) => !o); if (!open) load(); }}
 style={{
 position: "relative",
 background: "none",
 border: "none",
 cursor: "pointer",
 color: open ? "var(--accent)" : "var(--text-secondary)",
 padding: "0.375rem",
 display: "flex",
 alignItems: "center",
 borderRadius: 8,
 transition: "color 0.15s",
 }}
 aria-label="Notifications"
 >
 <Bell size={20} strokeWidth={1.75} />
 {unread > 0 && (
 <span style={{
 position: "absolute",
 top: 0,
 right: 0,
 width: 16,
 height: 16,
 borderRadius: "50%",
 background: "var(--red)",
 color: "#fff",
 fontSize: "0.625rem",
 fontWeight: 700,
 display: "grid",
 placeItems: "center",
 fontFamily: "var(--font-mono)",
 }}>
 {unread > 9 ? "9+" : unread}
 </span>
 )}
 </button>

 {open && (
 <div style={{
 position: "absolute",
 ...(direction === "up"
 ? { bottom: "calc(100% + 0.5rem)" }
 : { top: "calc(100% + 0.5rem)" }),
 ...(align === "left" ? { left: 0 } : { right: 0 }),
 width: "min(360px, calc(100vw - 1.5rem))",
 maxHeight: 440,
 overflowY: "auto",
 background: "var(--bg-panel)",
 border: "1px solid var(--border)",
 borderRadius: 12,
 boxShadow: direction === "up" ? "0 -8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.4)",
 zIndex: 9999,
 }}>
 {/* Header, sticky so the actions stay reachable while the list scrolls */}
 <div style={{ position: "sticky", top: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)", background: "var(--bg-panel)" }}>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)" }}>
 Notifications
 </span>
 <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
 {unread > 0 && (
 <button
 onClick={markAllRead}
 style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}
 >
 Mark all read
 </button>
 )}
 {notifs.length > 0 && (
 <button
 onClick={clearAll}
 style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}
 >
 Clear all
 </button>
 )}
 </div>
 </div>

 {/* List */}
 {notifs.length === 0 ? (
 <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-dim)", fontSize: "0.875rem" }}>
 No notifications yet
 </div>
 ) : (
 notifs.map((n) => (
 <NotifRow key={n.id} n={n} onOpen={handleClick} onDismiss={dismiss} />
 ))
 )}
 </div>
 )}

 {/* Desktop-only: reveal the per-row delete button on hover. Touch users
 delete by swiping the row left instead. */}
 <style>{`
 .notif-dismiss-btn { opacity: 0; }
 .notif-row:hover .notif-dismiss-btn,
 .notif-dismiss-btn:focus-visible { opacity: 1; }
 @media (hover: none) {
 .notif-dismiss-btn { display: none; }
 }
 `}</style>
 </div>
 );
}
