import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPreviewRoadmap } from "@/lib/roadmaps";

export const dynamic = "force-dynamic";

export default async function DevTrackWeeks({ params }: { params: Promise<{ slug: string }> }) {
 if (process.env.NEXT_PUBLIC_DEV_MODE !== "true") return notFound();
 const { slug } = await params;
 const p = loadPreviewRoadmap(slug);
 if (!p) return notFound();
 const { roadmap, source, liveServesEnriched } = p;

 return (
 <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: "2rem 1.5rem 5rem" }}>
 <div style={{ maxWidth: 900, margin: "0 auto" }}>
 <Link href="/dev/roadmaps" style={{ color: "#60a5fa", fontFamily: "var(--font-mono)", fontSize: 12 }}>← all tracks</Link>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.8rem", margin: "0.5rem 0 0.25rem" }}>{roadmap.title}</h1>
 <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: 12, marginBottom: "1.25rem" }}>
 {roadmap.weeks.length} weeks · source {source}{liveServesEnriched ? "" : " · ⚠ enriched not live"}
 </p>
 <div style={{ display: "grid", gap: 8 }}>
 {roadmap.weeks.map((w) => {
 const days = w.days ?? [];
 const vids = days.reduce((n, d) => n + (d.items ?? []).filter((i) => i.kind === "video").length, 0);
 const noVid = days.filter((d) => (d.number ?? 1) !== 0 && (d.items ?? []).every((i) => i.kind !== "video")).length;
 return (
 <Link key={w.number} href={`/dev/roadmaps/${slug}/${w.number}`} className="forge-panel"
 style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.7rem 1rem", textDecoration: "none", color: "inherit", borderRadius: 6 }}>
 <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", minWidth: 38 }}>W{w.number}</span>
 <span style={{ flex: 1, fontWeight: 600 }}>{w.title}</span>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)" }}>
 {days.length}d · {(w.concept_check ?? []).length}cc · {vids} vid{noVid ? ` · ${noVid} no-vid` : ""}
 </span>
 </Link>
 );
 })}
 </div>
 </div>
 </main>
 );
}
