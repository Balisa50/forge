import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Clock, BookOpen, ClipboardCheck, Target,
  Library, HelpCircle, Code2, CheckCircle2, ExternalLink, Sparkles,
} from "lucide-react";
import { loadAllRoadmaps, loadRoadmap, ROADMAP_META } from "@/lib/roadmaps";

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

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Banner */}
      <section
        className={`relative overflow-hidden border-b border-[color:var(--border)] bg-gradient-to-br ${meta?.gradient ?? "from-cyan-500 to-blue-600"}`}
        style={{ color: "white" }}
      >
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />
        <div className="relative mx-auto max-w-4xl px-6 pt-10 pb-12">
          <Link
            href={`/learn/${roadmap.slug}`}
            className="inline-flex items-center gap-1.5 text-xs opacity-80 hover:opacity-100"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <ArrowLeft size={12} /> back to {roadmap.title}
          </Link>
          <p className="mt-6 text-xs opacity-80" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.28em", textTransform: "uppercase" }}>
            {roadmap.title} · Phase: {w.phase || "—"}
          </p>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(1.85rem, 5vw, 3rem)", fontWeight: 700, lineHeight: 1.1, marginTop: "0.5rem" }}>
            Week {w.number}: {w.title}
          </h1>
          {w.commitment_hours && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm opacity-90">
              <Clock size={14} /> {w.commitment_hours.replace(/--/g, "–")} hours this week
            </p>
          )}
          {w.context && (
            <p className="mt-5 max-w-3xl text-base italic opacity-95" style={{ lineHeight: 1.6 }}>
              {w.context}
            </p>
          )}
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <Section title="Topics to study" icon={BookOpen} accent="#60a5fa">
          <ul className="grid gap-2 md:grid-cols-2">
            {w.topics.map((t, i) => (
              <li key={i} className="flex gap-2 text-[15px]" style={{ color: "var(--text-primary)", lineHeight: 1.55 }}>
                <span style={{ color: "#60a5fa" }}>•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Tasks & deliverables" icon={ClipboardCheck} accent="#34d399">
          <ol className="space-y-2.5">
            {w.tasks.map((t, i) => (
              <li key={i} className="flex gap-3 text-[15px]" style={{ color: "var(--text-primary)", lineHeight: 1.55 }}>
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold"
                  style={{ background: "#34d39922", color: "#34d399", fontFamily: "var(--font-mono)" }}
                >
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </Section>

        {w.project && (
          <Section title="Real-world project" icon={Target} accent="#fb923c">
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {w.project}
            </p>
          </Section>
        )}

        {w.resources.length > 0 && (
          <Section title="Resources" icon={Library} accent="#c084fc">
            <ul className="space-y-2">
              {w.resources.map((r, i) => (
                <li key={i}>
                  {r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex items-start gap-2.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-3 transition hover:border-[#c084fc]"
                    >
                      <ExternalLink size={14} className="mt-1 shrink-0" style={{ color: "#c084fc" }} />
                      <span>
                        <span className="text-[14.5px] font-medium" style={{ color: "var(--text-primary)" }}>{r.label}</span>
                        {r.note && (
                          <span className="block text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>{r.note}</span>
                        )}
                      </span>
                    </a>
                  ) : (
                    <p className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-3 text-[14.5px]" style={{ color: "var(--text-primary)" }}>
                      {r.label}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {w.questions.length > 0 && (
          <Section title="Think like an analyst — questions on your data" icon={HelpCircle} accent="#f472b6">
            <div className="space-y-3">
              {w.questions.map((q, i) => (
                <div key={i} className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-4">
                  <p className="text-xs mb-1.5" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em", color: "#f472b6", textTransform: "uppercase" }}>
                    Q{i + 1}
                  </p>
                  <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--text-primary)" }}>{q}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {w.exercises.length > 0 && (
          <Section title="Practical exercises" icon={Code2} accent="#38bdf8">
            <ol className="space-y-2.5">
              {w.exercises.map((e, i) => (
                <li key={i} className="flex gap-3 text-[15px]" style={{ color: "var(--text-primary)", lineHeight: 1.55 }}>
                  <span
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold"
                    style={{ background: "#38bdf822", color: "#38bdf8", fontFamily: "var(--font-mono)" }}
                  >
                    {i + 1}
                  </span>
                  <span>{e}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {w.outputs.length > 0 && (
          <Section title="Expected outputs this week" icon={CheckCircle2} accent="#fbbf24">
            <ul className="space-y-2">
              {w.outputs.map((o, i) => (
                <li key={i} className="flex gap-2 text-[15px]" style={{ color: "var(--text-primary)", lineHeight: 1.55 }}>
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "#fbbf24" }} />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* CTA */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-6 text-center">
          <Sparkles size={22} className="mx-auto" style={{ color: "var(--accent)" }} />
          <h3 className="mt-2 text-lg font-semibold">Ship this week and prove it</h3>
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            THE FORGE keeps you honest. Submit your evidence and an AI Professor will interrogate you on the work.
          </p>
          <Link
            href="/register"
            className="forge-btn forge-btn-primary mt-4 inline-flex"
            style={{ padding: "0.625rem 1.5rem" }}
          >
            Start the forge →
          </Link>
        </div>
      </section>

      {/* Prev / Next */}
      <nav className="mx-auto max-w-4xl px-6 pb-16 grid grid-cols-2 gap-3">
        <div>
          {prev && (
            <Link
              href={`/learn/${roadmap.slug}/${prev.number}`}
              className="block rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-4 transition hover:border-[color:var(--accent)]"
            >
              <p className="flex items-center gap-1 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
                <ArrowLeft size={11} /> previous
              </p>
              <p className="mt-1 line-clamp-1 text-sm font-medium">Week {prev.number}: {prev.title}</p>
            </Link>
          )}
        </div>
        <div>
          {next && (
            <Link
              href={`/learn/${roadmap.slug}/${next.number}`}
              className="block rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-4 text-right transition hover:border-[color:var(--accent)]"
            >
              <p className="flex items-center justify-end gap-1 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
                next <ArrowRight size={11} />
              </p>
              <p className="mt-1 line-clamp-1 text-sm font-medium">Week {next.number}: {next.title}</p>
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}

function Section({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  icon: typeof BookOpen;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${accent}1f`, color: accent }}>
          <Icon size={18} />
        </span>
        <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.375rem", fontWeight: 700 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
