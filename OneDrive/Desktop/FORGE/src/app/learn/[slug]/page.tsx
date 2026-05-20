import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Layers } from "lucide-react";
import { loadAllRoadmaps, loadRoadmap, ROADMAP_META, getPhaseGroups } from "@/lib/roadmaps";
import { auth } from "@/lib/auth";

// Force dynamic so the auth check runs on every request - no static prerender
// for the curriculum content. Drops the route from generateStaticParams.
export const dynamic = "force-dynamic";

export default async function RoadmapDetail({ params }: { params: Promise<{ slug: string }> }) {
  // Gate: curriculum content requires login. Public visitors see the landing-page
  // pitch, not the week-by-week details.
  const session = await auth();
  const { slug } = await params;
  if (!session?.user?.id) redirect(`/register?next=/learn/${slug}`);

  const roadmap = loadRoadmap(slug);
  if (!roadmap) return notFound();
  const meta = ROADMAP_META[roadmap.slug];
  const groups = getPhaseGroups(roadmap.weeks);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Compact banner */}
      <section className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-5xl px-6 pt-8 pb-6">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
          >
            <ArrowLeft size={12} /> all roadmaps
          </Link>
          <div
            style={{ height: 3, borderRadius: 3 }}
            className={`mt-4 w-16 bg-gradient-to-r ${meta?.gradient ?? "from-cyan-500 to-blue-500"}`}
          />
          <h1
            className="mt-3"
            style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, lineHeight: 1.15 }}
          >
            {roadmap.title}
          </h1>
          {meta?.tagline && (
            <p className="mt-1.5" style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", maxWidth: 640, lineHeight: 1.55 }}>
              {meta.tagline}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-4" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
            <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {roadmap.total_weeks} weeks</span>
            <span className="inline-flex items-center gap-1.5"><Layers size={12} /> {groups.length} phases</span>
          </div>
          {meta?.outcome && (
            <div className="mt-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-3">
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", color: "var(--accent)", textTransform: "uppercase" }}>What you'll have at the end</p>
              <p className="mt-1" style={{ color: "var(--text-primary)", fontSize: "0.875rem", lineHeight: 1.5 }}>{meta.outcome}</p>
            </div>
          )}
        </div>
      </section>

      {/* Phase groups */}
      <section className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        {groups.map((g, gi) => (
          <div key={g.phase}>
            <div className="mb-6 flex items-baseline gap-3">
              <span
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.28em", color: "var(--accent)", textTransform: "uppercase" }}
              >
                Phase {gi + 1}
              </span>
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", fontWeight: 700 }}>{g.phase}</h2>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                · {g.weeks.length} {g.weeks.length === 1 ? "week" : "weeks"}
              </span>
            </div>
            <ul className="space-y-3">
              {g.weeks.map((w) => (
                <li key={w.number}>
                  <Link
                    href={`/learn/${roadmap.slug}/${w.number}`}
                    className="flex items-center gap-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-5 transition hover:border-[color:var(--accent)] hover:bg-[color:var(--bg-elev)]"
                  >
                    <span
                      className={`shrink-0 grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br ${meta?.gradient ?? "from-cyan-500 to-blue-500"} text-white font-semibold`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {w.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate" style={{ fontSize: "1.0625rem", fontWeight: 600 }}>{w.title}</h3>
                      <p className="mt-0.5 truncate" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        {w.context.slice(0, 140)}{w.context.length > 140 ? "…" : ""}
                      </p>
                      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
                        <span>{w.topics.length} topics</span>
                        <span>{w.tasks.length} tasks</span>
                        <span>{w.resources.length} resources</span>
                        <span>{w.exercises.length} exercises</span>
                        {w.commitment_hours && <span>{w.commitment_hours.replace(/--/g, "–")} hrs</span>}
                      </p>
                    </div>
                    <ArrowRight size={18} style={{ color: "var(--text-dim)" }} className="shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
