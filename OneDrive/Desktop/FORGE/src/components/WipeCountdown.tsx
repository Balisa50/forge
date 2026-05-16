"use client";

import { useState, useEffect, useRef } from "react";
import { Flame } from "lucide-react";

interface WipeCountdownProps {
  phaseName: string;
  taskCount: number;
  onComplete: () => void;
}

export default function WipeCountdown({ phaseName, taskCount, onComplete }: WipeCountdownProps) {
  const [progress, setProgress] = useState(100);
  const [counting, setCounting] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const startTime = useRef(Date.now());
  const rafRef = useRef<number>(0);
  const DURATION_MS = 10_000;

  useEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const pct = Math.max(0, 100 - (elapsed / DURATION_MS) * 100);
      const secs = Math.ceil((DURATION_MS - elapsed) / 1000);

      setProgress(pct);
      setSecondsLeft(Math.max(0, secs));

      if (pct <= 0) {
        setCounting(false);
        setTimeout(onComplete, 1500);
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9500,
        background: "rgba(6,6,8,0.98)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>
        <div
          style={{
            color: "var(--red)",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "center",
            animation: counting ? "pulse 1s ease-in-out infinite" : "none",
          }}
        >
          <Flame size={72} strokeWidth={1.5} />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "2.5rem",
            color: "var(--red)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}
        >
          {counting ? "PHASE WIPE INITIATED" : "WIPED"}
        </h1>

        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "0.5rem" }}>
          {counting ? (
            <>
              <span style={{ fontWeight: 700 }}>{phaseName}</span> — {taskCount} verified task{taskCount !== 1 ? "s" : ""} will be reset
            </>
          ) : (
            "All verified progress in this phase has been destroyed."
          )}
        </p>

        {counting && (
          <>
            {/* Countdown number */}
            <div
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "8rem",
                lineHeight: 1,
                color: "var(--red)",
                margin: "1.5rem 0",
                textShadow: "0 0 40px rgba(239,68,68,0.4)",
              }}
            >
              {secondsLeft}
            </div>

            {/* Progress bar draining */}
            <div
              style={{
                height: "8px",
                background: "var(--border)",
                borderRadius: "4px",
                overflow: "hidden",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, var(--red), #ff6b6b)`,
                  borderRadius: "4px",
                  transition: "none",
                  boxShadow: "0 0 12px rgba(239,68,68,0.4)",
                }}
              />
            </div>

            <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
              3 FAILURES IN ONE MONTH. THIS IS THE CONSEQUENCE.
            </p>
          </>
        )}

        {!counting && (
          <p
            style={{
              color: "var(--text-dim)",
              fontSize: "0.8125rem",
              fontFamily: "var(--font-mono)",
              marginTop: "2rem",
              letterSpacing: "0.05em",
            }}
          >
            START OVER. PROVE YOURSELF AGAIN.
          </p>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
