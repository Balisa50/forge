import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Layers, Lock, Check } from "lucide-react";
import { loadAllRoadmaps, loadRoadmap, ROADMAP_META, getPhaseGroups } from "@/lib/roadmaps";
import { HIDDEN_SLUGS } from "@/lib/curated-roadmaps-client";
import { auth } from "@/lib/auth";

// Force dynamic so the auth check runs on every request - no static prerender
// for the curriculum content. Drops the route from generateStaticParams.
export const dynamic = "force-dynamic";

export default async function RoadmapDetail({ params }: { params: Promise<{ slug: string }> }) {
 const session = await auth();
 const { slug } = await params;

 // Hidden (in-development) tracks are not publicly browsable, even by direct
 // URL. Members keep access so an already-assigned mentee is never locked out.
 if (!session?.user?.id && HIDDEN_SLUGS.has(slug)) return notFound();

 const roadmap = loadRoadmap(slug);
 if (!roadmap) return notFound();
 const meta = ROADMAP_META[roadmap.slug];
 const groups = getPhaseGroups(roadmap.weeks);

 // Logged-out visitors see an overview card + signup CTA, the week-by-week
 // content stays LOCKED until they join. (Actuary exam paths are public and
 // live on a separate route; this gate is only for the build tracks.)
 if (!session?.user?.id) {
 return (
 <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
 <section className="border-b border-[color:var(--border)]">
 <div className="mx-auto w-full max-w-[1180px] px-6 pt-8 pb-6 md:px-12">
 <Link href="/learn" className="inline-flex items-center gap-1.5 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
 <ArrowLeft size={12} /> all roadmaps
 </Link>
 <div style={{ height: 3, borderRadius: 3 }} className={`mt-4 w-16 bg-gradient-to-r ${meta?.gradient ?? "from-cyan-500 to-blue-500"}`} />
 <h1 className="mt-3" style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, lineHeight: 1.15 }}>{roadmap.title}</h1>
 {meta?.tagline && (
 <p className="mt-1.5" style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", maxWidth: 640, lineHeight: 1.55 }}>{meta.tagline}</p>
 )}
 <div className="mt-3 flex flex-wrap gap-4" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
 <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {roadmap.total_weeks} weeks</span>
 <span className="inline-flex items-center gap-1.5"><Layers size={12} /> {groups.length} phases</span>
 </div>
 </div>
 </section>

 <section className="mx-auto w-full max-w-[1180px] px-6 py-10 space-y-10 md:px-12">
 {/* What this path covers, flat on the page, accent rule not a box */}
 <div style={{ borderLeft: "3px solid var(--accent)", paddingLeft: "1.25rem" }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", color: "var(--accent)", textTransform: "uppercase" }}>What this path covers</p>
 <ul className="mt-3 space-y-2">
 {groups.map((g, i) => (
 <li key={g.phase} className="flex items-baseline gap-2.5" style={{ fontSize: "0.9375rem" }}>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--accent)" }}>{String(i + 1).padStart(2, "0")}</span>
 <span>{g.phase}<span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}> · {g.weeks.length} {g.weeks.length === 1 ? "week" : "weeks"}</span></span>
 </li>
 ))}
 </ul>
 </div>

 {/* Skills you'll gain */}
 {meta?.outcome && (
 <div style={{ borderLeft: "3px solid var(--green)", paddingLeft: "1.25rem" }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", color: "var(--green)", textTransform: "uppercase" }}>Skills you&apos;ll gain</p>
 <p className="mt-2 inline-flex items-start gap-2" style={{ color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.55 }}>
 <Check size={16} style={{ color: "var(--green)", marginTop: 3, flexShrink: 0 }} /> {meta.outcome}
 </p>
 </div>
 )}

 {/* Time to complete */}
 <div className="flex flex-wrap gap-6 border-t border-[color:var(--border)] pt-6" style={{ fontSize: "0.875rem" }}>
 <span className="inline-flex items-center gap-2"><Clock size={15} style={{ color: "var(--accent)" }} /> <strong>{roadmap.total_weeks} weeks</strong> <span style={{ color: "var(--text-dim)" }}>estimated</span></span>
 <span className="inline-flex items-center gap-2"><Layers size={15} style={{ color: "var(--accent)" }} /> <strong>{groups.length} phases</strong></span>
 </div>

 {/* Locked + CTA, flat, anchored by a top accent rule */}
 <div className="border-t-2 pt-8 text-center" style={{ borderColor: "var(--accent)" }}>
 <Lock size={28} style={{ color: "var(--accent)", margin: "0 auto 0.75rem" }} />
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>The full path is locked</h2>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", maxWidth: 440, margin: "0 auto 1.25rem", lineHeight: 1.55 }}>
 Every lesson, code cell, and mastery quiz unlocks the moment you sign up. The Forge is about earning your knowledge through action.
 </p>
 <Link href={`/register?next=/learn/${roadmap.slug}`} className="forge-btn forge-btn-primary inline-flex items-center gap-2">
 Sign up to start forging this path <ArrowRight size={16} />
 </Link>
 <p className="mt-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
 Already have an account? <Link href={`/login?next=/learn/${roadmap.slug}`} style={{ color: "var(--accent)" }}>Log in</Link>
 </p>
 </div>
 </section>
 </main>
 );
 }

 return (
 <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
 {/* Compact banner */}
 <section className="border-b border-[color:var(--border)]">
 <div className="mx-auto w-full max-w-[1180px] px-6 pt-8 pb-6 md:px-12">
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
 <div className="mt-4" style={{ borderLeft: "3px solid var(--accent)", paddingLeft: "1rem" }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", color: "var(--accent)", textTransform: "uppercase" }}>What you&apos;ll have at the end</p>
 <p className="mt-1" style={{ color: "var(--text-primary)", fontSize: "0.875rem", lineHeight: 1.5 }}>{meta.outcome}</p>
 </div>
 )}
 </div>
 </section>

 {/* Phase groups */}
 <section className="mx-auto w-full max-w-[1180px] px-6 py-12 space-y-12 md:px-12">
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
 <ul className="border-t border-[color:var(--border)]">
 {g.weeks.map((w) => (
 <li key={w.number}>
 <Link
 href={`/learn/${roadmap.slug}/${w.number}`}
 className="flex items-center gap-5 border-b border-[color:var(--border)] py-5 transition hover:bg-[rgba(255,255,255,0.02)]"
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
 <span>{w.topics?.length ?? w.days?.length ?? 0} topics</span>
 <span>{w.tasks?.length ?? 0} tasks</span>
 <span>{w.resources?.length ?? 0} resources</span>
 <span>{w.exercises?.length ?? 0} exercises</span>
 {w.commitment_hours && <span>{w.commitment_hours.replace(/--/g, ", ")} hrs</span>}
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
