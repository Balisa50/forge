/**
 * POST /api/mentor/refresh-roadmap-details
 *
 * Re-renders the `detail`, `why`, `milestone`, and `resources` fields of
 * every Task that belongs to a roadmap owned by the caller OR by any
 * mentee linked to the caller as their mentor. Uses the current curated
 * roadmap JSON + current formatters, so changes to weekToTaskDetail (drop
 * markdown asterisks, em-dashes, etc) flow into already-seeded student
 * roadmaps without re-seeding.
 *
 * The mapping from Roadmap.title -> curated slug is title-based. If your
 * roadmap title was customised this row is skipped.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadRoadmap } from "@/lib/roadmaps";
import {
 weekToTaskDetail,
 weekToTaskMilestone,
 weekToTaskResources,
 weekToTaskWhy,
} from "@/lib/curated-roadmaps";
import { CURATED_ROADMAPS } from "@/lib/curated-roadmaps-client";

const TITLE_TO_SLUG: Record<string, string> = Object.fromEntries(
 CURATED_ROADMAPS.map((r) => [r.title, r.slug]),
);

export async function POST(_req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 // User IDs whose roadmaps we are allowed to touch: yourself + every active
 // mentee linked to you as their mentor.
 const links = await prisma.mentorLink.findMany({
 where: { mentorId: session.user.id, isActive: true },
 select: { menteeId: true },
 });
 const userIds = [session.user.id, ...links.map((l) => l.menteeId)];

 const roadmaps = await prisma.roadmap.findMany({
 where: { userId: { in: userIds } },
 include: {
 tracks: {
 include: {
 phases: {
 include: { tasks: { select: { id: true, sortOrder: true } } },
 },
 },
 },
 },
 });

 let touchedRoadmaps = 0;
 let touchedTasks = 0;
 const skipped: string[] = [];

 for (const roadmap of roadmaps) {
 const slug = TITLE_TO_SLUG[roadmap.title];
 if (!slug) {
 skipped.push(`${roadmap.title} (no slug match)`);
 continue;
 }
 const curated = loadRoadmap(slug);
 if (!curated) {
 skipped.push(`${roadmap.title} (curated JSON missing)`);
 continue;
 }
 // The Task table is flat under phases; the curated tree is week-by-week
 // under groups. Tasks were seeded in week-number order within phases, so
 // we flatten both sides and zip by index.
 const flatTasks = roadmap.tracks
 .flatMap((t) => t.phases)
 .flatMap((p) => p.tasks.sort((a, b) => a.sortOrder - b.sortOrder));
 // Walk weeks in the same order the seeder uses (getPhaseGroups preserves
 // week.number order). We don't need the group structure here, just weeks.
 const weeks = [...curated.weeks].sort((a, b) => a.number - b.number);

 const ops: Promise<unknown>[] = [];
 const pairs = Math.min(flatTasks.length, weeks.length);
 for (let i = 0; i < pairs; i++) {
 const task = flatTasks[i];
 const week = weeks[i];
 ops.push(
 prisma.task.update({
 where: { id: task.id },
 data: {
 detail: weekToTaskDetail(week),
 why: weekToTaskWhy(week),
 milestone: weekToTaskMilestone(week),
 resources: weekToTaskResources(week),
 },
 }),
 );
 }
 await Promise.all(ops);
 touchedRoadmaps++;
 touchedTasks += pairs;
 }

 return NextResponse.json({
 touchedRoadmaps,
 touchedTasks,
 skipped,
 });
}
