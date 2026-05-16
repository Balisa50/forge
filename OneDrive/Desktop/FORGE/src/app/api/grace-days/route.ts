import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const body = await req.json();
  const { roadmapId } = body;

  if (!roadmapId) {
    return NextResponse.json(
      { error: "roadmapId is required" },
      { status: 400 }
    );
  }

  // Verify ownership
  const roadmap = await prisma.roadmap.findFirst({
    where: { id: roadmapId, userId },
  });
  if (!roadmap) {
    return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
  }

  const graceDaysMax = 5; // 5 grace days per month

  // Count grace days used this month
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-indexed
  const currentYear = now.getFullYear();

  const graceDaysUsed = await prisma.graceDay.count({
    where: { userId, month: currentMonth, year: currentYear },
  });

  if (graceDaysUsed >= graceDaysMax) {
    return NextResponse.json(
      {
        error: "Grace day limit reached this month",
        graceDaysUsed,
        graceDaysMax,
      },
      { status: 403 }
    );
  }

  // Find an active task to attach the grace checkin to
  // Use the first in_progress or available task in the roadmap
  const task = await prisma.task.findFirst({
    where: {
      phase: { track: { roadmapId } },
      status: { in: ["in_progress", "available"] },
    },
    include: { phase: { include: { track: true } } },
    orderBy: { sortOrder: "asc" },
  });

  if (!task) {
    return NextResponse.json(
      { error: "No active task found for this roadmap" },
      { status: 400 }
    );
  }

  // Create GraceDay record and grace Checkin in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const graceDay = await tx.graceDay.create({
      data: {
        userId,
        roadmapId,
        month: currentMonth,
        year: currentYear,
      },
    });

    const checkin = await tx.checkin.create({
      data: {
        userId,
        roadmapId,
        trackId: task.phase.trackId,
        taskId: task.id,
        description: "Grace day used - streak preserved",
        status: "grace",
      },
    });

    return { graceDay, checkin };
  });

  return NextResponse.json(
    {
      graceDayId: result.graceDay.id,
      checkinId: result.checkin.id,
      graceDaysUsed: graceDaysUsed + 1,
      graceDaysMax,
    },
    { status: 201 }
  );
}
