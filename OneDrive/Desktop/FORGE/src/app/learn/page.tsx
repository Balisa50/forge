import Link from "next/link";
import { ArrowRight, Clock, BookOpen, Target, GraduationCap, Brain, Timer } from "lucide-react";
import { loadAllRoadmaps, ROADMAP_META } from "@/lib/roadmaps";
import { VISIBLE_SLUGS } from "@/lib/curated-roadmaps-client";
import { loadAllExamPaths, totalConcepts } from "@/lib/examPaths";

export const metadata = {
 title: "Roadmaps, THE FORGE",
 description: "Multi-week curriculums in Data Science, Data Analysis, and BI Analytics. Topics, deliverables, real projects, resources, and exercises, every single week.",
};

// Force dynamic so the auth check runs on every request (no static cache leak)
export const dynamic = "force-dynamic";

// The hub is PUBLIC so anyone can browse. Clicking a build roadmap shows its
// overview (locked content until signup); clicking an Actuary exam opens it
// fully (public by design).
//
// Visibility is OPT-IN: a roadmap renders here only if its slug is in
// VISIBLE_SLUGS (curated AND not flagged hidden). A JSON file on disk alone
// never publishes a track.
export default async function LearnIndexPage() {
 const roadmaps = loadAllRoadmaps().filter((r) => VISIBLE_SLUGS.has(r.slug));
 const examPaths = loadAllExamPaths();

 return (
 <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
 <section className="mx-auto max-w-6xl px-6 pt-20 pb-10">
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.32em", color: "var(--accent)", textTransform: "uppercase" }}>
 ~/forge/roadmaps
 </p>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontWeight: 700, lineHeight: 1.05, marginTop: "0.75rem" }}>
 Roadmaps that actually <span style={{ color: "var(--accent)" }}>respect your time.</span>
 </h1>
 <p style={{ color: "var(--text-secondary)", marginTop: "1rem", maxWidth: 720, fontSize: "1.0625rem", lineHeight: 1.65 }}>
 Every week is a real curriculum, not a generic checklist. Eight sections, topics, deliverables, a real-world project,
 curated resources, deep questions about <em>your</em> data, practical exercises, and concrete outputs. Stop guessing
 what to learn next.
 </p>
 </section>

 {/* Flat editorial list, content sits on the page, separated by hairlines,
 each track keyed by its gradient accent bar. No boxes. */}
 <section className="mx-auto max-w-6xl px-6 pb-24">
 <div className="border-t border-[color:var(--border)]">
 {roadmaps.map((r) => {
 const meta = ROADMAP_META[r.slug];
 // Defensive: some roadmaps (e.g. AI Automation) ship with days-only
 // content and omit topics/tasks/outputs. Treat missing as empty.
 const totalTopics = r.weeks.reduce((s, w) => s + (w.topics?.length ?? 0), 0);
 const totalProjects = r.weeks.filter((w) => w.project).length;
 const phases = Array.from(new Set(r.weeks.map((w) => w.phase).filter(Boolean)));
 return (
 <Link
 key={r.slug}
 href={`/learn/${r.slug}`}
 className="group flex items-stretch gap-5 border-b border-[color:var(--border)] py-6 transition md:gap-8"
 >
 <div className={`w-1 shrink-0 rounded-full bg-gradient-to-b ${meta?.gradient ?? "from-cyan-500 to-blue-500"} opacity-70 transition group-hover:opacity-100`} />
 <div className="min-w-0 flex-1">
 <h2 className="transition group-hover:text-[color:var(--accent)]" style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.2 }}>
 {r.title}
 </h2>
 {meta && (
 <p style={{ color: "var(--text-secondary)", marginTop: "0.375rem", fontSize: "0.9375rem", lineHeight: 1.55, maxWidth: 640 }}>
 {meta.tagline}
 </p>
 )}
 <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 md:hidden" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
 <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {r.total_weeks} wks</span>
 <span className="inline-flex items-center gap-1.5"><BookOpen size={12} /> {totalTopics} topics</span>
 <span className="inline-flex items-center gap-1.5"><Target size={12} /> {totalProjects} projects</span>
 </p>
 </div>
 <div className="hidden shrink-0 flex-col items-end justify-center gap-1.5 md:flex" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
 <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {r.total_weeks} weeks · {phases.length} phases</span>
 <span className="inline-flex items-center gap-1.5"><BookOpen size={12} /> {totalTopics} curated topics</span>
 <span className="inline-flex items-center gap-1.5"><Target size={12} /> {totalProjects} real-world projects</span>
 </div>
 <div className="hidden items-center sm:flex">
 <ArrowRight size={18} className="transition group-hover:translate-x-1" style={{ color: "var(--accent)" }} />
 </div>
 </Link>
 );
 })}
 </div>
 </section>

 {/* Actuarial exam paths, deliberately distinct: concept-based, mastery-gated. */}
 {examPaths.length > 0 && (
 <section className="border-t border-[color:var(--border)]" style={{ background: "linear-gradient(180deg, rgba(212,175,55,0.05), transparent)" }}>
 <div className="mx-auto max-w-6xl px-6 pt-16 pb-24">
 <div className="flex items-center gap-2">
 <GraduationCap size={18} style={{ color: "var(--accent)" }} />
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.28em", color: "var(--accent)", textTransform: "uppercase" }}>
 Actuarial exams
 </p>
 </div>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(1.75rem, 5vw, 3rem)", fontWeight: 700, lineHeight: 1.1, marginTop: "0.75rem" }}>
 Walk into Exam P & FM like it&apos;s <span style={{ color: "var(--accent)" }}>any other test.</span>
 </h2>
 <p style={{ color: "var(--text-secondary)", marginTop: "1rem", maxWidth: 720, fontSize: "1.0625rem", lineHeight: 1.65 }}>
 Not a roadmap, a <strong style={{ color: "var(--text-primary)" }}>concept-mastery system</strong>. Each idea is taught from intuition to formula
 to worked example to the exact trap that catches people, then locked in with a timed, SOA-style quiz. Weak concepts
 resurface on a spaced schedule until recall is automatic. Progress saves on your device, no login, share the link with anyone.
 </p>

 <div className="mt-10 border-t border-[color:var(--border)]">
 {examPaths.map((p) => {
 const concepts = totalConcepts(p);
 return (
 <Link
 key={p.slug}
 href={`/learn/exam/${p.slug}`}
 className="group flex items-stretch gap-5 border-b border-[color:var(--border)] py-6 transition md:gap-8"
 >
 <div className={`w-1 shrink-0 rounded-full bg-gradient-to-b ${p.gradient} opacity-70 transition group-hover:opacity-100`} />
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-3">
 <span
 className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-bold"
 style={{ fontFamily: "var(--font-mono)", background: "rgba(212,175,55,0.12)", color: "var(--accent)", border: "1px solid rgba(212,175,55,0.3)" }}
 >
 {p.exam}
 </span>
 <h3 className="transition group-hover:text-[color:var(--accent)]" style={{ fontFamily: "var(--font-headline)", fontSize: "1.375rem", fontWeight: 700, lineHeight: 1.2 }}>
 {p.title}
 </h3>
 </div>
 <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "0.9375rem", lineHeight: 1.55, maxWidth: 640 }}>
 {p.subtitle}
 </p>
 <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 md:hidden" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
 <span className="inline-flex items-center gap-1.5"><Brain size={12} /> {concepts} concepts</span>
 <span className="inline-flex items-center gap-1.5"><Timer size={12} /> timed gates</span>
 </p>
 </div>
 <div className="hidden shrink-0 flex-col items-end justify-center gap-1.5 md:flex" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
 <span className="inline-flex items-center gap-1.5"><Brain size={12} /> {concepts} concepts · {p.modules.length} modules</span>
 <span className="inline-flex items-center gap-1.5"><Timer size={12} /> timed mastery gates + spaced review</span>
 <span className="inline-flex items-center gap-1.5"><Target size={12} /> {p.format.questions} questions · {p.format.minutes} min on exam day</span>
 </div>
 <div className="hidden items-center sm:flex">
 <ArrowRight size={18} className="transition group-hover:translate-x-1" style={{ color: "var(--accent)" }} />
 </div>
 </Link>
 );
 })}
 </div>
 </div>
 </section>
 )}
 </main>
 );
}
