"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";

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

  const handleMenteeReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalId.trim()) return;
    setMenteeLoading(true);
    setError("");
    try {
      const result = await signIn("mentee-return", {
        personalId: personalId.trim().toUpperCase(),
        redirect: false,
      });
      if (result?.ok) {
        window.location.href = "/dashboard";
      } else {
        setError("That Personal ID didn't match any mentee account. Check spelling, or use 'Forgot my code' below.");
        setMenteeLoading(false);
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
        router.push("/dashboard");
        router.refresh();
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
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: "420px" }}
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
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: 0, display: "flex" }}>
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
