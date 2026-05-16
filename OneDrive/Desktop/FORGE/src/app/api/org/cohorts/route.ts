import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserOrg, STAFF_ROLES, hasRole } from "@/lib/org";

// GET — list all cohorts
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserOrg(session.user.id);
  if (!membership) return NextResponse.json({ error: "Not in an organization" }, { status: 403 });

  const cohorts = await prisma.cohort.findMany({
    where: { orgId: membership.orgId },
    include: {
      _count: { select: { enrollments: true } },
      resources: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json({ cohorts });
}

// POST — create a new cohort (staff only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserOrg(session.user.id);
  if (!membership || !hasRole(membership.role, STAFF_ROLES)) {
    return NextResponse.json({ error: "Staff access required" }, { status: 403 });
  }

  const { name, description, startDate, deadline, roadmapTemplateId } = await req.json();
  if (!name || !startDate || !deadline) {
    return NextResponse.json({ error: "Name, start date, and deadline are required" }, { status: 400 });
  }

  const cohort = await prisma.cohort.create({
    data: {
      orgId: membership.orgId,
      name: name.trim(),
      description: description?.trim() || null,
      startDate: new Date(startDate),
      deadline: new Date(deadline),
      roadmapTemplateId: roadmapTemplateId || null,
    },
  });

  return NextResponse.json({ cohort }, { status: 201 });
}

// PATCH — update a cohort
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserOrg(session.user.id);
  if (!membership || !hasRole(membership.role, STAFF_ROLES)) {
    return NextResponse.json({ error: "Staff access required" }, { status: 403 });
  }

  const { cohortId, ...data } = await req.json();
  if (!cohortId) return NextResponse.json({ error: "Cohort ID required" }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (data.name) updateData.name = data.name.trim();
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.deadline) updateData.deadline = new Date(data.deadline);
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const cohort = await prisma.cohort.update({
    where: { id: cohortId },
    data: updateData,
  });

  return NextResponse.json({ cohort });
}
