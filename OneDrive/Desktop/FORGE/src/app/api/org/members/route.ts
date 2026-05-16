import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserOrg, ADMIN_ROLES, hasRole } from "@/lib/org";

// GET — list all members of the org
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserOrg(session.user.id);
  if (!membership) return NextResponse.json({ error: "Not in an organization" }, { status: 403 });

  const members = await prisma.orgMembership.findMany({
    where: { orgId: membership.orgId },
    include: {
      user: {
        select: { id: true, name: true, email: true, integrityScore: true, image: true, createdAt: true },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json({ members });
}

// POST — invite a member by email (admins only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserOrg(session.user.id);
  if (!membership || !hasRole(membership.role, ADMIN_ROLES)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { email, role } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const validRoles = ["student", "mentor", "instructor", "admin"];
  const assignRole = validRoles.includes(role) ? role : "student";

  // Find the user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "No user with that email found. They must register first." }, { status: 404 });

  // Check seat limit
  const memberCount = await prisma.orgMembership.count({ where: { orgId: membership.orgId } });
  if (memberCount >= membership.org.maxSeats) {
    return NextResponse.json({ error: "Organization has reached its seat limit" }, { status: 400 });
  }

  // Add member
  const newMember = await prisma.orgMembership.upsert({
    where: { userId_orgId: { userId: user.id, orgId: membership.orgId } },
    update: { role: assignRole },
    create: { userId: user.id, orgId: membership.orgId, role: assignRole },
  });

  return NextResponse.json({ member: newMember }, { status: 201 });
}

// PATCH — update a member's role
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserOrg(session.user.id);
  if (!membership || !hasRole(membership.role, ADMIN_ROLES)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { memberId, role } = await req.json();
  const validRoles = ["student", "mentor", "instructor", "admin"];
  if (!validRoles.includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const updated = await prisma.orgMembership.update({
    where: { id: memberId },
    data: { role },
  });

  return NextResponse.json({ member: updated });
}

// DELETE — remove a member
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserOrg(session.user.id);
  if (!membership || !hasRole(membership.role, ADMIN_ROLES)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { memberId } = await req.json();
  await prisma.orgMembership.delete({ where: { id: memberId } });
  return NextResponse.json({ success: true });
}
