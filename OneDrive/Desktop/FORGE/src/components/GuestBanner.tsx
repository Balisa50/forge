"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { UserPlus, X, Flame } from "lucide-react";

export default function GuestBanner() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Wipe guest data automatically when the tab is closed / browser navigates away
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon("/api/guest/cleanup");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // On mobile: render a compact floating "guest" chip in the bottom-right
  // instead of the top bar that overlaps content.
  const handleExit = async () => {
    await fetch("/api/guest/cleanup", { method: "POST" });
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  if (isMobile) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 12,
          right: 12,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.4rem 0.625rem",
          background: "rgba(15, 12, 8, 0.92)",
          border: "1px solid rgba(245,158,11,0.35)",
          borderRadius: 999,
          backdropFilter: "blur(8px)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          letterSpacing: "0.08em",
          boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
        }}
      >
        <Flame size={11} color="var(--accent)" strokeWidth={2} />
        <span style={{ color: "var(--accent)", textTransform: "uppercase" }}>Guest</span>
        <Link
          href="/register"
          style={{ marginLeft: "0.25rem", color: "var(--green)", textDecoration: "none", padding: "0.15rem 0.4rem", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 999 }}
        >
          Save
        </Link>
        <button
          onClick={handleExit}
          style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: "0.15rem", display: "flex", alignItems: "center" }}
          aria-label="Exit guest"
        >
          <X size={11} />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: 28,
        background: "rgba(15, 12, 8, 0.92)",
        borderBottom: "1px solid rgba(245,158,11,0.35)",
        backdropFilter: "blur(8px)",
        padding: "0 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Flame size={14} color="var(--accent)" strokeWidth={2} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            color: "var(--accent)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Guest Mode
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
          }}
        >
          — your progress is erased when you leave
        </span>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexShrink: 0 }}>
        <Link
          href="/register"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            letterSpacing: "0.08em",
            color: "var(--green)",
            textDecoration: "none",
            padding: "0.3rem 0.625rem",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "4px",
            background: "rgba(34,197,94,0.07)",
            transition: "background 0.15s",
          }}
        >
          <UserPlus size={12} strokeWidth={2} />
          Save progress
        </Link>

        <button
          onClick={handleExit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            cursor: "pointer",
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            letterSpacing: "0.08em",
            padding: "0.3rem 0.625rem",
            transition: "border-color 0.15s",
          }}
        >
          <X size={12} strokeWidth={2} />
          Exit
        </button>
      </div>
    </div>
  );
}
