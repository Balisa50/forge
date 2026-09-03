"use client";

/**
 * Themed replacement for browser `confirm()` / `prompt()` / `alert()` so
 * mentor actions never trigger the OS-native dialog UI. Keeps the FORGE
 * look-and-feel even on Firefox/Chrome's most aggressive default styling.
 *
 * Usage:
 * const [dialog, setDialog] = useState<DialogConfig | null>(null);
 * setDialog({ kind: "confirm", title: "...", message: "...", onConfirm: () => ... });
 * <Dialog config={dialog} onClose={() => setDialog(null)} />
 */

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

export type DialogConfig =
 | {
 kind: "confirm";
 title: string;
 message: string;
 confirmText?: string;
 cancelText?: string;
 danger?: boolean;
 onConfirm: () => void | Promise<void>;
 }
 | {
 kind: "alert";
 title: string;
 message: string;
 buttonText?: string;
 }
 | {
 kind: "release";
 taskTitle: string;
 mode: "release" | "extend";
 defaultDate: string;
 onSubmit: (deadlineIsoDate: string, note: string) => void | Promise<void>;
 }
 | {
 kind: "prompt";
 title: string;
 message: string;
 label: string;
 placeholder?: string;
 confirmText?: string;
 danger?: boolean;
 /** Minimum characters required before the confirm button enables. */
 minLength?: number;
 onSubmit: (value: string) => void | Promise<void>;
 }
 | {
 kind: "verify";
 taskTitle: string;
 /** Called with the 1, 5 depth rating the mentor picked. Null = skipped. */
 onSubmit: (depthRating: number | null) => void | Promise<void>;
 }
 | {
 /** Destructive confirm that forces the user to type an exact phrase
 * (e.g. the mentee's name) before the action unlocks. Used for
 * irreversible operations like deleting a mentee's account. */
 kind: "confirm-text";
 title: string;
 message: string;
 /** Exact phrase the user must type to enable confirm (case-insensitive). */
 confirmPhrase: string;
 confirmText?: string;
 danger?: boolean;
 onConfirm: () => void | Promise<void>;
 };

interface Props {
 config: DialogConfig | null;
 onClose: () => void;
}

export default function Dialog({ config, onClose }: Props) {
 const [busy, setBusy] = useState(false);
 const [date, setDate] = useState("");
 const [note, setNote] = useState("");
 const [rating, setRating] = useState<number | null>(null);
 // Surfaces an error thrown by a confirm/submit handler. Without this, a
 // handler that failed (e.g. the seed-roadmap POST 500'd) was invisible: the
 // dialog just closed and the click looked dead. Now the error shows inline
 // and the dialog stays open so the user actually sees what went wrong.
 const [actionError, setActionError] = useState<string | null>(null);
 const firstFocusRef = useRef<HTMLButtonElement | HTMLInputElement | null>(null);

 // Reset form state every time the dialog opens with a new config
 useEffect(() => {
 setBusy(false);
 setRating(null);
 setActionError(null);
 if (config?.kind === "release") {
 setDate(config.defaultDate);
 setNote("");
 } else {
 setDate("");
 setNote("");
 }
 }, [config]);

 // Auto-focus the primary control + close on Escape
 useEffect(() => {
 if (!config) return;
 const t = setTimeout(() => firstFocusRef.current?.focus(), 30);
 const onKey = (e: KeyboardEvent) => {
 if (e.key === "Escape" && !busy) onClose();
 };
 window.addEventListener("keydown", onKey);
 return () => {
 clearTimeout(t);
 window.removeEventListener("keydown", onKey);
 };
 }, [config, busy, onClose]);

 if (!config) return null;

 // Run a handler, closing the dialog only on success. If the handler throws,
 // keep the dialog open and show the error inline so the action never looks
 // like it silently did nothing.
 const runHandler = async (fn: () => void | Promise<void>) => {
 setBusy(true);
 setActionError(null);
 try {
 await fn();
 onClose();
 } catch (e) {
 setActionError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
 } finally {
 setBusy(false);
 }
 };

 const handleConfirm = async () => {
 if (config.kind === "alert") {
 onClose();
 return;
 }
 if (config.kind === "release") {
 const parsed = new Date(date + "T23:59:00");
 if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
 return; // invalid, let the user try again, validation message below
 }
 await runHandler(() => config.onSubmit(parsed.toISOString(), note.trim()));
 return;
 }
 if (config.kind === "prompt") {
 if (note.trim().length < (config.minLength ?? 1)) return;
 await runHandler(() => config.onSubmit(note.trim()));
 return;
 }
 if (config.kind === "verify") {
 await runHandler(() => config.onSubmit(rating));
 return;
 }
 if (config.kind === "confirm-text") {
 if (note.trim().toLowerCase() !== config.confirmPhrase.trim().toLowerCase()) return;
 await runHandler(() => config.onConfirm());
 return;
 }
 await runHandler(() => config.onConfirm());
 };

 const releaseDateInvalid =
 config.kind === "release" &&
 (!date || Number.isNaN(new Date(date + "T23:59:00").getTime()) || new Date(date + "T23:59:00").getTime() <= Date.now());

 const danger = (config.kind === "confirm" || config.kind === "prompt" || config.kind === "confirm-text") && config.danger;

 return (
 <div
 onClick={() => !busy && onClose()}
 style={{
 position: "fixed",
 inset: 0,
 background: "rgba(0,0,0,0.65)",
 backdropFilter: "blur(2px)",
 zIndex: 200,
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 padding: "1rem",
 }}
 >
 <div
 onClick={(e) => e.stopPropagation()}
 role="dialog"
 aria-modal="true"
 style={{
 width: "100%",
 maxWidth: config.kind === "release" ? "480px" : "420px",
 background: "var(--bg-panel)",
 border: `1px solid ${danger ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
 borderRadius: 12,
 boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
 overflow: "hidden",
 }}
 >
 {/* Header */}
 <div
 style={{
 padding: "1.125rem 1.25rem 0.875rem",
 borderBottom: "1px solid var(--border)",
 display: "flex",
 alignItems: "flex-start",
 gap: "0.75rem",
 }}
 >
 {danger && (
 <span
 style={{
 width: 32,
 height: 32,
 borderRadius: 8,
 background: "rgba(239,68,68,0.12)",
 color: "var(--red)",
 display: "grid",
 placeItems: "center",
 flexShrink: 0,
 }}
 >
 <AlertTriangle size={16} />
 </span>
 )}
 <h2
 style={{
 flex: 1,
 fontFamily: "var(--font-headline)",
 fontSize: "1.125rem",
 letterSpacing: "0.04em",
 color: danger ? "var(--red)" : "var(--text-primary)",
 lineHeight: 1.3,
 }}
 >
 {config.kind === "release"
 ? `${config.mode === "release" ? "Release" : "Extend"}, ${config.taskTitle}`
 : config.kind === "verify"
 ? `Verify week, ${config.taskTitle}`
 : config.title}
 </h2>
 <button
 type="button"
 onClick={onClose}
 disabled={busy}
 aria-label="Close"
 style={{
 background: "none",
 border: "none",
 cursor: busy ? "not-allowed" : "pointer",
 color: "var(--text-dim)",
 padding: "0.25rem",
 display: "flex",
 minHeight: "unset",
 }}
 >
 <X size={16} />
 </button>
 </div>

 {/* Body */}
 <div style={{ padding: "1.125rem 1.25rem" }}>
 {config.kind === "confirm" || config.kind === "alert" ? (
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
 {config.message}
 </p>
 ) : config.kind === "prompt" ? (
 <div className="flex flex-col gap-3">
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
 {config.message}
 </p>
 <div>
 <label
 style={{
 display: "block",
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 color: "var(--text-dim)",
 letterSpacing: "0.12em",
 textTransform: "uppercase",
 marginBottom: "0.375rem",
 }}
 >
 {config.label}
 </label>
 <textarea
 value={note}
 onChange={(e) => setNote(e.target.value)}
 rows={4}
 placeholder={config.placeholder}
 className="forge-input"
 style={{ resize: "vertical", lineHeight: 1.55 }}
 autoFocus
 />
 </div>
 </div>
 ) : config.kind === "confirm-text" ? (
 <div className="flex flex-col gap-3">
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
 {config.message}
 </p>
 <div>
 <label
 style={{
 display: "block",
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 color: "var(--text-dim)",
 letterSpacing: "0.12em",
 textTransform: "uppercase",
 marginBottom: "0.375rem",
 }}
 >
 Type <span style={{ color: "var(--red)", textTransform: "none", letterSpacing: 0 }}>{config.confirmPhrase}</span> to confirm
 </label>
 <input
 type="text"
 value={note}
 onChange={(e) => setNote(e.target.value)}
 placeholder={config.confirmPhrase}
 className="forge-input"
 autoFocus
 autoComplete="off"
 />
 </div>
 </div>
 ) : config.kind === "verify" ? (
 <div className="flex flex-col gap-3">
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.55 }}>
 Mark this week as passed. Rate the depth of the work, a single
 signal you can&apos;t fake later, and the only one that makes the
 Forge Score meaningful.
 </p>
 <div>
 <label style={{
 display: "block",
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 color: "var(--text-dim)",
 letterSpacing: "0.12em",
 textTransform: "uppercase",
 marginBottom: "0.5rem",
 }}>
 Depth rating <span style={{ color: "var(--text-dim)", textTransform: "none", letterSpacing: 0 }}>, optional</span>
 </label>
 <div style={{ display: "flex", gap: "0.5rem" }}>
 {[1, 2, 3, 4, 5].map((n) => {
 const selected = rating === n;
 return (
 <button
 key={n}
 type="button"
 onClick={() => setRating(selected ? null : n)}
 aria-label={`Rate ${n} of 5`}
 style={{
 flex: 1,
 padding: "0.625rem 0.5rem",
 background: selected ? "rgba(212,175,55,0.18)" : "var(--bg-card)",
 border: selected ? "1px solid var(--accent)" : "1px solid var(--border)",
 borderRadius: 8,
 color: selected ? "var(--accent)" : "var(--text-secondary)",
 fontFamily: "var(--font-headline)",
 fontSize: "1.125rem",
 fontWeight: 700,
 cursor: "pointer",
 transition: "all 0.15s",
 }}
 >
 {n}
 </button>
 );
 })}
 </div>
 <div style={{
 display: "flex",
 justifyContent: "space-between",
 marginTop: "0.4rem",
 fontFamily: "var(--font-mono)",
 fontSize: "0.625rem",
 color: "var(--text-dim)",
 letterSpacing: "0.08em",
 }}>
 <span>1 · surface</span>
 <span>3 · solid</span>
 <span>5 · exceptional</span>
 </div>
 </div>
 </div>
 ) : (
 <div className="flex flex-col gap-3">
 <div>
 <label
 style={{
 display: "block",
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 color: "var(--text-dim)",
 letterSpacing: "0.12em",
 textTransform: "uppercase",
 marginBottom: "0.375rem",
 }}
 >
 Deadline
 </label>
 <input
 ref={(el) => {
 firstFocusRef.current = el;
 }}
 type="date"
 value={date}
 min={new Date(Date.now() + 86_400_000).toISOString().split("T")[0]}
 onChange={(e) => setDate(e.target.value)}
 className="forge-input"
 style={{ fontFamily: "var(--font-mono)" }}
 />
 {releaseDateInvalid && (
 <p style={{ color: "var(--red)", fontSize: "0.75rem", marginTop: "0.375rem", fontFamily: "var(--font-mono)" }}>
 Pick a future date.
 </p>
 )}
 </div>
 <div>
 <label
 style={{
 display: "block",
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 color: "var(--text-dim)",
 letterSpacing: "0.12em",
 textTransform: "uppercase",
 marginBottom: "0.375rem",
 }}
 >
 Note to mentee <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--text-dim)" }}>, optional</span>
 </label>
 <textarea
 value={note}
 onChange={(e) => setNote(e.target.value)}
 rows={4}
 placeholder="Focus on the SQL part this week, that's where most students struggle."
 className="forge-input"
 style={{ resize: "vertical", lineHeight: 1.55 }}
 />
 </div>
 </div>
 )}
 </div>

 {/* Inline error from a failed confirm/submit handler */}
 {actionError && (
 <div
 role="alert"
 style={{
 margin: "0 1.25rem 0.5rem",
 padding: "0.625rem 0.75rem",
 background: "rgba(239,68,68,0.1)",
 border: "1px solid rgba(239,68,68,0.4)",
 borderRadius: 8,
 color: "var(--red)",
 fontSize: "0.8125rem",
 lineHeight: 1.45,
 display: "flex",
 alignItems: "flex-start",
 gap: "0.5rem",
 }}
 >
 <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
 <span>{actionError}</span>
 </div>
 )}

 {/* Footer */}
 <div
 style={{
 padding: "0.875rem 1.25rem 1.125rem",
 display: "flex",
 justifyContent: "flex-end",
 gap: "0.5rem",
 borderTop: "1px solid var(--border)",
 background: "rgba(0,0,0,0.15)",
 }}
 >
 {config.kind !== "alert" && (
 <button
 type="button"
 onClick={onClose}
 disabled={busy}
 className="forge-btn forge-btn-ghost"
 style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", minHeight: "unset" }}
 >
 {config.kind === "confirm" ? config.cancelText ?? "Cancel" : "Cancel"}
 </button>
 )}
 <button
 ref={(el) => {
 if (config.kind !== "release" && config.kind !== "prompt" && config.kind !== "confirm-text" && el && !firstFocusRef.current) firstFocusRef.current = el;
 }}
 type="button"
 onClick={handleConfirm}
 disabled={
 busy ||
 (config.kind === "release" && releaseDateInvalid) ||
 (config.kind === "prompt" && note.trim().length < (config.minLength ?? 1)) ||
 (config.kind === "confirm-text" && note.trim().toLowerCase() !== config.confirmPhrase.trim().toLowerCase())
 }
 className={danger ? "forge-btn forge-btn-red" : "forge-btn forge-btn-primary"}
 style={{ padding: "0.5rem 1.125rem", fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: "0.375rem", minHeight: "unset" }}
 >
 {busy && <Loader2 size={13} className="animate-spin" />}
 {config.kind === "alert"
 ? config.buttonText ?? "OK"
 : config.kind === "release"
 ? config.mode === "release"
 ? "Release week"
 : "Update deadline"
 : config.kind === "verify"
 ? (rating !== null ? `Verify · ${rating}/5` : "Verify (skip rating)")
 : config.confirmText ?? "Confirm"}
 </button>
 </div>
 </div>
 </div>
 );
}
