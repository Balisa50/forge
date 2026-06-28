"use client";

/**
 * Your Forge Pact, on the dashboard. Collapsed by default - the identity
 * line shows as a quiet daily reminder. Expanded, it shows the full pact:
 * the why, the stake, the signature. This is the commitment kept in view.
 *
 * Behavioural basis: a commitment only holds if the person is periodically
 * re-exposed to it. The Pact signed once and never seen again is forgotten.
 */

import { useEffect, useState } from "react";
import { Flame, ChevronDown, ChevronRight } from "lucide-react";

interface Pact {
 why: string;
 stake: string;
 identity: string;
 signature: string;
 signedAt: string;
}

export default function ForgePactCard() {
 const [pact, setPact] = useState<Pact | null>(null);
 const [open, setOpen] = useState(false);

 useEffect(() => {
 fetch("/api/pact")
 .then((r) => r.json())
 .then((d) => setPact(d.pact ?? null))
 .catch(() => {});
 }, []);

 if (!pact) return null;

 return (
 <section
 className="forge-panel"
 style={{
 padding: 0,
 marginBottom: "1.5rem",
 overflow: "hidden",
 border: "1px solid rgba(245,158,11,0.25)",
 }}
 >
 <button
 type="button"
 onClick={() => setOpen((o) => !o)}
 aria-expanded={open}
 style={{
 width: "100%",
 background: "transparent",
 border: "none",
 padding: "1rem 1.25rem",
 display: "flex",
 alignItems: "center",
 gap: "0.75rem",
 cursor: "pointer",
 textAlign: "left",
 minHeight: "unset",
 }}
 >
 <span style={{ flexShrink: 0, color: "var(--text-dim)", display: "flex" }}>
 {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
 </span>
 <span
 style={{
 width: 30,
 height: 30,
 borderRadius: 8,
 background: "rgba(245,158,11,0.14)",
 color: "var(--accent)",
 display: "grid",
 placeItems: "center",
 flexShrink: 0,
 }}
 >
 <Flame size={15} />
 </span>
 <span style={{ flex: 1, minWidth: 0 }}>
 <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)" }}>
 Your Forge Pact
 </span>
 <span style={{ display: "block", fontSize: "0.875rem", color: "var(--text-primary)", marginTop: "0.125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
 I am becoming someone who {pact.identity}
 </span>
 </span>
 </button>

 {open && (
 <div style={{ padding: "0 1.25rem 1.25rem", borderTop: "1px solid var(--border)" }}>
 <div style={{ marginTop: "1rem" }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.375rem" }}>
 Why I started
 </p>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{pact.why}</p>
 </div>
 <div style={{ marginTop: "1rem" }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.375rem" }}>
 What quitting costs me
 </p>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{pact.stake}</p>
 </div>
 <div
 style={{
 marginTop: "1.25rem",
 paddingTop: "1rem",
 borderTop: "1px dashed var(--border)",
 display: "flex",
 alignItems: "baseline",
 justifyContent: "space-between",
 gap: "1rem",
 flexWrap: "wrap",
 }}
 >
 <span style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", color: "var(--accent)", letterSpacing: "0.04em" }}>
 {pact.signature}
 </span>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
 signed {new Date(pact.signedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
 </span>
 </div>
 </div>
 )}
 </section>
 );
}
