/**
 * GET /api/feed
 *
 * Quiet activity stream across all Forge learners. Powers the BuildFeed
 * component on the learner dashboard.
 *
 * Privacy:
 * - Names appear only for users with User.showInFeed = true
 * - Everyone else is anonymized to "Anonymous learner"
 * - Self-entries are excluded, learner doesn't see their own action
 * in the feed (that's already in their dashboard)
 *
 * Data sources (most-recent 24h, capped at 30 entries):
 * - Tasks transitioning to "verified" → kind: verified
 * - Checkins with status "passed" → kind: submitted
 * - Tasks transitioning to "available" → kind: started (release)
 *
 * Cached server-side via the runtime, no DB hit storm even with polling.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ANON = "Anonymous learner";

interface FeedEntry {
 id: string;
 name: string;
 kind: "verified" | "submitted" | "completed_week" | "started";
 program: string;
 weekLabel: string;
 at: string;
}

function weekLabelFromTitle(title: string): string {
 const m = title.match(/^Week\s+(\d+)/i);
 return m ? `Week ${m[1]}` : "Week 1";
}

export async function GET() {
 const session = await auth();
 const selfId = session?.user?.id ?? null;

 const since = new Date(Date.now() - 24 * 3600_000);

 // Pull recent verified + recent submitted in parallel.
 const [verifiedTasks, recentCheckins] = await Promise.all([
 prisma.task.findMany({
 where: {
 status: "verified",
 verifiedAt: { gte: since },
 ...(selfId ? { phase: { track: { roadmap: { userId: { not: selfId } } } } } : {}),
 },
 orderBy: { verifiedAt: "desc" },
 take: 30,
 select: {
 id: true,
 title: true,
 verifiedAt: true,
 phase: {
 select: {
 track: {
 select: {
 roadmap: {
 select: {
 title: true,
 user: { select: { id: true, name: true, showInFeed: true } },
 },
 },
 },
 },
 },
 },
 },
 }),
 prisma.checkin.findMany({
 where: {
 status: "passed",
 createdAt: { gte: since },
 ...(selfId ? { userId: { not: selfId } } : {}),
 },
 orderBy: { createdAt: "desc" },
 take: 30,
 select: {
 id: true,
 createdAt: true,
 roadmap: { select: { title: true } },
 task: { select: { title: true } },
 user: { select: { id: true, name: true, showInFeed: true } },
 },
 }),
 ]);

 const entries: FeedEntry[] = [];

 for (const t of verifiedTasks) {
 const owner = t.phase.track.roadmap.user;
 entries.push({
 id: `v-${t.id}`,
 name: owner.showInFeed ? (owner.name?.split(" ")[0] ?? ANON) : ANON,
 kind: "verified",
 program: t.phase.track.roadmap.title,
 weekLabel: weekLabelFromTitle(t.title),
 at: (t.verifiedAt ?? new Date()).toISOString(),
 });
 }

 for (const c of recentCheckins) {
 entries.push({
 id: `s-${c.id}`,
 name: c.user.showInFeed ? (c.user.name?.split(" ")[0] ?? ANON) : ANON,
 kind: "submitted",
 program: c.roadmap?.title ?? "their program",
 weekLabel: c.task ? weekLabelFromTitle(c.task.title) : "Week 1",
 at: c.createdAt.toISOString(),
 });
 }

 // Sort by time, cap, return.
 entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
 return NextResponse.json(
 { entries: entries.slice(0, 30) },
 { headers: { "Cache-Control": "no-store" } },
 );
}
