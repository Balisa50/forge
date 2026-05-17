"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Flame, Loader2, AlertTriangle, ArrowRight, Bookmark } from "lucide-react";

interface PreviewResp {
  valid: boolean;
  error?: string;
  mentor?: { id: string; name: string | null; email: string };
  roadmapSlug?: string | null;
  label?: string | null;
}

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const normalised = (code ?? "").toUpperCase();

  const [preview, setPreview] = useState<PreviewResp | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post-join recovery info
  const [joined, setJoined] = useState(false);
  const [recoveryUrl, setRecoveryUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch(`/api/mentor/invites/redeem?code=${encodeURIComponent(normalised)}`);
        const data = await res.json();
        if (!cancelled) setPreview(data);
      } catch {
        if (!cancelled) setPreview({ valid: false, error: "Couldn't verify this link" });
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [normalised]);

  const handleJoin = async () => {
    if (!name.trim()) return;
    setJoining(true);
    setError(null);
    try {
      const res = await signIn("join", {
        code: normalised,
        name: name.trim(),
        email: email.trim(),
        redirect: false,
      });
      if (!res?.ok || res?.error) {
        setError(res?.error ?? "Couldn't pair you with this mentor. The code may have expired or hit its usage cap.");
        setJoining(false);
        return;
      }
      // Pull the recovery token so we can show the bookmarkable URL
      const meRes = await fetch("/api/me/recovery-token");
      if (meRes.ok) {
        const me = await meRes.json();
        if (me.recoveryToken) {
          setRecoveryUrl(`${window.location.origin}/r/${me.recoveryToken}`);
        }
      }
      setJoined(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setJoining(false);
    }
  };

  const continueIn = () => {
    // Full reload so the proxy middleware reads the new session cookie
    window.location.href = "/dashboard";
  };

  const copyRecovery = async () => {
    if (!recoveryUrl) return;
    try {
      await navigator.clipboard.writeText(recoveryUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", display: "grid", placeItems: "center", padding: "1.5rem" }}>
      <div className="forge-panel" style={{ width: "100%", maxWidth: 480, padding: "2.5rem 2rem" }}>
        <Flame size={36} color="var(--accent)" strokeWidth={1.5} style={{ margin: "0 auto 1rem", display: "block" }} />

        {previewLoading ? (
          <div style={{ textAlign: "center", color: "var(--text-dim)" }}><Loader2 size={18} className="animate-spin inline-block" /> Verifying link…</div>
        ) : !preview?.valid ? (
          <div style={{ textAlign: "center" }}>
            <AlertTriangle size={28} color="var(--red)" style={{ margin: "0 auto 0.75rem", display: "block" }} />
            <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>This link doesn&apos;t work</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>{preview?.error ?? "The code may have expired, been deactivated, or reached its usage limit. Ask your mentor for a fresh link."}</p>
            <a href="/" className="forge-btn forge-btn-ghost" style={{ marginTop: "1.5rem", display: "inline-block" }}>Back home</a>
          </div>
        ) : joined ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34,197,94,0.15)", display: "grid", placeItems: "center", margin: "0 auto 1rem" }}>
              <Flame size={28} color="var(--green)" />
            </div>
            <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.625rem", marginBottom: "0.25rem" }}>You&apos;re paired with {preview.mentor?.name ?? "your mentor"}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
              Save this personal link so you can return to your account on any device:
            </p>
            {recoveryUrl ? (
              <div style={{ marginBottom: "1rem", padding: "0.75rem 0.875rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }}>
                <code style={{ display: "block", wordBreak: "break-all", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>{recoveryUrl}</code>
                <button onClick={copyRecovery} className="forge-btn forge-btn-ghost" style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  <Bookmark size={11} /> {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            ) : (
              <div style={{ color: "var(--text-dim)", fontSize: "0.8125rem", marginBottom: "1rem" }}>(Recovery link will appear in your settings if you need it later.)</div>
            )}
            <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginBottom: "1.5rem" }}>
              Bookmark or email it to yourself. Without it, you&apos;d need a new code from your mentor.
            </p>
            <button onClick={continueIn} className="forge-btn forge-btn-primary" style={{ width: "100%", padding: "0.75rem 1rem", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "0.375rem" }}>
              Continue to dashboard <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.625rem", marginBottom: "0.25rem", textAlign: "center" }}>
              Join {preview.mentor?.name ?? "your mentor"}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", textAlign: "center", marginBottom: "1.5rem" }}>
              {preview.roadmapSlug
                ? <>Path: <strong style={{ color: "var(--accent)" }}>{preview.roadmapSlug.replace(/-/g, " ")}</strong></>
                : "Your mentor will help you pick a path after you join."}
            </p>

            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.375rem" }}>What should we call you?</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="forge-input"
              style={{ marginBottom: "1rem", fontSize: "1rem" }}
              autoFocus
            />

            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.375rem" }}>Email (optional, for recovery)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="forge-input"
              style={{ marginBottom: "1.25rem", fontSize: "1rem" }}
            />

            {error && (
              <div style={{ color: "var(--red)", fontSize: "0.875rem", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6 }}>{error}</div>
            )}

            <button
              onClick={handleJoin}
              disabled={!name.trim() || joining}
              className="forge-btn forge-btn-primary"
              style={{ width: "100%", padding: "0.75rem 1rem", fontSize: "1rem", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
            >
              {joining ? <><Loader2 size={14} className="animate-spin" /> Joining…</> : <>Join <ArrowRight size={14} /></>}
            </button>

            <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-dim)", textAlign: "center", fontFamily: "var(--font-mono)" }}>
              No password required. By joining you become {preview.mentor?.name ?? "this mentor"}&apos;s mentee.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
