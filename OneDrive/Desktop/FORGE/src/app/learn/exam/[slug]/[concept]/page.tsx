import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { loadExamPath, findConcept, flattenConcepts } from "@/lib/examPaths";
import ConceptSections from "@/components/exam/ConceptSections";
import ConceptStatusBar from "@/components/exam/ConceptStatusBar";
import StartConceptButton from "@/components/exam/StartConceptButton";
import MasteryGate from "@/components/exam/MasteryGate";
import ActuaryQuestionSolver from "@/components/exam/ActuaryQuestionSolver";
import StudyPractice from "@/components/exam/StudyPractice";
import { workedExamples } from "@/lib/examWorkedExamples";

export const dynamic = "force-dynamic";

// Actuary concept pages are PUBLIC by design, full lessons + quiz, no login wall.
//
// Layout: editorial two-column on large screens, a wide flat reading column
// (no cards, content sits on the page) plus a sticky status rail. On small
// screens the rail content stacks under the title.
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

 const examples = workedExamples(conceptId);

 return (
 <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
 <article className="mx-auto max-w-6xl px-6 pt-8 pb-20">
 {/* Breadcrumb */}
 <div className="flex flex-wrap items-center gap-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
 <Link href={`/learn/exam/${slug}`} className="inline-flex items-center gap-1.5 hover:text-[color:var(--accent)]">
 <ArrowLeft size={11} /> {path.title}
 </Link>
 <span>/</span>
 <span style={{ color: "var(--accent)" }}>{module.title}</span>
 </div>

 <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
 {/* Reading column */}
 <div className="min-w-0">
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)", fontWeight: 700, lineHeight: 1.1 }}>
 {concept.title}
 </h1>
 <p className="mt-2" style={{ color: "var(--text-secondary)", fontSize: "1.0625rem", lineHeight: 1.55, maxWidth: 680 }}>
 {concept.tagline}
 </p>

 {/* Status + start, stacked here on small screens; the rail owns them on lg+ */}
 <div className="mt-5 space-y-4 lg:hidden">
 <div className="inline-flex items-center gap-1.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
 <Clock size={11} /> ~{concept.minutes} min focused
 </div>
 <ConceptStatusBar slug={slug} conceptId={conceptId} />
 <StartConceptButton slug={slug} conceptId={conceptId} />
 </div>

 {/* Teaching arc */}
 <div className="mt-10">
 <ConceptSections sections={concept.sections} />
 </div>

 {/* Worked examples, study mode: decode, trick, diagram, step-by-step */}
 {examples.length > 0 && (
 <section className="mt-12 border-t border-[color:var(--border)] pt-8">
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>
 Worked examples
 </h2>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
 Work each one yourself first, then reveal the decode, the trick, the diagram, and the full solution.
 </p>
 <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
 {examples.map((ex, i) => (
 <ActuaryQuestionSolver key={i} question={ex} />
 ))}
 </div>
 </section>
 )}

 {/* Infinite enriched practice (study mode), trick / diagram / 4-step */}
 <StudyPractice slug={slug} conceptId={conceptId} />

 {/* Completion closure → unlocks the mastery gate */}
 <div className="mt-12">
 <MasteryGate
 slug={slug}
 conceptId={conceptId}
 passing={concept.mastery.passing}
 secondsPerQuestion={concept.mastery.secondsPerQuestion}
 questions={concept.mastery.questions}
 />
 </div>

 {/* Prev / next, flat rows on a hairline, no boxes */}
 <nav className="mt-14 flex flex-col gap-4 border-t border-[color:var(--border)] pt-6 sm:flex-row sm:items-start sm:justify-between">
 {prev ? (
 <Link href={`/learn/exam/${slug}/${prev.concept.id}`} className="group min-w-0">
 <span className="inline-flex items-center gap-1.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)" }}>
 <ArrowLeft size={11} className="transition group-hover:-translate-x-0.5" /> Previous
 </span>
 <p className="mt-1 transition group-hover:text-[color:var(--accent)]" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{prev.concept.title}</p>
 </Link>
 ) : <div />}
 {next ? (
 <Link href={`/learn/exam/${slug}/${next.concept.id}`} className="group min-w-0 text-right sm:ml-auto">
 <span className="inline-flex items-center gap-1.5 justify-end w-full" style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)" }}>
 Next <ArrowRight size={11} className="transition group-hover:translate-x-0.5" />
 </span>
 <p className="mt-1 transition group-hover:text-[color:var(--accent)]" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{next.concept.title}</p>
 </Link>
 ) : <div />}
 </nav>
 </div>

 {/* Sticky status rail (lg+) */}
 <aside className="hidden lg:block">
 <div className="sticky top-8 space-y-5 border-l border-[color:var(--border)] pl-6">
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-dim)" }}>
 This concept
 </p>
 <div className="inline-flex items-center gap-1.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
 <Clock size={11} /> ~{concept.minutes} min focused
 </div>
 <ConceptStatusBar slug={slug} conceptId={conceptId} />
 <StartConceptButton slug={slug} conceptId={conceptId} />
 </div>
 </aside>
 </div>
 </article>
 </main>
 );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; concept: string }> }) {
 const { slug, concept: conceptId } = await params;
 const path = loadExamPath(slug);
 const found = path && findConcept(path, conceptId);
 if (!found) return { title: "Concept, THE FORGE" };
 return { title: `${found.concept.title}, Exam ${path!.exam}, THE FORGE`, description: found.concept.tagline };
}
