import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Clock, BookOpen, Target } from "lucide-react";
import { loadAllRoadmaps, ROADMAP_META } from "@/lib/roadmaps";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Roadmaps — THE FORGE",
  description: "Multi-week curriculums in Data Science, Data Analysis, and BI Analytics. Topics, deliverables, real projects, resources, and exercises — every single week.",
};

// Force dynamic so the auth check runs on every request (no static cache leak)
export const dynamic = "force-dynamic";

export default async function LearnIndexPage() {
  // Gate: curriculum content is for FORGE members only. Unauthenticated
  // visitors see the landing-page pitch, NOT the actual roadmap content.
  const session = await auth();
  if (!session?.user?.id) redirect("/register?next=/learn");

  const roadmaps = loadAllRoadmaps();

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-12">
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.32em", color: "var(--accent)", textTransform: "uppercase" }}>
          ~/forge/roadmaps
        </p>
        <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontWeight: 700, lineHeight: 1.05, marginTop: "0.75rem" }}>
          Roadmaps that actually <span style={{ color: "var(--accent)" }}>respect your time.</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem", maxWidth: 720, fontSize: "1.0625rem", lineHeight: 1.65 }}>
          Every week is a real curriculum, not a generic checklist. Eight sections — topics, deliverables, a real-world project,
          curated resources, deep questions about <em>your</em> data, practical exercises, and concrete outputs. Stop guessing
          what to learn next.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 md:grid-cols-3">
          {roadmaps.map((r) => {
            const meta = ROADMAP_META[r.slug];
            const totalTopics = r.weeks.reduce((s, w) => s + w.topics.length, 0);
            const totalProjects = r.weeks.filter((w) => w.project).length;
            const phases = Array.from(new Set(r.weeks.map((w) => w.phase).filter(Boolean)));
            return (
              <Link
                key={r.slug}
                href={`/learn/${r.slug}`}
                className="group block rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-6 transition hover:border-[color:var(--accent)]"
              >
                <div
                  style={{ height: 6, borderRadius: 4 }}
                  className={`mb-5 w-full bg-gradient-to-r ${meta?.gradient ?? "from-cyan-500 to-blue-500"}`}
                />
                <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", fontWeight: 700 }}>{r.title}</h2>
                {meta && (
                  <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "0.9375rem", lineHeight: 1.55 }}>
                    {meta.tagline}
                  </p>
                )}
                <ul className="mt-5 space-y-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-dim)" }}>
                  <li className="flex items-center gap-2"><Clock size={13} /> {r.total_weeks} weeks · {phases.length} phases</li>
                  <li className="flex items-center gap-2"><BookOpen size={13} /> {totalTopics} curated topics</li>
                  <li className="flex items-center gap-2"><Target size={13} /> {totalProjects} real-world projects</li>
                </ul>
                <p
                  className="mt-6 inline-flex items-center gap-1 text-sm font-medium transition group-hover:translate-x-1"
                  style={{ color: "var(--accent)" }}
                >
                  Explore the roadmap <ArrowRight size={14} />
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
