"use client";

/**
 * Ask The Professor - the student-facing chat panel for AI Mentor questions.
 *
 * Renders as a collapsed card on the Solo dashboard. Expands to a chat-style
 * interface. Posts to /api/ai-mentor/ask. Gracefully handles the dormant
 * 501 state with a "coming soon" message.
 */

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, GraduationCap, ChevronDown, ChevronRight } from "lucide-react";

interface Message {
  role: "user" | "professor";
  text: string;
  ts: number;
}

export default function AskTheProfessor({ taskId }: { taskId?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dormant, setDormant] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages]);

  const ask = async () => {
    const q = draft.trim();
    if (!q || submitting) return;
    setSubmitting(true);
    setError(null);
    setMessages((m) => [...m, { role: "user", text: q, ts: Date.now() }]);
    setDraft("");
    try {
      const res = await fetch("/api/ai-mentor/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, taskId }),
      });
      const data = await res.json();
      if (res.status === 501) {
        setDormant(true);
        setMessages((m) => [
          ...m,
          { role: "professor", text: "(THE PROFESSOR is not yet active on this FORGE instance. The system is built and waiting to be turned on. Check back soon.)", ts: Date.now() },
        ]);
        return;
      }
      if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
      setMessages((m) => [...m, { role: "professor", text: data.response, ts: Date.now() }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reach The Professor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="forge-panel" style={{ padding: 0, marginBottom: "1.5rem", overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "1.125rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          cursor: "pointer",
          textAlign: "left",
          minHeight: "unset",
        }}
        aria-expanded={open}
      >
        <span style={{ flexShrink: 0, color: "var(--text-dim)", display: "flex" }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(245,158,11,0.15)",
            color: "var(--accent)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <GraduationCap size={16} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: "var(--font-headline)", fontSize: "1rem", color: "var(--text-primary)" }}>
            Ask THE PROFESSOR
          </span>
          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.125rem" }}>
            Stuck on this week? Bring it to him. He has no patience for shallow questions - bring real ones.
          </span>
        </span>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "1.125rem 1.5rem" }}>
          {/* Messages */}
          {messages.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem", maxHeight: 480, overflowY: "auto" }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: "0.75rem 0.875rem",
                    borderRadius: 10,
                    background: m.role === "user" ? "var(--bg-card)" : "rgba(245,158,11,0.06)",
                    border: m.role === "user" ? "1px solid var(--border)" : "1px solid rgba(245,158,11,0.25)",
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "90%",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.625rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: m.role === "user" ? "var(--text-dim)" : "var(--accent)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {m.role === "user" ? "You" : "THE PROFESSOR"}
                  </div>
                  <p style={{ color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.text}</p>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}

          {/* Composer */}
          {!dormant ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    ask();
                  }
                }}
                placeholder="What is your question? Be specific. Vague questions get vague answers - and he hates vague answers."
                rows={3}
                className="forge-input"
                style={{ resize: "vertical", lineHeight: 1.55 }}
                disabled={submitting}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <span style={{ fontSize: "0.6875rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                  Cmd+Enter to send
                </span>
                <button
                  type="button"
                  onClick={ask}
                  disabled={!draft.trim() || submitting}
                  className="forge-btn forge-btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", fontSize: "0.875rem", minHeight: "unset" }}
                >
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  Send to The Professor
                </button>
              </div>
              {error && (
                <p style={{ color: "var(--red)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>{error}</p>
              )}
            </div>
          ) : (
            <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-dim)", fontSize: "0.875rem", lineHeight: 1.55 }}>
              THE PROFESSOR is waking up. We will notify you when he is available.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
