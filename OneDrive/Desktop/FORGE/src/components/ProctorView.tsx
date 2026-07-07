"use client";

/**
 * The live proctor surface shown during the viva: a small self-view with a
 * status light and real-time coaching ("sit back", "eyes on your screen").
 * Purely presentational — all detection lives in useProctor.
 */

import { Video, VideoOff, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import type { RefObject } from "react";
import type { ProctorStatus, ProctorCoaching } from "@/lib/proctor/useProctor";

const TONE_COLOR: Record<ProctorCoaching["tone"], string> = {
 ok: "var(--green)",
 warn: "var(--yellow)",
 bad: "var(--red)",
};

export default function ProctorView({
 status,
 coaching,
 flagCount,
 videoRef,
}: {
 status: ProctorStatus;
 coaching: ProctorCoaching;
 flagCount: number;
 videoRef: RefObject<HTMLVideoElement | null>;
}) {
 const live = status === "active";
 const failed = status === "denied" || status === "unsupported" || status === "error";
 const accent = failed ? "var(--red)" : live ? TONE_COLOR[coaching.tone] : "var(--text-dim)";

 return (
 <div
 style={{
 display: "flex",
 alignItems: "center",
 gap: "0.875rem",
 padding: "0.625rem 0.75rem",
 marginBottom: "1.125rem",
 border: `1px solid var(--border)`,
 borderLeft: `3px solid ${accent}`,
 borderRadius: 8,
 background: "var(--bg-card)",
 }}
 >
 {/* Self-view (mirrored). Hidden when there's no live feed. */}
 <div
 style={{
 position: "relative",
 width: 88,
 height: 66,
 flexShrink: 0,
 borderRadius: 6,
 overflow: "hidden",
 background: "#000",
 border: `1px solid ${accent}`,
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 }}
 >
 <video
 ref={videoRef}
 muted
 playsInline
 style={{
 width: "100%",
 height: "100%",
 objectFit: "cover",
 transform: "scaleX(-1)",
 display: live ? "block" : "none",
 }}
 />
 {status === "starting" && <Loader2 size={18} className="animate-spin" style={{ color: "var(--text-dim)" }} />}
 {failed && <VideoOff size={18} style={{ color: "var(--red)" }} />}
 {/* Recording dot */}
 {live && (
 <span
 style={{
 position: "absolute",
 top: 4,
 left: 4,
 width: 7,
 height: 7,
 borderRadius: "50%",
 background: "var(--red)",
 boxShadow: "0 0 0 2px rgba(0,0,0,0.4)",
 }}
 />
 )}
 </div>

 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.15rem" }}>
 {live ? (
 <ShieldCheck size={13} style={{ color: accent }} />
 ) : failed ? (
 <ShieldAlert size={13} style={{ color: "var(--red)" }} />
 ) : (
 <Video size={13} style={{ color: "var(--text-dim)" }} />
 )}
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>
 {live ? "Proctored" : failed ? "Unproctored" : "Proctor starting"}
 </span>
 {live && flagCount > 0 && (
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--yellow)" }}>
 · {flagCount} flag{flagCount === 1 ? "" : "s"}
 </span>
 )}
 </div>
 <p style={{ fontSize: "0.8125rem", color: failed ? "var(--red)" : "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>
 {coaching.message}
 </p>
 </div>
 </div>
 );
}
