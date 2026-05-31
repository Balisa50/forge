"use client";

/**
 * RecallCards — active-recall flashcards inside a concept.
 *
 * Click to flip front→back. Recall (try to answer before flipping) beats
 * re-reading for retention, so the answer stays hidden until the student
 * commits. Front and back may contain LaTeX.
 */

import { useState } from "react";
import { renderRichText } from "@/lib/math";

interface Card {
  front: string;
  back: string;
}

export default function RecallCards({ cards }: { cards: Card[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((c, i) => (
        <Flip key={i} card={c} k={i} />
      ))}
    </div>
  );
}

function Flip({ card, k }: { card: Card; k: number }) {
  const [shown, setShown] = useState(false);
  return (
    <button
      onClick={() => setShown((s) => !s)}
      className="min-h-[120px] rounded-xl border p-4 text-left transition"
      style={{
        borderColor: shown ? "rgba(52,211,153,0.4)" : "var(--border)",
        background: shown ? "rgba(52,211,153,0.05)" : "var(--bg-panel)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.5625rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: shown ? "#34d399" : "var(--accent)",
        }}
      >
        {shown ? "Answer" : "Recall"}
      </span>
      <div className="mt-2" style={{ fontSize: "0.9375rem", lineHeight: 1.55, color: "var(--text-primary)" }}>
        {renderRichText(shown ? card.back : card.front, `card${k}-${shown ? "b" : "f"}`)}
      </div>
      {!shown && (
        <p className="mt-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)" }}>
          answer first → click to check
        </p>
      )}
    </button>
  );
}
