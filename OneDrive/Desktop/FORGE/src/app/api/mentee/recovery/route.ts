/**
 * Mentee "I forgot my personal ID" recovery flow.
 *
 *  POST /api/mentee/recovery
 *    body: { name: string, mentorIdentifier: string }
 *  Creates a MentorComment(kind="recovery_request") on the mentor's inbox so
 *  the mentor sees the request and can one-click resend.
 *
 *  GET  /api/mentee/recovery?mentor=...
 *    Quick lookup so the mentee form can validate the mentor exists before
 *    they submit. Returns just first-name to avoid leaking accounts.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Loose name-match used in invite redeem too. */
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

async function findMentor(identifier: string) {
  const id = identifier.trim().toLowerCase();
  // Try email exact, then name fuzzy
  let mentor = await prisma.user.findFirst({
    where: { email: id, role: "mentor" },
    select: { id: true, name: true, email: true },
  });
  if (!mentor) {
    const all = await prisma.user.findMany({
      where: { role: "mentor" },
      select: { id: true, name: true, email: true },
    });
    mentor = all.find((m) => norm(m.name ?? "") === norm(identifier)) ?? null;
  }
  return mentor;
}

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("mentor");
  if (!id) return NextResponse.json({ found: false });
  const mentor = await findMentor(id);
  return NextResponse.json({ found: !!mentor, mentorFirstName: mentor?.name?.split(" ")[0] ?? null });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = (body.name as string | undefined)?.trim();
  const mentorIdentifier = (body.mentorIdentifier as string | undefined)?.trim();
  if (!name || !mentorIdentifier) {
    return NextResponse.json({ error: "Name and mentor are required" }, { status: 400 });
  }

  const mentor = await findMentor(mentorIdentifier);
  if (!mentor) {
    return NextResponse.json({ error: "Mentor not found by that name/email" }, { status: 404 });
  }

  // Find the mentee user via the mentor's active links + name match
  const links = await prisma.mentorLink.findMany({
    where: { mentorId: mentor.id, isActive: true },
    include: { mentee: { select: { id: true, name: true, personalId: true } } },
  });
  const match = links.find((l) => norm(l.mentee.name ?? "") === norm(name));
  if (!match) {
    return NextResponse.json({ error: "We couldn't find you under that mentor. Check spelling." }, { status: 404 });
  }

  // Drop a recovery request as a MentorComment so it lands in the mentor's inbox.
  // We reuse the existing MentorComment surface — no new table needed.
  // For taskId we need a placeholder — use the mentee's first task.
  const firstTask = await prisma.task.findFirst({
    where: { phase: { track: { roadmap: { userId: match.mentee.id } } } },
    select: { id: true },
    orderBy: { sortOrder: "asc" },
  });
  if (firstTask) {
    await prisma.mentorComment.create({
      data: {
        taskId: firstTask.id,
        mentorId: mentor.id,
        menteeId: match.mentee.id,
        body: `🔑 ${match.mentee.name} requested their personal ID via the forgot-code page. Personal ID on file: ${match.mentee.personalId ?? "(none — needs regeneration)"}. Send it to them privately.`,
        authorRole: "mentee",
        kind: "request_unlock", // reuse existing kind so it shows in inbox
      },
    });
  }

  return NextResponse.json({ success: true, mentorFirstName: mentor.name?.split(" ")[0] ?? null });
}
