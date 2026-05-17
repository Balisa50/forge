import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PROFESSOR_SYSTEM_PROMPT, type GeneratedQuestion } from "@/lib/interrogation";
import { createWithFallback } from "@/lib/openai";
import type OpenAI from "openai";
import { Prisma } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: interrogationId } = await params;
  const { questionNumber } = await req.json();

  // Load interrogation + checkin + task context
  const interrogation = await prisma.interrogation.findUnique({
    where: { id: interrogationId },
    include: {
      checkin: {
        include: {
          task: { include: { phase: { include: { track: true } } } },
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!interrogation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (interrogation.checkin.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { checkin } = interrogation;
  const task = checkin.task;
  const studentName = checkin.user.name;

  // ─── MENTOR-AUTHORED PATH ─────────────────────────────────────────
  // If this mentee has an active mentor with pre-written questions on
  // this task, serve those instead of calling the AI. The interrogation
  // mode is flipped so /answer defers grading to the mentor.
  const link = await prisma.mentorLink.findFirst({
    where: { menteeId: session.user.id, isActive: true },
    orderBy: { createdAt: "asc" },
    select: { mentorId: true },
  });

  if (link) {
    const bank = await prisma.mentorQuestion.findMany({
      where: { taskId: task.id, mentorId: link.mentorId, isActive: true },
      orderBy: { position: "asc" },
      take: 10,
    });
    if (bank.length > 0) {
      // Flip the interrogation's mode if it isn't already
      if (interrogation.mode !== "mentor_async") {
        await prisma.interrogation.update({
          where: { id: interrogationId },
          data: { mode: "mentor_async", mentorReviewerId: link.mentorId },
        });
      }

      const idx = (questionNumber as number) - 1;
      const q = bank[idx];
      if (!q) {
        return NextResponse.json({ error: "No more mentor questions" }, { status: 400 });
      }

      // Cap at the size of the bank — TOTAL_QUESTIONS is dynamic in this mode.
      const existingTranscript = interrogation.transcript as Array<{ role: string; content: string }>;
      const updatedTranscript = [
        ...existingTranscript,
        {
          role: "assistant",
          content: JSON.stringify({ question: q.prompt }),
          questionNumber,
          topic: "mentor_question",
          type: "MENTOR_AUTHORED",
          mentorQuestionId: q.id,
          rubric: q.rubric ? { idealAnswer: q.idealAnswer ?? "", mustMention: [], pitfalls: [], scoring: {}, mentorRubric: q.rubric } : null,
        },
      ];

      await prisma.interrogation.update({
        where: { id: interrogationId },
        data: { transcript: updatedTranscript as unknown as Prisma.InputJsonValue },
      });

      return NextResponse.json({
        question: {
          questionNumber,
          type: "MENTOR_AUTHORED",
          question: q.prompt,
          topic: "mentor_question",
          totalQuestions: bank.length,
          mode: "mentor_async",
        },
      });
    }
  }
  // ─── END MENTOR-AUTHORED PATH ─────────────────────────────────────

  // Build evidence context from screenshot
  const evidenceData = checkin.evidenceData as Record<string, unknown> | null;
  const evidenceContext = evidenceData
    ? `Screenshot uploaded: ${evidenceData.filename ?? "screenshot"}. Size: ${evidenceData.size ?? "unknown"} bytes.`
    : "No evidence uploaded.";

  // Get previous session topics for anti-repetition
  const recentInterrogations = await prisma.interrogation.findMany({
    where: {
      checkin: {
        userId: session.user.id,
        trackId: checkin.trackId,
      },
      id: { not: interrogationId },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { transcript: true },
  });

  const previousTopics = recentInterrogations
    .flatMap((i) => {
      const t = i.transcript as Array<{ topic?: string }>;
      return t.map((q) => q.topic).filter(Boolean);
    })
    .slice(0, 20) as string[];

  const systemPrompt = PROFESSOR_SYSTEM_PROMPT(
    studentName,
    task.title,
    task.detail,
    checkin.description,
    evidenceContext,
    previousTopics,
  );

  // Build conversation history for this interrogation
  const transcript = interrogation.transcript as Array<{ role: string; content: string }>;
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...transcript.map((t) => ({ role: t.role as "user" | "assistant", content: t.content })),
    { role: "user", content: `Generate question number ${questionNumber} now. Return ONLY valid JSON.` },
  ];

  try {
    const { completion } = await createWithFallback({
      messages,
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content ?? "{}";
    const question = JSON.parse(content) as GeneratedQuestion;

    // Validate required fields
    if (!question.question || !question.rubric || !question.rubric.mustMention) {
      return NextResponse.json({ error: "Invalid question format from AI" }, { status: 500 });
    }

    // Save question + rubric to transcript (rubric stays server-side)
    const updatedTranscript = [
      ...transcript,
      {
        role: "assistant",
        content: JSON.stringify({ question: question.question }),
        questionNumber,
        topic: question.topic,
        type: question.type,
        rubric: question.rubric,
      },
    ];

    await prisma.interrogation.update({
      where: { id: interrogationId },
      data: {
        transcript: updatedTranscript as unknown as Prisma.InputJsonValue,
        tokensUsed: { increment: completion.usage?.total_tokens ?? 0 },
      },
    });

    // Return question WITHOUT the rubric — client never sees it
    return NextResponse.json({
      question: {
        questionNumber: question.questionNumber,
        type: question.type,
        question: question.question,
        topic: question.topic,
      },
    });
  } catch (err) {
    console.error("OpenAI error:", err);
    return NextResponse.json({ error: "AI service error" }, { status: 503 });
  }
}
