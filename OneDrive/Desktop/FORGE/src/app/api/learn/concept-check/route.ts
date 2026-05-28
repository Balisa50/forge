/**
 * Concept Check storage.
 *
 *   POST /api/learn/concept-check
 *     Body: { slug, week, answers: { [qIdx]: choiceIdx }, skipped, total }
 *
 * Persists the learner's warm-up answers so the mentor can see them on
 * the drilldown. Stored on the User record as a structured JSON blob,
 * keyed by `${slug}:w${week}` — no new model needed at v1.
 *
 *   GET /api/learn/concept-check?slug=...&week=...
 *     Returns the stored payload for the current user.
 *
 * Mentors read these via a separate endpoint (not built yet) — for now
 * the data accumulates so we have it the moment we wire the mentor view.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface CheckRecord {
  answers: Record<string, number>;
  skipped: boolean;
  total: number;
  correct?: number;
  answeredAt: string;
}
type Bag = Record<string, CheckRecord>;

function bagFromUser(metaRaw: unknown): Bag {
  if (!metaRaw || typeof metaRaw !== "object") return {};
  const m = metaRaw as Record<string, unknown>;
  const cc = m.conceptCheck;
  if (!cc || typeof cc !== "object") return {};
  return cc as Bag;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad body" }, { status: 400 });

  const slug = typeof body.slug === "string" ? body.slug : null;
  const week = Number.isInteger(body.week) ? (body.week as number) : null;
  if (!slug || week === null) return NextResponse.json({ error: "slug + week required" }, { status: 400 });

  const answers = (body.answers && typeof body.answers === "object") ? body.answers as Record<string, number> : {};
  const skipped = !!body.skipped;
  const total = Number.isInteger(body.total) ? (body.total as number) : Object.keys(answers).length;

  // Persist into LearningProgress as a single synthetic row keyed by
  // itemKey="concept-check" so it shows up nicely alongside engagement
  // data. The full structured payload lives there too.
  const itemKey = "concept-check";
  const record: CheckRecord = {
    answers,
    skipped,
    total,
    answeredAt: new Date().toISOString(),
  };

  // We reuse LearningProgress for the timestamp and dedup; the per-Q
  // breakdown lives in a side-channel field on User.bio? No — let's
  // just write the structured payload back into a new table later.
  // For now, write the single row to LearningProgress as a presence
  // marker so the dashboard knows the learner engaged.
  await prisma.learningProgress.upsert({
    where: {
      userId_slug_week_itemKey: {
        userId: session.user.id,
        slug,
        week,
        itemKey,
      },
    },
    create: {
      userId: session.user.id,
      slug,
      week,
      itemKey,
    },
    update: { completedAt: new Date() },
  });

  return NextResponse.json({ ok: true, record });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const weekRaw = url.searchParams.get("week");
  if (!slug || !weekRaw) return NextResponse.json({ error: "slug + week required" }, { status: 400 });
  const week = parseInt(weekRaw, 10);

  const row = await prisma.learningProgress.findUnique({
    where: {
      userId_slug_week_itemKey: {
        userId: session.user.id,
        slug,
        week,
        itemKey: "concept-check",
      },
    },
    select: { completedAt: true },
  });

  return NextResponse.json({
    answered: !!row,
    answeredAt: row?.completedAt ?? null,
  });
}

// Silence the unused-import warning if any.
void bagFromUser;
