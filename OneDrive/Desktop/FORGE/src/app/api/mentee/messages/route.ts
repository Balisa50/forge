/**
 * Mentee-side endpoints for the two-way thread.
 *
 * POST /api/mentee/messages
 * Body: { taskId, body, kind? }
 * kind defaults to "note", set "request_unlock" when the mentee
 * wants their mentor to unlock the next step.
 *
 * The mentee can only post on a task they own that has an active
 * MentorLink with at least one mentor.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";

export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const menteeId = session.user.id;

 const body = await req.json().catch(() => ({}));
 const taskId = body.taskId as string | undefined;
 const text = (body.body as string | undefined)?.trim();
 const kind = (body.kind as string | undefined) ?? "note";

 if (!taskId || !text) {
 return NextResponse.json({ error: "taskId and body required" }, { status: 400 });
 }
 if (kind !== "note" && kind !== "request_unlock") {
 return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
 }
 if (text.length > 4000) {
 return NextResponse.json({ error: "Message too long" }, { status: 400 });
 }

 // Task must belong to this mentee
 const task = await prisma.task.findFirst({
 where: { id: taskId, phase: { track: { roadmap: { userId: menteeId } } } },
 select: { id: true, title: true },
 });
 if (!task) return NextResponse.json({ error: "Task not yours" }, { status: 400 });

 // Find an active mentor (first one, most users have at most one)
 const link = await prisma.mentorLink.findFirst({
 where: { menteeId, isActive: true },
 select: { mentorId: true },
 });
 if (!link) {
 return NextResponse.json({ error: "You don't have an active mentor yet" }, { status: 400 });
 }

 const message = await prisma.mentorComment.create({
 data: {
 taskId,
 mentorId: link.mentorId,
 menteeId,
 authorRole: "mentee",
 kind,
 body: text,
 },
 select: { id: true, body: true, createdAt: true, kind: true, authorRole: true },
 });

 // Best-effort notify mentor
 void sendNotification(kind === "request_unlock" ? "mentee-requested-unlock" : "mentee-replied", {
 recipientId: link.mentorId,
 actorId: menteeId,
 taskTitle: task.title,
 payload: { body: text },
 });

 return NextResponse.json({ message }, { status: 201 });
}
