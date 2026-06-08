/**
 * PUT /api/mentor/tasks/:id/content
 *
 * One endpoint for all of a mentor's per-week content edits. It writes to the
 * mentee's Task ROW (not the shared roadmap JSON — that is read-only on Vercel
 * and shared across every student on the track). Per-mentee, production-safe.
 *
 * Body (all optional — only the provided keys change):
 *   Structured detail sections (written back into Task.detail via the serializer):
 *     context   string         — the week brief / context paragraph
 *     topics    string[]       — "Topics to study"
 *     tasks     string[]       — "Tasks & deliverables"
 *     project   string         — "Real-world project"
 *     questions string[]       — mastery checkpoints (questions)
 *     exercises string[]       — mastery checkpoints (exercises)
 *   First-class Task fields:
 *     why            string|null
 *     milestone      string|null
 *     estimatedHours number|null
 *     resources      string[]   — curated resources ("Title — URL (note)")
 *
 * Auth: caller must be the active mentor of the mentee who owns the task
 * (task → phase → track → roadmap.userId).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTaskDetail, serializeTaskDetail, type ParsedTaskDetail } from "@/lib/parse-task-detail";

async function authorize(mentorId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId },
    select: {
      id: true, detail: true,
      phase: { select: { track: { select: { roadmap: { select: { userId: true } } } } } },
    },
  });
  if (!task) return { error: "Task not found", status: 404 as const };
  const menteeId = task.phase.track.roadmap.userId;
  const link = await prisma.mentorLink.findFirst({
    where: { mentorId, menteeId, isActive: true },
    select: { id: true },
  });
  if (!link) return { error: "Not your mentee", status: 403 as const };
  return { task };
}

/** Coerce an incoming value to a clean string[] (drops empties), or undefined. */
function strArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.map((x) => (typeof x === "string" ? x : String(x ?? ""))).map((s) => s.trim()).filter(Boolean);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: taskId } = await params;

  const res = await authorize(session.user.id, taskId);
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.status });

  const body = await req.json().catch(() => ({} as Record<string, unknown>));

  // Rebuild the detail blob from its parsed sections, overlaying any provided ones.
  const parsed: ParsedTaskDetail = parseTaskDetail(res.task.detail ?? "");
  let detailTouched = false;
  if (typeof body.context === "string") { parsed.context = body.context.trim(); detailTouched = true; }
  if (typeof body.project === "string") { parsed.project = body.project.trim(); detailTouched = true; }
  for (const key of ["topics", "tasks", "questions", "exercises"] as const) {
    const arr = strArray(body[key]);
    if (arr) { parsed[key] = arr; detailTouched = true; }
  }

  const data: Record<string, unknown> = {};
  if (detailTouched) data.detail = serializeTaskDetail(parsed);

  if ("why" in body) data.why = typeof body.why === "string" && body.why.trim() ? body.why.trim() : null;
  if ("milestone" in body) data.milestone = typeof body.milestone === "string" && body.milestone.trim() ? body.milestone.trim() : null;
  if ("estimatedHours" in body) {
    const n = Number(body.estimatedHours);
    data.estimatedHours = body.estimatedHours === null || Number.isNaN(n) ? null : n;
  }
  const resources = strArray(body.resources);
  if (resources) data.resources = resources;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data,
    select: {
      detail: true, why: true, milestone: true, estimatedHours: true, resources: true,
    },
  });

  return NextResponse.json({ ok: true, task: updated, detail: parseTaskDetail(updated.detail ?? "") });
}
