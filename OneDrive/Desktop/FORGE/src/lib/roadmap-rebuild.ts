import { prisma } from "@/lib/prisma";
import { createWithFallback } from "@/lib/openai";

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
    // Always allow YouTube channel references and book references
    if (r.startsWith("YouTube:") || r.startsWith("Book:")) return true;
    // Check URL against allowed domains
    try {
      const url = new URL(r);
      return ALLOWED_DOMAINS.some((d) => url.hostname.includes(d));
    } catch {
      return false;
    }
  });
}

/**
 * Regenerates a placeholder roadmap with AI-generated content.
 */
export async function regenerateRoadmap(roadmapId: string, title: string, userId: string) {
  const year = new Date().getFullYear();

  const { completion } = await createWithFallback({
    temperature: 0.7,
    max_tokens: 5000,
    messages: [
      {
        role: "system",
        content: `/no_think
You are THE FORGE — the best mentor. Return ONLY raw JSON (no markdown, no backticks).
{"tracks":[{"title":"Track","color":"#hex","phases":[{"title":"Phase","tasks":[{"title":"Build X — mission name","detail":"4-5 sentences. Specific project to build, mentor tone, tools, deliverable.","why":"Why it matters in ${year}","milestone":"Concrete proof","estimatedHours":6,"resources":["https://official-docs.com","YouTube: Channel — Topic"]}]}]}]}
Rules: 1-2 tracks, 3 phases, 3 tasks per phase. BUILD missions only. Resources: official doc URLs, YouTube channels by name, books. NEVER invent URLs. Colors: #00c8ff #f59e0b #a855f7 #22c55e #ff7c3a.`,
      },
      { role: "user", content: `Create the best learning roadmap for: "${title.trim()}"` },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty AI response");

  let jsonStr = raw.replace(/<think>[\s\S]*?<\/think>/g, "");
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1];
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in AI response");

  const generated = JSON.parse(jsonMatch[0]) as {
    tracks: Array<{
      title: string;
      color: string;
      phases: Array<{
        title: string;
        tasks: Array<{
          title: string;
          detail: string;
          why?: string;
          milestone?: string;
          estimatedHours?: number;
          resources?: string[];
        }>;
      }>;
    }>;
  };

  if (!generated.tracks?.length) throw new Error("AI returned empty roadmap");

  // Delete old tracks/phases/tasks
  const oldTracks = await prisma.track.findMany({
    where: { roadmapId },
    include: { phases: { select: { id: true } } },
  });
  for (const track of oldTracks) {
    for (const phase of track.phases) {
      await prisma.task.deleteMany({ where: { phaseId: phase.id } });
    }
    await prisma.phase.deleteMany({ where: { trackId: track.id } });
  }
  await prisma.track.deleteMany({ where: { roadmapId } });

  // Create AI-generated tracks with filtered resources
  for (const [ti, trackData] of generated.tracks.entries()) {
    await prisma.track.create({
      data: {
        roadmapId,
        title: trackData.title,
        color: trackData.color || "#00c8ff",
        sortOrder: ti,
        phases: {
          create: trackData.phases.map((phase, pi) => ({
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
      },
    });
  }

  await prisma.roadmap.update({
    where: { id: roadmapId },
    data: { description: `AI-generated roadmap for: ${title.trim()}` },
  });
}
