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
  // First gate: curriculum is for FORGE members only. Public visitors get
  // redirected to register with a return URL.
  const session = await auth();
  if (!session?.user?.id) redirect(`/register?next=/learn/${slug}/${week}`);

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
        select: { status: true, closedAt: true, releasedAt: true },
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

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Slim banner */}
      <section className={`border-b border-[color:var(--border)] bg-gradient-to-r ${meta?.gradient ?? "from-cyan-500 to-blue-600"}`} style={{ color: "white" }}>
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="flex items-center justify-between gap-3 text-xs opacity-90">
            <Link href={`/learn/${roadmap.slug}`} className="inline-flex items-center gap-1.5 hover:opacity-100" style={{ fontFamily: "var(--font-mono)" }}>
              <ArrowLeft size={12} /> {roadmap.title}
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
        <WeekPageTabs week={w} slug={roadmap.slug} />
      </section>

      <nav className="mx-auto max-w-5xl px-6 pb-14 grid grid-cols-2 gap-3">
        <div>
          {prev && (
            <Link href={`/learn/${roadmap.slug}/${prev.number}`} className="block rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-3.5 transition hover:border-[color:var(--accent)]">
              <p className="flex items-center gap-1 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}><ArrowLeft size={11} /> previous</p>
              <p className="mt-1 line-clamp-1 text-sm font-medium">Week {prev.number}: {prev.title}</p>
            </Link>
          )}
        </div>
        <div>
          {next && (
            <Link href={`/learn/${roadmap.slug}/${next.number}`} className="block rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-3.5 text-right transition hover:border-[color:var(--accent)]">
              <p className="flex items-center justify-end gap-1 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>next <ArrowRight size={11} /></p>
              <p className="mt-1 line-clamp-1 text-sm font-medium">Week {next.number}: {next.title}</p>
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}
