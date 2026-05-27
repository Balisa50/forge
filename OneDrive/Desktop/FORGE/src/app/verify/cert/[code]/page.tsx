import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { verifyCertSignature } from "@/lib/cert-signature";
import CertificateArtwork, { CertificatePrintStyles, DownloadCertButton } from "@/components/CertificateArtwork";

export default async function VerifyCertPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { verifyCode: code },
    include: {
      user: { select: { name: true } },
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0807 0%, #14100c 100%)",
        padding: "2.5rem 1.5rem 4rem",
      }}
    >
      <CertificatePrintStyles />

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Trust badge */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: 999,
              background: signatureValid === false ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
              border: `1px solid ${signatureValid === false ? "var(--red)" : "var(--green)"}`,
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: signatureValid === false ? "var(--red)" : "var(--green)",
            }}
          >
            {signatureValid === false ? (
              <>
                <ShieldAlert size={13} /> Signature mismatch — possibly tampered
              </>
            ) : signatureValid === true ? (
              <>
                <ShieldCheck size={13} /> Cryptographically verified
              </>
            ) : (
              <>
                <CheckCircle2 size={13} /> Verified certificate
              </>
            )}
          </div>
        </div>

        {/* THE ARTWORK */}
        <CertificateArtwork
          recipientName={cert.user.name ?? "Recipient"}
          roadmapTitle={cert.title}
          issuedAt={cert.issuedAt.toISOString()}
          totalTasks={cert.totalTasks}
          totalHours={cert.totalHours}
          passRate={cert.passRate}
          verifyCode={cert.verifyCode}
          signedBy={cert.signedBy}
        />

        {/* Actions + footer */}
        <div
          style={{
            maxWidth: 1100,
            margin: "1.75rem auto 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
          className="cert-actions"
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }}>
            Issued {new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            {cert.signedBy && <> · Released by <span style={{ color: "#d4af37" }}>{cert.signedBy}</span></>}
          </div>
          <DownloadCertButton verifyCode={cert.verifyCode} />
        </div>

        <p
          className="cert-actions"
          style={{
            textAlign: "center",
            marginTop: "2.5rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Verify code: {cert.verifyCode}
        </p>
      </div>

      <style>{`
        @media print {
          .cert-actions { display: none !important; }
        }
      `}</style>
    </div>
  );
}
