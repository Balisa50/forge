/**
 * Per-item engagement tracking for /learn/[slug]/[week].
 *
 *   GET  /api/learn/progress?slug=...&week=N
 *     → { items: ["d1-i0", "d1-i1", ...] }  — keys this user has ticked
 *
 *   POST /api/learn/progress
 *     body: { slug, week, itemKey, done }
 *     → marks a single item done (done=true) or removes it (done=false)
 *
 *   POST /api/learn/progress  (bulk)
 *     body: { slug, week, items: Record<string, boolean> }
 *     → upserts many items at once; used when migrating from localStorage
 *
 * Replaces the previous localStorage-only flow so the server can gate
 * check-in submissions on actual engagement.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const weekParam = url.searchParams.get("week");
  if (!slug || !weekParam) return NextResponse.json({ error: "slug + week required" }, { status: 400 });
  const week = parseInt(weekParam, 10);
  if (Number.isNaN(week)) return NextResponse.json({ error: "week must be a number" }, { status: 400 });

  const rows = await prisma.learningProgress.findMany({
    where: { userId: session.user.id, slug, week },
    select: { itemKey: true },
  });
  return NextResponse.json({ items: rows.map((r) => r.itemKey) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const slug: string | undefined = body.slug;
  const week: number | undefined = typeof body.week === "number" ? body.week : undefined;
  if (!slug || typeof week !== "number") {
    return NextResponse.json({ error: "slug + week required" }, { status: 400 });
  }

  // Bulk path — migrate a whole record from localStorage in one shot.
  if (body.items && typeof body.items === "object") {
    const entries = Object.entries(body.items as Record<string, boolean>);
    const ops = entries.map(([itemKey, done]) =>
      done
        ? prisma.learningProgress.upsert({
            where: { userId_slug_week_itemKey: { userId, slug, week, itemKey } },
            update: {},
            create: { userId, slug, week, itemKey },
          })
        : prisma.learningProgress.deleteMany({
            where: { userId, slug, week, itemKey },
          })
    );
    await prisma.$transaction(ops);
    return NextResponse.json({ ok: true, synced: entries.length });
  }

  // Single-item path
  const itemKey: string | undefined = body.itemKey;
  const done: boolean = !!body.done;
  if (!itemKey) return NextResponse.json({ error: "itemKey required" }, { status: 400 });

  if (done) {
    await prisma.learningProgress.upsert({
      where: { userId_slug_week_itemKey: { userId, slug, week, itemKey } },
      update: {},
      create: { userId, slug, week, itemKey },
    });
  } else {
    await prisma.learningProgress.deleteMany({
      where: { userId, slug, week, itemKey },
    });
  }
  return NextResponse.json({ ok: true });
}
