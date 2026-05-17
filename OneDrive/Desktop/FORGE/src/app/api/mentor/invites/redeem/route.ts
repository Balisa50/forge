/**
 * POST /api/mentor/invites/redeem
 *   body: { code: string }
 *
 * Mentee (or anyone signed in) redeems a mentor invite code. Side effects:
 *   - validates code is active, not expired, has uses left
 *   - creates a MentorLink(mentorId → menteeId)  (idempotent if already linked)
 *   - increments usesCount; deactivates if maxUses reached
 *
 * Returns the paired mentor's display info + the roadmap slug the
 * invite was scoped to (so onboarding can pre-select that roadmap).
 *
 * GET /api/mentor/invites/redeem?code=... — preview without redeeming.
 *   Useful for the onboarding form so the mentee sees who they're pairing with
 *   before they commit.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalise(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

async function findInvite(code: string) {
  return prisma.mentorInvite.findUnique({
    where: { code },
    include: { mentor: { select: { id: true, name: true, email: true, image: true } } },
  });
}

function invalidReason(invite: { isActive: boolean; expiresAt: Date | null; maxUses: number | null; usesCount: number } | null): string | null {
  if (!invite) return "Code not found";
  if (!invite.isActive) return "This code has been deactivated";
  if (invite.expiresAt && invite.expiresAt < new Date()) return "This code has expired";
  if (invite.maxUses != null && invite.usesCount >= invite.maxUses) return "This code has reached its usage limit";
  return null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const invite = await findInvite(normalise(code));
  const reason = invalidReason(invite);
  if (reason || !invite) {
    return NextResponse.json({ valid: false, error: reason ?? "Invalid code" }, { status: 200 });
  }
  return NextResponse.json({
    valid: true,
    mentor: invite.mentor,
    roadmapSlug: invite.roadmapSlug,
    label: invite.label,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const menteeId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const code = body.code ? normalise(String(body.code)) : null;
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const invite = await findInvite(code);
  const reason = invalidReason(invite);
  if (reason || !invite) {
    return NextResponse.json({ error: reason ?? "Invalid code" }, { status: 400 });
  }

  if (invite.mentorId === menteeId) {
    return NextResponse.json({ error: "You can't pair with yourself" }, { status: 400 });
  }

  // Idempotent MentorLink + usage increment
  await prisma.$transaction(async (tx) => {
    await tx.mentorLink.upsert({
      where: { mentorId_menteeId: { mentorId: invite.mentorId, menteeId } },
      update: { isActive: true },
      create: { mentorId: invite.mentorId, menteeId, isActive: true },
    });
    const newCount = invite.usesCount + 1;
    await tx.mentorInvite.update({
      where: { id: invite.id },
      data: {
        usesCount: newCount,
        isActive: invite.maxUses != null && newCount >= invite.maxUses ? false : invite.isActive,
      },
    });
  });

  return NextResponse.json({
    paired: true,
    mentor: invite.mentor,
    roadmapSlug: invite.roadmapSlug,
  });
}
