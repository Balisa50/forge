/**
 * POST /api/roadmaps/from-curated
 *
 * Seeds the user's Roadmap → Track → Phase → Task hierarchy from a
 * hand-curated mastery roadmap (data/roadmaps/{slug}.json). Each week
 * of the curriculum becomes one Task, the granularity the FORGE
 * accountability engine works on.
 *
 * Body: { slug: string, commitDays?: number[], targetDate?: string }
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
 "growth-marketing": "#ec4899",
};

export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const body = await req.json().catch(() => ({}));
 const slug: string | undefined = body.slug;
 const targetDate: string | undefined = body.targetDate;

 if (!slug) {
 return NextResponse.json({ error: "Missing slug" }, { status: 400 });
 }

 const curriculum = loadRoadmap(slug);
 if (!curriculum) {
 return NextResponse.json({ error: `Roadmap '${slug}' not found` }, { status: 404 });
 }

 const groups = getPhaseGroups(curriculum.weeks);
 const trackColor = TRACK_COLOR_BY_SLUG[slug] ?? "#00c8ff";

 // Mentee detection: if user has any active MentorLink as mentee, EVERY week
 // starts locked, the mentor controls every release. Solo learners get the
 // legacy chain (W1 available, rest locked).
 const isMentee = !!(await prisma.mentorLink.findFirst({
 where: { menteeId: session.user.id, isActive: true },
 }));

 // Build the entire tree in one nested create so we get atomic insertion.
 const roadmap = await prisma.roadmap.create({
 data: {
 userId: session.user.id,
 title: curriculum.title,
 targetDate: targetDate ? new Date(targetDate) : null,
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
 // For solo learners: W1 starts available. For mentees: EVERY
 // week is locked until the mentor releases it.
 status: !isMentee && phaseIdx === 0 && weekIdx === 0 ? "available" : "locked",
 })),
 },
 })),
 },
 },
 ],
 },
 },
 include: {
 tracks: {
 include: {
 phases: { include: { tasks: true } },
 },
 },
 },
 });

 return NextResponse.json({
 roadmapId: roadmap.id,
 title: roadmap.title,
 weeks: curriculum.weeks.length,
 phases: groups.length,
 });
}
