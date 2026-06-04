"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, KeyRound, UserCheck, X } from "lucide-react";

// LocalStorage keys. Scoped to the forge-ab.vercel.app origin only; nothing
// in here is sensitive enough to need encryption — anyone who can read the
// browser's localStorage can already act as the user via the session cookie.
const REMEMBER_PID_KEY = "forge_remembered_personal_id";
const REMEMBER_NAME_KEY = "forge_remembered_name";

function maskPersonalId(pid: string): string {
  // FORGE-2K7R-SAW4 -> FORGE-2K7R-•••• (mask last 4 chars)
  if (pid.length <= 5) return pid;
  return pid.slice(0, pid.length - 4) + "••••";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Mentee return via personal ID
  const [personalId, setPersonalId] = useState("");
  const [menteeLoading, setMenteeLoading] = useState(false);
  // Remembered identity (per-device, localStorage)
  const [rememberedPid, setRememberedPid] = useState<string | null>(null);
  const [rememberedName, setRememberedName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Read remembered identity AFTER mount (avoids SSR/CSR mismatch)
  useEffect(() => {
    try {
      const pid = localStorage.getItem(REMEMBER_PID_KEY);
      const name = localStorage.getItem(REMEMBER_NAME_KEY);
      if (pid) setRememberedPid(pid);
      if (name) setRememberedName(name);
    } catch {
      // localStorage blocked (private mode, third-party cookies off) — ignore
    }
    setHydrated(true);
  }, []);

  const clearRemembered = () => {
    try {
      localStorage.removeItem(REMEMBER_PID_KEY);
      localStorage.removeItem(REMEMBER_NAME_KEY);
    } catch { /* noop */ }
    setRememberedPid(null);
    setRememberedName(null);
  };

  // One-tap return: use the remembered ID without typing
  const handleQuickReturn = async () => {
    if (!rememberedPid) return;
    setMenteeLoading(true);
    setError("");
    try {
      const result = await signIn("mentee-return", {
        personalId: rememberedPid,
        redirect: false,
      });
      if (result?.ok) {
        window.location.href = "/dashboard";
      } else {
        // The remembered ID is stale (e.g., mentor rotated it). Forget it
        // and let the user type the new one.
        clearRemembered();
        setError("This device's saved Personal ID no longer works — your mentor may have issued you a new one. Type the new ID below or use 'Forgot my Personal ID'.");
        setMenteeLoading(false);
      }
    } catch {
      setError("Couldn't sign you in. Try again.");
      setMenteeLoading(false);
    }
  };

  const handleMenteeReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalId.trim()) return;
    setMenteeLoading(true);
    setError("");
    try {
      const cleaned = personalId.trim().toUpperCase();
      const result = await signIn("mentee-return", {
        personalId: cleaned,
        redirect: false,
      });
      if (result?.ok) {
        // Remember this device — next visit, one-tap continue
        try {
          localStorage.setItem(REMEMBER_PID_KEY, cleaned);
          // We don't have the user's display name client-side yet; the
          // dashboard will fill it in on first load via a small effect.
          // For now, store nothing for the name and let the welcome card
          // say "Welcome back" generically until the dashboard caches it.
        } catch { /* noop */ }
        window.location.href = "/dashboard";
      } else {
        setError("That Personal ID didn't match any account. Make sure you include the FORGE- prefix (example: FORGE-XXXX-XXXX). If you've lost your code, use 'Forgot my Personal ID' below.");
        setMenteeLoading(false);
        // Scroll error into view on mobile so the mentee actually sees it
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 50);
      }
    } catch {
      setError("Couldn't sign you in. Try again.");
      setMenteeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        // NextAuth v5 error codes
        if (res.error === "CredentialsSignin") {
          setError("Email or password is incorrect. Double-check and try again.");
        } else if (res.error === "Configuration") {
          setError("Server configuration issue — please contact support.");
        } else {
          setError(`Sign-in failed: ${res.error}`);
        }
        setLoading(false);
        return;
      }

      if (res?.ok) {
        // Full page reload — router.push/refresh is unreliable on mobile
        // browsers and can leave the user stuck on a blank screen after
        // session cookies are set. window.location forces a fresh request
        // so the proxy middleware re-reads the session.
        window.location.href = "/dashboard";
      } else {
        setError("Sign-in did not complete. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Network error: ${msg}. Check your connection and retry.`);
      setLoading(false);
    }
  };

  return (
    // Bullet-proof centring that ignores every parent layout. The root layout
    // <body className="flex flex-col"> + any auth/redirect wrapper can shift a
    // normally-positioned flex container off the visual centre. Pulling the
    // wrapper out of normal flow with position:fixed + inset:0 makes it span
    // the full viewport unambiguously. Inside, display:grid + place-items:
    // center is the most robust two-axis centring CSS has. overflow:auto keeps
    // the page scrollable when the card is taller than the viewport.
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-base)",
        display: "grid",
        placeItems: "center",
        padding: "1.5rem",
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: "450px", margin: "0 auto", boxSizing: "border-box" }}
      >
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)", fontSize: "0.875rem", fontFamily: "var(--font-mono)", marginBottom: "1.25rem", textDecoration: "none" }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="forge-panel" style={{ padding: "2.5rem" }}>
        <Link href="/" style={{ display: "block", textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ fontFamily: "var(--font-headline)", color: "var(--red)", fontSize: "2rem", letterSpacing: "0.1em" }}>THE FORGE</span>
        </Link>

        <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", textAlign: "center", marginBottom: "0.5rem" }}>Welcome Back</h1>
        <p style={{ color: "var(--text-secondary)", textAlign: "center", fontSize: "0.9375rem", marginBottom: "2rem" }}>Sign in to your account</p>

        {error && (
          <div style={{ background: "rgba(255,45,45,0.1)", border: "1px solid var(--red)", borderRadius: "4px", padding: "0.75rem 1rem", marginBottom: "1.5rem", color: "var(--red)", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        {/* Remembered identity — one-tap continue. Only renders after hydration
            to avoid SSR/CSR text mismatch. */}
        {hydrated && rememberedPid && (
          <div style={{ marginBottom: "1.75rem", padding: "1rem 1.125rem", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
              <UserCheck size={16} style={{ color: "var(--accent)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                  Welcome back{rememberedName ? `, ${rememberedName.split(" ")[0]}` : ""}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", marginTop: 2 }}>
                  {maskPersonalId(rememberedPid)}
                </div>
              </div>
              <button
                type="button"
                onClick={clearRemembered}
                title="Forget this device"
                aria-label="Forget this device"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0.25rem", display: "flex", alignItems: "center", borderRadius: 4 }}
              >
                <X size={14} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleQuickReturn}
              disabled={menteeLoading}
              className="forge-btn forge-btn-primary"
              style={{ width: "100%", padding: "0.625rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              <KeyRound size={14} />
              {menteeLoading ? "Signing in..." : "Continue"}
            </button>
            <p style={{ fontSize: "0.6875rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)", textAlign: "center", marginTop: "0.75rem", marginBottom: 0 }}>
              Not you? <button type="button" onClick={clearRemembered} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: "inherit" }}>Sign in with a different ID</button>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="forge-input"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="forge-input"
                style={{ paddingRight: "2.75rem" }}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0 0.25rem", display: "flex", alignItems: "center", minHeight: "unset" }}>
                {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <button type="submit" className="forge-btn forge-btn-primary" style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem" }} disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/forgot-password" style={{ color: "var(--text-dim)", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
            Forgot password?
          </Link>
        </div>

        <div style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          No account?{" "}
          <Link href="/register" style={{ color: "var(--blue)" }}>Create one</Link>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.1em" }}>MENTEE? RETURN WITH YOUR PERSONAL ID</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>

        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", marginBottom: "0.5rem", lineHeight: 1.5 }}>
          Type your full Personal ID, including the <strong style={{ color: "var(--accent)" }}>FORGE-</strong> prefix.
          <br />
          Example: <strong style={{ color: "var(--accent)" }}>FORGE-XXXX-XXXX</strong>
        </p>

        <form onSubmit={handleMenteeReturn}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={personalId}
              onChange={(e) => setPersonalId(e.target.value)}
              placeholder="FORGE-XXXX-YYYY"
              className="forge-input"
              style={{ flex: 1, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="characters"
            />
            <button
              type="submit"
              disabled={menteeLoading || !personalId.trim()}
              className="forge-btn forge-btn-primary"
              style={{ padding: "0 1rem", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
            >
              <KeyRound size={14} />
              {menteeLoading ? "..." : "Enter"}
            </button>
          </div>
        </form>
        <div style={{ textAlign: "center", marginTop: "0.625rem" }}>
          <Link href="/forgot-code" style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
            Forgot my Personal ID
          </Link>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
