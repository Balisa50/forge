import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Award, Fingerprint, Target, ShieldAlert } from "lucide-react";
import { verifyCertSignature } from "@/lib/cert-signature";

export default async function VerifyCertPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { verifyCode: code },
    include: {
      user: { select: { name: true, image: true } },
    },
  });

  if (!cert) notFound();

  // Cryptographically verify the certificate. A row that's been tampered
  // with (or one signed before signing was introduced) shows a warning.
  const signatureValid = cert.signature
    ? verifyCertSignature(
        {
          id: cert.id,
          userId: cert.userId,
          roadmapId: cert.roadmapId,
          title: cert.title,
          totalTasks: cert.totalTasks,
          totalHours: cert.totalHours,
          passRate: cert.passRate,
          issuedAt: cert.issuedAt,
        },
        cert.signature,
      )
    : null;

  const strongPassRate = cert.passRate >= 0.8;

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: "560px", width: "100%" }}>
        {/* Verification badge */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 1rem",
            background: "rgba(34,197,94,0.1)",
            border: "2px solid var(--green)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CheckCircle2 size={32} color="var(--green)" strokeWidth={1.5} />
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: signatureValid === false ? "var(--red)" : "var(--green)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            {signatureValid === false
              ? "⚠ SIGNATURE MISMATCH"
              : signatureValid === true
                ? "CRYPTOGRAPHICALLY VERIFIED"
                : "VERIFIED CERTIFICATE"}
          </div>
          {signatureValid === false && (
            <p style={{ color: "var(--red)", fontSize: "0.8125rem", maxWidth: 360, margin: "0 auto 0.75rem" }}>
              <ShieldAlert size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
              This certificate&apos;s data does not match its cryptographic signature. It may have been altered.
            </p>
          )}
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", letterSpacing: "0.05em" }}>The Forge</h1>
        </div>

        {/* Certificate card */}
        <div className="forge-panel" style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>This certifies that</div>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", color: "var(--accent)", marginBottom: "0.25rem" }}>{cert.user.name}</h2>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>has completed</div>
            <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", marginTop: "0.5rem" }}>{cert.title}</h3>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.25rem" }}>Tasks Verified</div>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", color: "var(--text-primary)" }}>{cert.totalTasks}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.25rem" }}>Hours Invested</div>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", color: "var(--text-primary)" }}>{cert.totalHours.toFixed(0)}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.25rem" }}>Pass Rate</div>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", color: strongPassRate ? "var(--green)" : "var(--yellow)" }}>
                {Math.round(cert.passRate * 100)}<span style={{ fontSize: "0.875rem", color: "var(--text-dim)" }}>%</span>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Target size={14} color={strongPassRate ? "var(--green)" : "var(--yellow)"} />
                <span style={{ fontSize: "0.8125rem", color: strongPassRate ? "var(--green)" : "var(--yellow)" }}>
                  {strongPassRate
                    ? "Passed interrogations with strong consistency"
                    : "Completed with some retries — genuine persistence demonstrated"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={14} color="var(--accent)" />
                <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                  Verified by AI interrogation — not self-reported
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} color="var(--text-dim)" />
                <span style={{ fontSize: "0.8125rem", color: "var(--text-dim)" }}>
                  Issued {new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Fingerprint size={14} color="var(--text-dim)" />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
                  {cert.verifyCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.1em" }}>
            Verified by The Forge — AI-Powered Accountability Platform
          </p>
        </div>
      </div>
    </div>
  );
}
