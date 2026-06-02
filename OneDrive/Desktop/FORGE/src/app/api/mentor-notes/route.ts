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

  const [rawComments, rawResources] = await Promise.all([
    prisma.mentorComment.findMany({
      // Aggregate Notes page (no taskId) shows ONLY deliberately-pinned notes;
      // week-conversation messages + system rows are excluded so the page is a
      // clean, intentional record. A per-task request (week view) still returns
      // the full thread for context.
      where: {
        menteeId,
        hiddenByMentee: false,
        ...(taskId ? { taskId } : { kind: "note" }),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        taskId: true,
        body: true,
        createdAt: true,
        readAt: true,
        authorRole: true,
        kind: true,
        mentor: { select: { id: true, name: true, mentorDisplayName: true, image: true } },
      },
    }),
    prisma.mentorResource.findMany({
      where: { menteeId, ...(taskId ? { taskId } : {}) },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        taskId: true,
        title: true,
        url: true,
        note: true,
        createdAt: true,
        mentor: { select: { id: true, name: true, mentorDisplayName: true } },
      },
    }),
  ]);

  // Mentees see the mentor's persona name (mentorDisplayName) - never the real
  // account name. Resolve here so every consumer of this API gets the right
  // thing for free.
  const comments = rawComments.map((c) => ({
    ...c,
    mentor: { id: c.mentor.id, name: c.mentor.mentorDisplayName ?? c.mentor.name, image: c.mentor.image },
  }));
  const resources = rawResources.map((r) => ({
    ...r,
    mentor: { id: r.mentor.id, name: r.mentor.mentorDisplayName ?? r.mentor.name },
  }));

  return NextResponse.json({
    comments,
    resources,
    unreadCount: comments.filter((c) => !c.readAt && c.authorRole === "mentor").length,
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

/**
 * DELETE /api/mentor-notes?id=...
 *   Mentee-side soft-delete. Removes the note from the mentee's inbox but
 *   keeps it visible to the mentor for audit. Only the mentee themselves
 *   can hide their own notes.
 */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const result = await prisma.mentorComment.updateMany({
    where: { id, menteeId: session.user.id },
    data: { hiddenByMentee: true },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  return NextResponse.json({ hidden: true });
}

