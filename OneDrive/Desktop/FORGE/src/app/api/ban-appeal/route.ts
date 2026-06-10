/**
 * POST /api/ban-appeal
 *
 * A suspended mentee sends ONE appeal message to their mentor.
 * - Requires an active session (they still have a JWT even when banned).
 * - The MentorLink must have bannedAt set, you cannot appeal a non-suspension.
 * - If banAppeal is already set on the link, the request is rejected, one shot only.
 * - Min 80 chars so the mentee is forced to write something substantive.
 *
 * The mentor reads the appeal in their mentee management panel.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MIN_LENGTH = 80;
const MAX_LENGTH = 1200;

export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const body = await req.json().catch(() => ({}));
 const appeal: string = (body.appeal ?? "").toString().trim();

 if (appeal.length < MIN_LENGTH) {
 return NextResponse.json(
 { error: `Appeal must be at least ${MIN_LENGTH} characters. Make it count.` },
 { status: 400 }
 );
 }
 if (appeal.length > MAX_LENGTH) {
 return NextResponse.json(
 { error: `Appeal must be under ${MAX_LENGTH} characters.` },
 { status: 400 }
 );
 }

 // Find the active suspension for this mentee.
 const link = await prisma.mentorLink.findFirst({
 where: { menteeId: session.user.id, isActive: true, bannedAt: { not: null } },
 select: { id: true, banAppeal: true },
 });

 if (!link) {
 return NextResponse.json({ error: "No active suspension found." }, { status: 404 });
 }

 // One shot, if they already sent an appeal, refuse.
 if (link.banAppeal !== null) {
 return NextResponse.json(
 { error: "You have already sent your appeal. Wait for your mentor to decide." },
 { status: 409 }
 );
 }

 await prisma.mentorLink.update({
 where: { id: link.id },
 data: { banAppeal: appeal, banAppealAt: new Date() },
 });

 return NextResponse.json({ status: "sent" });
}
