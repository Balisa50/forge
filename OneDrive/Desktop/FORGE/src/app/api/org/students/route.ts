import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserOrg, STAFF_ROLES, hasRole } from "@/lib/org";

// GET — get detailed student progress for the org (staff view)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserOrg(session.user.id);
  if (!membership || !hasRole(membership.role, STAFF_ROLES)) {
    return NextResponse.json({ error: "Staff access required" }, { status: 403 });
  }

  const cohortId = req.nextUrl.searchParams.get("cohortId");

  // Get all student members
  const studentMembers = await prisma.orgMembership.findMany({
    where: { orgId: membership.orgId, role: "student" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          integrityScore: true,
        },
      },
    },
  });

  // For each student, get their active roadmap progress + recent checkins
  const students = await Promise.all(
    studentMembers.map(async (m) => {
      const roadmap = await prisma.roadmap.findFirst({
        where: {
          userId: m.user.id,
          isActive: true,
          ...(cohortId ? { cohortId } : {}),
        },
        include: {
          tracks: {
            include: {
              phases: { include: { tasks: true } },
            },
          },
          checkins: {
            orderBy: { createdAt: "desc" },
            take: 7,
            include: { interrogation: { select: { passed: true, overallScore: true } } },
          },
        },
      });

      const allTasks = roadmap?.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks)) ?? [];
      const verifiedTasks = allTasks.filter((t) => t.status === "verified").length;
      const totalTasks = allTasks.length;

      // Check last checkin date
      const lastCheckin = roadmap?.checkins[0];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastCheckinDate = lastCheckin ? new Date(lastCheckin.createdAt) : null;
      if (lastCheckinDate) lastCheckinDate.setHours(0, 0, 0, 0);
      const checkedInToday = lastCheckinDate?.getTime() === today.getTime();

      return {
        user: m.user,
        membershipId: m.id,
        roadmapTitle: roadmap?.title ?? null,
        progress: totalTasks > 0 ? Math.round((verifiedTasks / totalTasks) * 100) : 0,
        verifiedTasks,
        totalTasks,
        checkedInToday,
        recentPassRate: roadmap?.checkins.length
          ? Math.round((roadmap.checkins.filter((c) => c.status === "passed").length / roadmap.checkins.length) * 100)
          : 0,
        avgScore: roadmap?.checkins.filter((c) => c.interrogation).length
          ? Number((roadmap.checkins.filter((c) => c.interrogation).reduce((s: number, c) => s + c.interrogation!.overallScore, 0) / roadmap.checkins.filter((c) => c.interrogation).length).toFixed(1))
          : 0,
        integrityScore: m.user.integrityScore,
      };
    })
  );

  // Sort by progress descending
  students.sort((a, b) => b.progress - a.progress);

  return NextResponse.json({ students });
}

// POST — enroll a student in a cohort
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getUserOrg(session.user.id);
  if (!membership || !hasRole(membership.role, STAFF_ROLES)) {
    return NextResponse.json({ error: "Staff access required" }, { status: 403 });
  }

  const { studentId, cohortId } = await req.json();
  if (!studentId || !cohortId) return NextResponse.json({ error: "Student ID and Cohort ID required" }, { status: 400 });

  const enrollment = await prisma.cohortEnrollment.upsert({
    where: { cohortId_userId: { cohortId, userId: studentId } },
    update: { dropped: false, droppedAt: null },
    create: { cohortId, userId: studentId },
  });

  return NextResponse.json({ enrollment }, { status: 201 });
}
