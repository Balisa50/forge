/**
 * GET  /api/notifications        — fetch recent notifications for current user
 * PATCH /api/notifications       — mark all as read
 * PATCH /api/notifications?id=X  — mark one as read
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Best-effort prune: drop this user's already-read notifications older than
  // 30 days so the bell doesn't accumulate forever. Fire-and-forget — never
  // blocks or fails the read.
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  void prisma.notification
    .deleteMany({
      where: {
        userId: session.user.id,
        readAt: { not: null },
        createdAt: { lt: new Date(Date.now() - THIRTY_DAYS_MS) },
      },
    })
    .catch(() => {});

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, kind: true, title: true, body: true, href: true, readAt: true, createdAt: true },
  });

  const unread = notifications.filter((n) => !n.readAt).length;
  return NextResponse.json({ notifications, unread });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { readAt: new Date() },
    });
  } else {
    // mark all read
    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/notifications        — clear ALL of the user's notifications
 * DELETE /api/notifications?id=X   — dismiss one
 */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  const res = await prisma.notification.deleteMany({
    where: id
      ? { id, userId: session.user.id }
      : { userId: session.user.id },
  });
  return NextResponse.json({ deleted: res.count });
}
