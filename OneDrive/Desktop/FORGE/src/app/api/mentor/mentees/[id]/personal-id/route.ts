/**
 * Mentor surface for a mentee's Personal ID.
 *
 * GET /api/mentor/mentees/:id/personal-id → current Personal ID (mentor only)
 * POST /api/mentor/mentees/:id/personal-id → rotate to a fresh one
 *
 * Always defends in depth, only the mentor linked to this mentee can
 * read or rotate. We never expose Personal IDs in any other API route.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Same format the rest of the app uses: FORGE-XXXX-YYYY, base32, no confusable chars. */
function makeCode(): string {
 const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
 const bytes = randomBytes(8);
 let out = "";
 for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
 return `${out.slice(0, 4)}-${out.slice(4, 8)}`;
}
function makePersonalId(): string {
 return `FORGE-${makeCode()}`;
}

async function requireMentorOf(mentorId: string, menteeId: string): Promise<boolean> {
 const link = await prisma.mentorLink.findFirst({
 where: { mentorId, menteeId, isActive: true },
 });
 return !!link;
}

export async function GET(
 _req: NextRequest,
 { params }: { params: Promise<{ id: string }> },
) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const { id: menteeId } = await params;

 if (!(await requireMentorOf(session.user.id, menteeId))) {
 return NextResponse.json({ error: "Not your mentee" }, { status: 403 });
 }

 const mentee = await prisma.user.findUnique({
 where: { id: menteeId },
 select: { id: true, name: true, personalId: true },
 });
 if (!mentee) return NextResponse.json({ error: "Mentee not found" }, { status: 404 });

 return NextResponse.json({
 personalId: mentee.personalId,
 menteeName: mentee.name,
 });
}

export async function POST(
 _req: NextRequest,
 { params }: { params: Promise<{ id: string }> },
) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const { id: menteeId } = await params;

 if (!(await requireMentorOf(session.user.id, menteeId))) {
 return NextResponse.json({ error: "Not your mentee" }, { status: 403 });
 }

 // Generate a unique new Personal ID (retry up to 5 times in case of
 // a collision, the alphabet has ~32^8 = 1.1 trillion combinations so this
 // is mostly belt-and-suspenders).
 let newId = makePersonalId();
 for (let attempt = 0; attempt < 5; attempt++) {
 const existsUser = await prisma.user.findUnique({ where: { personalId: newId } });
 const existsInvite = await prisma.mentorInvite.findUnique({ where: { personalIdIssued: newId } });
 if (!existsUser && !existsInvite) break;
 newId = makePersonalId();
 }

 await prisma.user.update({
 where: { id: menteeId },
 data: { personalId: newId },
 });

 return NextResponse.json({
 personalId: newId,
 rotated: true,
 });
}
