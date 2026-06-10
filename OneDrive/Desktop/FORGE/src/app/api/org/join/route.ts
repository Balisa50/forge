import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST, join an organization with an invite code
export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { inviteCode, joinAs } = await req.json();
 if (!inviteCode) return NextResponse.json({ error: "Invite code required" }, { status: 400 });

 // Check if already in an org
 const existing = await prisma.orgMembership.findFirst({
 where: { userId: session.user.id },
 });
 if (existing) return NextResponse.json({ error: "You are already in an organization" }, { status: 400 });

 // Find org by invite code
 const org = await prisma.organization.findUnique({
 where: { inviteCode },
 include: { _count: { select: { members: true } } },
 });

 if (!org) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

 // Check seat limit
 if (org._count.members >= org.maxSeats) {
 return NextResponse.json({ error: "Organization has reached its seat limit" }, { status: 400 });
 }

 // Join with specified role (default: student)
 const role = joinAs === "mentor" ? "mentor" : "student";
 const membership = await prisma.orgMembership.create({
 data: { userId: session.user.id, orgId: org.id, role },
 });

 return NextResponse.json({ org: { name: org.name, slug: org.slug }, membership }, { status: 201 });
}
