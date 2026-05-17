/**
 * GET /api/mentor-notes        — every mentor note on the signed-in user's tasks
 * GET /api/mentor-notes?taskId — just the notes on one task
 *
 * Used by the mentee's own roadmap view to surface mentor feedback inline.
 * POST marks one note as read.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const menteeId = session.user.id;
  const url = new URL(req.url);
  const taskId = url.searchParams.get("taskId");

  const comments = await prisma.mentorComment.findMany({
    where: { menteeId, ...(taskId ? { taskId } : {}) },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      taskId: true,
      body: true,
      createdAt: true,
      readAt: true,
      mentor: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({
    comments,
    unreadCount: comments.filter((c) => !c.readAt).length,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const commentId: string | undefined = body.commentId;
  if (!commentId) {
    return NextResponse.json({ error: "commentId required" }, { status: 400 });
  }

  // Only the mentee themselves can mark their own notes as read.
  const updated = await prisma.mentorComment.updateMany({
    where: { id: commentId, menteeId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ updated: updated.count });
}
