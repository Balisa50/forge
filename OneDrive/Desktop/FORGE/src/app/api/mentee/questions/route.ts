/**
 * GET /api/mentee/questions?taskId=...
 *
 * Returns the mentor's authored questions for a task the signed-in MENTEE
 * owns, so the check-in form can require answers. Prompts only — the private
 * rubric and ideal answer are never sent to the mentee.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const taskId = new URL(req.url).searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  // The task must belong to this mentee's own roadmap.
  const owns = await prisma.task.findFirst({
    where: { id: taskId, phase: { track: { roadmap: { userId: session.user.id } } } },
    select: { id: true },
  });
  if (!owns) return NextResponse.json({ questions: [] });

  const questions = await prisma.mentorQuestion.findMany({
    // publishedAt: { not: null } — drafts (publishedAt IS NULL) stay invisible
    // to the student until the mentor clicks "Send Questions to Student."
    where: { taskId, isActive: true, publishedAt: { not: null } },
    orderBy: { position: "asc" },
    select: { id: true, prompt: true, position: true },
  });

  return NextResponse.json({ questions });
}
