import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Lock } from "lucide-react";
import { loadAllRoadmaps, loadRoadmap, ROADMAP_META } from "@/lib/roadmaps";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import WeekPageTabs from "@/components/WeekPageTabs";

// Force dynamic so the mentee gate runs on every request (no static cache)
export const dynamic = "force-dynamic";

export default async function WeekPage({ params }: { params: Promise<{ slug: string; week: string }> }) {
  const { slug, week } = await params;
  const roadmap = loadRoadmap(slug);
  if (!roadmap) return notFound();
  const wNum = parseInt(week, 10);
  const w = roadmap.weeks.find((x) => x.number === wNum);
  if (!w) return notFound();
  const meta = ROADMAP_META[roadmap.slug];

  // ── Mentee gate ────────────────────────────────────────────────────
  // First gate: week content is for FORGE members only. Public visitors are
  // sent to the roadmap's overview card (covers / skills / time + signup CTA)
  // rather than the locked week content.
  const session = await auth();
  if (!session?.user?.id) redirect(`/learn/${slug}`);

  // Second gate: if the logged-in user is a mentee (has any active
  // MentorLink), they can ONLY view a week if their mentor has released it
  // or they've already verified it. Solo learners are unaffected.
  if (session?.user?.id) {
    const link = await prisma.mentorLink.findFirst({
      where: { menteeId: session.user.id, isActive: true },
      include: { mentor: { select: { name: true, mentorDisplayName: true } } },
    });
    if (link) {
      // Find this user's matching Task for this week (by week number in title)
      const task = await prisma.task.findFirst({
        where: {
          phase: { track: { roadmap: { userId: session.user.id } } },
          title: { startsWith: `Week ${wNum}:` },
        },
        select: { id: true, status: true, closedAt: true, releasedAt: true },
      });
      const blocked =
        !task ||
        task.status === "locked" ||
        !task.releasedAt ||
        (task.closedAt && task.status !== "verified");
      if (blocked) {
        return (
          <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", display: "grid", placeItems: "center", padding: "1.5rem" }}>
            <div className="forge-panel" style={{ padding: "2.5rem 2rem", maxWidth: 460, textAlign: "center" }}>
              <Lock size={36} color="var(--text-dim)" style={{ margin: "0 auto 1rem" }} />
              <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>This week is locked</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                {(link.mentor.mentorDisplayName ?? link.mentor.name) ?? "Your mentor"} hasn&apos;t released Week {wNum} of {roadmap.title} to you yet. You&apos;ll see it on your dashboard the moment they do.
              </p>
              <Link href="/dashboard" className="forge-btn forge-btn-primary" style={{ display: "inline-block", padding: "0.625rem 1.25rem" }}>
                Go to dashboard
              </Link>
            </div>
          </main>
        );
      }
    }
  }

  const prev = roadmap.weeks.find((x) => x.number === wNum - 1);
  const next = roadmap.weeks.find((x) => x.number === wNum + 1);

  const hours = w.commitment_hours ? w.commitment_hours.replace(/—|--/g, "–").trim() : "";

  // Mentees navigate from their dashboard ("Open this week" button) — the
  // roadmap browse page isn't useful to them since they're gated to the
  // released week anyway. Route the back-arrow back to their dashboard
  // instead of the curriculum index.
  const isMentee = await prisma.mentorLink.findFirst({
    where: { menteeId: session.user.id, isActive: true },
    select: { id: true },
  });
  const backHref = isMentee ? "/dashboard" : `/learn/${roadmap.slug}`;
  const backLabel = isMentee ? "Dashboard" : roadmap.title;

  // Resolve THIS user's Task row for this week, so the WeekPageTabs can render
  // the Mentor Review section directly underneath the days (questions, answers,
  // mentor verdict + rating — all in one place, no chat-thread hunting).
  // We do this for every signed-in user; the MentorReviewSection renders nothing
  // when there are no mentor questions, so solo learners see no change.
  const ownTask = await prisma.task.findFirst({
    where: {
      phase: { track: { roadmap: { userId: session.user.id } } },
      title: { startsWith: `Week ${wNum}:` },
    },
    select: { id: true },
  });

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Slim banner */}
      <section className={`border-b border-[color:var(--border)] bg-gradient-to-r ${meta?.gradient ?? "from-cyan-500 to-blue-600"}`} style={{ color: "white" }}>
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="flex items-center justify-between gap-3 text-xs opacity-90">
            <Link href={backHref} className="inline-flex items-center gap-1.5 hover:opacity-100" style={{ fontFamily: "var(--font-mono)" }}>
              <ArrowLeft size={12} /> {backLabel}
            </Link>
            {hours && (<span className="inline-flex items-center gap-1.5"><Clock size={12} /> {hours} hrs</span>)}
          </div>
          <h1 className="mt-2" style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(1.4rem, 3.4vw, 2rem)", fontWeight: 700, lineHeight: 1.2 }}>
            Week {w.number}: {w.title}
          </h1>
          {w.phase && (
            <p className="mt-1.5 text-xs opacity-80" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.18em", textTransform: "uppercase" }}>Phase · {w.phase}</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <WeekPageTabs week={w} slug={roadmap.slug} taskId={ownTask?.id ?? null} />
      </section>

      <nav
        aria-label="Week navigation"
        style={{
          maxWidth: "64rem",
          margin: "0 auto",
          padding: "0 1.5rem 3.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        {/* Previous — sized to content. flex: 0 1 auto means: don't grow,
            shrink if necessary, base width = content. So the card hugs its
            title instead of stretching to half the page. */}
        {prev ? (
          <Link
            href={`/learn/${roadmap.slug}/${prev.number}`}
            style={{
              flex: "0 1 auto",
              maxWidth: "22rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg-panel)",
              color: "var(--text-primary)",
              textDecoration: "none",
              transition: "border-color 0.15s, background 0.15s",
              minWidth: 0,
            }}
          >
            <ArrowLeft size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
            <span style={{ minWidth: 0, display: "block" }}>
              <span style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.625rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--text-dim)",
                lineHeight: 1,
                marginBottom: "0.25rem",
              }}>
                Previous
              </span>
              <span style={{
                display: "block",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 500,
                lineHeight: 1.25,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "var(--text-primary)",
              }}>
                Week {prev.number}: {prev.title}
              </span>
            </span>
          </Link>
        ) : <span aria-hidden />}

        {/* Next */}
        {next ? (
          <Link
            href={`/learn/${roadmap.slug}/${next.number}`}
            style={{
              flex: "0 1 auto",
              maxWidth: "22rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg-panel)",
              color: "var(--text-primary)",
              textDecoration: "none",
              transition: "border-color 0.15s, background 0.15s",
              minWidth: 0,
              marginLeft: prev ? 0 : "auto",
            }}
          >
            <span style={{ minWidth: 0, display: "block", textAlign: "right" }}>
              <span style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.625rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--text-dim)",
                lineHeight: 1,
                marginBottom: "0.25rem",
              }}>
                Next
              </span>
              <span style={{
                display: "block",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 500,
                lineHeight: 1.25,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "var(--text-primary)",
              }}>
                Week {next.number}: {next.title}
              </span>
            </span>
            <ArrowRight size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
