/**
 * POST /api/interrogations/:id/proctor
 *   Body: { kind: "snapshot" | "event", data: string | object }
 *
 * Mentee-side beacon: posts camera snapshots (base64 JPEG ~50KB each) and
 * integrity events (tab switch, fullscreen exit, paste, devtools) into
 * the interrogation transcript so the mentor (or AI) can review.
 *
 * We don't claim to prevent these — we log them. Honest proctoring.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_SNAPSHOT_BYTES = 120_000; // ~120 KB max per snapshot

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: interrogationId } = await params;
  const body = await req.json().catch(() => ({}));
  const kind = body.kind as "snapshot" | "event" | undefined;
  const data = body.data as string | Record<string, unknown> | undefined;

  if (!kind || data === undefined) {
    return NextResponse.json({ error: "kind and data required" }, { status: 400 });
  }
  if (kind === "snapshot" && typeof data === "string" && data.length > MAX_SNAPSHOT_BYTES) {
    return NextResponse.json({ error: "Snapshot too large" }, { status: 413 });
  }

  const interrogation = await prisma.interrogation.findUnique({
    where: { id: interrogationId },
    select: { id: true, transcript: true, checkin: { select: { userId: true } } },
  });
  if (!interrogation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (interrogation.checkin.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const transcript = (interrogation.transcript as Array<Record<string, unknown>>).slice();
  transcript.push({
    role: "proctor",
    kind,
    content: kind === "snapshot" ? data : "",
    event: kind === "event" ? data : undefined,
    timestamp: new Date().toISOString(),
  });

  await prisma.interrogation.update({
    where: { id: interrogationId },
    data: { transcript: transcript as unknown as object },
  });

  return NextResponse.json({ ok: true });
}
