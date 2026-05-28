"use client";

/**
 * Full-screen celebration moment for when a mentor verifies a week.
 *
 * Detects newly-verified tasks via localStorage diffing — if the latest
 * verified task ID changed since the user last saw their dashboard, fire
 * a full-screen cinematic overlay:
 *
 *   - Centered, large Cormorant Garamond name treatment
 *   - Week title in italic gold
 *   - "Week N of T. Still forging." chain line
 *   - Verified-by mentor signature
 *   - Confetti
 *   - Optional 3-note audio ding
 *   - 5 seconds auto-dismiss · ESC or "Continue" to dismiss earlier
 *
 * Every learner will screenshot this. That's the whole point.
 */
import { useEffect, useState, useCallback } from "react";
import { Sparkles, Flame, X } from "lucide-react";

interface Props {
  latestVerifiedId: string | null;
  latestVerifiedTitle: string | null;
  streakWeeks: number;
  menteeFirstName: string;
  /** 1-indexed week number among all weeks in the roadmap */
  weekNumber?: number | null;
  /** Total weeks in the roadmap */
  totalWeeks?: number;
  /** Mentor persona name who verified this week */
  verifyingMentor?: string | null;
}

const STORAGE_KEY = "forge.lastSeenVerifiedId";
const MUTED_KEY = "forge.celebrationMuted";

export default function WeekVerifiedCelebration({
  latestVerifiedId,
  latestVerifiedTitle,
  streakWeeks,
  menteeFirstName,
  weekNumber,
  totalWeeks,
  verifyingMentor,
}: Props) {
  const [celebrating, setCelebrating] = useState(false);

  const dismiss = useCallback(() => setCelebrating(false), []);

  useEffect(() => {
    if (!latestVerifiedId) return;
    try {
      const last = localStorage.getItem(STORAGE_KEY);
      if (last === latestVerifiedId) return;

      setCelebrating(true);
      localStorage.setItem(STORAGE_KEY, latestVerifiedId);

      // 3-note ding (skip if muted)
      const muted = localStorage.getItem(MUTED_KEY) === "true";
      if (!muted) {
        try {
          const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
          const ctx = new Ctx();
          [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.13);
            gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + i * 0.13 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.13 + 0.45);
            osc.connect(gain).connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.13);
            osc.stop(ctx.currentTime + i * 0.13 + 0.45);
          });
          setTimeout(() => ctx.close(), 1500);
        } catch { /* audio blocked — silent */ }
      }

      // 5 second auto-dismiss
      const t = setTimeout(() => setCelebrating(false), 5000);
      return () => clearTimeout(t);
    } catch { /* localStorage blocked */ }
  }, [latestVerifiedId]);

  // ESC to dismiss
  useEffect(() => {
    if (!celebrating) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [celebrating, dismiss]);

  return (
    <>
      {/* Inline streak badge (always visible if streak >= 2) */}
      {streakWeeks >= 2 && (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.875rem",
          background: streakWeeks >= 5 ? "rgba(212,175,55,0.12)" : "rgba(34,197,94,0.08)",
          border: streakWeeks >= 5 ? "1px solid rgba(212,175,55,0.35)" : "1px solid rgba(34,197,94,0.3)",
          borderRadius: 999,
          marginBottom: "1rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: streakWeeks >= 5 ? "var(--accent)" : "var(--green)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}>
          <Flame size={14} />
          {streakWeeks} week streak{streakWeeks >= 5 ? " — you are on fire" : ""}
        </div>
      )}

      {/* ─── FULL-SCREEN TAKEOVER ─── */}
      {celebrating && (
        <div
          role="dialog"
          aria-label="Week verified"
          onClick={dismiss}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "radial-gradient(ellipse at center, rgba(20,16,12,0.97) 0%, rgba(8,6,4,0.99) 70%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            animation: "forgeOverlayIn 0.4s cubic-bezier(.16,1,.3,1) forwards",
            overflow: "hidden",
          }}
        >
          {/* Confetti */}
          <div aria-hidden style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}>
            {Array.from({ length: 80 }).map((_, i) => {
              const colors = ["#d4af37", "#f0c75c", "#22c55e", "#3b82f6", "#ec4899", "#ffffff"];
              const color = colors[i % colors.length];
              const left = Math.random() * 100;
              const delay = Math.random() * 0.5;
              const duration = 2.5 + Math.random() * 2.5;
              const rotate = Math.random() * 360;
              const size = 5 + Math.random() * 9;
              return (
                <span key={i} style={{
                  position: "absolute",
                  left: `${left}%`,
                  top: "-30px",
                  width: size, height: size,
                  background: color,
                  transform: `rotate(${rotate}deg)`,
                  animation: `forgeConfettiFall ${duration}s cubic-bezier(.4,.7,.4,1) ${delay}s forwards`,
                  borderRadius: i % 3 === 0 ? "50%" : "2px",
                  opacity: 0.9,
                }} />
              );
            })}
          </div>

          {/* Centred content */}
          <div
            style={{
              position: "relative",
              textAlign: "center",
              maxWidth: "min(92vw, 760px)",
              padding: "2rem",
              animation: "forgeCelebContentIn 0.7s cubic-bezier(.16,1,.3,1) 0.12s backwards",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* VERIFIED tag */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1rem",
              borderRadius: 999,
              border: "1px solid rgba(212,175,55,0.5)",
              background: "rgba(212,175,55,0.1)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#f0c75c",
              marginBottom: "1.75rem",
            }}>
              <Sparkles size={12} /> Verified
            </div>

            {/* Learner name */}
            <div style={{
              fontFamily: "Georgia, 'Cormorant Garamond', serif",
              fontSize: "clamp(2.75rem, 7vw, 5rem)",
              fontWeight: 700,
              color: "#fdfaf2",
              letterSpacing: "0.01em",
              lineHeight: 1.05,
              marginBottom: "0.5rem",
              textShadow: "0 4px 30px rgba(0,0,0,0.4)",
            }}>
              {menteeFirstName}.
            </div>

            {/* Week title */}
            {latestVerifiedTitle && (
              <div style={{
                fontFamily: "Georgia, 'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "clamp(1.125rem, 2.4vw, 1.625rem)",
                color: "#f0c75c",
                marginBottom: "2rem",
                letterSpacing: "0.02em",
                opacity: 0.95,
              }}>
                {latestVerifiedTitle}
              </div>
            )}

            {/* Chain line */}
            {weekNumber && totalWeeks ? (
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(0.75rem, 1.4vw, 0.9375rem)",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}>
                Week {weekNumber} of {totalWeeks}.{" "}
                <span style={{ color: "#d4af37" }}>Still forging.</span>
              </div>
            ) : (
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(0.75rem, 1.4vw, 0.9375rem)",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}>
                <span style={{ color: "#d4af37" }}>Still forging.</span>
              </div>
            )}

            {/* Streak count */}
            {streakWeeks >= 2 && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8125rem",
                color: streakWeeks >= 5 ? "#d4af37" : "#22c55e",
                letterSpacing: "0.12em",
                marginBottom: "2rem",
                textTransform: "uppercase",
                fontWeight: 700,
              }}>
                <Flame size={14} /> {streakWeeks}-week streak unbroken
              </div>
            )}

            {/* Signature */}
            {verifyingMentor && (
              <div style={{ marginTop: "1.75rem", textAlign: "center" }}>
                <div style={{
                  fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                  fontSize: "clamp(1.25rem, 2.3vw, 1.625rem)",
                  color: "#fdfaf2",
                  lineHeight: 1,
                  paddingBottom: "0.25rem",
                  borderBottom: "1px solid rgba(255,255,255,0.35)",
                  display: "inline-block",
                  minWidth: 200,
                }}>
                  {verifyingMentor}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  letterSpacing: "0.28em",
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  marginTop: "0.4rem",
                }}>
                  Verifying Mentor
                </div>
              </div>
            )}

            {/* Continue */}
            <div style={{ marginTop: "2.5rem" }}>
              <button
                type="button"
                onClick={dismiss}
                style={{
                  background: "transparent",
                  color: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  padding: "0.625rem 1.5rem",
                  borderRadius: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; e.currentTarget.style.color = "#fdfaf2"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
              >
                Continue → or press ESC
              </button>
            </div>
          </div>

          {/* Top-right close */}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss celebration"
            style={{
              position: "absolute",
              top: "1.25rem", right: "1.25rem",
              background: "transparent",
              color: "rgba(255,255,255,0.45)",
              border: "1px solid rgba(255,255,255,0.18)",
              width: 36, height: 36,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>

          <style>{`
            @keyframes forgeOverlayIn {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            @keyframes forgeCelebContentIn {
              0% { opacity: 0; transform: translateY(20px) scale(0.96); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes forgeConfettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 0; }
              5% { opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
