/**
 * POST /api/mentor/release-bulk
 *
 * Release a week to several mentees in one click. For each mentee, the server
 * figures out the NEXT locked-and-unreleased week (lowest sortOrder, status
 * locked, no releasedAt) and releases that one. The mentor sets ONE shared
 * deadline + ONE shared note that applies to everyone.
 *
 * Body: {
 * menteeIds: string[],
 * deadlineAt: string (ISO),
 * note?: string,
 * weekNumber?: number // optional override: release this specific week
 * // to everyone instead of "their next". Useful
 * // when re-releasing a week across a cohort.
 * }
 *
 * Returns: {
 * released: { menteeId, menteeName, weekTitle, weekNumber }[],
 * skipped: { menteeId, menteeName, reason }[]
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";

function parseWeekNumber(title: string): number | null {
 const m = title.match(/^Week\s+(\d+)\s*[:\-]/i);
 return m ? parseInt(m[1], 10) : null;
}

export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }
 const mentorId = session.user.id;

 const body = await req.json().catch(() => ({}));
 const menteeIds: string[] = Array.isArray(body.menteeIds) ? body.menteeIds : [];
 const deadlineRaw: string | undefined = body.deadlineAt;
 const note: string | undefined = body.note?.trim() || undefined;
 const weekNumber: number | undefined =
 typeof body.weekNumber === "number" && Number.isFinite(body.weekNumber)
 ? body.weekNumber
 : undefined;

 if (!menteeIds.length) {
 return NextResponse.json({ error: "Pick at least one mentee" }, { status: 400 });
 }
 if (!deadlineRaw) {
 return NextResponse.json({ error: "Deadline required" }, { status: 400 });
 }
 const deadline = new Date(deadlineRaw);
 if (Number.isNaN(deadline.getTime()) || deadline.getTime() <= Date.now()) {
 return NextResponse.json({ error: "Deadline must be a future date" }, { status: 400 });
 }

 // Validate that every menteeId is actually a mentee of THIS mentor.
 const links = await prisma.mentorLink.findMany({
 where: { mentorId, menteeId: { in: menteeIds }, isActive: true },
 select: { menteeId: true, mentee: { select: { name: true, email: true } } },
 });
 const okMenteeIds = new Set(links.map((l) => l.menteeId));
 if (okMenteeIds.size === 0) {
 return NextResponse.json({ error: "None of those mentees are linked to you" }, { status: 403 });
 }
 const nameById = new Map(links.map((l) => [l.menteeId, l.mentee.name ?? l.mentee.email]));

 const released: Array<{ menteeId: string; menteeName: string; weekTitle: string; weekNumber: number | null }> = [];
 const skipped: Array<{ menteeId: string; menteeName: string; reason: string }> = [];

 for (const menteeId of menteeIds) {
 if (!okMenteeIds.has(menteeId)) {
 skipped.push({ menteeId, menteeName: nameById.get(menteeId) ?? menteeId, reason: "Not your mentee" });
 continue;
 }
 const menteeName = nameById.get(menteeId) ?? menteeId;

 // Find this mentee's target task.
 // If weekNumber was explicitly passed: find by title "Week N:".
 // Otherwise: find the lowest sortOrder task that is still locked AND unreleased.
 let task;
 if (weekNumber !== undefined) {
 task = await prisma.task.findFirst({
 where: {
 phase: { track: { roadmap: { userId: menteeId, isActive: true } } },
 title: { startsWith: `Week ${weekNumber}:` },
 },
 select: { id: true, title: true, status: true, releasedAt: true },
 });
 } else {
 const candidates = await prisma.task.findMany({
 where: {
 phase: { track: { roadmap: { userId: menteeId, isActive: true } } },
 status: "locked",
 releasedAt: null,
 },
 orderBy: [{ phase: { sortOrder: "asc" } }, { sortOrder: "asc" }],
 take: 1,
 select: { id: true, title: true, status: true, releasedAt: true },
 });
 task = candidates[0];
 }

 if (!task) {
 skipped.push({
 menteeId,
 menteeName,
 reason: weekNumber !== undefined
 ? `Week ${weekNumber} not found in their roadmap`
 : "No locked-and-unreleased weeks left",
 });
 continue;
 }
 if (task.releasedAt && weekNumber === undefined) {
 // Shouldn't happen with the filter above, but defensive
 skipped.push({ menteeId, menteeName, reason: "Already released" });
 continue;
 }

 const taskWeekNumber = parseWeekNumber(task.title);

 // Apply the release + log + (optional) custom note - same transaction shape
 // as the single-mentee PATCH /api/mentor/tasks/[id] endpoint so behavior
 // stays consistent.
 const txOps: Promise<unknown>[] = [];
 txOps.push(
 prisma.task.update({
 where: { id: task.id },
 data: {
 status: "available",
 deadline,
 releasedAt: new Date(),
 releasedBy: mentorId,
 closedAt: null,
 },
 }),
 );
 txOps.push(
 prisma.mentorComment.create({
 data: {
 taskId: task.id,
 mentorId,
 menteeId,
 authorRole: "mentor",
 kind: "action_log",
 body: `Mentor released this week. Deadline ${deadline.toLocaleDateString()} - get it done before then.`,
 },
 }),
 );
 if (note) {
 txOps.push(
 prisma.mentorComment.create({
 data: {
 taskId: task.id,
 mentorId,
 menteeId,
 authorRole: "mentor",
 kind: "note",
 body: note,
 },
 }),
 );
 }
 await prisma.$transaction(txOps as never);

 void sendNotification("mentor-action", {
 recipientId: menteeId,
 actorId: mentorId,
 taskTitle: task.title,
 payload: { action: "release", deadlineAt: deadline.toISOString(), bulk: true },
 });

 released.push({ menteeId, menteeName, weekTitle: task.title, weekNumber: taskWeekNumber });
 }

 return NextResponse.json({ released, skipped });
}
