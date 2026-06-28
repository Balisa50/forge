/**
 * POST /api/me/mark-week-complete
 *
 * Solo-learner self-verify. The user marks one of THEIR own tasks (a week)
 * complete without a mentor in the loop. Three guards:
 *
 * 1. They must own the task (task.phase.track.roadmap.userId === userId).
 * 2. They must have NO active MentorLink, if a mentor exists, this path
 * is forbidden; the mentor flow at /api/mentor/tasks/:id is the only
 * legitimate verifier.
 * 3. Idempotent, re-POSTing when the task is already verified is a no-op.
 *
 * Body: { taskId: string, evidenceUrl?: string | null }
 *
 * On success:
 * - Upserts a Checkin (one row per (userId, taskId), same invariant as
 * /api/checkins) with evidenceType="self_complete" and the optional URL.
 * - Sets Task.status = "verified", verifiedAt = now.
 * - Returns 200 with { ok: true }.
 *
 * The next week unlocks naturally because gating on the client + server reads
 * Task.status to decide what's accessible.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const userId = session.user.id;

 const body = await req.json().catch(() => ({}));
 const taskId: string | undefined = body.taskId;
 const evidenceUrlRaw = body.evidenceUrl;
 const evidenceUrl =
 typeof evidenceUrlRaw === "string" && evidenceUrlRaw.trim().length > 0
 ? evidenceUrlRaw.trim()
 : null;

 if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

 // Guard 1: task must belong to this user's roadmap.
 const task = await prisma.task.findFirst({
 where: {
 id: taskId,
 phase: { track: { roadmap: { userId } } },
 },
 select: {
 id: true,
 status: true,
 title: true,
 phase: { select: { track: { select: { id: true, roadmapId: true } } } },
 },
 });
 if (!task) return NextResponse.json({ error: "Task not yours" }, { status: 403 });

 // Guard 2: no active mentor, solo path is for solo learners.
 const hasMentor = !!(await prisma.mentorLink.findFirst({
 where: { menteeId: userId, isActive: true },
 select: { id: true },
 }));
 if (hasMentor) {
 return NextResponse.json(
 { error: "You have an active mentor, the mentor verifies your weeks. Self-complete is solo-only." },
 { status: 403 },
 );
 }

 // Guard 3: idempotent, already verified is a no-op success.
 if (task.status === "verified") {
 return NextResponse.json({ ok: true, alreadyComplete: true });
 }

 // Transactionally upsert the Checkin and flip the Task to verified.
 await prisma.$transaction(async (tx) => {
 const existing = await tx.checkin.findFirst({
 where: { userId, taskId },
 orderBy: { createdAt: "desc" },
 });
 if (existing) {
 await tx.checkin.update({
 where: { id: existing.id },
 data: {
 evidenceType: "self_complete",
 evidenceUrl,
 status: "passed",
 attemptNum: existing.attemptNum + 1,
 description: "Marked complete (solo).",
 },
 });
 } else {
 await tx.checkin.create({
 data: {
 userId,
 roadmapId: task.phase.track.roadmapId,
 trackId: task.phase.track.id,
 taskId,
 description: "Marked complete (solo).",
 evidenceType: "self_complete",
 evidenceUrl,
 status: "passed",
 },
 });
 }

 await tx.task.update({
 where: { id: taskId },
 data: {
 status: "verified",
 verifiedAt: new Date(),
 },
 });
 });

 return NextResponse.json({ ok: true });
}
