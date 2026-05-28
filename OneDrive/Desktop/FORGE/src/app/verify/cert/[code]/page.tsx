import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ShieldAlert, ShieldCheck, CheckCircle2 } from "lucide-react";
import { verifyCertSignature } from "@/lib/cert-signature";
import CertificateCard, {
  CertificatePrintStyles,
  DownloadCertButton,
  certToCardProps,
} from "@/components/CertificateCard";

export default async function VerifyCertPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { verifyCode: code },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (!cert) notFound();

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

  const learnerName = cert.user.name ?? cert.user.email ?? "Recipient";
  const cardProps = certToCardProps(cert);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0d0b08 0%, #15110d 55%, #0a0807 100%)",
        padding: "2.5rem 1.5rem 4rem",
      }}
    >
      <CertificatePrintStyles />

      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        {/* ── Cryptographic trust badge ── */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1.125rem",
              borderRadius: 999,
              background: signatureValid === false
                ? "rgba(239,68,68,0.1)"
                : "rgba(34,197,94,0.08)",
              border: `1px solid ${signatureValid === false ? "rgba(239,68,68,0.5)" : "rgba(34,197,94,0.4)"}`,
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase" as const,
              color: signatureValid === false ? "#ef4444" : "#22c55e",
            }}
          >
            {signatureValid === false ? (
              <><ShieldAlert size={13} /> Signature mismatch — possibly tampered</>
            ) : signatureValid === true ? (
              <><ShieldCheck size={13} /> Cryptographically verified</>
            ) : (
              <><CheckCircle2 size={13} /> Verified certificate</>
            )}
          </div>
        </div>

        {/* ── The certificate ── */}
        <CertificateCard
          learnerName={learnerName}
          {...cardProps}
        />

        {/* ── Actions bar ── */}
        <div
          className="cert-actions"
          style={{
            maxWidth: 1100,
            margin: "1.5rem auto 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.1em",
          }}>
            Issued {new Date(cert.issuedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {cert.signedBy && (
              <> · Released by{" "}
                <span style={{ color: "#B8952A" }}>{cert.signedBy}</span>
              </>
            )}
          </div>
          <DownloadCertButton />
        </div>

        {/* ── Verify code footnote ── */}
        <p
          className="cert-actions"
          style={{
            textAlign: "center",
            marginTop: "2rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.5625rem",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Verification code: {cert.verifyCode}
        </p>
      </div>

      <style>{`
        @media print { .cert-actions { display: none !important; } }
      `}</style>
    </div>
  );
}
