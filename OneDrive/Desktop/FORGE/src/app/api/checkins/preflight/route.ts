/**
 * GET /api/checkins/preflight?taskId=...
 *
 * Returns whether a check-in submission for this task would pass the
 * engagement gate. The CheckinForm calls this when the mentee picks a
 * task so it can disable the submit button + show exactly what's missing
 * before they ever try to submit.
 *
 * {
 * gated: true,
 * complete: false,
 * missing: 11,
 * total: 13,
 * slug: "data-analysis",
 * week: 1,
 * learnUrl: "/learn/data-analysis/1"
 * }
 *
 * gated=false for non-curated roadmaps or weeks without day-by-day content, * meaning the mentee can submit freely.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadRoadmap } from "@/lib/roadmaps";
import { curatedSlugForTitle } from "@/lib/curated-slug";
import { normalizeSubmissionConfig, type SubmissionConfig } from "@/lib/submission-types";

export async function GET(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const userId = session.user.id;

 const taskId = new URL(req.url).searchParams.get("taskId");
 if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

 const task = await prisma.task.findFirst({
 where: { id: taskId, phase: { track: { roadmap: { userId } } } },
 select: {
 title: true,
 submissionConfig: true,
 phase: { select: { track: { select: { roadmap: { select: { title: true } } } } } },
 },
 });
 if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

 // The mentor's submission requirement rides along on every response so the
 // student form can render the right fields the moment a task is picked.
 const submissionConfig = normalizeSubmissionConfig(task.submissionConfig);
 const reply = (body: Record<string, unknown> & { gated: boolean }) =>
 NextResponse.json({ submissionConfig, ...body } as { submissionConfig: SubmissionConfig } & typeof body);

 const taskTitle = task.title;
 const roadmapTitle = task.phase.track.roadmap.title;

 const m = taskTitle.match(/^Week\s+(\d+)\s*[:\-]/i);
 if (!m) return reply({ gated: false });
 const week = parseInt(m[1], 10);

 // Resolve via the shared resolver so the preflight check stays consistent
 // with the actual POST gate even when the curriculum title drifts from the
 // static client title (DevOps/Cyber/BI).
 const slug = curatedSlugForTitle(roadmapTitle);
 if (!slug) return reply({ gated: false });

 const curriculum = loadRoadmap(slug);
 if (!curriculum) return reply({ gated: false });
 const wk = curriculum.weeks.find((w) => w.number === week);
 if (!wk || !wk.days || wk.days.length === 0) return reply({ gated: false });

 const requiredKeys: string[] = [];
 for (const d of wk.days) {
 d.items.forEach((_, i) => requiredKeys.push(`d${d.number}-i${i}`));
 }
 if (requiredKeys.length === 0) return reply({ gated: false });

 const done = await prisma.learningProgress.findMany({
 where: { userId, slug, week, itemKey: { in: requiredKeys } },
 select: { itemKey: true },
 });

 return reply({
 gated: true,
 complete: done.length === requiredKeys.length,
 missing: requiredKeys.length - done.length,
 total: requiredKeys.length,
 slug,
 week,
 learnUrl: `/learn/${slug}/${week}`,
 });
}
