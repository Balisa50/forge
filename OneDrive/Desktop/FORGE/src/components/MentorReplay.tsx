"use client";

/**
 * MentorReplay — the most recent mentor note from the previous verified
 * week, surfaced at the top of the *new* week's brief.
 *
 * The mentor's feedback was already in the action log. Nobody reads the
 * action log. By replaying it at the exact moment the learner is starting
 * fresh, the feedback actually lands.
 *
 * Renders nothing if there's no recent note.
 *
 * Dismissable per-week (localStorage key includes the note id). Once
 * dismissed it stays dismissed for this week — but next week's brief gets
 * the next note.
 */

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

interface Props {
  noteId: string;
  mentorName: string;
  noteBody: string;
  previousWeekTitle?: string | null;
  /** Optional context — current week id, so dismissal scopes per-week */
  scopeKey?: string;
}

export default function MentorReplay({ noteId, mentorName, noteBody, previousWeekTitle }: Props) {
  // Dismiss GLOBALLY per note (not per week), so the same note never
  // re-surfaces when a new week is released. Also marked read server-side
  // below, so it stays dismissed across devices.
  const dismissKey = `forge.mentorReplayDismissed.${noteId}`;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(dismissKey) === "1") setDismissed(true);
    } catch { /* */ }
  }, [dismissKey]);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(dismissKey, "1"); } catch { /* */ }
    // Persist server-side so it won't replay on another device / after a cache
    // clear. Fire-and-forget; the local hide already happened.
    void fetch("/api/mentor-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: noteId }),
    }).catch(() => { /* offline — local dismissal still holds */ });
  };

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Mentor replay"
      style={{
        position: "relative",
        padding: "1rem 1.125rem 1rem 3rem",
        marginBottom: "1.25rem",
        background: "linear-gradient(135deg, rgba(212,175,55,0.05), rgba(212,175,55,0.02))",
        border: "1px solid rgba(212,175,55,0.25)",
        borderRadius: 10,
        animation: "forgeReplayIn 0.5s cubic-bezier(.16,1,.3,1) forwards",
      }}
    >
      <span style={{
        position: "absolute",
        top: 14, left: 14,
        width: 28, height: 28,
        borderRadius: "50%",
        background: "rgba(212,175,55,0.18)",
        display: "grid",
        placeItems: "center",
        color: "var(--accent)",
      }}>
        <MessageCircle size={14} />
      </span>

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.625rem",
        letterSpacing: "0.22em",
        color: "var(--accent)",
        textTransform: "uppercase",
        marginBottom: "0.35rem",
      }}>
        {mentorName} said
        {previousWeekTitle && (
          <span style={{ color: "var(--text-dim)" }}>
            {" "}· after {previousWeekTitle.replace(/^Week\s+\d+\s*[:\-]\s*/i, "")}
          </span>
        )}
      </div>

      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.9375rem",
        color: "var(--text-primary)",
        lineHeight: 1.55,
        whiteSpace: "pre-wrap",
      }}>
        {noteBody}
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          position: "absolute",
          top: 8, right: 8,
          background: "transparent",
          border: 0,
          color: "var(--text-dim)",
          cursor: "pointer",
          padding: 6,
          borderRadius: 6,
          lineHeight: 0,
        }}
      >
        <X size={14} />
      </button>

      <style>{`
        @keyframes forgeReplayIn {
          0%   { opacity: 0; transform: translateY(-6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
