"use client";

import { useState } from "react";
import { Lock, HeartCrack, ShieldAlert } from "lucide-react";

interface LockScreenProps {
  streakBefore: number;
  graceDaysLeft: number;
  onUseGraceDay: () => Promise<void>;
  onAcceptFailure: () => Promise<void>;
}

export default function LockScreen({ streakBefore, graceDaysLeft, onUseGraceDay, onAcceptFailure }: LockScreenProps) {
  const [loading, setLoading] = useState<"grace" | "accept" | null>(null);

  const handleGrace = async () => {
    setLoading("grace");
    try {
      await onUseGraceDay();
    } finally {
      setLoading(null);
    }
  };

  const handleAccept = async () => {
    setLoading("accept");
    try {
      await onAcceptFailure();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "rgba(6,6,8,0.97)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>
        <div style={{ color: "var(--red)", marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
          <Lock size={64} strokeWidth={1.5} />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "3rem",
            color: "var(--red)",
            letterSpacing: "0.08em",
            marginBottom: "0.5rem",
            textTransform: "uppercase",
          }}
        >
          SESSION LOCKED
        </h1>

        <p style={{ color: "var(--text-secondary)", fontSize: "1.0625rem", lineHeight: 1.8, marginBottom: "2rem" }}>
          You missed your check-in. Your {streakBefore}-day streak is at risk.
          <br />
          Choose your path.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Grace Day Option */}
          {graceDaysLeft > 0 && (
            <button
              onClick={handleGrace}
              disabled={loading !== null}
              className="forge-panel"
              style={{
                padding: "1.25rem 1.5rem",
                cursor: loading ? "not-allowed" : "pointer",
                border: "1px solid var(--accent)",
                background: "rgba(245,158,11,0.05)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                textAlign: "left",
                opacity: loading === "accept" ? 0.5 : 1,
                transition: "all 0.15s",
              }}
            >
              <ShieldAlert size={24} color="var(--accent)" strokeWidth={1.5} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", color: "var(--accent)", letterSpacing: "0.05em" }}>
                  {loading === "grace" ? "USING GRACE DAY..." : "USE GRACE DAY"}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  Keep your streak alive. You have {graceDaysLeft} grace day{graceDaysLeft !== 1 ? "s" : ""} left.
                </div>
              </div>
            </button>
          )}

          {/* Accept Failure Option */}
          <button
            onClick={handleAccept}
            disabled={loading !== null}
            className="forge-panel"
            style={{
              padding: "1.25rem 1.5rem",
              cursor: loading ? "not-allowed" : "pointer",
              border: "1px solid var(--red)",
              background: "rgba(239,68,68,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              textAlign: "left",
              opacity: loading === "grace" ? 0.5 : 1,
              transition: "all 0.15s",
            }}
          >
            <HeartCrack size={24} color="var(--red)" strokeWidth={1.5} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", color: "var(--red)", letterSpacing: "0.05em" }}>
                {loading === "accept" ? "ACCEPTING..." : "ACCEPT FAILURE"}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                Your streak resets to 0. Integrity score will decrease. A shame post will be required.
              </div>
            </div>
          </button>
        </div>

        <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", marginTop: "2rem", letterSpacing: "0.05em" }}>
          THIS CANNOT BE DISMISSED. YOU MUST CHOOSE.
        </p>
      </div>
    </div>
  );
}
