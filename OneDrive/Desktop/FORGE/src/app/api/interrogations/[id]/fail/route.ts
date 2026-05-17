import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Anti-cheat auto-fail trigger (tab switch, copy-paste, devtools, fast-pass).
 *
 * The contract says: "Integrity only goes up — no surveillance, no deductions."
 * So this route fails the interrogation + check-in BUT does NOT deduct from
 * integrityScore. We log the event for the user's own audit history.
 *
 * Integrity is earned by passing cleanly. Cheating doesn't subtract — it
 * just fails to add. That's the only honest reading of the contract.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: interrogationId } = await params;
  const { reason } = await req.json();

  const interrogation = await prisma.interrogation.findUnique({
    where: { id: interrogationId },
    include: { checkin: { select: { userId: true, id: true } } },
  });

  if (!interrogation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (interrogation.checkin.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { integrityScore: true },
  });
  const currentScore = user?.integrityScore ?? 0;

  await Promise.all([
    prisma.interrogation.update({
      where: { id: interrogationId },
      data: {
        passed: false,
        completedAt: new Date(),
        feedback: `Auto-failed: ${String(reason).replace(/_/g, " ")}`,
      },
    }),
    prisma.checkin.update({
      where: { id: interrogation.checkinId },
      data: { status: "failed" },
    }),
    // Note: integrityScore is NOT changed. Contract: "Integrity only goes up."
    prisma.integrityLog.create({
      data: {
        userId: session.user.id,
        event: reason,
        description: `Auto-fail: ${String(reason).replace(/_/g, " ")} during interrogation`,
        scoreBefore: currentScore,
        scoreAfter: currentScore,
        delta: 0,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
