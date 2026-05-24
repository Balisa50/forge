/**
 * POST /api/apply  - public learning application.
 *
 * Anyone interested in FORGE applies here. A mentor reviews it later and
 * either approves (generating a name-locked invite code) or rejects it.
 * No auth - this is the front door.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const applicantName = (body.name ?? "").toString().trim();
  const applicantEmail = (body.email ?? "").toString().trim().toLowerCase();
  const trackSlug = body.trackSlug ? body.trackSlug.toString().trim() : null;
  const motivation = (body.motivation ?? "").toString().trim();
  const commitment = body.commitment ? body.commitment.toString().trim() : null;
  const mentorId   = body.mentorId ? body.mentorId.toString().trim() : null;

  if (applicantName.length < 2) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (motivation.length < 80) {
    return NextResponse.json(
      { error: "Tell us why you want this. Really. Write at least a few sentences — vague answers get rejected." },
      { status: 400 },
    );
  }

  // Soft de-dupe: one pending application per email.
  const existing = await prisma.mentorApplication.findFirst({
    where: { applicantEmail, status: "pending" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You already have an application under review. Hold tight." },
      { status: 409 },
    );
  }

  await prisma.mentorApplication.create({
    data: {
      applicantName: applicantName.slice(0, 120),
      applicantEmail,
      trackSlug,
      motivation: motivation.slice(0, 2000),
      commitment: commitment?.slice(0, 300) ?? null,
      mentorId: mentorId ?? null,
    },
  });

  return NextResponse.json({ status: "received" });
}
