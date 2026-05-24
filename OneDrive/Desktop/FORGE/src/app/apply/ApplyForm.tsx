"use client";

/**
 * The FORGE application form — used by both /apply (global) and
 * /apply/[mentorId] (mentor-scoped). When mentorId + mentorName are
 * provided the page feels personal; otherwise generic but still premium.
 */

import { useState } from "react";
import Link from "next/link";
import { Flame, Loader2, CheckCircle2, ShieldCheck, Zap, Target, Lock } from "lucide-react";
import { CURATED_ROADMAPS } from "@/lib/curated-roadmaps-client";

interface ApplyFormProps {
  mentorId?: string;
  mentorName?: string;
}

const WHAT_TO_EXPECT = [
  {
    Icon: ShieldCheck,
    title: "Real accountability",
    body: "Your mentor checks your work. No ghosting.",
  },
  {
    Icon: Target,
    title: "A structured path",
    body: "Week by week. You cannot skip ahead.",
  },
  {
    Icon: Zap,
    title: "High standards",
    body: "Every check-in reviewed. No participation trophies.",
  },
  {
    Icon: Lock,
    title: "Invite only",
    body: "Not everyone gets in. That is the point.",
  },
];

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

  /* ── SUCCESS STATE ─────────────────────────────────────────────── */
  if (done) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", display: "grid", placeItems: "center", padding: "2rem 1.25rem" }}>
        <div style={{ maxWidth: 500, textAlign: "center" }}>
          <span style={{ display: "inline-grid", placeItems: "center", width: 64, height: 64, borderRadius: 16, background: "rgba(34,197,94,0.12)", color: "var(--green)", marginBottom: "1.5rem" }}>
            <CheckCircle2 size={32} />
          </span>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.25rem", letterSpacing: "0.04em", marginBottom: "0.875rem" }}>
            Application submitted.
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>
            Your application is in front of{mentorName ? ` ${mentorName}` : " a mentor"} right now. They read every word.
          </p>
          <p style={{ color: "var(--text-dim)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            If you are accepted, you will receive an <strong style={{ color: "var(--accent)" }}>invite code</strong> by email.
            That code is your key in — guard it. Watch your inbox.
          </p>
          <div style={{ marginTop: "2rem", padding: "1rem 1.25rem", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              While you wait
            </p>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", marginTop: "0.375rem", lineHeight: 1.6 }}>
              Think about the one thing you want to build. When your mentor releases your first week, they will ask you. Have an answer.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: "0.6875rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-dim)",
    marginBottom: "0.5rem",
  };

  const charCount = motivation.trim().length;

  /* ── FORM ──────────────────────────────────────────────────────── */
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>

      {/* HERO */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "4rem 1.25rem 3rem", textAlign: "center", background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 100%)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 999, padding: "0.3rem 0.875rem", marginBottom: "1.5rem" }}>
          <Flame size={12} color="var(--accent)" />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)" }}>
            Invite only
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.04em", lineHeight: 1.05, marginBottom: "1.25rem" }}>
          {mentorName ? (
            <>Apply to train<br />with <span style={{ color: "var(--accent)" }}>{mentorName}.</span></>
          ) : (
            <>Apply to be<br /><span style={{ color: "var(--accent)" }}>Forged.</span></>
          )}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "clamp(1rem, 2vw, 1.125rem)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 0" }}>
          A mentor. A roadmap. Real accountability.
        </p>
      </div>

      {/* WHAT TO EXPECT */}
      <div style={{ padding: "3rem 1.25rem", borderBottom: "1px solid var(--border)", maxWidth: 860, margin: "0 auto" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", textAlign: "center", marginBottom: "2rem" }}>
          What you are signing up for
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
          {WHAT_TO_EXPECT.map(({ Icon, title, body }) => (
            <div key={title} style={{ padding: "1.25rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <span style={{ display: "inline-grid", placeItems: "center", width: 36, height: 36, borderRadius: 8, background: "rgba(245,158,11,0.1)", color: "var(--accent)", marginBottom: "0.875rem" }}>
                <Icon size={17} />
              </span>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.375rem" }}>{title}</div>
              <div style={{ color: "var(--text-dim)", fontSize: "0.8125rem", lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* APPLICATION FORM */}
      <div style={{ padding: "3rem 1.25rem 5rem", maxWidth: 620, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", letterSpacing: "0.03em", marginBottom: "2rem" }}>
          Your application
        </h2>

        <div className="flex flex-col gap-5">

          {/* Name + Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="forge-input"
                placeholder="Your name"
              />
            </div>
            <div>
              <label style={labelStyle}>Email address</label>
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
            <label style={labelStyle}>Which path are you applying for?</label>
            <select
              value={trackSlug}
              onChange={(e) => setTrackSlug(e.target.value)}
              className="forge-input"
              style={{ appearance: "none" }}
            >
              <option value="">I am not sure yet — help me choose</option>
              {CURATED_ROADMAPS.map((r) => (
                <option key={r.slug} value={r.slug}>{r.title}</option>
              ))}
            </select>
          </div>

          {/* Background */}
          <div>
            <label style={labelStyle}>Your background</label>
            <textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              rows={3}
              className="forge-input"
              placeholder="Where you are now. What you have tried. Be honest."
              style={{ resize: "vertical", lineHeight: 1.65 }}
            />
          </div>

          {/* Motivation */}
          <div>
            <label style={labelStyle}>
              Why do you want this?
              <span style={{ textTransform: "none", letterSpacing: 0, marginLeft: "0.5rem", color: motivationOk ? "var(--green)" : "var(--red)", fontSize: "0.625rem" }}>
                {charCount} / 80 min
              </span>
            </label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={5}
              className="forge-input"
              placeholder="The real reason. Vague answers get rejected."
              style={{ resize: "vertical", lineHeight: 1.65, borderColor: motivation.length > 0 && !motivationOk ? "rgba(239,68,68,0.5)" : undefined }}
            />
          </div>

          {/* Commitment */}
          <div>
            <label style={labelStyle}>
              Weekly commitment
              <span style={{ textTransform: "none", letterSpacing: 0, marginLeft: "0.5rem" }}>(optional)</span>
            </label>
            <input
              value={commitment}
              onChange={(e) => setCommitment(e.target.value)}
              className="forge-input"
              placeholder="e.g. 10 hours, evenings and weekends"
            />
          </div>

          {error && (
            <div style={{ padding: "0.75rem 1rem", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "var(--red)", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={submit}
              disabled={!ready || submitting}
              className="forge-btn forge-btn-primary"
              style={{
                width: "100%",
                padding: "1rem 1.5rem",
                fontSize: "1rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.625rem",
                opacity: ready ? 1 : 0.45,
                letterSpacing: "0.03em",
              }}
            >
              {submitting ? <Loader2 size={17} className="animate-spin" /> : <Flame size={17} />}
              {submitting ? "Submitting..." : "Submit my application"}
            </button>
            <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", marginTop: "1rem" }}>
              You will hear back by email.
            </p>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem" }}>
              Already have an invite code?{" "}
              <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>
                Register here →
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
