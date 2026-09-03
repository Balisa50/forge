import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BulkReleaseForm from "@/components/BulkReleaseForm";

export const dynamic = "force-dynamic";

interface MenteeRow {
 id: string;
 name: string;
 email: string;
 roadmapTitle: string | null;
 nextWeek: { number: number | null; title: string } | null;
 releasedActiveCount: number;
 totalCount: number;
}

function parseWeekNumber(title: string): number | null {
 const m = title.match(/^Week\s+(\d+)\s*[:\-]/i);
 return m ? parseInt(m[1], 10) : null;
}

export default async function BulkReleasePage() {
 const session = await auth();
 if (!session?.user?.id) redirect("/login");

 // Every active mentee + their roadmap + tasks, in one query.
 const links = await prisma.mentorLink.findMany({
 where: { mentorId: session.user.id, isActive: true },
 include: {
 mentee: {
 select: {
 id: true,
 name: true,
 email: true,
 roadmaps: {
 where: { isActive: true },
 orderBy: { createdAt: "desc" },
 take: 1,
 select: {
 title: true,
 tracks: {
 include: {
 phases: {
 orderBy: { sortOrder: "asc" },
 include: {
 tasks: {
 orderBy: { sortOrder: "asc" },
 select: { id: true, title: true, status: true, releasedAt: true, deadline: true, closedAt: true },
 },
 },
 },
 },
 },
 },
 },
 },
 },
 },
 });

 const mentees: MenteeRow[] = links.map((link) => {
 const m = link.mentee;
 const roadmap = m.roadmaps[0];
 const tasks =
 roadmap?.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks)) ?? [];
 const next =
 tasks.find((t) => t.status === "locked" && !t.releasedAt) ?? null;
 const releasedActive = tasks.filter((t) => t.releasedAt && t.status !== "verified").length;
 return {
 id: m.id,
 name: m.name ?? m.email,
 email: m.email,
 roadmapTitle: roadmap?.title ?? null,
 nextWeek: next ? { number: parseWeekNumber(next.title), title: next.title } : null,
 releasedActiveCount: releasedActive,
 totalCount: tasks.length,
 };
 });

 // Group mentees by roadmap title so the mentor can release "the next week
 // to everyone on Data Analysis" with one click.
 const byTrack = new Map<string, MenteeRow[]>();
 for (const m of mentees) {
 const key = m.roadmapTitle ?? "No roadmap yet";
 if (!byTrack.has(key)) byTrack.set(key, []);
 byTrack.get(key)!.push(m);
 }

 return (
 <div style={{ paddingBottom: "4rem" }}>
 <Link
 href="/dashboard/mentor"
 className="inline-flex items-center gap-1.5 text-xs mb-4"
 style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
 >
 <ArrowLeft size={12} /> mentor overview
 </Link>

 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", marginBottom: "0.5rem" }}>
 Release a week to multiple mentees
 </h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "1rem", lineHeight: 1.55, maxWidth: 720 }}>
 Select the mentees you want to release a week to. By default each mentee gets their NEXT unreleased
 week. One shared deadline, one shared note - no need to open each mentee separately. You can still
 open a single mentee&apos;s page if you want to send a personal note or release a specific week to just them.
 </p>

 <BulkReleaseForm tracks={Array.from(byTrack.entries()).map(([title, rows]) => ({ title, mentees: rows }))} />
 </div>
 );
}
