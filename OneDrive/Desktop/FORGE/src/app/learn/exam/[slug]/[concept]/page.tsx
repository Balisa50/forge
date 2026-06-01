import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { loadExamPath, findConcept, flattenConcepts } from "@/lib/examPaths";
import ConceptSections from "@/components/exam/ConceptSections";
import ConceptStatusBar from "@/components/exam/ConceptStatusBar";
import MasteryQuiz from "@/components/exam/MasteryQuiz";

export const dynamic = "force-dynamic";

// Actuary concept pages are PUBLIC by design — full lessons + quiz, no login wall.
export default async function ConceptPage({ params }: { params: Promise<{ slug: string; concept: string }> }) {
  const { slug, concept: conceptId } = await params;

  const path = loadExamPath(slug);
  if (!path) return notFound();
  const found = findConcept(path, conceptId);
  if (!found) return notFound();
  const { module, concept } = found;

  // Prev/next across the whole path (module-spanning).
  const flat = flattenConcepts(path);
  const pos = flat.findIndex((f) => f.concept.id === conceptId);
  const prev = pos > 0 ? flat[pos - 1] : null;
  const next = pos < flat.length - 1 ? flat[pos + 1] : null;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <article className="mx-auto max-w-3xl px-6 pt-8 pb-20">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
          <Link href={`/learn/exam/${slug}`} className="inline-flex items-center gap-1.5 hover:text-[color:var(--accent)]">
            <ArrowLeft size={11} /> {path.title}
          </Link>
          <span>/</span>
          <span style={{ color: "var(--accent)" }}>{module.title}</span>
        </div>

        {/* Title */}
        <h1 className="mt-4" style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(1.625rem, 4.5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.12 }}>
          {concept.title}
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)", fontSize: "1.0625rem", lineHeight: 1.55 }}>
          {concept.tagline}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
          <Clock size={11} /> ~{concept.minutes} min focused
        </div>

        {/* Live status + opened tracker */}
        <div className="mt-5">
          <ConceptStatusBar slug={slug} conceptId={conceptId} />
        </div>

        {/* Teaching arc */}
        <div className="mt-8">
          <ConceptSections sections={concept.sections} />
        </div>

        {/* Mastery gate */}
        <div className="mt-10">
          <MasteryQuiz
            slug={slug}
            conceptId={conceptId}
            passing={concept.mastery.passing}
            secondsPerQuestion={concept.mastery.secondsPerQuestion}
            questions={concept.mastery.questions}
          />
        </div>

        {/* Prev / next */}
        <nav className="mt-12 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link href={`/learn/exam/${slug}/${prev.concept.id}`} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-4 transition hover:border-[color:var(--accent)]">
              <span className="inline-flex items-center gap-1.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)" }}>
                <ArrowLeft size={11} /> Previous
              </span>
              <p className="mt-1" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{prev.concept.title}</p>
            </Link>
          ) : <div />}
          {next ? (
            <Link href={`/learn/exam/${slug}/${next.concept.id}`} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-4 text-right transition hover:border-[color:var(--accent)]">
              <span className="inline-flex items-center gap-1.5 justify-end w-full" style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)" }}>
                Next <ArrowRight size={11} />
              </span>
              <p className="mt-1" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{next.concept.title}</p>
            </Link>
          ) : <div />}
        </nav>
      </article>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; concept: string }> }) {
  const { slug, concept: conceptId } = await params;
  const path = loadExamPath(slug);
  const found = path && findConcept(path, conceptId);
  if (!found) return { title: "Concept — THE FORGE" };
  return { title: `${found.concept.title} — Exam ${path!.exam} — THE FORGE`, description: found.concept.tagline };
}
