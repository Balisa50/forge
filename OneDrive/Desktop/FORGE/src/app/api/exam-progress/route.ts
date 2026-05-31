/**
 * Account-backed mastery progress for the actuary exam paths.
 *
 * GET  /api/exam-progress?slug=exam-p
 *   -> { progress: { [conceptId]: ConceptProgress } } for the signed-in user.
 *
 * POST /api/exam-progress
 *   Body: { slug, concepts: { [conceptId]: ConceptProgress } }
 *   Upserts each concept. Used both for a single write (one concept) and for
 *   the initial merge-push of a device's localStorage store.
 *
 * Timestamps cross the wire as epoch-ms numbers (matching the client store);
 * they're stored as DateTime and converted back on read.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUSES = new Set(["not-started", "in-progress", "mastered"]);

interface WireConcept {
  status?: string;
  best?: number;
  attempts?: number;
  box?: number;
  dueAt?: number | null;
  masteredAt?: number | null;
  lastSeen?: number | null;
}

const ms = (d: Date | null): number | null => (d ? d.getTime() : null);
const toDate = (n: unknown): Date | null =>
  typeof n === "number" && isFinite(n) ? new Date(n) : null;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const rows = await prisma.examProgress.findMany({
    where: { userId: session.user.id, slug },
  });

  const progress: Record<string, unknown> = {};
  for (const r of rows) {
    progress[r.conceptId] = {
      status: r.status,
      best: r.best,
      attempts: r.attempts,
      box: r.box,
      dueAt: ms(r.dueAt),
      masteredAt: ms(r.masteredAt),
      lastSeen: ms(r.lastSeen),
    };
  }
  return NextResponse.json({ progress });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const slug = body.slug as string | undefined;
  const concepts = body.concepts as Record<string, WireConcept> | undefined;

  if (!slug || typeof concepts !== "object" || concepts === null) {
    return NextResponse.json({ error: "slug and concepts required" }, { status: 400 });
  }

  const entries = Object.entries(concepts).slice(0, 300); // sane cap per request

  await Promise.all(
    entries.map(([conceptId, c]) => {
      const status = STATUSES.has(c.status ?? "") ? (c.status as string) : "not-started";
      const data = {
        status,
        best: typeof c.best === "number" ? Math.max(0, Math.min(1, c.best)) : 0,
        attempts: typeof c.attempts === "number" ? Math.max(0, Math.floor(c.attempts)) : 0,
        box: typeof c.box === "number" ? Math.max(0, Math.floor(c.box)) : 0,
        dueAt: toDate(c.dueAt),
        masteredAt: toDate(c.masteredAt),
        lastSeen: toDate(c.lastSeen),
      };
      return prisma.examProgress.upsert({
        where: { userId_slug_conceptId: { userId, slug, conceptId } },
        create: { userId, slug, conceptId, ...data },
        update: data,
      });
    }),
  );

  return NextResponse.json({ saved: entries.length });
}
