"use client";

import { Printer } from "lucide-react";

/** Print / Save-as-PDF trigger for the formula sheet (browser print dialog). */
export default function PrintButton({ label = "Print / Save PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition hover:border-[color:var(--accent)]"
      style={{ borderColor: "var(--border)", background: "var(--bg-panel)", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}
    >
      <Printer size={12} /> {label}
    </button>
  );
}
