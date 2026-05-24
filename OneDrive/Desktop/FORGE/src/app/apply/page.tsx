"use client";

/**
 * /apply - the public learning application. The front door to FORGE.
 * Applying is itself the first commitment - selectivity is on-brand.
 */

import { useState } from "react";
import Link from "next/link";
import { Flame, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { CURATED_ROADMAPS } from "@/lib/curated-roadmaps-client";

export default function ApplyPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [trackSlug, setTrackSlug] = useState("");
  const [motivation, setMotivation] = useState("");
  const [commitment, setCommitment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const ready = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && motivation.trim().length >= 30;

  const submit = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, trackSlug: trackSlug || null, motivation, commitment }),
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

  if (done) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", display: "grid", placeItems: "center", padding: "2rem 1.25rem" }}>
        <div style={{ maxWidth: 460, textAlign: "center" }}>
          <span style={{ display: "inline-grid", placeItems: "center", width: 56, height: 56, borderRadius: 14, background: "rgba(34,197,94,0.12)", color: "var(--green)", marginBottom: "1.25rem" }}>
            <CheckCircle2 size={28} />
          </span>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "0.75rem" }}>Application received</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.65 }}>
            A mentor will review it. If you are accepted, you will get an invite code by email - that code is
            your way in. Watch your inbox.
          </p>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginTop: "1.5rem", color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "0.8125rem", textDecoration: "none" }}>
            <ArrowLeft size={13} /> back to home
          </Link>
        </div>
      </main>
    );
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: "0.6875rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-dim)",
    marginBottom: "0.375rem",
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: "3rem 1.25rem 5rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
          <span style={{ display: "inline-grid", placeItems: "center", width: 52, height: 52, borderRadius: 13, background: "rgba(245,158,11,0.12)", color: "var(--accent)", marginBottom: "1rem" }}>
            <Flame size={26} />
          </span>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.25rem", letterSpacing: "0.04em", marginBottom: "0.625rem" }}>
            Apply to FORGE
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            FORGE is invite-only. Every learner is mentored by a real human and held to a real standard.
            Tell us who you are and why you want this. Mentors review every application.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Your full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="forge-input" placeholder="Jane Doe" />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="forge-input" placeholder="you@email.com" style={{ fontFamily: "var(--font-mono)" }} />
          </div>
          <div>
            <label style={labelStyle}>Which path do you want?</label>
            <select value={trackSlug} onChange={(e) => setTrackSlug(e.target.value)} className="forge-input">
              <option value="">Not sure yet - help me decide</option>
              {CURATED_ROADMAPS.map((r) => (
                <option key={r.slug} value={r.slug}>{r.title} ({r.weeks} weeks)</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Why do you want this? Be honest, be specific.</label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={5}
              className="forge-input"
              placeholder="What are you trying to reach? What have you tried before? Why now?"
              style={{ resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
          <div>
            <label style={labelStyle}>How much time can you commit each week? <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <input value={commitment} onChange={(e) => setCommitment(e.target.value)} className="forge-input" placeholder="e.g. 8-10 hours, evenings and weekends" />
          </div>

          {error && <p style={{ color: "var(--red)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)" }}>{error}</p>}

          <button
            type="button"
            onClick={submit}
            disabled={!ready || submitting}
            className="forge-btn forge-btn-primary"
            style={{ padding: "0.875rem 1.5rem", fontSize: "1rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: ready ? 1 : 0.5, marginTop: "0.5rem" }}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Flame size={16} />}
            Submit application
          </button>
          <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
            Already have an invite code? <Link href="/register" style={{ color: "var(--accent)" }}>Register here</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
