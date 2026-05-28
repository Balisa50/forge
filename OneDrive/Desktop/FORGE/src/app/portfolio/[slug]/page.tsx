import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";

/**
 * Public learner portfolio at /portfolio/[slug].
 *
 * For now `slug` = User.id (cuid). Later we'll add a vanity slug column.
 *
 * Shows every verified week as a card — title, deliverable description,
 * submitted link if any, verified date, mentor name. Plus the cert links
 * for any released certificates.
 *
 * Privacy: only renders if user.isPublic = true. Otherwise 404 — no leak
 * that the user exists.
 *
 * This is what learners show employers.
 */

interface PageParams {
  params: Promise<{ slug: string }>;
}

export default async function PortfolioPage({ params }: PageParams) {
  const { slug } = await params;

  const user = await prisma.user.findUnique({
    where: { id: slug },
    select: {
      id: true,
      name: true,
      bio: true,
      github: true,
      linkedin: true,
      isPublic: true,
      createdAt: true,
    },
  });

  if (!user || !user.isPublic) notFound();

  const [verifiedTasks, certificates] = await Promise.all([
    prisma.task.findMany({
      where: {
        status: "verified",
        verifiedAt: { not: null },
        phase: { track: { roadmap: { userId: user.id } } },
      },
      orderBy: { verifiedAt: "desc" },
      take: 60,
      select: {
        id: true,
        title: true,
        verifiedAt: true,
        mentorRating: true,
        milestone: true,
        releasedBy: true,
        checkins: {
          where: { status: "passed" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { description: true, evidenceUrl: true, createdAt: true },
        },
        phase: {
          select: {
            track: {
              select: {
                title: true,
                roadmap: { select: { title: true } },
              },
            },
          },
        },
      },
    }),
    prisma.certificate.findMany({
      where: { userId: user.id },
      orderBy: { issuedAt: "desc" },
      select: {
        id: true,
        title: true,
        verifyCode: true,
        issuedAt: true,
        signedBy: true,
      },
    }),
  ]);

  // Pull mentor names referenced by releasedBy
  const mentorIds = Array.from(new Set(verifiedTasks.map((t) => t.releasedBy).filter(Boolean) as string[]));
  const mentors = mentorIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: mentorIds } },
        select: { id: true, name: true, mentorDisplayName: true },
      })
    : [];
  const mentorById = new Map(mentors.map((m) => [m.id, m.mentorDisplayName ?? m.name]));

  const firstName = user.name.split(" ")[0];
  const memberSince = user.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long" });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0a0807 0%, #0d0b08 100%)",
      color: "var(--text-primary)",
      padding: "3rem 1.5rem 5rem",
    }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            letterSpacing: "0.32em",
            color: "var(--accent)",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}>
            The Forge · Verified Portfolio
          </div>
          <h1 style={{
            fontFamily: "Georgia, 'Cormorant Garamond', serif",
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 700,
            letterSpacing: "0.01em",
            lineHeight: 1.05,
            marginBottom: "0.625rem",
          }}>
            {user.name}
          </h1>
          {user.bio && (
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "0.75rem", maxWidth: 640 }}>
              {user.bio}
            </p>
          )}
          <div style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--text-dim)",
          }}>
            <span>On Forge since {memberSince}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--green)" }}>
              <CheckCircle2 size={12} /> {verifiedTasks.length} weeks verified
            </span>
            {certificates.length > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#d4af37" }}>
                <ShieldCheck size={12} /> {certificates.length} certificate{certificates.length === 1 ? "" : "s"}
              </span>
            )}
            {user.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <ExternalLink size={11} /> GitHub
              </a>
            )}
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <ExternalLink size={11} /> LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Certificates */}
        {certificates.length > 0 && (
          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              color: "var(--text-dim)",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}>
              Certificates
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {certificates.map((c) => (
                <Link
                  key={c.id}
                  href={`/verify/cert/${c.verifyCode}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem 1.125rem",
                    background: "rgba(212,175,55,0.06)",
                    border: "1px solid rgba(212,175,55,0.3)",
                    borderRadius: 10,
                    textDecoration: "none",
                    color: "var(--text-primary)",
                  }}
                >
                  <span style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg, #f0c75c, #d4af37)",
                    display: "grid", placeItems: "center",
                    color: "#1a1410",
                    flexShrink: 0,
                  }}>
                    <ShieldCheck size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "1.125rem", fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.08em", marginTop: "0.25rem" }}>
                      Issued {new Date(c.issuedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      {c.signedBy && <> · signed by {c.signedBy}</>}
                    </div>
                  </div>
                  <ArrowRight size={14} color="#d4af37" style={{ flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Verified weeks */}
        <section>
          <h2 style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.3em",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            Verified weeks
          </h2>

          {verifiedTasks.length === 0 ? (
            <p style={{ color: "var(--text-dim)", fontSize: "0.875rem", fontStyle: "italic" }}>
              No verified weeks yet — work is in progress.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {verifiedTasks.map((t) => {
                const checkin = t.checkins[0];
                const mentorName = t.releasedBy ? mentorById.get(t.releasedBy) ?? null : null;
                return (
                  <div key={t.id} style={{
                    padding: "1rem 1.125rem",
                    background: "rgba(34,197,94,0.04)",
                    border: "1px solid rgba(34,197,94,0.18)",
                    borderRadius: 10,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.4rem" }}>
                      <CheckCircle2 size={16} color="var(--green)" style={{ marginTop: 4, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.625rem",
                          letterSpacing: "0.2em",
                          color: "var(--text-dim)",
                          textTransform: "uppercase",
                          marginBottom: "0.2rem",
                        }}>
                          {t.phase.track.roadmap.title} · {t.phase.track.title}
                        </div>
                        <div style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          lineHeight: 1.4,
                        }}>
                          {t.title}
                        </div>
                        {t.milestone && (
                          <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.35rem", fontStyle: "italic" }}>
                            {t.milestone}
                          </div>
                        )}
                        {checkin?.description && (
                          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.4rem", lineHeight: 1.55 }}>
                            {checkin.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                      flexWrap: "wrap",
                      paddingLeft: "1.75rem",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6875rem",
                      color: "var(--text-dim)",
                      letterSpacing: "0.05em",
                    }}>
                      {t.verifiedAt && (
                        <span>Verified {new Date(t.verifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      )}
                      {mentorName && <span>by {mentorName}</span>}
                      {checkin?.evidenceUrl && (
                        <a
                          href={checkin.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--blue)", display: "inline-flex", alignItems: "center", gap: "0.3rem", textDecoration: "none" }}
                        >
                          <ExternalLink size={11} /> View deliverable
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <div style={{
          marginTop: "3rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          color: "var(--text-dim)",
          letterSpacing: "0.18em",
        }}>
          Forged at{" "}
          <Link href="/" style={{ color: "var(--accent)", textDecoration: "none" }}>
            forge-ab.vercel.app
          </Link>
          {" "}— {firstName}&apos;s journey is real, verified, public.
        </div>
      </div>
    </div>
  );
}
