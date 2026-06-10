import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RoadmapView from "@/components/RoadmapView";
import Link from "next/link";
import { loadAllRoadmaps, type RoadmapWeek } from "@/lib/roadmaps";
import { Map as MapIcon } from "lucide-react";

export default async function RoadmapPage() {
 const session = await auth();
 const userId = session!.user!.id!;

 const roadmap = await prisma.roadmap.findFirst({
 where: { userId, isActive: true },
 include: {
 tracks: {
 include: {
 phases: {
 include: {
 tasks: { orderBy: { sortOrder: "asc" } },
 },
 orderBy: { sortOrder: "asc" },
 },
 },
 orderBy: { sortOrder: "asc" },
 },
 },
 });

 // Match the DB roadmap to its curated curriculum JSON so we can show the
 // new beginner-friendly Day-by-Day view inline on the dashboard. Falls back
 // gracefully when no curriculum matches.
 const curatedSlug = (() => {
 if (!roadmap) return null;
 const match = loadAllRoadmaps().find((r) => r.title === roadmap.title);
 return match?.slug ?? null;
 })();

 const weekByTaskId: Record<string, RoadmapWeek> = {};
 if (roadmap && curatedSlug) {
 const all = loadAllRoadmaps();
 const curriculum = all.find((r) => r.slug === curatedSlug);
 if (curriculum) {
 const byNumber = new Map<number, RoadmapWeek>(curriculum.weeks.map((w) => [w.number, w]));
 for (const t of roadmap.tracks) {
 for (const p of t.phases) {
 for (const task of p.tasks) {
 const m = task.title.match(/^Week\s+(\d+)/i);
 if (m) {
 const n = parseInt(m[1], 10);
 const w = byNumber.get(n);
 if (w) weekByTaskId[task.id] = w;
 }
 }
 }
 }
 }
 }

 if (!roadmap) {
 return (
 <div>
 <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", marginBottom: "0.5rem" }}>Roadmap</h1>
 <div className="forge-panel" style={{ padding: "2rem 1.5rem", textAlign: "center", marginTop: "2rem" }}>
 <MapIcon size={44} strokeWidth={1.5} style={{ color: "var(--text-dim)", margin: "0 auto 1rem", display: "block" }} />
 <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.75rem", marginBottom: "1rem" }}>No Active Roadmap</h2>
 <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Create a roadmap to structure your learning journey.</p>
 <form action="/api/roadmaps" method="post">
 <Link href="/onboarding" className="forge-btn forge-btn-primary">Create Roadmap</Link>
 </form>
 </div>
 </div>
 );
 }

 return (
 <div>
 <div className="flex items-start justify-between gap-4 mb-6" style={{ flexWrap: "wrap" }}>
 <div>
 <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>{roadmap.title}</h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
 Started {new Date(roadmap.startedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
 </p>
 </div>
 <Link href="/dashboard/checkin" className="forge-btn forge-btn-primary">Check In Today</Link>
 </div>

 <RoadmapView roadmap={roadmap} curatedSlug={curatedSlug} weekByTaskId={weekByTaskId} />
 </div>
 );
}
