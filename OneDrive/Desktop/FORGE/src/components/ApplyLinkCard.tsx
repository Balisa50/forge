"use client";

import { useEffect, useState } from "react";
import { Copy, CheckCheck, Link2 } from "lucide-react";

/**
 * The mentor's public apply link. Anyone who applies through it lands in
 * the Applications queue on the same page.
 */
export default function ApplyLinkCard({ mentorId }: { mentorId: string }) {
 const [copied, setCopied] = useState(false);

 // Resolved after mount so server and client markup agree (the real origin
 // differs between prod, previews and localhost).
 const [origin, setOrigin] = useState("https://forge-ab.vercel.app");
 useEffect(() => { setOrigin(window.location.origin); }, []);
 const applyLink = `${origin}/apply/${mentorId}`;

 const copyLink = () => {
 navigator.clipboard.writeText(applyLink);
 setCopied(true);
 setTimeout(() => setCopied(false), 1500);
 };

 return (
 <div style={{ marginBottom: "1.75rem", padding: "1rem 1.25rem", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10 }}>
 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
 <Link2 size={14} color="var(--accent)" />
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)" }}>
 Your public apply link
 </span>
 </div>
 <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
 <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-primary)", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6, padding: "0.375rem 0.625rem", wordBreak: "break-all", flex: 1, minWidth: 200 }}>
 {applyLink}
 </code>
 <button
 onClick={copyLink}
 className="forge-btn forge-btn-ghost"
 style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", minHeight: "unset", display: "inline-flex", alignItems: "center", gap: "0.3rem", flexShrink: 0 }}
 >
 {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
 {copied ? "Copied!" : "Copy"}
 </button>
 </div>
 <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginTop: "0.5rem", marginBottom: 0 }}>
 Post it anywhere. Everyone who applies shows up in the Applications queue below.
 </p>
 </div>
 );
}
