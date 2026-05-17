/**
 * POST /api/mentor/resources
 *   Body: { taskId, menteeId, title, url, note? }
 *   Mentor pins an extra resource onto a mentee's task. Mentee sees it
 *   inline on their roadmap.
 *
 * DELETE /api/mentor/resources?id=...
 *   Mentor removes one of their own grants.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const mentorId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const { taskId, menteeId, title, url, note } = body as { taskId?: string; menteeId?: string; title?: string; url?: string; note?: string };
  if (!taskId || !menteeId || !title?.trim() || !url?.trim()) {
    return NextResponse.json({ error: "taskId, menteeId, title, url required" }, { status: 400 });
  }
  // Light URL sanity check — must look like http(s)://
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("scheme");
  } catch {
    return NextResponse.json({ error: "url must start with http(s)://" }, { status: 400 });
  }

  const link = await prisma.mentorLink.findFirst({ where: { mentorId, menteeId, isActive: true } });
  if (!link) return NextResponse.json({ error: "Not your mentee" }, { status: 403 });

  const task = await prisma.task.findFirst({
    where: { id: taskId, phase: { track: { roadmap: { userId: menteeId } } } },
    select: { id: true, title: true },
  });
  if (!task) return NextResponse.json({ error: "Task not in mentee's roadmap" }, { status: 400 });

  const resource = await prisma.mentorResource.create({
    data: { taskId, mentorId, menteeId, title: title.trim(), url: url.trim(), note: note?.trim() || null },
  });

  // Best-effort email
  void sendNotification("mentor-shared-resource", {
    recipientId: menteeId,
    actorId: mentorId,
    taskTitle: task.title,
    payload: { title: title.trim(), url: url.trim() },
  });

  return NextResponse.json({ resource }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const mentorId = session.user.id;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const deleted = await prisma.mentorResource.deleteMany({
    where: { id, mentorId },
  });
  return NextResponse.json({ deleted: deleted.count });
}
