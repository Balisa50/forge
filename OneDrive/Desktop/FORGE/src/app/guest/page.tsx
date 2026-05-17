"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export default function GuestPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/guest", { method: "POST" });
        if (!res.ok) throw new Error("Could not create guest session");
        const { email, password } = (await res.json()) as { email: string; password: string };
        if (cancelled) return;
        const signin = await signIn("credentials", { email, password, redirect: false });
        if (cancelled) return;
        if (!signin?.ok || signin?.error) throw new Error(signin?.error || "Sign-in failed");
        // Full reload so the proxy middleware re-reads the new session cookie.
        // router.replace doesn't trigger middleware in v5 reliably.
        window.location.href = "/onboarding";
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-mono)",
        padding: "2rem",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        {error ? (
          <>
            <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", marginBottom: "0.75rem" }}>
              Couldn&apos;t start guest session
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{error}</p>
            <a href="/" className="forge-btn forge-btn-primary" style={{ padding: "0.75rem 1.75rem" }}>
              Back home
            </a>
          </>
        ) : (
          <>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "3px solid var(--border)",
                borderTopColor: "var(--accent)",
                margin: "0 auto 1.25rem",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Spinning up a guest forge
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              No signup needed — you&apos;ll land in a fresh workspace in a moment.
            </p>
          </>
        )}
      </div>
      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
