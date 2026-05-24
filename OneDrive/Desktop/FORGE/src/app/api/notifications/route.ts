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
