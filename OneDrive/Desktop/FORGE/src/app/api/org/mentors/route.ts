import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserOrg, STAFF_ROLES, hasRole } from "@/lib/org";

// GET, list all mentor-mentee pairs in the org
export async function GET() {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const membership = await getUserOrg(session.user.id);
 if (!membership) return NextResponse.json({ error: "Not in an organization" }, { status: 403 });

 const links = await prisma.mentorLink.findMany({
 where: { orgId: membership.orgId, isActive: true },
 include: {
 mentor: { select: { id: true, name: true, email: true, image: true } },
 mentee: { select: { id: true, name: true, email: true, image: true, integrityScore: true } },
 },
 orderBy: { createdAt: "desc" },
 });

 return NextResponse.json({ links });
}

// POST, pair a mentor with a mentee (staff only)
export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const membership = await getUserOrg(session.user.id);
 if (!membership || !hasRole(membership.role, STAFF_ROLES)) {
 return NextResponse.json({ error: "Staff access required" }, { status: 403 });
 }

 const { mentorId, menteeId, note } = await req.json();
 if (!mentorId || !menteeId) return NextResponse.json({ error: "Mentor ID and Mentee ID required" }, { status: 400 });
 if (mentorId === menteeId) return NextResponse.json({ error: "Cannot mentor yourself" }, { status: 400 });

 // Verify both users are in the org
 const [mentorMember, menteeMember] = await Promise.all([
 prisma.orgMembership.findFirst({ where: { userId: mentorId, orgId: membership.orgId } }),
 prisma.orgMembership.findFirst({ where: { userId: menteeId, orgId: membership.orgId } }),
 ]);

 if (!mentorMember || !menteeMember) {
 return NextResponse.json({ error: "Both users must be in the organization" }, { status: 400 });
 }

 const link = await prisma.mentorLink.upsert({
 where: { mentorId_menteeId: { mentorId, menteeId } },
 update: { isActive: true, note: note?.trim() || null },
 create: {
 mentorId,
 menteeId,
 orgId: membership.orgId,
 note: note?.trim() || null,
 },
 });

 return NextResponse.json({ link }, { status: 201 });
}

// DELETE, deactivate a mentor link
export async function DELETE(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const membership = await getUserOrg(session.user.id);
 if (!membership || !hasRole(membership.role, STAFF_ROLES)) {
 return NextResponse.json({ error: "Staff access required" }, { status: 403 });
 }

 const { linkId } = await req.json();
 await prisma.mentorLink.update({
 where: { id: linkId },
 data: { isActive: false },
 });

 return NextResponse.json({ success: true });
}
