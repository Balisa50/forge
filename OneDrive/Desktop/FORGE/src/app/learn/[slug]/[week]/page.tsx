import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { loadAllRoadmaps, loadRoadmap, ROADMAP_META } from "@/lib/roadmaps";
import WeekPageTabs from "@/components/WeekPageTabs";

export function generateStaticParams() {
  const params: { slug: string; week: string }[] = [];
  for (const r of loadAllRoadmaps()) {
    for (const w of r.weeks) params.push({ slug: r.slug, week: String(w.number) });
  }
  return params;
}

export default async function WeekPage({ params }: { params: Promise<{ slug: string; week: string }> }) {
  const { slug, week } = await params;
  const roadmap = loadRoadmap(slug);
  if (!roadmap) return notFound();
  const wNum = parseInt(week, 10);
  const w = roadmap.weeks.find((x) => x.number === wNum);
  if (!w) return notFound();
  const meta = ROADMAP_META[roadmap.slug];

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
