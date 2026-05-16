"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function OrgInviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1rem",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.125rem", letterSpacing: "0.15em", color: "var(--accent)" }}>
        {code}
      </span>
      {copied ? (
        <Check size={16} color="var(--green)" />
      ) : (
        <Copy size={16} color="var(--text-dim)" />
      )}
    </div>
  );
}
