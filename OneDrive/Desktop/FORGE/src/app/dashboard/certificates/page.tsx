import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireLearnerAccess } from "@/lib/role-guard";
import Link from "next/link";
import { Award, ExternalLink, Clock, CheckCircle2, Fingerprint, Target, Lock, Star } from "lucide-react";
import CertShareButton from "@/components/CertShareButton";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  await requireLearnerAccess(userId);

  const [certificates, user, roadmaps, mentorLink] = await Promise.all([
    prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
    prisma.roadmap.findMany({
      where: { userId },
      select: {
        title: true,
        tracks: {
          select: {
            phases: {
              select: {
                tasks: { select: { status: true } },
              },
            },
          },
        },
      },
    }),
    prisma.mentorLink.findFirst({
      where: { menteeId: userId, isActive: true },
      include: { mentor: { select: { name: true, mentorDisplayName: true } } },
    }),
  ]);
  const mentorName = mentorLink ? (mentorLink.mentor.mentorDisplayName ?? mentorLink.mentor.name) : null;

  // Progress toward a future cert (for the blurred preview).
  let inProgressTitle: string | null = null;
  let verifiedCount = 0;
  let totalCount = 0;
  for (const r of roadmaps) {
    const tasks = r.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks));
    if (tasks.length === 0) continue;
    const v = tasks.filter((t) => t.status === "verified").length;
    if (v < tasks.length) {
      inProgressTitle = r.title;
      verifiedCount = v;
      totalCount = tasks.length;
      break;
    }
  }
  const progressPct = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6" style={{ flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
            Certificates
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            Verifiable proof of your completed roadmaps.
          </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div style={{ marginTop: "1rem" }}>
          {/* Blurred preview — the cert they're working toward, with their own
              name + roadmap baked in. Stays heavily blurred until 100% verified. */}
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: "1rem", border: "1px solid var(--border)" }}>
            {/* The "future cert" art */}
            <div
              style={{
                background: "linear-gradient(135deg, #1a1410 0%, #2a1f15 50%, #1a1410 100%)",
                padding: "3rem 2.5rem",
                filter: progressPct >= 100 ? "none" : "blur(7px)",
                transform: progressPct >= 100 ? "none" : "scale(1.02)",
                transition: "filter 0.4s, transform 0.4s",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              <div style={{
                border: "2px solid #d4af37",
                borderRadius: 10,
                padding: "2rem 1.5rem",
                background: "linear-gradient(180deg, rgba(212,175,55,0.04), transparent)",
                textAlign: "center",
                boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.25)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.35em", color: "#d4af37", marginBottom: "0.75rem" }}>
                  <Star size={9} fill="#d4af37" strokeWidth={0} />
                  <Star size={9} fill="#d4af37" strokeWidth={0} />
                  <span style={{ paddingLeft: "0.35em" }}>THE FORGE</span>
                  <Star size={9} fill="#d4af37" strokeWidth={0} />
                  <Star size={9} fill="#d4af37" strokeWidth={0} />
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "0.875rem", color: "#c9b178", marginBottom: "1rem" }}>
                  Certificate of Completion
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.2em", color: "rgba(212,175,55,0.7)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  This certifies that
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#fff", letterSpacing: "0.04em", margin: "0.5rem 0 1rem" }}>
                  {user?.name ?? "Your Name"}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.2em", color: "rgba(212,175,55,0.7)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  has successfully completed
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", color: "#d4af37", marginBottom: "1rem" }}>
                  {inProgressTitle ?? "Your Roadmap"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(212,175,55,0.2)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.15em", color: "rgba(212,175,55,0.6)" }}>
                    Verified by AI
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.15em", color: "rgba(212,175,55,0.6)" }}>
                    Cryptographically Signed
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay — only shows while blurred */}
            {progressPct < 100 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem", background: "rgba(0,0,0,0.35)" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(212,175,55,0.15)", border: "2px solid rgba(212,175,55,0.6)", display: "grid", placeItems: "center", marginBottom: "1rem" }}>
                  <Lock size={22} color="#d4af37" />
                </div>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", color: "#fff", marginBottom: "0.5rem" }}>
                  {progressPct >= 100 && mentorName
                    ? `Awaiting release by ${mentorName}`
                    : inProgressTitle
                      ? "Unlocks when you finish"
                      : "Pick a roadmap to begin"}
                </h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(212,175,55,0.85)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
                  {progressPct >= 100 && mentorName
                    ? "All weeks verified — your mentor signs the cert next"
                    : inProgressTitle
                      ? `${verifiedCount} / ${totalCount} weeks shipped · ${progressPct}%`
                      : "0 / 0 weeks shipped"}
                </p>
                {/* Progress bar */}
                {inProgressTitle && (
                  <div style={{ width: "min(280px, 70%)", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden", marginBottom: "1rem" }}>
                    <div style={{ width: `${progressPct}%`, height: "100%", background: "linear-gradient(90deg, #d4af37, #f0c75c)", borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                )}
                <Link href="/dashboard/roadmap" className="forge-btn" style={{ background: "#d4af37", color: "#000", border: "none", fontWeight: 700, padding: "0.625rem 1.5rem" }}>
                  {inProgressTitle ? "Open my roadmap" : "Pick a roadmap"}
                </Link>
              </div>
            )}
          </div>

          <div className="forge-panel" style={{ padding: "1.25rem", textAlign: "center" }}>
            <div style={{ color: "var(--accent)", marginBottom: "0.75rem", display: "flex", justifyContent: "center" }}><Award size={32} strokeWidth={1.5} /></div>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", marginBottom: "0.5rem" }}>What you&apos;re working toward</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", maxWidth: "440px", margin: "0 auto", lineHeight: 1.55 }}>
              Every week you verify, the cert sharpens. Finish all of them, pass every check, and the full certificate above unlocks — with a public verify link anyone can check.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {certificates.map((cert) => {
            const strongPassRate = cert.passRate >= 0.8;
            const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            });

            return (
              <div key={cert.id} className="forge-panel" style={{ padding: "1.25rem" }}>
                <div className="flex items-start justify-between gap-4" style={{ flexWrap: "wrap", marginBottom: "1.25rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--green)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.375rem" }}>
                      <CheckCircle2 size={12} /> Verified
                    </div>
                    <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.375rem", letterSpacing: "0.03em", marginBottom: "0.25rem" }}>
                      {cert.title}
                    </h2>
                    <div className="flex items-center gap-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
                      <Clock size={11} /> {issuedDate}
                    </div>
                  </div>
                  <Link
                    href={`/verify/cert/${cert.verifyCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="forge-btn forge-btn-ghost"
                    style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", flexShrink: 0 }}
                  >
                    <ExternalLink size={14} /> Public Link
                  </Link>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  {[
                    { label: "Tasks", value: cert.totalTasks.toString(), color: "var(--text-primary)" },
                    { label: "Hours", value: cert.totalHours.toFixed(0), color: "var(--text-primary)" },
                    { label: "Pass Rate", value: `${Math.round(cert.passRate * 100)}%`, color: strongPassRate ? "var(--green)" : "var(--yellow)" },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.75rem", textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.25rem" }}>{stat.label}</div>
                      <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3" style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                  <div className="flex items-center gap-1.5" style={{ fontSize: "0.8125rem" }}>
                    <Target size={13} color={strongPassRate ? "var(--green)" : "var(--yellow)"} strokeWidth={2} />
                    <span style={{ color: strongPassRate ? "var(--green)" : "var(--yellow)" }}>
                      {strongPassRate ? "Strong pass rate" : "Passed with retries"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ fontSize: "0.8125rem" }}>
                    <CheckCircle2 size={13} color="var(--accent)" strokeWidth={2} />
                    <span style={{ color: "var(--text-secondary)" }}>Verified by AI</span>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", marginLeft: "auto" }}>
                    <Fingerprint size={12} /> {cert.verifyCode.slice(0, 16)}…
                  </div>
                </div>

                {/* Share card */}
                <CertShareButton
                  certTitle={cert.title}
                  verifyCode={cert.verifyCode}
                  passRate={cert.passRate}
                  totalTasks={cert.totalTasks}
                  totalHours={cert.totalHours}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
