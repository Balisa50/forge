import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// POST: Request a respite day (planned break, no penalty)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { roadmapId } = await req.json();

  if (!roadmapId) return NextResponse.json({ error: "roadmapId required" }, { status: 400 });

  const roadmap = await prisma.roadmap.findFirst({ where: { id: roadmapId, userId } });
  if (!roadmap) return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });

  const maxRespite = 5; // 5 respite days per month

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Count respite checkins this month
  const respiteCount = await prisma.checkin.count({
    where: { userId, roadmapId, status: "respite", createdAt: { gte: monthStart, lt: monthEnd } },
  });

  if (respiteCount >= maxRespite) {
    return NextResponse.json({ error: `Maximum ${maxRespite} respite day(s) per month reached` }, { status: 429 });
  }

  // Check if already checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingToday = await prisma.checkin.findFirst({
    where: { userId, roadmapId, createdAt: { gte: today, lt: tomorrow } },
  });
  if (existingToday) {
    return NextResponse.json({ error: "Already have a check-in record today" }, { status: 409 });
  }

  // Get first available task for the checkin record
  const task = await prisma.task.findFirst({
    where: { phase: { track: { roadmapId } }, status: { in: ["available", "in_progress"] } },
    include: { phase: { include: { track: true } } },
  });

  if (!task) return NextResponse.json({ error: "No active tasks" }, { status: 400 });

  await prisma.checkin.create({
    data: {
      userId,
      roadmapId,
      trackId: task.phase.track.id,
      taskId: task.id,
      description: "Respite day — planned rest.",
      status: "respite",
    },
  });

  return NextResponse.json({
    ok: true,
    respiteUsed: respiteCount + 1,
    respiteMax: maxRespite,
  });
}

// GET: Check respite status
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roadmapId = req.nextUrl.searchParams.get("roadmapId");
  if (!roadmapId) return NextResponse.json({ error: "roadmapId required" }, { status: 400 });

  const maxRespite = 5; // 5 respite days per month

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const respiteCount = await prisma.checkin.count({
    where: { userId: session.user.id, roadmapId, status: "respite", createdAt: { gte: monthStart, lt: monthEnd } },
  });

  return NextResponse.json({ respiteUsed: respiteCount, respiteMax: maxRespite });
}
