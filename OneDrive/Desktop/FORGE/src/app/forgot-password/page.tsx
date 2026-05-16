"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const d = await res.json();
        setError(d.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: "420px" }}>
        <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)", fontSize: "0.875rem", fontFamily: "var(--font-mono)", marginBottom: "1.25rem", textDecoration: "none" }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        <div className="forge-panel" style={{ padding: "2.5rem" }}>
          <Link href="/" style={{ display: "block", textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ fontFamily: "var(--font-headline)", color: "var(--red)", fontSize: "2rem", letterSpacing: "0.1em" }}>THE FORGE</span>
          </Link>

          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", textAlign: "center", marginBottom: "0.5rem" }}>Forgot Password?</h1>
          <p style={{ color: "var(--text-secondary)", textAlign: "center", fontSize: "0.9375rem", marginBottom: "2rem" }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                <CheckCircle2 size={48} strokeWidth={1.5} color="var(--green)" />
              </div>
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", marginBottom: "0.75rem" }}>Check your inbox</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
                If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your spam folder too.
              </p>
              <Link href="/login" className="forge-btn forge-btn-primary" style={{ display: "block", textAlign: "center" }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
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
                <button type="submit" className="forge-btn forge-btn-primary" style={{ width: "100%", padding: "0.75rem" }} disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
