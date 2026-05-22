"use client";

/**
 * The suspension letter a banned mentee sees instead of the dashboard.
 * Rendered by the dashboard layout when the mentee's active MentorLink
 * has bannedAt set. The ONLY thing they can do here is read it and sign out.
 */

import { signOut } from "next-auth/react";
import { LogOut, ShieldAlert } from "lucide-react";

interface Props {
  menteeName: string | null;
  mentorName: string | null;
  reason: string | null;
  bannedAt: string; // ISO
  pactWhy?: string | null;
}

export default function SuspensionLetter({ menteeName, mentorName, reason, bannedAt, pactWhy }: Props) {
  const firstName = menteeName?.split(" ")[0] ?? "there";
  const mentor = mentorName ?? "your mentor";
  const date = new Date(bannedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="forge-btn forge-btn-ghost"
          style={{
            marginTop: "1.75rem",
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
