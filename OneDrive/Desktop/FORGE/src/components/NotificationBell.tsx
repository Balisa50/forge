"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

interface Notif {
  id: string;
  kind: string;
  title: string;
  body?: string | null;
  href?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export default function NotificationBell({
  align = "right",
  direction = "down",
}: {
  align?: "left" | "right";
  direction?: "up" | "down";
}) {
  const router = useRouter();
  const [notifs, setNotifs]   = useState<Notif[]>([]);
  const [unread, setUnread]   = useState(0);
  const [open, setOpen]       = useState(false);
  const ref                   = useRef<HTMLDivElement>(null);

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

  const handleClick = async (n: Notif) => {
    if (!n.readAt) {
      await fetch(`/api/notifications?id=${n.id}`, { method: "PATCH" });
      setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x));
      setUnread((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.href) router.push(n.href);
  };

  const timeAgo = (iso: string) => {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

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
          width: "min(320px, calc(100vw - 1.5rem))",
          maxHeight: 420,
          overflowY: "auto",
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          boxShadow: direction === "up" ? "0 -8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.4)",
          zIndex: 9999,
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)" }}>
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {notifs.length === 0 ? (
            <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-dim)", fontSize: "0.875rem" }}>
              No notifications yet
            </div>
          ) : (
            notifs.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  width: "100%",
                  background: n.readAt ? "none" : "rgba(245,158,11,0.04)",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  padding: "0.875rem 1rem",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  gap: "0.625rem",
                  alignItems: "flex-start",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = n.readAt ? "none" : "rgba(245,158,11,0.04)"; }}
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
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
