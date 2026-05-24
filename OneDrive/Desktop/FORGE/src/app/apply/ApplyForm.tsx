"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Loader2, CheckCircle2 } from "lucide-react";
import { CURATED_ROADMAPS } from "@/lib/curated-roadmaps-client";

interface ApplyFormProps {
  mentorId?: string;
  mentorName?: string;
}

export default function ApplyForm({ mentorId, mentorName }: ApplyFormProps) {
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [trackSlug, setTrackSlug]   = useState("");
  const [motivation, setMotivation] = useState("");
  const [background, setBackground] = useState("");
  const [commitment, setCommitment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [done, setDone]             = useState(false);

  const motivationOk = motivation.trim().length >= 80;
  const ready =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    motivationOk;

  const submit = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          trackSlug: trackSlug || null,
          motivation: `${motivation}\n\nBackground: ${background}`.trim(),
          commitment,
          mentorId: mentorId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit your application.");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const label: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: "0.6875rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-dim)",
    marginBottom: "0.5rem",
  };

  /* ── SUCCESS ───────────────────────────────────────────────────── */
  if (done) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", display: "grid", placeItems: "center", padding: "2rem 1.25rem" }}>
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <span style={{ display: "inline-grid", placeItems: "center", width: 56, height: 56, borderRadius: 14, background: "rgba(34,197,94,0.1)", color: "var(--green)", marginBottom: "1.5rem" }}>
            <CheckCircle2 size={28} />
          </span>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
            Application received.
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7 }}>
            {mentorName ? `${mentorName} will` : "A mentor will"} review it and reach out by email if you are accepted.
          </p>
        </div>
      </main>
    );
  }

  const charCount = motivation.trim().length;

  /* ── FORM ──────────────────────────────────────────────────────── */
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", display: "flex", flexDirection: "column", alignItems: "center", padding: "4rem 1.25rem 6rem" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem", maxWidth: 520 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 999, padding: "0.25rem 0.75rem", marginBottom: "1.25rem" }}>
          <Flame size={11} color="var(--accent)" />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)" }}>
            Invite only
          </span>
        </div>

        <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.25rem, 5vw, 3.5rem)", letterSpacing: "0.04em", lineHeight: 1.05, marginBottom: "1rem" }}>
          {mentorName ? (
            <>Apply to train with <span style={{ color: "var(--accent)" }}>{mentorName}.</span></>
          ) : (
            <>Apply to be <span style={{ color: "var(--accent)" }}>Forged.</span></>
          )}
        </h1>

        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.65 }}>
          A mentor. A roadmap. Real accountability.
        </p>
      </div>

      {/* Form */}
      <div style={{ width: "100%", maxWidth: 580 }} className="flex flex-col gap-5">

        {/* Name + Email */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={label}>Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="forge-input"
              placeholder="Your name"
            />
          </div>
          <div>
            <label style={label}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="forge-input"
              placeholder="you@email.com"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>
        </div>

        {/* Track */}
        <div>
          <label style={label}>Path</label>
          <select
            value={trackSlug}
            onChange={(e) => setTrackSlug(e.target.value)}
            className="forge-input"
            style={{ appearance: "none" }}
          >
            <option value="">Not sure yet</option>
            {CURATED_ROADMAPS.map((r) => (
              <option key={r.slug} value={r.slug}>{r.title}</option>
            ))}
          </select>
        </div>

        {/* Background */}
        <div>
          <label style={label}>Where you are now</label>
          <textarea
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            rows={3}
            className="forge-input"
            placeholder="What you have tried. What you have built. Be honest."
            style={{ resize: "vertical", lineHeight: 1.65 }}
          />
        </div>

        {/* Motivation */}
        <div>
          <label style={label}>
            Why do you want this?{" "}
            <span style={{ textTransform: "none", letterSpacing: 0, color: motivationOk ? "var(--green)" : charCount > 0 ? "var(--red)" : "var(--text-dim)", fontSize: "0.625rem" }}>
              {charCount} / 80
            </span>
          </label>
          <textarea
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            rows={5}
            className="forge-input"
            placeholder="The real reason. Vague answers get rejected."
            style={{
              resize: "vertical",
              lineHeight: 1.65,
              borderColor: charCount > 0 && !motivationOk ? "rgba(239,68,68,0.4)" : undefined,
            }}
          />
        </div>

        {/* Commitment */}
        <div>
          <label style={label}>
            Weekly hours{" "}
            <span style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.625rem" }}>(optional)</span>
          </label>
          <input
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
            className="forge-input"
            placeholder="e.g. 10 hrs, evenings and weekends"
          />
        </div>

        {error && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--red)", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!ready || submitting}
          className="forge-btn forge-btn-primary"
          style={{
            width: "100%",
            padding: "0.9rem 1.5rem",
            fontSize: "0.9375rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            opacity: ready ? 1 : 0.4,
          }}
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Flame size={16} />}
          {submitting ? "Submitting..." : "Submit application"}
        </button>

        <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", marginTop: "-0.5rem" }}>
          You will hear back by email.
        </p>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem" }}>
            Already have an invite code?{" "}
            <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Register here →
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
