"use client";

import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Zap } from "lucide-react";
import InterrogationChat from "@/components/InterrogationChat";

export default function DefencePage() {
  const [status, setStatus] = useState<"loading" | "eligible" | "not_eligible" | "started">("loading");
  const [integrityScore, setIntegrityScore] = useState(100);
  const [checkinId, setCheckinId] = useState<string | null>(null);
  const [interrogationId, setInterrogationId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [defenceComplete, setDefenceComplete] = useState(false);

  useEffect(() => {
    // Check eligibility — integrity must be below 80
    fetch("/api/user/settings")
      .then((r) => r.json())
      .then((d) => {
        setIntegrityScore(d.user?.integrityScore ?? 100);
        if (d.user?.integrityScore < 80) {
          setStatus("eligible");
        } else {
          setStatus("not_eligible");
        }
      })
      .catch(() => setStatus("not_eligible"));
  }, []);

  const startDefence = async () => {
    setError("");
    try {
      const res = await fetch("/api/defence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setCheckinId(data.checkinId);
      setInterrogationId(data.interrogationId);
      setStatus("started");
    } catch {
      setError("Failed to start defence. Try again.");
    }
  };

  if (status === "loading") {
    return <div style={{ color: "var(--text-dim)", padding: "2rem" }}>Checking eligibility...</div>;
  }

  if (status === "started" && interrogationId) {
    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--red)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            ⚖️ DEFENCE MODE ACTIVE
          </div>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", letterSpacing: "0.05em" }}>Prove Your Knowledge</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Pass this interrogation to restore your integrity score. The Professor will be rigorous.
          </p>
        </div>
        <InterrogationChat
          interrogationId={interrogationId}
          checkinId={checkinId!}
          userName="Defendant"
          onComplete={() => setDefenceComplete(true)}
        />
      </div>
    );
  }

  if (status === "not_eligible") {
    return (
      <div>
        <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Defence Mode</h1>
        <div className="forge-panel" style={{ padding: "3rem", textAlign: "center", marginTop: "2rem" }}>
          <Shield size={48} color="var(--green)" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", marginBottom: "0.5rem", color: "var(--green)" }}>No Defence Needed</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            Your integrity score is <strong style={{ color: "var(--green)" }}>{integrityScore}/100</strong>. Defence mode is only available when your integrity drops below 80.
          </p>
        </div>
      </div>
    );
  }

  // Eligible for defence
  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Defence Mode</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "2rem" }}>
        Your integrity has been compromised. Defend your knowledge to restore it.
      </p>

      <div className="forge-panel" style={{ padding: "2rem", borderColor: "var(--red)", background: "rgba(239,68,68,0.03)", maxWidth: "600px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "rgba(239,68,68,0.1)", border: "2px solid var(--red)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
          }}>
            <AlertTriangle size={36} color="var(--red)" strokeWidth={1.5} />
          </div>
          <div style={{ fontFamily: "var(--font-headline)", fontSize: "3rem", color: "var(--red)", lineHeight: 1, marginBottom: "0.25rem" }}>
            {integrityScore}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.1em" }}>
            INTEGRITY SCORE
          </div>
        </div>

        <div style={{ background: "var(--bg-card)", borderRadius: "8px", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", marginBottom: "0.75rem" }}>How Defence Works</h3>
          <ul style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.8, listStyle: "none", padding: 0 }}>
            <li style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>01.</span> You will face 10 rigorous questions about your recent work
            </li>
            <li style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>02.</span> The Professor will probe deeper than standard interrogations
            </li>
            <li style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>03.</span> Anti-cheat monitoring is active — no tab switching, no copy-paste
            </li>
            <li style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>04.</span> <strong>Pass:</strong> Integrity restored by up to 20 points
            </li>
            <li style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ color: "var(--accent)" }}>05.</span> <strong>Fail:</strong> Integrity drops by an additional 10 points
            </li>
          </ul>
        </div>

        <button onClick={startDefence} className="forge-btn forge-btn-red" style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", gap: "0.5rem" }}>
          <Zap size={18} /> Enter Defence Mode
        </button>
        {error && <div style={{ marginTop: "0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--red)", textAlign: "center" }}>{error}</div>}
      </div>
    </div>
  );
}
