/**
 * POST /api/intentions
 *
 * Save the learner's implementation intention for a released week:
 * when they will work, where, and what they will do first. Set once,
 * before the week opens. Grounded in Gollwitzer's if-then planning -
 * the single highest-ROI behavioural lever in the accountability research.
 *
 * Body: { taskId, when, where, first }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const taskId: string | undefined = body.taskId;
  const when = (body.when ?? "").toString().trim();
  const where = (body.where ?? "").toString().trim();
  const first = (body.first ?? "").toString().trim();

  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }
  if (when.length < 3 || where.length < 3 || first.length < 5) {
    return NextResponse.json(
      { error: "Fill all three. A vague plan is no plan - be specific." },
      { status: 400 },
    );
  }

  // Verify the task is on the caller's own roadmap.
  const task = await prisma.task.findFirst({
    where: { id: taskId, phase: { track: { roadmap: { userId: session.user.id } } } },
    select: { id: true, intentSetAt: true },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  if (task.intentSetAt) {
    return NextResponse.json({ error: "You already locked in your plan for this week." }, { status: 409 });
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      intentWhen: when.slice(0, 300),
      intentWhere: where.slice(0, 300),
      intentFirst: first.slice(0, 500),
      intentSetAt: new Date(),
    },
  });

  return NextResponse.json({ status: "locked" });
}
