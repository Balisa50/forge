/**
 * GET  /api/ai-mentor/latest  -> the learner's most recent UNREAD message from
 *                                The Professor (drives the dashboard pop-up).
 * POST /api/ai-mentor/latest  -> { id } marks that message read (dismiss).
 *
 * Backed by the Notification table (kind "professor-message"), so "seen" state
 * is just readAt. No feature-flag gate here: if a message exists it should show.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ message: null });

 const message = await prisma.notification.findFirst({
 where: { userId: session.user.id, kind: "professor-message", readAt: null },
 orderBy: { createdAt: "desc" },
 select: { id: true, title: true, body: true, href: true, createdAt: true },
 });
 return NextResponse.json({ message });
}

export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

 const { id } = await req.json().catch(() => ({}));
 if (!id || typeof id !== "string") return NextResponse.json({ ok: false }, { status: 400 });

 // Scoped to the caller so nobody can mark someone else's message read.
 await prisma.notification.updateMany({
 where: { id, userId: session.user.id },
 data: { readAt: new Date() },
 });
 return NextResponse.json({ ok: true });
}
