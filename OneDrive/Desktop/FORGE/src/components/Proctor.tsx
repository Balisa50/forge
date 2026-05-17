"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, Eye, AlertTriangle, Loader2 } from "lucide-react";

/**
 * Proctor sidecar.
 *
 * What it actually does (honestly):
 *  - Requests the webcam, takes a JPEG snapshot every 30s, sends it to the
 *    server. The mentor reviews these later. We log this to the user.
 *  - Listens for visibilitychange / fullscreenchange / window blur / paste
 *    on the body. Each fires a "proctor event" beacon.
 *  - We do NOT claim to prevent screenshots. We log what we can detect.
 *
 * `onIntegrityFail` is called if too many high-severity events fire
 * (more than 3 tab-leaves or fullscreen-exits during the exam).
 */

interface Props {
  interrogationId: string;
  onIntegrityFail?: () => void;
}

const SNAPSHOT_EVERY_MS = 30_000;
const SEVERE_EVENT_LIMIT = 3;

export default function Proctor({ interrogationId, onIntegrityFail }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"requesting" | "live" | "denied" | "no-camera">("requesting");
  const [eventCount, setEventCount] = useState(0);
  const severeRef = useRef(0);

  // Beacon helper — never throws, never blocks
  const post = useCallback(async (kind: "snapshot" | "event", data: string | Record<string, unknown>) => {
    try {
      await fetch(`/api/interrogations/${interrogationId}/proctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, data }),
        keepalive: true,
      });
    } catch {
      // Don't crash the exam over a network blip
    }
  }, [interrogationId]);

  // 1. Camera — request + attach
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("no-camera");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("live");
      } catch (err) {
        setStatus("denied");
        post("event", { type: "camera_denied", detail: err instanceof Error ? err.message : String(err) });
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [post]);

  // 2. Snapshot loop
  useEffect(() => {
    if (status !== "live") return;
    const id = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Quality 0.55 ~ 25KB JPEG at 320x240 — well under the 120KB server cap
      const dataUrl = canvas.toDataURL("image/jpeg", 0.55);
      post("snapshot", dataUrl);
    }, SNAPSHOT_EVERY_MS);
    return () => clearInterval(id);
  }, [status, post]);

  // 3. Integrity events
  useEffect(() => {
    const bump = (type: string, severe = false) => {
      post("event", { type, detail: severe ? "severe" : "info" });
      setEventCount((c) => c + 1);
      if (severe) {
        severeRef.current += 1;
        if (severeRef.current > SEVERE_EVENT_LIMIT && onIntegrityFail) {
          onIntegrityFail();
        }
      }
    };

    const onVisibility = () => { if (document.hidden) bump("tab_hidden", true); };
    const onFullscreen = () => { if (!document.fullscreenElement) bump("fullscreen_exit", true); };
    const onBlur = () => bump("window_blur");
    const onPaste = (e: ClipboardEvent) => bump("paste", (e.clipboardData?.getData("text") ?? "").length > 100);
    const onContextMenu = (e: MouseEvent) => { e.preventDefault(); bump("right_click"); };

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    window.addEventListener("blur", onBlur);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContextMenu);

    // We DO NOT auto-request fullscreen here — mobile browsers reject it
    // unless triggered by a user gesture, and some throw layout-breaking
    // errors. Fullscreen is a manual user action via the OS controls.

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreen);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, [post, onIntegrityFail]);

  return (
    <>
      <video ref={videoRef} autoPlay playsInline muted style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Proctor status indicator — small, always visible */}
      <div
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.4rem 0.625rem",
          background: "rgba(15,12,8,0.9)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          letterSpacing: "0.08em",
          backdropFilter: "blur(6px)",
        }}
      >
        {status === "requesting" && <><Loader2 size={11} className="animate-spin" style={{ color: "var(--accent)" }} /> CAMERA…</>}
        {status === "live" && <><Camera size={11} style={{ color: "#ef4444" }} /> <span style={{ color: "var(--text-dim)" }}>REC</span></>}
        {status === "denied" && <><AlertTriangle size={11} style={{ color: "var(--yellow)" }} /> <span style={{ color: "var(--yellow)" }}>NO CAMERA</span></>}
        {status === "no-camera" && <><Eye size={11} style={{ color: "var(--text-dim)" }} /> <span style={{ color: "var(--text-dim)" }}>NO CAM</span></>}
        {eventCount > 0 && (
          <span style={{ color: "var(--yellow)", borderLeft: "1px solid var(--border)", paddingLeft: "0.5rem", marginLeft: "0.25rem" }}>
            {eventCount} flag{eventCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </>
  );
}
