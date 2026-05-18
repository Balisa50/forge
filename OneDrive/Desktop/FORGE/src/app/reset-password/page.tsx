"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !email) setError("Invalid reset link. Please request a new one.");
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.error ?? "Something went wrong. Try again.");
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

          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", textAlign: "center", marginBottom: "0.5rem" }}>Set New Password</h1>
          <p style={{ color: "var(--text-secondary)", textAlign: "center", fontSize: "0.9375rem", marginBottom: "2rem" }}>
            Choose a strong password for your account.
          </p>

          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                <CheckCircle2 size={48} strokeWidth={1.5} color="var(--green)" />
              </div>
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Password updated!</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>Redirecting you to sign in...</p>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: "rgba(255,45,45,0.1)", border: "1px solid var(--red)", borderRadius: "4px", padding: "0.75rem 1rem", marginBottom: "1.5rem", color: "var(--red)", fontSize: "0.875rem" }}>
                  {error}{" "}
                  {error.includes("expired") || error.includes("Invalid") ? (
                    <Link href="/forgot-password" style={{ color: "var(--blue)", fontWeight: 600 }}>Request new link</Link>
                  ) : null}
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="forge-input"
                      style={{ paddingRight: "2.75rem" }}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      disabled={!!error && !newPassword}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.75rem", top: 0, bottom: 0, background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0 0.25rem", display: "flex", alignItems: "center" }}>
                      {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="forge-btn forge-btn-primary" style={{ width: "100%", padding: "0.75rem" }} disabled={loading || !token || !email}>
                  {loading ? "Updating..." : "Set New Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
