import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Clock, BookOpen, ClipboardCheck, Target,
  Library, HelpCircle, Code2, CheckCircle2, ExternalLink, Sparkles,
} from "lucide-react";
import { loadAllRoadmaps, loadRoadmap, ROADMAP_META } from "@/lib/roadmaps";
import { normaliseResource } from "@/lib/normalize-resource";

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

  // Normalise commitment-hours rendering: "20--30" / "20—30" → "20–30"
  const hours = w.commitment_hours
    ? w.commitment_hours.replace(/—|--/g, "–").trim()
    : "";

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Slim banner — gradient stripe + breadcrumb + week title. Compact so it
          never hides side navigation or scrolls content out of view. */}
      <section
        className={`border-b border-[color:var(--border)] bg-gradient-to-r ${meta?.gradient ?? "from-cyan-500 to-blue-600"}`}
        style={{ color: "white" }}
      >
        <div className="mx-auto max-w-4xl px-6 py-5">
          <div className="flex items-center justify-between gap-3 text-xs opacity-90">
            <Link
              href={`/learn/${roadmap.slug}`}
              className="inline-flex items-center gap-1.5 hover:opacity-100"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <ArrowLeft size={12} /> {roadmap.title}
            </Link>
            {hours && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} /> {hours} hours
              </span>
            )}
          </div>
          <h1
            className="mt-2"
            style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(1.4rem, 3.4vw, 2rem)", fontWeight: 700, lineHeight: 1.2 }}
          >
            Week {w.number}: {w.title}
          </h1>
          {w.phase && (
            <p className="mt-1.5 text-xs opacity-80" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Phase · {w.phase}
            </p>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-4xl px-6 py-8 space-y-7">
        {/* Context — friendlier, normal weight */}
        {w.context && (
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.6, maxWidth: "60ch" }}>
            {w.context}
          </p>
        )}

        <Section title="What you'll learn this week" icon={BookOpen} accent="#60a5fa">
          <ul className="grid gap-2 md:grid-cols-2">
            {w.topics.map((t, i) => (
              <li key={i} className="flex gap-2.5 text-[15px]" style={{ color: "var(--text-primary)", lineHeight: 1.55 }}>
                <span style={{ color: "#60a5fa", flexShrink: 0 }}>•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="What to do" icon={ClipboardCheck} accent="#34d399">
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
          <Section title="Build this — your real-world project" icon={Target} accent="#fb923c">
            <p
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-4 text-[15px]"
              style={{ color: "var(--text-primary)", lineHeight: 1.65 }}
            >
              {w.project}
            </p>
          </Section>
        )}

        {w.resources.length > 0 && (
          <Section title="Hand-picked resources" icon={Library} accent="#c084fc">
            <ul className="grid gap-2">
              {w.resources.map((raw, i) => {
                const r = normaliseResource(raw);
                return (
                  <li key={i}>
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group flex items-start gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-3.5 transition hover:border-[#c084fc]"
                      >
                        <ExternalLink size={15} className="mt-1 shrink-0" style={{ color: "#c084fc" }} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14.5px] font-medium" style={{ color: "var(--text-primary)" }}>{r.label}</span>
                          {r.note && (
                            <span className="mt-0.5 block text-xs" style={{ color: "var(--text-dim)" }}>{r.note}</span>
                          )}
                        </span>
                      </a>
                    ) : (
                      <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-3.5 text-[14.5px]" style={{ color: "var(--text-primary)" }}>
                        {r.label}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {w.questions.length > 0 && (
          <Section title="Questions to ask yourself" icon={HelpCircle} accent="#f472b6">
            <div className="space-y-3">
              {w.questions.map((q, i) => (
                <div key={i} className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-4">
                  <p className="mb-1.5 text-xs" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.18em", color: "#f472b6", textTransform: "uppercase" }}>
                    Q{i + 1}
                  </p>
                  <p className="text-[14.5px]" style={{ color: "var(--text-primary)", lineHeight: 1.6 }}>{q}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {w.exercises.length > 0 && (
          <Section title="Practice — try these" icon={Code2} accent="#38bdf8">
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
          <Section title="What you'll have by the end" icon={CheckCircle2} accent="#fbbf24">
            <ul className="space-y-2">
              {w.outputs.map((o, i) => (
                <li key={i} className="flex gap-2.5 text-[15px]" style={{ color: "var(--text-primary)", lineHeight: 1.55 }}>
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "#fbbf24" }} />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* CTA */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-5 text-center">
          <Sparkles size={20} className="mx-auto" style={{ color: "var(--accent)" }} />
          <h3 className="mt-2 text-base font-semibold">Ship this week and prove it</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Submit your work in the FORGE and the AI will grill you on what you actually built.
          </p>
          <Link
            href="/register"
            className="forge-btn forge-btn-primary mt-3 inline-flex"
            style={{ padding: "0.5rem 1.25rem", fontSize: "0.9375rem" }}
          >
            Start the forge →
          </Link>
        </div>
      </section>

      {/* Prev / Next */}
      <nav className="mx-auto max-w-4xl px-6 pb-14 grid grid-cols-2 gap-3">
        <div>
          {prev && (
            <Link
              href={`/learn/${roadmap.slug}/${prev.number}`}
              className="block rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-3.5 transition hover:border-[color:var(--accent)]"
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
              className="block rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-3.5 text-right transition hover:border-[color:var(--accent)]"
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
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${accent}1f`, color: accent }}>
          <Icon size={16} />
        </span>
        <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", fontWeight: 700 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
