import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { createWithFallback } from "@/lib/openai";
import { cacheKey, getCached, setCached, type CachedRoadmap } from "@/lib/roadmap-cache";
import { getTemplate } from "@/lib/roadmap-templates";

const LEARNING_STYLE_GUIDANCE: Record<string, string> = {
  balanced: "Mix theory and building evenly.",
  hands_on: "Minimize reading. Every task ships something. Shorter explanations, bigger projects.",
  theory_first: "Front-load mental models. First task in each phase is an explainer/study task; subsequent tasks apply it.",
  spaced: "Keep tasks small (2-4h estimatedHours). Add short review/recall milestones every 2-3 tasks.",
  sprint: "Fewer, larger tasks (8-12h estimatedHours). Deeper scope per task, less context switching.",
};

// Streaming responses get 30s on Vercel Hobby (vs 10s for regular functions).
// Keep maxDuration for Pro/Enterprise plans where it can go higher.
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ALLOWED_DOMAINS = [
  "developer.mozilla.org", "react.dev", "nextjs.org", "nodejs.org", "docs.python.org",
  "pytorch.org", "tensorflow.org", "go.dev", "doc.rust-lang.org", "typescriptlang.org",
  "tailwindcss.com", "prisma.io", "git-scm.com", "docs.docker.com", "kubernetes.io",
  "flask.palletsprojects.com", "fastapi.tiangolo.com", "djangoproject.com", "vuejs.org",
  "angular.dev", "svelte.dev", "expressjs.com", "huggingface.co",
  "freecodecamp.org", "kaggle.com", "cs50.harvard.edu", "eloquentjavascript.net",
  "javascript.info", "web.dev", "learngitbranching.js.org", "flexboxfroggy.com",
  "cssgridgarden.com", "theodinproject.com", "fullstackopen.com", "exercism.org",
  "leetcode.com", "neetcode.io", "roadmap.sh", "github.com",
];

function filterResources(resources: string[]): string[] {
  return resources.filter((r) => {
    if (r.startsWith("YouTube:") || r.startsWith("Book:")) return true;
    try {
      const url = new URL(r);
      return ALLOWED_DOMAINS.some((d) => url.hostname.includes(d));
    } catch {
      return false;
    }
  });
}

function getSystemPrompt(type: "learn" | "project", learningStyle: string = "balanced") {
  const year = new Date().getFullYear();
  const styleGuidance = LEARNING_STYLE_GUIDANCE[learningStyle] ?? LEARNING_STYLE_GUIDANCE.balanced;

  if (type === "project") {
    return `You are THE FORGE — a strict but caring project manager. Break the user's project into accountable milestones.

Learning style guidance: ${styleGuidance}

Return ONLY raw JSON (no markdown, no backticks). Structure:
{"tracks":[{"title":"Track","color":"#hex","phases":[{"title":"Phase","tasks":[{"title":"Deliverable name","detail":"3-4 sentences. Be the PM they need — what to build, decisions to make, what to avoid. Specific tech stack and architecture.","why":"Why this step matters for shipping — be blunt.","milestone":"Exact demonstrable proof this is done.","estimatedHours":6,"resources":[]}]}]}]}

Rules:
- 1 track, 4 phases: Planning → Core Build → Polish → Ship. 2-3 tasks per phase (10 max total)
- Colors: #00c8ff #f59e0b #a855f7 #22c55e #ff7c3a
- Resources: EMPTY [] for project tasks
- Every milestone must be demonstrable (screenshot or demo)
- Include final "Ship It" task — deploy, README, share publicly
- Use ${year} best practices. Be opinionated.`;
  }

  return `You are THE FORGE — the best mentor in the world. You talk like a wise elder who builds things, not a textbook. Warm, direct, invested in this person's success.

Learning style guidance: ${styleGuidance}

Return ONLY raw JSON (no markdown, no backticks). Structure:
{"tracks":[{"title":"Track","color":"#hex","phases":[{"title":"Phase","tasks":[{"title":"Build X — exciting mission name","detail":"4-5 sentences. Talk directly to them. What they'll BUILD (specific project), what concepts they learn by building it, tools to use, and what they can do after. Be specific and encouraging.","why":"One punchy sentence — real-world relevance in ${year}","milestone":"Concrete proof: a working app, a repo with tests, a deployed demo","estimatedHours":6,"resources":["YouTube: Channel — Topic","https://official-docs.com/page","Book: Title by Author"]}]}]}]}

Rules:
- 1-2 tracks, 3 phases each, 3 tasks per phase (9-18 total). Colors: #00c8ff #f59e0b #a855f7 #22c55e #ff7c3a
- Every task is a BUILD mission — specific project, not "learn about X"
- Tasks must be specific: not "Build a web app" but "Build a real-time chat app with WebSockets and typing indicators"
- Each phase builds on previous. Final phase = portfolio-worthy project
- Resources (2-3 per task): ONLY these sources:
  Official docs roots (e.g. https://react.dev/learn, https://docs.python.org/3/tutorial/, https://pytorch.org/tutorials/, https://developer.mozilla.org/en-US/docs/Web/JavaScript, https://nodejs.org/en/docs, https://go.dev/doc/, https://doc.rust-lang.org/book/, https://tailwindcss.com/docs, https://nextjs.org/docs, https://huggingface.co/docs, https://docs.docker.com/get-started/, https://www.arduino.cc/reference/en/)
  Free platforms: freecodecamp.org, kaggle.com/learn, cs50.harvard.edu, theodinproject.com, fullstackopen.com, exercism.org, javascript.info, eloquentjavascript.net
  YouTube as "YouTube: Channel — Topic" (Fireship, 3Blue1Brown, Traversy Media, Corey Schafer, Andrej Karpathy, Sentdex, freeCodeCamp, Web Dev Simplified, NetworkChuck, ThePrimeagen, StatQuest)
  Books as "Book: Title by Author"
  NEVER invent URLs. NEVER use domains not listed above.
- Make this THE BEST roadmap — better than any bootcamp. Use ${year} tools.`;
}

export async function POST(req: NextRequest) {
  // Validate auth and inputs BEFORE creating the stream so we can return proper HTTP errors
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { title, mode, commitDays, type = "learn", targetDate, roadmapshId, roadmapshDescription } = body;

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return new Response(JSON.stringify({ error: "Title must be at least 3 characters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const roadmapType: "learn" | "project" = type === "project" ? "project" : "learn";
  const userId = session.user.id;

  // Return a streaming Response — Vercel Hobby gives 30s for streaming vs 10s for regular.
  // The client reads the full body with res.json() which handles streaming transparently.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(data)));

      try {
        // ── Template lookup: pre-built paths skip AI entirely ────────────
        let generated: CachedRoadmap | null = roadmapshId ? getTemplate(roadmapshId) : null;

        if (generated) {
          console.log(`[ROADMAP] Using pre-built template for: ${roadmapshId}`);
        } else {
          // Custom roadmap (no roadmapshId or no template found) → use AI
          const userRow = await prisma.user.findUnique({
            where: { id: userId },
            select: { learningStyle: true },
          });
          const learningStyle = userRow?.learningStyle ?? "balanced";

          const userPrompt = roadmapType === "project"
            ? `Break down this project into accountable milestones: "${title.trim()}"`
            : `Create the best possible learning roadmap for: "${title.trim()}"`;

          // Cache: same title + type + style → skip the AI round trip
          const ck = cacheKey(title.trim(), roadmapType, learningStyle);
          generated = getCached(ck);
          if (generated) console.log("[ROADMAP] Cache hit");

          if (!generated) {
            let raw = "";

            // ── Primary: Anthropic Claude ────────────────────────────────
            try {
              const message = await anthropic.messages.create({
                model: "claude-sonnet-4-5",
                max_tokens: 4000,
                temperature: 0.7,
                system: getSystemPrompt(roadmapType, learningStyle),
                messages: [{ role: "user", content: userPrompt }],
              });
              const firstBlock = message.content[0];
              raw = firstBlock?.type === "text" ? firstBlock.text : "";
              if (raw) console.log("[ROADMAP] Generated via Anthropic Claude");
            } catch (anthropicErr) {
              console.warn("[ROADMAP] Anthropic failed, trying OpenRouter:", (anthropicErr as Error).message);
            }

            // ── Fallback: OpenRouter ─────────────────────────────────────
            if (!raw) {
              const { completion } = await createWithFallback(
                {
                  temperature: 0.7,
                  max_tokens: 4000,
                  messages: [
                    { role: "system", content: `/no_think\n${getSystemPrompt(roadmapType, learningStyle)}` },
                    { role: "user", content: userPrompt },
                  ],
                },
                { timeoutMs: 25000 },
              );
              raw = completion.choices[0]?.message?.content ?? "";
              if (raw) console.log("[ROADMAP] Generated via OpenRouter fallback");
            }

            if (!raw) throw new Error("Empty AI response from all providers");

            // Extract JSON (handle markdown code blocks and thinking tags)
            let jsonStr = raw;
            jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/g, "");
            const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeBlockMatch) jsonStr = codeBlockMatch[1];
            const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON found in AI response");

            generated = JSON.parse(jsonMatch[0]) as CachedRoadmap;

            if (!generated.tracks?.length || !generated.tracks[0].phases?.length) {
              throw new Error("AI returned empty roadmap structure");
            }

            setCached(ck, generated);
          }
        }

        // Deactivate existing active roadmaps
        await prisma.roadmap.updateMany({
          where: { userId, isActive: true },
          data: { isActive: false },
        });

        const roadmapMode = mode ?? "daily";
        const roadmapCommitDays = commitDays ?? [0, 1, 2, 3, 4, 5, 6];

        const roadmap = await prisma.roadmap.create({
          data: {
            userId,
            title: title.trim(),
            mode: roadmapMode,
            commitDays: roadmapCommitDays,
            description: roadmapType === "project"
              ? `Project accountability roadmap: ${title.trim()}`
              : `${roadmapshId ? "roadmap.sh curated path" : "Custom learning roadmap"}: ${title.trim()}`,
            targetDate: targetDate ? new Date(targetDate) : null,
            isActive: true,
            tracks: {
              create: generated.tracks.map((track, ti) => ({
                title: track.title,
                color: track.color || "#00c8ff",
                sortOrder: ti,
                phases: {
                  create: track.phases.map((phase, pi) => ({
                    title: phase.title,
                    sortOrder: pi,
                    tasks: {
                      create: phase.tasks.map((task, tki) => ({
                        title: task.title,
                        detail: task.detail,
                        why: task.why ?? null,
                        milestone: task.milestone ?? null,
                        estimatedHours: task.estimatedHours ?? null,
                        resources: filterResources(task.resources ?? []),
                        sortOrder: tki,
                        status: ti === 0 && pi === 0 && tki === 0 ? "available" : "locked",
                      })),
                    },
                  })),
                },
              })),
            },
          },
        });

        send({ roadmapId: roadmap.id });
      } catch (e) {
        const err = e as Error & { status?: number };
        console.error("=== ROADMAP GENERATION ERROR ===");
        console.error("Message:", err?.message);
        console.error("Status:", err?.status);
        console.error("ANTHROPIC_API_KEY present:", !!process.env.ANTHROPIC_API_KEY);
        send({ error: "Failed to generate roadmap. Please try again.", debug: err?.message });
      } finally {
        controller.close();
      }
    },
  });

  // HTTP 200 + streaming body — client reads with res.json() which handles stream transparently.
  // Check both res.ok AND data.error on the client side.
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
