/**
 * GET /api/tasks/meta?ids=t1,t2,t3
 *
 * Resolve task titles + phase + roadmap for a comma-separated list of
 * task IDs the signed-in user owns. Used by the mentee's notes view to
 * render which week each comment is on.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }
 const url = new URL(req.url);
 const idsParam = url.searchParams.get("ids") ?? "";
 const ids = idsParam.split(",").filter(Boolean).slice(0, 100);
 if (ids.length === 0) return NextResponse.json({ tasks: [] });

 const tasks = await prisma.task.findMany({
 where: {
 id: { in: ids },
 phase: { track: { roadmap: { userId: session.user.id } } },
 },
 select: {
 id: true,
 title: true,
 phase: {
 select: {
 title: true,
 track: { select: { roadmap: { select: { title: true } } } },
 },
 },
 },
 });

 return NextResponse.json({
 tasks: tasks.map((t) => ({
 id: t.id,
 title: t.title,
 phaseTitle: t.phase.title,
 roadmapTitle: t.phase.track.roadmap.title,
 })),
 });
}
