/**
 * GET  /api/mentor/applications              - list pending applications
 * POST /api/mentor/applications              - approve or reject one
 *   Body: { applicationId, action: "approve" | "reject" }
 *
 * Approving generates a name-locked, single-use MentorInvite code scoped
 * to the applicant's chosen track. The mentor hands that code to the
 * applicant, who registers with it.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** 10-char code XXXX-XXXX, base32, no confusable chars - matches invites route. */
function makeCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return `${out.slice(0, 4)}-${out.slice(4, 8)}`;
}
function makePersonalId(): string {
  return `FORGE-${makeCode()}`;
}

async function requireMentor(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return u?.role === "mentor";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await requireMentor(session.user.id))) {
    return NextResponse.json({ error: "Mentors only" }, { status: 403 });
  }

  // Show: applications scoped to this mentor, plus unscoped global ones.
  // Global applications (mentorId = null) are visible to all mentors as a
  // shared queue — first to approve wins.
  const applications = await prisma.mentorApplication.findMany({
    where: {
      OR: [
        { mentorId: session.user.id },
        { mentorId: null },
      ],
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });
  return NextResponse.json({ applications, mentorId: session.user.id });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await requireMentor(session.user.id))) {
    return NextResponse.json({ error: "Mentors only" }, { status: 403 });
  }
  const mentorId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const applicationId: string | undefined = body.applicationId;
  const action: string | undefined = body.action;

  if (!applicationId || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "applicationId and a valid action required" }, { status: 400 });
  }

  const application = await prisma.mentorApplication.findUnique({ where: { id: applicationId } });
  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (application.status !== "pending") {
    return NextResponse.json({ error: `Already ${application.status}` }, { status: 409 });
  }

  if (action === "reject") {
    await prisma.mentorApplication.update({
      where: { id: applicationId },
      data: { status: "rejected", reviewedById: mentorId, reviewedAt: new Date() },
    });
    return NextResponse.json({ status: "rejected" });
  }

  // APPROVE: generate a name-locked, single-use invite code.
  let code = makeCode();
  for (let i = 0; i < 5; i++) {
    if (!(await prisma.mentorInvite.findUnique({ where: { code } }))) break;
    code = makeCode();
  }
  let personalId = makePersonalId();
  for (let i = 0; i < 5; i++) {
    const a = await prisma.mentorInvite.findUnique({ where: { personalIdIssued: personalId } });
    const b = await prisma.user.findUnique({ where: { personalId } });
    if (!a && !b) break;
    personalId = makePersonalId();
  }

  await prisma.$transaction([
    prisma.mentorInvite.create({
      data: {
        code,
        mentorId,
        roadmapSlug: application.trackSlug,
        label: `From application: ${application.applicantName}`,
        maxUses: 1,
        expectedName: application.applicantName,
        personalIdIssued: personalId,
      },
    }),
    prisma.mentorApplication.update({
      where: { id: applicationId },
      data: { status: "approved", reviewedById: mentorId, reviewedAt: new Date(), inviteCode: code },
    }),
  ]);

  return NextResponse.json({
    status: "approved",
    inviteCode: code,
    personalId,
    applicantName: application.applicantName,
    applicantEmail: application.applicantEmail,
  });
}
