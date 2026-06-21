import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { loadExamPath } from "@/lib/examPaths";
import { loadFormulaSheet } from "@/lib/examFormulaSheets";
import { Tex, renderRichText } from "@/lib/math";
import PrintButton from "@/components/exam/PrintButton";

export const dynamic = "force-dynamic";

// Public, like the rest of the actuary path — a printable reference, no login wall.
export default async function FormulaSheetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = loadExamPath(slug);
  const sheet = loadFormulaSheet(slug);
  if (!path || !sheet) return notFound();

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <article className="mx-auto max-w-3xl px-6 pt-8 pb-20">
        {/* Breadcrumb + print */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/learn/exam/${slug}`}
            className="inline-flex items-center gap-1.5 hover:text-[color:var(--accent)]"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}
          >
            <ArrowLeft size={11} /> {path.title}
          </Link>
          <span className="print:hidden">
            <PrintButton />
          </span>
        </div>

        {/* Title */}
        <p className="mt-5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.24em", color: "var(--accent)", textTransform: "uppercase" }}>
          Exam {sheet.exam} · reference
        </p>
        <h1 className="mt-2" style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(1.625rem, 4.5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.12 }}>
          {sheet.title}
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.6 }}>
          {sheet.intro}
        </p>

        {/* Groups */}
        <div className="mt-8 space-y-8">
          {sheet.groups.map((g, gi) => (
            <section key={gi} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-5">
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.1875rem", fontWeight: 700 }}>{g.heading}</h2>
              {g.blurb && (
                <p className="mt-1" style={{ color: "var(--text-dim)", fontSize: "0.8125rem", lineHeight: 1.5 }}>{g.blurb}</p>
              )}
              <dl className="mt-4 space-y-3.5">
                {g.items.map((it, ii) => (
                  <div key={ii} className="grid gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4 sm:items-baseline">
                    <dt style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.04em", color: "var(--accent)", lineHeight: 1.4 }}>
                      {it.name}
                    </dt>
                    <dd style={{ minWidth: 0, overflowX: "auto" }}>
                      <div style={{ fontSize: "1rem", color: "var(--text-primary)" }}>
                        <Tex block>{it.tex}</Tex>
                      </div>
                      {it.note && (
                        <div className="mt-1" style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", lineHeight: 1.55 }}>
                          {renderRichText(it.note, `g${gi}i${ii}`)}
                        </div>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <p className="mt-10" style={{ color: "var(--text-dim)", fontSize: "0.8125rem", lineHeight: 1.6 }}>
          Memorize the groups, not the page. On exam day you reconstruct any line from the one above it — that is the test of whether you actually own it.
        </p>
      </article>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sheet = loadFormulaSheet(slug);
  if (!sheet) return { title: "Formula sheet, THE FORGE" };
  return { title: `${sheet.title}, THE FORGE`, description: sheet.intro };
}
