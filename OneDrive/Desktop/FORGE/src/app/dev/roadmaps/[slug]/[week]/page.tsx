import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { loadPreviewRoadmap, ROADMAP_META } from "@/lib/roadmaps";
import WeekPageTabs from "@/components/WeekPageTabs";
import PreviewAdminBar from "@/components/PreviewAdminBar";

export const dynamic = "force-dynamic";

export default async function DevWeekPreview({ params }: { params: Promise<{ slug: string; week: string }> }) {
 if (process.env.NEXT_PUBLIC_DEV_MODE !== "true") return notFound();
 const { slug, week } = await params;
 const p = loadPreviewRoadmap(slug);
 if (!p) return notFound();
 const { roadmap, source, liveServesEnriched } = p;

 const wNum = parseInt(week, 10);
 const w = roadmap.weeks.find((x) => x.number === wNum);
 if (!w) return notFound();
 const meta = ROADMAP_META[slug];
 const prev = roadmap.weeks.find((x) => x.number === wNum - 1);
 const next = roadmap.weeks.find((x) => x.number === wNum + 1);
 const hours = w.commitment_hours ? w.commitment_hours.replace(/, |--/g, ", ").trim() : "";

 return (
 <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", paddingBottom: 110 }}>
 <section className={`border-b border-[color:var(--border)] bg-gradient-to-r ${meta?.gradient ?? "from-cyan-500 to-blue-600"}`} style={{ color: "white" }}>
 <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: "1.25rem 1.5rem", boxSizing: "border-box" }}>
 <div className="flex items-center justify-between gap-3 text-xs opacity-90">
 <Link href={`/dev/roadmaps/${slug}`} className="inline-flex items-center gap-1.5 hover:opacity-100" style={{ fontFamily: "var(--font-mono)" }}>
 <ArrowLeft size={12} /> {roadmap.title}
 </Link>
 {hours && <span style={{ fontFamily: "var(--font-mono)" }}>{hours} hrs</span>}
 </div>
 <h1 className="mt-2" style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(1.4rem, 3.4vw, 2rem)", fontWeight: 700, lineHeight: 1.2 }}>
 Week {w.number}: {w.title}
 </h1>
 {w.phase && (
 <p className="mt-1.5 text-xs opacity-80" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.18em", textTransform: "uppercase" }}>Phase · {w.phase}</p>
 )}
 </div>
 </section>

 <section style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem", boxSizing: "border-box" }}>
 {/* taskId=null => content-only student view (no submission/mentor tabs). */}
 <WeekPageTabs
 week={w}
 slug={slug}
 taskId={null}
 prev={prev ? { number: prev.number, title: prev.title } : null}
 next={next ? { number: next.number, title: next.title } : null}
 submission={null}
 hasMentor={false}
 />
 </section>

 <PreviewAdminBar week={w} source={source} liveServesEnriched={liveServesEnriched} />
 </main>
 );
}
