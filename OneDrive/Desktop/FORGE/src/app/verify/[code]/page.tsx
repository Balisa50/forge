import Link from "next/link";
import { Shield, CheckCircle2, XCircle } from "lucide-react";

async function verifyCertificate(code: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/certificate?code=${code}`, { cache: "no-store" });
    return res.json();
  } catch {
    return { valid: false };
  }
}

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const result = await verifyCertificate(code);

  if (!result.valid) {
    return (
      <div style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", color: "var(--text-primary)" }}>
        <div className="forge-panel" style={{ maxWidth: "500px", padding: "3rem", textAlign: "center" }}>
          <div style={{ color: "var(--red)", marginBottom: "1rem" }}><XCircle size={56} strokeWidth={1.5} /></div>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "0.5rem" }}>Certificate Not Found</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>This verification code is invalid or the certificate does not exist.</p>
          <Link href="/" className="forge-btn forge-btn-ghost">Back to Home</Link>
        </div>
      </div>
    );
  }

  const cert = result.certificate;

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", color: "var(--text-primary)" }}>
      <div className="forge-panel" style={{ maxWidth: "600px", padding: "3rem", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ color: "var(--green)", marginBottom: "1rem" }}><CheckCircle2 size={56} strokeWidth={1.5} /></div>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", marginBottom: "0.25rem" }}>Verified Certificate</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", letterSpacing: "0.15em" }}>CODE: {cert.verifyCode}</p>
        </div>

        <div className="forge-card" style={{ padding: "1.5rem", marginBottom: "1.5rem", borderColor: "var(--accent)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>This certifies that</div>
            <div style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", color: "var(--accent)", marginBottom: "0.5rem" }}>{cert.userName}</div>
            <div style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>has completed</div>
            <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", marginBottom: "1rem" }}>{cert.roadmapTitle}</div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontFamily: "var(--font-headline)", fontSize: "4rem", lineHeight: 1, color: "var(--accent)" }}>{cert.grade}</div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--accent)", letterSpacing: "0.15em" }}>{cert.gradeLabel}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>{cert.scores.overall}/10 avg</div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2" style={{ marginBottom: "1rem" }}>
            {[
              { label: "M", value: cert.scores.mastery },
              { label: "A", value: cert.scores.application },
              { label: "An", value: cert.scores.analysis },
              { label: "R", value: cert.scores.recall },
              { label: "D", value: cert.scores.depth },
            ].map((s: { label: string; value: number }) => (
              <div key={s.label} style={{ textAlign: "center", padding: "0.5rem", background: "var(--bg-base)", borderRadius: "4px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", color: s.value >= 7 ? "var(--green)" : s.value >= 5 ? "var(--yellow)" : "var(--red)" }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3" style={{ fontSize: "0.8125rem" }}>
            {[
              { label: "Tasks Completed", value: cert.totalTasks },
              { label: "Check-ins Passed", value: cert.totalCheckins },
              { label: "Study Hours", value: `${cert.totalHours}h` },
              { label: "Best Streak", value: `${cert.bestStreak} days` },
            ].map((item: { label: string; value: string | number }) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.375rem 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.6875rem" }}>{item.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Shield size={16} strokeWidth={2} style={{ color: cert.integrityScore >= 80 ? "var(--green)" : cert.integrityScore >= 50 ? "var(--yellow)" : "var(--red)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            Integrity Score: {cert.integrityScore}/100
          </span>
        </div>

        <div style={{ textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.6875rem" }}>
          Completed: {new Date(cert.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          <br />
          Started: {new Date(cert.startedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/" style={{ fontFamily: "var(--font-headline)", color: "var(--accent)", fontSize: "1.125rem" }}>THE FORGE</Link>
        </div>
      </div>
    </div>
  );
}
