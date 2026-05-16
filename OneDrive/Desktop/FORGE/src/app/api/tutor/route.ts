import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createWithFallback } from "@/lib/openai";

/**
 * POST /api/tutor
 *
 * "Stuck?" hint endpoint. Given a task ID, returns a Socratic nudge — NOT
 * a solution. The tutor asks clarifying questions or gives a small directional
 * hint to unblock the learner without doing the thinking for them.
 *
 * Body: { taskId: string; question?: string }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }

  const { taskId, question } = body as { taskId: string; question?: string };

  // Fetch the task — ensure it belongs to this user's roadmap
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      phase: {
        include: {
          track: {
            include: {
              roadmap: { select: { userId: true } },
            },
          },
        },
      },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  if (task.phase.track.roadmap.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const userQuestion = question?.trim() || "";

  const systemPrompt = `You are THE FORGE Tutor — a Socratic guide that helps learners get unstuck without giving away solutions. You never write code for the student. You ask probing questions and give directional hints only.

Rules:
1. NEVER give the full solution or complete code
2. Ask 1-2 clarifying questions that help the student realise what they are missing
3. Give at most one small concrete hint (a concept name, a function to look up, a pattern to consider)
4. Keep your response under 120 words
5. Speak directly to the student — use "you" language
6. If the student hasn't asked a specific question, prompt them to think about where exactly they are stuck`;

  const userContent = `Task: "${task.title}"

What it requires: ${task.detail}
${task.why ? `Why it matters: ${task.why}` : ""}

${userQuestion ? `The student says: "${userQuestion}"` : "The student is stuck and hasn't specified where."}`;

  try {
    const { completion } = await createWithFallback(
      {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.6,
        max_tokens: 200,
      },
      { timeoutMs: 20000 },
    );

    const hint = completion.choices[0]?.message?.content?.trim() ?? "Can you tell me more about where you're stuck?";
    return NextResponse.json({ hint });
  } catch (e) {
    console.error("Tutor error:", e);
    return NextResponse.json({ error: "AI unavailable — try again in a moment." }, { status: 503 });
  }
}
