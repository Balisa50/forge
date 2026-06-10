"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, AlertTriangle, Flame } from "lucide-react";

export default function RecoveryPage() {
 const { token } = useParams<{ token: string }>();
 const [status, setStatus] = useState<"working" | "ok" | "fail">("working");
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 let cancelled = false;
 (async () => {
 try {
 const res = await signIn("recovery", { token, redirect: false });
 if (cancelled) return;
 if (!res?.ok || res?.error) {
 setError(res?.error ?? "Recovery link invalid or expired.");
 setStatus("fail");
 return;
 }
 setStatus("ok");
 // Full reload so proxy reads new session
 window.location.href = "/dashboard";
 } catch (e) {
 if (cancelled) return;
 setError(e instanceof Error ? e.message : "Recovery failed.");
 setStatus("fail");
 }
 })();
 return () => { cancelled = true; };
 }, [token]);

 return (
 <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1.5rem", background: "var(--bg-base)", color: "var(--text-primary)" }}>
 <div className="forge-panel" style={{ width: "100%", maxWidth: 420, padding: "2.5rem 2rem", textAlign: "center" }}>
 <Flame size={32} color="var(--accent)" strokeWidth={1.5} style={{ margin: "0 auto 1rem" }} />
 {status === "working" && (
 <>
 <Loader2 size={20} className="animate-spin" style={{ margin: "0 auto 0.5rem", color: "var(--accent)" }} />
 <p style={{ color: "var(--text-secondary)" }}>Signing you back in…</p>
 </>
 )}
 {status === "fail" && (
 <>
 <AlertTriangle size={24} color="var(--red)" style={{ margin: "0 auto 0.5rem" }} />
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Recovery failed</h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>{error}</p>
 <a href="/" className="forge-btn forge-btn-ghost">Back home</a>
 </>
 )}
 </div>
 </main>
 );
}
