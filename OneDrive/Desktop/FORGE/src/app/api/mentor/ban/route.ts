/**
 * POST /api/mentor/ban
 *
 * Mentor suspends (or reinstates) a mentee. A suspended mentee is locked
 * out of the entire app and sees a suspension letter on login. Only the
 * mentor who set the suspension can lift it.
 *
 * Body: { menteeId: string, action: "ban" | "unban", reason?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const mentorId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const menteeId: string | undefined = body.menteeId;
  const action: string | undefined = body.action;
  const reason: string = (body.reason ?? "").toString().trim();

  if (!menteeId || (action !== "ban" && action !== "unban")) {
    return NextResponse.json({ error: "menteeId and a valid action (ban|unban) are required" }, { status: 400 });
  }
  if (action === "ban" && reason.length < 3) {
    return NextResponse.json({ error: "A reason is required to suspend a mentee" }, { status: 400 });
  }

  // Verify this is the mentor's own active mentee.
  const link = await prisma.mentorLink.findFirst({
    where: { mentorId, menteeId, isActive: true },
  });
  if (!link) {
    return NextResponse.json({ error: "Not your mentee" }, { status: 403 });
  }

  if (action === "ban") {
    await prisma.mentorLink.update({
      where: { id: link.id },
      data: { bannedAt: new Date(), banReason: reason.slice(0, 600) },
    });
    return NextResponse.json({ status: "banned", bannedAt: new Date().toISOString(), reason });
  }

  // unban
  await prisma.mentorLink.update({
    where: { id: link.id },
    data: { bannedAt: null, banReason: null },
  });
  return NextResponse.json({ status: "reinstated" });
}
