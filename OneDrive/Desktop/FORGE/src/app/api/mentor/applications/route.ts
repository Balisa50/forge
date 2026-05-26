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
import { sendApplicationApprovedEmail } from "@/lib/email";

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

/**
 * DELETE /api/mentor/applications?id=<applicationId>
 *   Permanently removes a reviewed (approved/rejected) application from the
 *   mentor's list. Pending applications cannot be deleted — reject them first.
 */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await requireMentor(session.user.id))) {
    return NextResponse.json({ error: "Mentors only" }, { status: 403 });
  }
  const mentorId = session.user.id;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Only allow deleting applications THIS mentor reviewed (or that were
  // scoped to them). Global pending applications are off-limits.
  const application = await prisma.mentorApplication.findUnique({
    where: { id },
    select: { id: true, status: true, mentorId: true, reviewedById: true },
  });
  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (application.status === "pending") {
    return NextResponse.json({ error: "Reject or approve this application before removing it" }, { status: 400 });
  }
  if (application.mentorId !== mentorId && application.reviewedById !== mentorId) {
    return NextResponse.json({ error: "Not yours to remove" }, { status: 403 });
  }

  await prisma.mentorApplication.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await requireMentor(session.user.id))) {
    return NextResponse.json({ error: "Mentors only" }, { status: 403 });
  }
  const mentorId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const action: string | undefined = body.action;

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Valid action required" }, { status: 400 });
  }

  // ── Bulk mode: ids[] ──────────────────────────────────────────────
  if (Array.isArray(body.ids) && body.ids.length > 0) {
    const ids: string[] = body.ids.slice(0, 100); // cap at 100
    const applications = await prisma.mentorApplication.findMany({
      where: { id: { in: ids }, status: "pending" },
    });

    const results: { id: string; status: string; inviteCode?: string }[] = [];

    for (const application of applications) {
      if (action === "reject") {
        await prisma.mentorApplication.update({
          where: { id: application.id },
          data: { status: "rejected", reviewedById: mentorId, reviewedAt: new Date() },
        });
        results.push({ id: application.id, status: "rejected" });
        continue;
      }

      // Approve: generate unique code + personalId
      const { code, personalId } = await generateUniqueCodePair();
      await prisma.$transaction([
        prisma.mentorInvite.create({
          data: {
            code, mentorId,
            roadmapSlug: application.trackSlug,
            label: `From application: ${application.applicantName}`,
            maxUses: 1,
            expectedName: application.applicantName,
            personalIdIssued: personalId,
          },
        }),
        prisma.mentorApplication.update({
          where: { id: application.id },
          data: { status: "approved", reviewedById: mentorId, reviewedAt: new Date(), inviteCode: code },
        }),
      ]);
      sendApplicationApprovedEmail(application.applicantEmail, application.applicantName, code).catch(() => {});
      results.push({ id: application.id, status: "approved", inviteCode: code });
    }

    return NextResponse.json({ bulk: true, results, count: results.length });
  }

  // ── Single mode: applicationId ────────────────────────────────────
  const applicationId: string | undefined = body.applicationId;
  if (!applicationId) {
    return NextResponse.json({ error: "applicationId or ids required" }, { status: 400 });
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

  const { code, personalId } = await generateUniqueCodePair();
  await prisma.$transaction([
    prisma.mentorInvite.create({
      data: {
        code, mentorId,
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

  sendApplicationApprovedEmail(application.applicantEmail, application.applicantName, code).catch(() => {});

  return NextResponse.json({
    status: "approved",
    inviteCode: code,
    personalId,
    applicantName: application.applicantName,
    applicantEmail: application.applicantEmail,
  });
}

async function generateUniqueCodePair(): Promise<{ code: string; personalId: string }> {
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
  return { code, personalId };
}
