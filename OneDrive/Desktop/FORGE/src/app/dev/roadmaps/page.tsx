import Link from "next/link";
import { notFound } from "next/navigation";
import { PREVIEW_SLUGS, loadPreviewRoadmap, ROADMAP_META } from "@/lib/roadmaps";

export const dynamic = "force-dynamic";

export default function DevRoadmapsIndex() {
 if (process.env.NEXT_PUBLIC_DEV_MODE !== "true") return notFound();

 const tracks = PREVIEW_SLUGS.map((slug) => {
 const p = loadPreviewRoadmap(slug);
 return p ? { slug, title: p.roadmap.title, weeks: p.roadmap.weeks.length, source: p.source, live: p.liveServesEnriched } : null;
 }).filter(Boolean) as { slug: string; title: string; weeks: number; source: string; live: boolean }[];

 return (
 <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: "2rem 1.5rem" }}>
 <div style={{ maxWidth: 900, margin: "0 auto" }}>
 <p style={{ fontFamily: "var(--font-mono)", letterSpacing: ".18em", textTransform: "uppercase", fontSize: 12, color: "var(--accent)" }}>Developer preview</p>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", margin: "0.25rem 0 0.5rem" }}>Roadmaps, experience mode</h1>
 <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
 Click a track to walk its weeks exactly as a student sees them. Previews the enriched content; the admin bar flags any track whose enriched build isn&apos;t what the live /learn route serves.
 </p>
 <div style={{ display: "grid", gap: 10 }}>
 {tracks.map((t) => (
 <Link key={t.slug} href={`/dev/roadmaps/${t.slug}`} className="forge-panel"
 style={{ display: "flex", alignItems: "center", gap: 14, padding: "0.9rem 1.1rem", textDecoration: "none", color: "inherit", borderRadius: 8 }}>
 <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.live ? "#16a34a" : "#dc2626", flexShrink: 0 }} />
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: 700 }}>{t.title} <span style={{ color: "var(--text-dim)", fontWeight: 400, fontFamily: "var(--font-mono)", fontSize: 12 }}>/{t.slug}</span></div>
 <div style={{ color: "var(--text-dim)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{t.weeks} weeks · serves {t.source}{t.live ? "" : " · ⚠ enriched not live"}</div>
 </div>
 <span style={{ color: "var(--text-dim)" }}>→</span>
 </Link>
 ))}
 </div>
 </div>
 </main>
 );
}
