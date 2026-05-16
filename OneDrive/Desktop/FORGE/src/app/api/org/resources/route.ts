import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserOrg, STAFF_ROLES, hasRole } from "@/lib/org";

// GET — list resources for an org (optionally filtered by cohort)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserOrg(session.user.id);
  if (!membership) return NextResponse.json({ error: "Not in an organization" }, { status: 403 });

  const cohortId = req.nextUrl.searchParams.get("cohortId");

  const resources = await prisma.orgResource.findMany({
    where: {
      orgId: membership.orgId,
      ...(cohortId ? { cohortId } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ resources });
}

// POST — add a resource (staff only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserOrg(session.user.id);
  if (!membership || !hasRole(membership.role, STAFF_ROLES)) {
    return NextResponse.json({ error: "Staff access required" }, { status: 403 });
  }

  const { title, description, url, fileUrl, fileType, cohortId, sortOrder } = await req.json();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const resource = await prisma.orgResource.create({
    data: {
      orgId: membership.orgId,
      cohortId: cohortId || null,
      title: title.trim(),
      description: description?.trim() || null,
      url: url?.trim() || null,
      fileUrl: fileUrl?.trim() || null,
      fileType: fileType || null,
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json({ resource }, { status: 201 });
}

// DELETE — remove a resource
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserOrg(session.user.id);
  if (!membership || !hasRole(membership.role, STAFF_ROLES)) {
    return NextResponse.json({ error: "Staff access required" }, { status: 403 });
  }

  const { resourceId } = await req.json();
  await prisma.orgResource.delete({ where: { id: resourceId } });
  return NextResponse.json({ success: true });
}
