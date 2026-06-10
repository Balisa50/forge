import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import CertificateCard, {
 CertificatePrintStyles,
 DownloadCertButton,
 certToCardProps,
 type CertificateCardProps,
} from "@/components/CertificateCard";

interface PageParams {
 params: Promise<{ menteeId: string }>;
 searchParams: Promise<{ roadmapId?: string }>;
}

/**
 * Full-screen mentor preview of the certificate they're about to release.
 * Same artwork as the public /verify/cert/[code] page, identical for
 * released certs, PREVIEW-watermarked for unreleased ones.
 *
 * Access: mentor-only, must be linked to this mentee.
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
 if (!link) notFound();

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
 cohort: { select: { name: true } },
 tracks: { include: { phases: { include: { tasks: { select: { status: true } } } } } },
 },
 }),
 prisma.certificate.findFirst({
 where: { userId: menteeId, roadmapId },
 }),
 ]);

 if (!roadmap || !mentee) notFound();

 const allTasks = roadmap.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks));
 const totalTasks = allTasks.length;
 const verifiedTasks = allTasks.filter((t) => t.status === "verified").length;
 const issuedAt = existingCert?.issuedAt ?? new Date();
 const signedBy = existingCert?.signedBy ?? mentor?.mentorDisplayName ?? mentor?.name ?? null;
 const released = !!existingCert;

 const learnerName = mentee.name ?? mentee.email ?? "Recipient";
 const year = issuedAt.getFullYear();

 // Build card props, use frozen values from issued cert if available
 const cardProps: Omit<CertificateCardProps, "learnerName" | "preview"> = existingCert
 ? certToCardProps(existingCert)
 : {
 programName: roadmap.title,
 issueDate: issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
 certId: `TF-${year}-PREVIEW`,
 mentorName: signedBy ?? "The Forge",
 mentorTitle: "Program Director, The Forge",
 verifyUrl: `forge-ab.vercel.app/verify/cert/[pending-release]`,
 cohort: roadmap.cohort?.name ?? "",
 curriculumYear: String(year),
 cryptoHash: ", ",
 };

 return (
 <div style={{
 minHeight: "100vh",
 background: "linear-gradient(160deg, #0d0b08 0%, #15110d 55%, #0a0807 100%)",
 padding: "2rem 1.5rem 4rem",
 }}>
 <CertificatePrintStyles />

 {/* ── Mentor toolbar ── */}
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
 color: "rgba(255,255,255,0.55)",
 fontFamily: "var(--font-mono)",
 fontSize: "0.75rem",
 letterSpacing: "0.1em",
 textDecoration: "none",
 }}
 >
 <ArrowLeft size={13} /> back to {learnerName.split(" ")[0]}
 </Link>

 <div style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
 <span style={{
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 letterSpacing: "0.16em",
 color: released ? "#22c55e" : "#B8952A",
 textTransform: "uppercase",
 padding: "0.3125rem 0.75rem",
 borderRadius: 999,
 border: `1px solid ${released ? "#22c55e" : "#B8952A"}`,
 background: released ? "rgba(34,197,94,0.08)" : "rgba(184,149,42,0.08)",
 }}>
 {released
 ? "Released · public link active"
 : verifiedTasks === totalTasks && totalTasks > 0
 ? "Ready to release"
 : `Preview · ${verifiedTasks}/${totalTasks} weeks verified`}
 </span>
 <DownloadCertButton verifyCode={existingCert?.verifyCode ?? "preview"} />
 </div>
 </div>

 {/* ── The certificate ── */}
 <CertificateCard
 learnerName={learnerName}
 preview={!released}
 {...cardProps}
 />

 {/* ── Release prompt (unreleased only) ── */}
 {!released && (
 <div
 className="cert-toolbar"
 style={{ maxWidth: 1100, margin: "1.5rem auto 0", display: "flex", justifyContent: "flex-end" }}
 >
 {verifiedTasks === totalTasks && totalTasks > 0 ? (
 <div style={{ textAlign: "right" }}>
 <p style={{
 fontFamily: "var(--font-mono)",
 fontSize: "0.75rem",
 color: "rgba(255,255,255,0.55)",
 marginBottom: "0.625rem",
 }}>
 Looks good? Release from the drilldown card.
 </p>
 <Link href={`/dashboard/mentor/${menteeId}`}>
 <button
 className="forge-btn"
 style={{
 display: "inline-flex", alignItems: "center", gap: "0.5rem",
 background: "#B8952A", color: "#000", border: "none",
 padding: "0.625rem 1.25rem", fontWeight: 700, cursor: "pointer",
 borderRadius: 6,
 }}
 >
 <Send size={13} /> Go release it
 </button>
 </Link>
 </div>
 ) : (
 <p style={{
 fontFamily: "var(--font-mono)",
 fontSize: "0.75rem",
 color: "rgba(255,255,255,0.55)",
 textAlign: "right",
 }}>
 Release unlocks at 100%, {totalTasks - verifiedTasks} week
 {totalTasks - verifiedTasks === 1 ? "" : "s"} still to verify.
 </p>
 )}
 </div>
 )}

 {/* ── Public link (released) ── */}
 {released && existingCert && (
 <p
 className="cert-toolbar"
 style={{
 maxWidth: 1100,
 margin: "1.5rem auto 0",
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 letterSpacing: "0.12em",
 color: "rgba(255,255,255,0.45)",
 textAlign: "right",
 }}
 >
 Public link:{" "}
 <Link
 href={`/verify/cert/${existingCert.verifyCode}`}
 target="_blank"
 rel="noopener noreferrer"
 style={{ color: "#B8952A" }}
 >
 /verify/cert/{existingCert.verifyCode.slice(0, 16)}…
 </Link>
 </p>
 )}

 <style>{`
 @media print { .cert-toolbar { display: none !important; } }
 `}</style>
 </div>
 );
}
