import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createWithFallback } from "@/lib/openai";
// POST: Start a defence — either a phase defence or integrity defence
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  let body: { phaseId?: string } = {};
  try { body = await req.json(); } catch { /* empty body = integrity defence */ }

  const { phaseId } = body;

  // ─── Integrity Defence (no phaseId) ─────────────────────────────────
  if (!phaseId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { integrityScore: true },
    });

    if (!user || user.integrityScore >= 80) {
      return NextResponse.json({ error: "Integrity defence only available when score is below 80" }, { status: 400 });
    }

    // Get user's recent verified tasks to question them on
    const roadmap = await prisma.roadmap.findFirst({
      where: { userId, isActive: true },
      include: {
        tracks: {
          include: {
            phases: {
              include: { tasks: { where: { status: "verified" }, orderBy: { updatedAt: "desc" }, take: 10 } },
            },
          },
        },
      },
    });

    if (!roadmap) return NextResponse.json({ error: "No active roadmap found" }, { status: 400 });

    const verifiedTasks = roadmap.tracks.flatMap((t) =>
      t.phases.flatMap((p) => p.tasks.map((task) => ({ ...task, trackTitle: t.title, phaseTitle: p.title })))
    );

    if (verifiedTasks.length === 0) {
      return NextResponse.json({ error: "No verified tasks to defend against" }, { status: 400 });
    }

    const taskSummary = verifiedTasks.map((t) => `- [${t.trackTitle} > ${t.phaseTitle}] ${t.title}: ${t.detail}`).join("\n");

    try {
      const { completion } = await createWithFallback({
        temperature: 0.8,
        max_tokens: 4000,
        messages: [
          {
            role: "system",
            content: `You are THE PROFESSOR conducting an INTEGRITY DEFENCE. The student's integrity score has dropped below the threshold. This is their chance to prove they actually learned the material.

Generate exactly 10 MCQ questions. These should be HARDER than normal interrogations. This is a trial.

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "questions": [
    {
      "questionNumber": 1,
      "type": "APPLICATION|DEBUGGING|CONCEPTUAL_DEPTH|EDGE_CASE|SYNTHESIS",
      "question": "The question (can include code with \`\`\`lang)",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctAnswer": "A",
      "explanation": "Why this is correct and why wrong answers are wrong",
      "topic": "specific topic"
    }
  ]
}

Rules:
- Questions MUST cover material from the tasks the student has previously verified
- At least 4 questions must involve code snippets or debugging
- Include trap answers that sound correct but have subtle errors
- No softballs — this student's integrity is in question
- Mix across all their verified topics to test breadth AND depth`
          },
          { role: "user", content: `Student's verified work:\n${taskSummary}\n\nGenerate 10 integrity defence questions.` }
        ],
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error("Empty AI response");
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");

      const { questions } = JSON.parse(jsonMatch[0]);

      // Create a defence checkin + interrogation
      const firstTask = verifiedTasks[0];
      const track = roadmap.tracks[0];

      const checkin = await prisma.checkin.create({
        data: {
          userId,
          roadmapId: roadmap.id,
          trackId: track.id,
          taskId: firstTask.id,
          description: `Integrity Defence — Score: ${user.integrityScore}`,
          status: "failed",
        },
      });

      const interrogation = await prisma.interrogation.create({
        data: {
          checkinId: checkin.id,
          isDefence: true,
          transcript: questions,
        },
      });

      return NextResponse.json({
        interrogationId: interrogation.id,
        checkinId: checkin.id,
        questions,
        totalQuestions: 10,
      }, { status: 201 });
    } catch (e) {
      console.error("Integrity defence error:", e);
      return NextResponse.json({ error: "Failed to generate defence questions" }, { status: 500 });
    }
  }

  // ─── Phase Defence (with phaseId) ───────────────────────────────────
  const phase = await prisma.phase.findFirst({
    where: { id: phaseId, track: { roadmap: { userId } } },
    include: {
      tasks: { select: { id: true, title: true, detail: true, status: true } },
      track: {
        select: { id: true, title: true, roadmap: { select: { id: true, title: true } } },
      },
    },
  });

  if (!phase) return NextResponse.json({ error: "Phase not found" }, { status: 404 });

  const allVerified = phase.tasks.every((t) => t.status === "verified");
  if (!allVerified) {
    return NextResponse.json({ error: "All tasks must be verified before defending" }, { status: 400 });
  }

  const taskSummary = phase.tasks.map((t) => `- ${t.title}: ${t.detail}`).join("\n");

  try {
    const { completion } = await createWithFallback({
      temperature: 0.8,
      max_tokens: 6000,
      messages: [
        {
          role: "system",
          content: `You are THE PROFESSOR conducting a PROJECT DEFENCE. The student claims to have completed phase "${phase.title}" in track "${phase.track.title}".

Generate exactly 15 MCQ questions for this defence.

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "questions": [
    {
      "questionNumber": 1,
      "type": "conceptual|application|analysis|debugging|architecture",
      "question": "The question text (can include code blocks with \`\`\`lang)",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctAnswer": "A",
      "explanation": "Why this is correct",
      "topic": "specific topic tested"
    }
  ]
}

Rules:
- Mix question types across all 5 categories
- Questions should be harder than daily interrogation (these prove mastery)
- Include at least 3 questions with code snippets
- Cover ALL tasks in the phase
- No trick questions, but genuinely challenging`
        },
        { role: "user", content: `Tasks completed:\n${taskSummary}\n\nGenerate 15 defence questions.` }
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty AI response");
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");

    const { questions } = JSON.parse(jsonMatch[0]);

    const firstTask = phase.tasks[0];

    const checkin = await prisma.checkin.create({
      data: {
        userId,
        roadmapId: phase.track.roadmap.id,
        trackId: phase.track.id,
        taskId: firstTask.id,
        description: `Project Defence: ${phase.title}`,
        status: "failed",
      },
    });

    const interrogation = await prisma.interrogation.create({
      data: {
        checkinId: checkin.id,
        isDefence: true,
        transcript: questions,
      },
    });

    return NextResponse.json({
      interrogationId: interrogation.id,
      checkinId: checkin.id,
      questions,
      phaseTitle: phase.title,
      totalQuestions: 15,
    }, { status: 201 });
  } catch (e) {
    console.error("Phase defence error:", e);
    return NextResponse.json({ error: "Failed to generate defence questions" }, { status: 500 });
  }
}
