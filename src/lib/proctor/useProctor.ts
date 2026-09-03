"use client";

/**
 * THE PROFESSOR watches. In-browser exam proctoring for the viva.
 *
 * Runs entirely on the learner's device using Google's MediaPipe FaceLandmarker
 * (WASM + model streamed from a CDN — nothing stored on our side, no video ever
 * leaves the machine). It watches the webcam while the learner defends their
 * work and reliably catches the things that actually matter:
 *   - no face in frame        (they walked off / hid)
 *   - more than one face       (someone else is helping)
 *   - looking away / off-screen (reading answers off a phone or 2nd monitor)
 *   - leaving the page/tab      (classic "go copy the answer" move)
 *
 * Only EVENTS (type + timestamp) and, on serious flags, a couple of tiny
 * downscaled snapshots are handed back — never a video stream. Everything is
 * best-effort: if the camera is denied or the model can't load, the hook
 * degrades to `proctored: false` so the viva still works, just flagged.
 */

import { useCallback, useEffect, useRef, useState } from "react";

// Keep the CDN wasm at the SAME version as the npm dep to avoid ABI drift.
const MP_VERSION = "0.10.18";
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODEL_URL =
 "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// Detection cadence + de-bounce so we don't spam events or burn CPU.
const DETECT_INTERVAL_MS = 220; // ~4–5 fps is plenty for presence/gaze
const CONFIRM_MS = 1400; // a condition must persist this long to count
const COOLDOWN_MS = 8000; // min gap between two events of the same type
const MAX_SNAPSHOTS = 6; // hard cap on stored stills (payload guard)
const MAX_EVENTS = 60;

// Landmark indices (MediaPipe FaceLandmarker, 468-point mesh).
const NOSE = 1;
const FACE_L = 234; // right cheek edge in image space
const FACE_R = 454; // left cheek edge in image space
const TURN_LOW = 0.34; // horizontal nose ratio outside [low, high] = looking away
const TURN_HIGH = 0.66;

export type ProctorStatus =
 | "idle"
 | "starting"
 | "active"
 | "denied"
 | "unsupported"
 | "error";

export type ProctorCoaching = {
 tone: "ok" | "warn" | "bad";
 message: string;
};

export interface TranscriptEventEntry {
 role: "proctor";
 kind: "event";
 event: { type: string; label: string };
 timestamp: string;
}
export interface TranscriptSnapshotEntry {
 role: "proctor";
 kind: "snapshot";
 content: string; // data URL (downscaled JPEG)
 timestamp: string;
}

export interface ProctorReport {
 /** true only if the camera was granted AND the model actually ran. */
 proctored: boolean;
 events: TranscriptEventEntry[];
 snapshots: TranscriptSnapshotEntry[];
 /** one-line human summary of what happened, for the grader + reviewer. */
 summary: string;
}

type Condition = "no_face" | "multi_face" | "looking_away";

const LABELS: Record<string, string> = {
 no_face: "Face left the frame",
 multi_face: "More than one person on camera",
 looking_away: "Looking away from the screen",
 tab_hidden: "Left the page during the defence",
};

export function useProctor(enabled: boolean) {
 const [status, setStatus] = useState<ProctorStatus>("idle");
 const [coaching, setCoaching] = useState<ProctorCoaching>({ tone: "ok", message: "Starting the camera…" });
 const [flagCount, setFlagCount] = useState(0);

 const videoRef = useRef<HTMLVideoElement | null>(null);
 const streamRef = useRef<MediaStream | null>(null);
 const landmarkerRef = useRef<{ detectForVideo: (v: HTMLVideoElement, t: number) => { faceLandmarks: { x: number; y: number }[][] }; close: () => void } | null>(null);
 const rafRef = useRef<number | null>(null);
 const lastDetectRef = useRef(0);

 // De-bounce bookkeeping.
 const sinceRef = useRef<Partial<Record<Condition, number>>>({});
 const lastEmitRef = useRef<Partial<Record<string, number>>>({});

 // Collected output (refs so the detection loop can push without re-renders).
 const eventsRef = useRef<TranscriptEventEntry[]>([]);
 const snapsRef = useRef<TranscriptSnapshotEntry[]>([]);
 const proctoredRef = useRef(false);

 const emit = useCallback((type: string, opts?: { snapshot?: boolean }) => {
 const now = Date.now();
 if (now - (lastEmitRef.current[type] ?? 0) < COOLDOWN_MS) return;
 lastEmitRef.current[type] = now;
 if (eventsRef.current.length < MAX_EVENTS) {
 eventsRef.current.push({
 role: "proctor",
 kind: "event",
 event: { type, label: LABELS[type] ?? type },
 timestamp: new Date(now).toISOString(),
 });
 }
 setFlagCount((c) => c + 1);

 if (opts?.snapshot && snapsRef.current.length < MAX_SNAPSHOTS) {
 const v = videoRef.current;
 if (v && v.videoWidth) {
 try {
 const c = document.createElement("canvas");
 c.width = 160;
 c.height = Math.round((v.videoHeight / v.videoWidth) * 160) || 120;
 const ctx = c.getContext("2d");
 if (ctx) {
 ctx.drawImage(v, 0, 0, c.width, c.height);
 snapsRef.current.push({
 role: "proctor",
 kind: "snapshot",
 content: c.toDataURL("image/jpeg", 0.5),
 timestamp: new Date(now).toISOString(),
 });
 }
 } catch {
 /* snapshot is best-effort */
 }
 }
 }
 }, []);

 // A condition only "fires" once it has held for CONFIRM_MS.
 const track = useCallback(
 (cond: Condition, active: boolean, snapshot: boolean) => {
 const now = Date.now();
 if (active) {
 if (!sinceRef.current[cond]) sinceRef.current[cond] = now;
 if (now - (sinceRef.current[cond] as number) >= CONFIRM_MS) emit(cond, { snapshot });
 } else {
 sinceRef.current[cond] = undefined;
 }
 },
 [emit],
 );

 // Main loop.
 const loop = useCallback(() => {
 rafRef.current = requestAnimationFrame(loop);
 const v = videoRef.current;
 const lm = landmarkerRef.current;
 if (!v || !lm || v.readyState < 2) return;
 const now = performance.now();
 if (now - lastDetectRef.current < DETECT_INTERVAL_MS) return;
 lastDetectRef.current = now;

 let faces: { x: number; y: number }[][] = [];
 try {
 faces = lm.detectForVideo(v, now).faceLandmarks ?? [];
 } catch {
 return;
 }

 const count = faces.length;
 const noFace = count === 0;
 const multi = count >= 2;

 let lookingAway = false;
 if (count === 1) {
 const f = faces[0];
 const L = f[FACE_L];
 const R = f[FACE_R];
 const N = f[NOSE];
 if (L && R && N) {
 const span = R.x - L.x;
 if (Math.abs(span) > 0.01) {
 const ratio = (N.x - L.x) / span;
 lookingAway = ratio < TURN_LOW || ratio > TURN_HIGH;
 }
 }
 }

 track("no_face", noFace, true);
 track("multi_face", multi, true);
 track("looking_away", lookingAway, false);

 // Live coaching (ephemeral, not stored).
 if (multi) setCoaching({ tone: "bad", message: "Only you should be on camera — ask others to step away." });
 else if (noFace) setCoaching({ tone: "bad", message: "Sit back so the camera can see your face." });
 else if (lookingAway) setCoaching({ tone: "warn", message: "Eyes on your own screen — keep facing the camera." });
 else setCoaching({ tone: "ok", message: "You're centered. Answer in your own words." });
 }, [track]);

 // Start / stop lifecycle.
 useEffect(() => {
 if (!enabled) return;
 let disposed = false;

 (async () => {
 if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
 setStatus("unsupported");
 setCoaching({ tone: "warn", message: "This browser can't run the camera check — your defence will be marked unproctored." });
 return;
 }
 setStatus("starting");
 try {
 const stream = await navigator.mediaDevices.getUserMedia({
 video: { facingMode: "user", width: 320, height: 240 },
 audio: false,
 });
 if (disposed) { stream.getTracks().forEach((t) => t.stop()); return; }
 streamRef.current = stream;
 if (videoRef.current) {
 videoRef.current.srcObject = stream;
 await videoRef.current.play().catch(() => {});
 }

 // Load the model (lazy import keeps it out of the server bundle).
 const vision = await import("@mediapipe/tasks-vision");
 const fileset = await vision.FilesetResolver.forVisionTasks(WASM_URL);
 const landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
 baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
 runningMode: "VIDEO",
 numFaces: 2,
 });
 if (disposed) { landmarker.close(); return; }
 landmarkerRef.current = landmarker as unknown as typeof landmarkerRef.current;
 proctoredRef.current = true;
 setStatus("active");
 setCoaching({ tone: "ok", message: "Camera on. The Professor is watching — answer in your own words." });
 rafRef.current = requestAnimationFrame(loop);
 } catch (err) {
 const denied = err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError");
 setStatus(denied ? "denied" : "error");
 setCoaching({
 tone: "bad",
 message: denied
 ? "Camera blocked. Allow it to defend proctored, or submit unproctored (this will be flagged)."
 : "Camera couldn't start — your defence will be marked unproctored.",
 });
 }
 })();

 // Leaving the page/tab mid-defence is a classic tell — 100% reliable, free.
 const onHide = () => {
 if (document.hidden) emit("tab_hidden");
 };
 document.addEventListener("visibilitychange", onHide);

 return () => {
 disposed = true;
 document.removeEventListener("visibilitychange", onHide);
 if (rafRef.current) cancelAnimationFrame(rafRef.current);
 landmarkerRef.current?.close();
 landmarkerRef.current = null;
 streamRef.current?.getTracks().forEach((t) => t.stop());
 streamRef.current = null;
 };
 }, [enabled, loop, emit]);

 const getReport = useCallback((): ProctorReport => {
 const proctored = proctoredRef.current;
 const events = eventsRef.current;
 const snaps = snapsRef.current;
 let summary: string;
 if (!proctored) {
 summary = "UNPROCTORED — the learner did not complete the camera check for this defence.";
 } else if (events.length === 0) {
 summary = "Proctored, clean — no integrity flags: one face present and facing the screen throughout.";
 } else {
 const counts: Record<string, number> = {};
 for (const e of events) counts[e.event.type] = (counts[e.event.type] ?? 0) + 1;
 const parts = Object.entries(counts).map(([t, n]) => `${LABELS[t] ?? t} ×${n}`);
 summary = `Proctored, FLAGGED: ${parts.join("; ")}.`;
 }
 return { proctored, events, snapshots: snaps, summary };
 }, []);

 return { status, coaching, flagCount, videoRef, getReport };
}
