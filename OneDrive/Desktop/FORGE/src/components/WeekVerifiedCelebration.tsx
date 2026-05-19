"use client";

/**
 * Celebration moment for the mentee dashboard. Detects newly-verified tasks
 * via localStorage diffing - if the latest verified task ID changed since
 * the user last saw their dashboard, fire confetti + show a big banner.
 *
 * No external deps - pure CSS keyframes for the confetti so the bundle stays small.
 *
 * Plus: a compact streak badge showing consecutive verified weeks.
 */
import { useEffect, useState } from "react";
import { Sparkles, Trophy, Flame } from "lucide-react";

interface Props {
  latestVerifiedId: string | null;
  latestVerifiedTitle: string | null;
  streakWeeks: number;
  menteeFirstName: string;
}

const STORAGE_KEY = "forge.lastSeenVerifiedId";

export default function WeekVerifiedCelebration({
  latestVerifiedId,
  latestVerifiedTitle,
  streakWeeks,
  menteeFirstName,
}: Props) {
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (!latestVerifiedId) return;
    try {
      const last = localStorage.getItem(STORAGE_KEY);
      if (last !== latestVerifiedId) {
        // New verification since the last visit - fire celebration.
        setCelebrating(true);
        localStorage.setItem(STORAGE_KEY, latestVerifiedId);
        // Auto-dismiss after 6 seconds.
        const t = setTimeout(() => setCelebrating(false), 6000);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage blocked - silently skip the celebration.
    }
  }, [latestVerifiedId]);

  return (
    <>
      {/* Streak badge - always visible if streak >= 2 */}
      {streakWeeks >= 2 && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.875rem",
            background: streakWeeks >= 5 ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.08)",
            border: streakWeeks >= 5 ? "1px solid rgba(245,158,11,0.35)" : "1px solid rgba(34,197,94,0.3)",
            borderRadius: 999,
            marginBottom: "1rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: streakWeeks >= 5 ? "var(--accent)" : "var(--green)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          <Flame size={14} />
          {streakWeeks} week streak{streakWeeks >= 5 ? " - you are on fire" : ""}
        </div>
      )}

      {/* Celebration overlay */}
      {celebrating && (
        <>
          {/* Confetti - 60 random colored squares pure-CSS animated */}
          <div
            aria-hidden
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              overflow: "hidden",
              zIndex: 150,
            }}
          >
            {Array.from({ length: 60 }).map((_, i) => {
              const colors = ["#f59e0b", "#22c55e", "#3b82f6", "#ec4899", "#a855f7", "#fbbf24"];
              const color = colors[i % colors.length];
              const left = Math.random() * 100;
              const delay = Math.random() * 0.6;
              const duration = 2.2 + Math.random() * 2;
              const rotate = Math.random() * 360;
              const size = 6 + Math.random() * 8;
              return (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${left}%`,
                    top: "-20px",
                    width: size,
                    height: size,
                    background: color,
                    transform: `rotate(${rotate}deg)`,
                    animation: `forgeConfettiFall ${duration}s linear ${delay}s forwards`,
                    borderRadius: i % 3 === 0 ? "50%" : "2px",
                  }}
                />
              );
            })}
          </div>

          {/* Banner */}
          <div
            role="status"
            style={{
              position: "fixed",
              top: "1.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 160,
              padding: "1rem 1.5rem",
              background: "linear-gradient(135deg, rgba(245,158,11,0.95) 0%, rgba(234,88,12,0.95) 100%)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 14,
              color: "white",
              boxShadow: "0 18px 40px rgba(234,88,12,0.45)",
              maxWidth: "min(92vw, 460px)",
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              animation: "forgeBannerIn 0.5s cubic-bezier(.16,1,.3,1) forwards",
            }}
          >
            <span style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.18)", flexShrink: 0 }}>
              <Trophy size={20} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", letterSpacing: "0.03em" }}>
                {menteeFirstName}, your mentor verified it!
              </div>
              <div style={{ fontSize: "0.8125rem", opacity: 0.95, marginTop: "0.125rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                <Sparkles size={11} style={{ display: "inline", marginRight: 4 }} />
                {latestVerifiedTitle ?? "Week passed"} - well done.
              </div>
            </div>
          </div>

          <style>{`
            @keyframes forgeConfettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
            @keyframes forgeBannerIn {
              0% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.95); }
              100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
            }
          `}</style>
        </>
      )}
    </>
  );
}
