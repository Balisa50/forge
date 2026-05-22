"use client";

/**
 * /pact - The Forge Pact signing ritual.
 *
 * A learner cannot reach their dashboard until they have signed this.
 * It is deliberately ceremonial: three real questions, a signature, and
 * a heavy final button. Grounded in commitment-device + identity research.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flame, Loader2, ArrowRight } from "lucide-react";

export default function ForgePactPage() {
  const router = useRouter();
  const [why, setWhy] = useState("");
  const [stake, setStake] = useState("");
  const [identity, setIdentity] = useState("");
  const [signature, setSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // If they already signed, don't let them re-sign - send them on.
  useEffect(() => {
    fetch("/api/pact")
      .then((r) => r.json())
      .then((d) => {
        if (d.pact) router.replace("/dashboard");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  const ready =
    why.trim().length >= 20 &&
    stake.trim().length >= 15 &&
    identity.trim().length >= 10 &&
    signature.trim().length >= 2;

  const sign = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/pact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ why, stake, identity, signature }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not record your pact.");
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "grid", placeItems: "center" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "var(--text-dim)" }} />
      </div>
    );
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-headline)",
    fontSize: "1.0625rem",
    color: "var(--text-primary)",
    marginBottom: "0.5rem",
  };
  const hintStyle: React.CSSProperties = {
    display: "block",
    color: "var(--text-dim)",
    fontSize: "0.8125rem",
    lineHeight: 1.5,
    marginBottom: "0.625rem",
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: "3rem 1.25rem 5rem" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(245,158,11,0.12)",
              color: "var(--accent)",
              marginBottom: "1rem",
            }}
          >
            <Flame size={28} />
          </span>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
            The Forge Pact
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.65 }}>
            Before you begin, you sign this. Not a checkbox - a commitment, in your own words.
            Your mentor witnesses it. THE PROFESSOR remembers it. And on the day you want to quit,
            FORGE will show it back to you.
          </p>
        </div>

        {/* The three questions */}
        <div className="flex flex-col gap-7">
          <div>
            <label style={labelStyle}>1. Why are you really doing this?</label>
            <span style={hintStyle}>
              Not the surface answer. The real one. The job, the person you want to prove wrong, the life
              you are trying to reach. Write it so that future-you, exhausted at week 9, remembers.
            </span>
            <textarea
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              rows={4}
              placeholder="I am doing this because..."
              className="forge-input"
              style={{ resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          <div>
            <label style={labelStyle}>2. What does it cost you if you quit?</label>
            <span style={hintStyle}>
              Be specific and honest. Another year in the same place? A promise broken to someone?
              The proof you abandoned, on your record, permanently. Name the real price.
            </span>
            <textarea
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              rows={3}
              placeholder="If I quit, I lose..."
              className="forge-input"
              style={{ resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          <div>
            <label style={labelStyle}>3. Who are you becoming?</label>
            <span style={hintStyle}>
              Finish the sentence. Every week you ship is a vote for this person. Make it someone
              you would be proud to be.
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-headline)", color: "var(--accent)", fontSize: "1rem", flexShrink: 0 }}>
                I am becoming someone who
              </span>
              <input
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="finishes what they start."
                className="forge-input"
                style={{ flex: 1, minWidth: 200 }}
              />
            </div>
          </div>

          {/* Signature */}
          <div
            style={{
              borderTop: "1px dashed var(--border)",
              paddingTop: "1.75rem",
            }}
          >
            <label style={labelStyle}>Sign it.</label>
            <span style={hintStyle}>
              Type your full name. This is your word.
            </span>
            <input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Your full name"
              className="forge-input"
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "1.25rem",
                letterSpacing: "0.05em",
                maxWidth: 360,
              }}
            />
          </div>

          {error && (
            <p style={{ color: "var(--red)", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>{error}</p>
          )}

          <button
            type="button"
            onClick={sign}
            disabled={!ready || submitting}
            className="forge-btn forge-btn-primary"
            style={{
              padding: "1rem 2rem",
              fontSize: "1.0625rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              opacity: ready ? 1 : 0.5,
            }}
          >
            {submitting ? <Loader2 size={17} className="animate-spin" /> : <Flame size={17} />}
            Sign the Forge Pact
            {!submitting && <ArrowRight size={17} />}
          </button>
          <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
            Once signed, the Pact is permanent. It cannot be rewritten.
          </p>
        </div>
      </div>
    </main>
  );
}
