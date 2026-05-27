import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import CertificateArtwork, { CertificatePrintStyles, DownloadCertButton } from "@/components/CertificateArtwork";

interface PageParams {
  params: Promise<{ menteeId: string }>;
  searchParams: Promise<{ roadmapId?: string }>;
}

/**
 * Full-screen, judge-this-design view of the certificate a mentor is about
 * to release. Same artwork as the public /verify/cert/[code] page, but
 * accessible BEFORE release — and the Download/Print button works on the
 * preview too.
 *
 * Access: mentor-only, must be linked to this mentee. The route is gated
 * on session + MentorLink check, so a mentee can't hit it for their own
 * future cert.
 */
export default async function CertPreviewPage({ params, searchParams }: PageParams) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const mentorId = session.user.id;

  const { menteeId } = await params;
  const { roadmapId } = await searchParams;
  if (!roadmapId) notFound();

  const link = await prisma.mentorLink.findFirst({
    where: { mentorId, menteeId, isActive: true },
  });
  if (!link) notFound(); // 404 instead of leaking that the mentee exists

  const [mentee, mentor, roadmap, existingCert] = await Promise.all([
    prisma.user.findUnique({
      where: { id: menteeId },
      select: { name: true, email: true },
    }),
    prisma.user.findUnique({
      where: { id: mentorId },
      select: { name: true, mentorDisplayName: true },
    }),
    prisma.roadmap.findFirst({
      where: { id: roadmapId, userId: menteeId },
      include: {
        tracks: { include: { phases: { include: { tasks: { select: { status: true, estimatedHours: true } } } } } },
        checkins: { where: { status: "passed" }, include: { interrogation: { select: { passed: true } } } },
      },
    }),
    prisma.certificate.findFirst({
      where: { userId: menteeId, roadmapId },
    }),
  ]);

  if (!roadmap || !mentee) notFound();

  // Numbers the cert needs. If a real cert was already issued, use its frozen
  // values so the preview matches the live one exactly.
  const allTasks = roadmap.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks));
  const totalTasks = allTasks.length;
  const verifiedTasks = allTasks.filter((t) => t.status === "verified").length;
  const totalHours = allTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);
  const interrogations = roadmap.checkins.filter((c) => c.interrogation).map((c) => c.interrogation!);
  const passedCount = interrogations.filter((i) => i.passed).length;
  const passRate = interrogations.length > 0 ? passedCount / interrogations.length : 0;
  const signedBy = mentor?.mentorDisplayName ?? mentor?.name ?? null;

  const released = !!existingCert;
  const recipientName = mentee.name ?? mentee.email;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0807 0%, #14100c 100%)",
        padding: "2rem 1.5rem 4rem",
      }}
    >
      <CertificatePrintStyles />

      {/* Mentor toolbar — hidden in print */}
      <div
        className="cert-toolbar"
        style={{
          maxWidth: 1100,
          margin: "0 auto 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <Link
          href={`/dashboard/mentor/${menteeId}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            color: "rgba(255,255,255,0.6)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={13} /> back to {recipientName.split(" ")[0]}
        </Link>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              letterSpacing: "0.16em",
              color: released ? "var(--green)" : "#d4af37",
              textTransform: "uppercase",
              padding: "0.3125rem 0.75rem",
              borderRadius: 999,
              border: `1px solid ${released ? "var(--green)" : "#d4af37"}`,
              background: released ? "rgba(34,197,94,0.08)" : "rgba(212,175,55,0.08)",
            }}
          >
            {released
              ? "Released · public link active"
              : verifiedTasks === totalTasks && totalTasks > 0
                ? "Ready to release"
                : `Preview · ${verifiedTasks}/${totalTasks} weeks verified`}
          </span>
          <DownloadCertButton verifyCode={existingCert?.verifyCode ?? "preview"} />
        </div>
      </div>

      {/* THE CERT */}
      <CertificateArtwork
        recipientName={recipientName}
        roadmapTitle={existingCert?.title ?? roadmap.title}
        issuedAt={(existingCert?.issuedAt ?? new Date()).toString()}
        totalTasks={existingCert?.totalTasks ?? totalTasks}
        totalHours={existingCert?.totalHours ?? Math.round(totalHours)}
        passRate={existingCert?.passRate ?? Number(passRate.toFixed(2))}
        verifyCode={existingCert?.verifyCode ?? "preview-not-yet-issued"}
        signedBy={existingCert?.signedBy ?? signedBy}
        preview={!released}
      />

      {/* Release button — only if mentor hasn't released yet */}
      {!released && (
        <div
          className="cert-toolbar"
          style={{ maxWidth: 1100, margin: "1.5rem auto 0", display: "flex", justifyContent: "flex-end" }}
        >
          {verifiedTasks === totalTasks && totalTasks > 0 ? (
            <form action={`/dashboard/mentor/${menteeId}`} method="get">
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", marginBottom: "0.625rem", textAlign: "right" }}>
                Looks good? Release from the drilldown card.
              </p>
              <button
                type="submit"
                className="forge-btn"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  background: "#d4af37", color: "#000", border: "none",
                  padding: "0.625rem 1.25rem", fontWeight: 700,
                }}
              >
                <Send size={13} /> Go release it
              </button>
            </form>
          ) : (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", textAlign: "right" }}>
              Release unlocks at 100% — {totalTasks - verifiedTasks} week{totalTasks - verifiedTasks === 1 ? "" : "s"} still to verify.
            </p>
          )}
        </div>
      )}

      {released && (
        <p
          className="cert-toolbar"
          style={{
            maxWidth: 1100,
            margin: "1.5rem auto 0",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.5)",
            textAlign: "right",
          }}
        >
          Public link: <Link href={`/verify/cert/${existingCert!.verifyCode}`} target="_blank" rel="noopener noreferrer" style={{ color: "#d4af37" }}>/verify/cert/{existingCert!.verifyCode.slice(0, 16)}…</Link>
        </p>
      )}

      <style>{`
        @media print {
          .cert-toolbar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
