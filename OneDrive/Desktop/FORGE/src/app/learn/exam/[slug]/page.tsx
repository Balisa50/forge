import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, FileText, ListChecks, Target, Sigma } from "lucide-react";
import { loadExamPath, totalConcepts } from "@/lib/examPaths";
import { loadFormulaSheet } from "@/lib/examFormulaSheets";
import PathMap, { type PathMapModule } from "@/components/exam/PathMap";
import ReadinessPanel from "@/components/exam/ReadinessPanel";

export const dynamic = "force-dynamic";

// Actuary exam paths are PUBLIC by design, fully viewable with no login wall.
export default async function ExamPathPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;

 const path = loadExamPath(slug);
 if (!path) return notFound();

 // Trim to the serializable shape PathMap needs (no quiz payloads client-side).
 const modules: PathMapModule[] = path.modules.map((m) => ({
 id: m.id,
 title: m.title,
 weight: m.weight,
 blurb: m.blurb,
 concepts: m.concepts.map((c) => ({ id: c.id, title: c.title, tagline: c.tagline, minutes: c.minutes })),
 }));
 const concepts = totalConcepts(path);
 const hasFormulaSheet = !!loadFormulaSheet(slug);

 return (
 <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
 {/* Banner */}
 <section className="border-b border-[color:var(--border)]" style={{ background: "linear-gradient(180deg, rgba(212,175,55,0.05), transparent)" }}>
 <div className="mx-auto max-w-5xl px-6 pt-8 pb-7">
 <Link href="/learn" className="inline-flex items-center gap-1.5 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
 <ArrowLeft size={12} /> all paths
 </Link>
 <div style={{ height: 3, borderRadius: 3 }} className={`mt-4 w-20 bg-gradient-to-r ${path.gradient}`} />
 <p className="mt-4" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.24em", color: "var(--accent)", textTransform: "uppercase" }}>
 Actuarial Exam {path.exam} · concept mastery path
 </p>
 <h1 className="mt-2" style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(1.75rem, 5vw, 2.75rem)", fontWeight: 700, lineHeight: 1.1 }}>
 {path.title}
 </h1>
 <p className="mt-2" style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 680, lineHeight: 1.6 }}>
 {path.subtitle}
 </p>
 <p className="mt-4" style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", maxWidth: 720, lineHeight: 1.7 }}>
 {path.intro}
 </p>

 {/* Exam format facts */}
 <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
 <span className="inline-flex items-center gap-1.5"><FileText size={12} /> {path.format.questions} questions</span>
 <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {path.format.minutes} min</span>
 <span className="inline-flex items-center gap-1.5"><ListChecks size={12} /> {path.format.choices} choices each</span>
 <span className="inline-flex items-center gap-1.5"><Target size={12} /> {concepts} concepts</span>
 </div>
 <div className="mt-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-3" style={{ maxWidth: 720 }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", letterSpacing: "0.18em", color: "var(--accent)", textTransform: "uppercase" }}>Passing</p>
 <p className="mt-1" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>{path.format.passing}</p>
 </div>
 {hasFormulaSheet && (
 <Link
 href={`/learn/exam/${path.slug}/formulas`}
 className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 transition hover:border-[color:var(--accent)]"
 style={{ borderColor: "rgba(212,175,55,0.35)", background: "rgba(212,175,55,0.06)" }}
 >
 <Sigma size={14} style={{ color: "var(--accent)" }} />
 <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Formula sheet</span>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)" }}>· printable reference</span>
 </Link>
 )}
 </div>
 </section>

 <section className="mx-auto max-w-5xl px-6 py-10">
 <ReadinessPanel slug={path.slug} modules={modules} />
 <PathMap slug={path.slug} gradient={path.gradient} modules={modules} />
 </section>
 </main>
 );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const path = loadExamPath(slug);
 if (!path) return { title: "Exam Path, THE FORGE" };
 return { title: `${path.title}, THE FORGE`, description: path.subtitle };
}
