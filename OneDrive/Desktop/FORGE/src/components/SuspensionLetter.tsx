"use client";

/**
 * The suspension letter a banned mentee sees instead of the dashboard.
 * Rendered by the dashboard layout when the mentee's active MentorLink
 * has bannedAt set.
 *
 * The mentee can send ONE appeal message to their mentor. Once sent, the
 * textarea is replaced with a "sent" confirmation. The API enforces the
 * one-shot rule server-side too.
 */

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, ShieldAlert, Send, CheckCircle2 } from "lucide-react";

const MIN_LENGTH = 80;

interface Props {
  menteeName: string | null;
  mentorName: string | null;
  reason: string | null;
  bannedAt: string; // ISO
  pactWhy?: string | null;
  /** If the mentee already sent an appeal, pass it here so the form is pre-resolved. */
  hasAppeal?: boolean;
}

export default function SuspensionLetter({ menteeName, mentorName, reason, bannedAt, pactWhy, hasAppeal = false }: Props) {
  const firstName = menteeName?.split(" ")[0] ?? "there";
  const mentor = mentorName ?? "your mentor";
  const date = new Date(bannedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Appeal state
  const [appeal, setAppeal] = useState("");
  const [appealSent, setAppealSent] = useState(hasAppeal);
  const [appealSending, setAppealSending] = useState(false);
  const [appealError, setAppealError] = useState("");
  const [showAppeal, setShowAppeal] = useState(false);

  const handleAppeal = async () => {
    if (appeal.trim().length < MIN_LENGTH) {
      setAppealError(`Write at least ${MIN_LENGTH} characters. Your mentor needs enough to make a decision.`);
      return;
    }
    setAppealSending(true);
    setAppealError("");
    try {
      const res = await fetch("/api/ban-appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appeal: appeal.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppealSent(true);
      } else {
        setAppealError(data.error ?? "Something went wrong.");
      }
    } catch {
      setAppealError("Network error. Try again.");
    }
    setAppealSending(false);
  };

  const charCount = appeal.trim().length;
  const charOk = charCount >= MIN_LENGTH;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          background: "var(--bg-panel)",
          border: "1px solid rgba(239,68,68,0.35)",
          borderRadius: 14,
          padding: "2.25rem 2rem",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(239,68,68,0.12)",
              color: "var(--red)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={22} />
          </span>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "1.5rem",
                letterSpacing: "0.04em",
                color: "var(--red)",
                textTransform: "uppercase",
              }}
            >
              Access Suspended
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.1em" }}>
              {date}
            </p>
          </div>
        </div>

        <div style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7 }}>
          <p style={{ marginBottom: "1rem" }}>{firstName},</p>
          <p style={{ marginBottom: "1rem" }}>
            Your access to THE FORGE has been suspended by <strong style={{ color: "var(--text-primary)" }}>{mentor}</strong>.
            You are no longer an active mentee under their guidance.
          </p>
          {reason && (
            <div
              style={{
                margin: "1.25rem 0",
                padding: "0.875rem 1rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  marginBottom: "0.375rem",
                }}
              >
                Reason given
              </p>
              <p style={{ color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>{reason}</p>
            </div>
          )}
          {pactWhy && (
            <div
              style={{
                margin: "1.25rem 0",
                padding: "0.875rem 1rem",
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: 8,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: "0.375rem",
                }}
              >
                What you wrote in your Forge Pact
              </p>
              <p style={{ color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.65, fontStyle: "italic" }}>
                &ldquo;{pactWhy}&rdquo;
              </p>
            </div>
          )}
          <p style={{ marginBottom: "1rem" }}>
            FORGE is built on accountability. A roadmap only works if you show up, do the work, and keep your
            mentor informed. If you believe this was a mistake, or you are ready to recommit, reach out to{" "}
            {mentor} directly. Only they can reinstate your access.
          </p>
          <p style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>
            The standard does not move. You are welcome back the moment you decide to meet it.
          </p>
        </div>

        {/* Appeal section */}
        <div style={{ marginTop: "1.75rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
          {appealSent ? (
            /* Already sent — show confirmation */
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "1rem",
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: 8,
              }}
            >
              <CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--green)", marginBottom: "0.25rem" }}>
                  Appeal sent
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Your message is with {mentor}. Only they can reinstate your access. There are no second appeals — this was your one shot. Make sure you meant every word.
                </p>
              </div>
            </div>
          ) : !showAppeal ? (
            /* Show the "appeal" prompt button */
            <div>
              <p style={{ fontSize: "0.875rem", color: "var(--text-dim)", marginBottom: "0.75rem", lineHeight: 1.6 }}>
                If you believe this suspension was a mistake, or you are genuinely ready to recommit, you have{" "}
                <strong style={{ color: "var(--text-primary)" }}>one chance</strong> to send an appeal to {mentor}.
                Choose your words carefully — there is no second message.
              </p>
              <button
                onClick={() => setShowAppeal(true)}
                className="forge-btn forge-btn-ghost"
                style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem" }}
              >
                Write an appeal
              </button>
            </div>
          ) : (
            /* Appeal form */
            <div className="flex flex-col gap-3">
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.5rem" }}>
                  Your appeal — one message, no edits, no second chances
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                  Be specific. Acknowledge what went wrong. Show {mentor} why reinstating you is the right call — not just that you want back in.
                </p>
                <textarea
                  value={appeal}
                  onChange={(e) => setAppeal(e.target.value)}
                  rows={7}
                  maxLength={1200}
                  placeholder={`Dear ${mentor},\n\nI understand why I was suspended. Here is what I want to say...`}
                  style={{
                    width: "100%",
                    resize: "vertical",
                    background: "var(--bg-card)",
                    border: `1px solid ${charOk ? "var(--green)" : "var(--border)"}`,
                    borderRadius: 8,
                    padding: "0.75rem",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.375rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: charOk ? "var(--green)" : "var(--text-dim)" }}>
                    {charCount} / 1200 {!charOk && `— need at least ${MIN_LENGTH} characters`}
                  </span>
                </div>
              </div>

              {appealError && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "0.625rem 0.875rem", color: "var(--red)", fontSize: "0.875rem" }}>
                  {appealError}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <button
                  onClick={handleAppeal}
                  disabled={appealSending || !charOk}
                  className="forge-btn forge-btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", fontSize: "0.875rem", opacity: charOk ? 1 : 0.5 }}
                >
                  <Send size={13} />
                  {appealSending ? "Sending..." : "Send appeal"}
                </button>
                <button
                  onClick={() => { setShowAppeal(false); setAppeal(""); setAppealError(""); }}
                  style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: "0.8125rem", cursor: "pointer", padding: "0.5rem" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="forge-btn forge-btn-ghost"
          style={{
            marginTop: "1.25rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 1.25rem",
          }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );
}
