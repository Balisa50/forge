/**
 * POST /api/mentor/seed-roadmap
 *
 * Mentor-initiated roadmap seeding for a specific mentee. Used when a mentee
 * joined via a non-path-scoped invite (legacy) or otherwise doesn't have a
 * roadmap yet, the mentor picks one for them. All weeks are created in
 * `locked` status; the mentor releases each one with a deadline.
 *
 * Body: { menteeId: string, slug: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadRoadmap, getPhaseGroups } from "@/lib/roadmaps";
import {
 parseCommitmentHours,
 weekToTaskDetail,
 weekToTaskMilestone,
 weekToTaskResources,
 weekToTaskWhy,
} from "@/lib/curated-roadmaps";

const TRACK_COLOR_BY_SLUG: Record<string, string> = {
 "ai-engineering": "#a855f7",
 "ml-engineering": "#6366f1",
 "full-stack-web": "#00c8ff",
 "mobile-engineering": "#ec4899",
 "devops-cloud": "#f59e0b",
 "cybersecurity": "#22c55e",
 "data-science": "#3b82f6",
 "data-analysis": "#14b8a6",
 "bi-analytics": "#f97316",
 "remote-ops": "#7c3aed",
};

export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const body = await req.json().catch(() => ({}));
 const menteeId: string | undefined = body.menteeId;
 const slug: string | undefined = body.slug;

 if (!menteeId || !slug) {
 return NextResponse.json({ error: "Missing menteeId or slug" }, { status: 400 });
 }

 // Auth: caller must be an active mentor of this mentee.
 const link = await prisma.mentorLink.findFirst({
 where: { mentorId: session.user.id, menteeId, isActive: true },
 });
 if (!link) {
 return NextResponse.json({ error: "You are not this mentee's mentor" }, { status: 403 });
 }

 // If the mentee already has an active roadmap, refuse, avoid duplicate trees.
 const existing = await prisma.roadmap.findFirst({
 where: { userId: menteeId, isActive: true },
 select: { id: true, title: true },
 });
 if (existing) {
 return NextResponse.json(
 { error: `Mentee already has an active roadmap: ${existing.title}` },
 { status: 409 },
 );
 }

 const curriculum = loadRoadmap(slug);
 if (!curriculum) {
 return NextResponse.json({ error: `Roadmap '${slug}' not found` }, { status: 404 });
 }

 const groups = getPhaseGroups(curriculum.weeks);
 const trackColor = TRACK_COLOR_BY_SLUG[slug] ?? "#00c8ff";

 const roadmap = await prisma.roadmap.create({
 data: {
 userId: menteeId,
 title: curriculum.title,
 tracks: {
 create: [
 {
 title: curriculum.title,
 color: trackColor,
 sortOrder: 0,
 phases: {
 create: groups.map((group, phaseIdx) => ({
 title: group.phase || `Phase ${phaseIdx + 1}`,
 sortOrder: phaseIdx,
 tasks: {
 create: group.weeks.map((week, weekIdx) => ({
 title: `Week ${week.number}: ${week.title}`,
 detail: weekToTaskDetail(week),
 why: weekToTaskWhy(week),
 milestone: weekToTaskMilestone(week),
 resources: weekToTaskResources(week),
 estimatedHours: parseCommitmentHours(week.commitment_hours),
 sortOrder: weekIdx,
 // Mentor-controlled: every week locked until released.
 status: "locked",
 })),
 },
 })),
 },
 },
 ],
 },
 },
 });

 // Mark onboarding done if it wasn't already, mentee shouldn't see the picker.
 await prisma.user.update({
 where: { id: menteeId },
 data: { onboardingDone: true },
 });

 return NextResponse.json({
 roadmapId: roadmap.id,
 title: roadmap.title,
 weeks: curriculum.weeks.length,
 phases: groups.length,
 });
}
