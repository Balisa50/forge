"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[FORGE Dashboard Error]", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "420px", textAlign: "center" }}>
        <div style={{ color: "var(--red)", marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
          <AlertTriangle size={48} strokeWidth={1.5} />
        </div>

        <h2
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "2rem",
            color: "var(--red)",
            letterSpacing: "0.05em",
            marginBottom: "0.75rem",
            textTransform: "uppercase",
          }}
        >
          Something Broke
        </h2>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "0.5rem" }}>
          An unexpected error occurred while loading this page.
        </p>

        {error.digest && (
          <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", marginBottom: "0.5rem" }}>
            Error ID: {error.digest}
          </p>
        )}

        <button
          onClick={reset}
          className="forge-btn forge-btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 2rem" }}
        >
          <RotateCcw size={14} />
          Try Again
        </button>
      </div>
    </div>
  );
}
