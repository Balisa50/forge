/**
 * POST /api/mentor/mentees/:id/release-cert?roadmapId=...
 *   Mentor-only. Issues the certificate for a mentee once every task in the
 *   roadmap is verified. The mentor's persona name is baked into the cert
 *   as the signing authority (signedBy column).
 *
 * GET /api/mentor/mentees/:id/release-cert?roadmapId=...
 *   Returns { eligible, alreadyIssued, verifyCode?, missing? } so the
 *   drilldown UI can decide what state to render (preview vs release vs done).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signCert } from "@/lib/cert-signature";

async function requireMentorOf(mentorId: string, menteeId: string) {
  return prisma.mentorLink.findFirst({
    where: { mentorId, menteeId, isActive: true },
    select: { id: true },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: menteeId } = await params;

  if (!(await requireMentorOf(session.user.id, menteeId))) {
    return NextResponse.json({ error: "Not your mentee" }, { status: 403 });
  }
  const roadmapId = new URL(req.url).searchParams.get("roadmapId");
  if (!roadmapId) return NextResponse.json({ error: "roadmapId required" }, { status: 400 });

  const roadmap = await prisma.roadmap.findFirst({
    where: { id: roadmapId, userId: menteeId },
    include: {
      tracks: { include: { phases: { include: { tasks: { select: { status: true, estimatedHours: true } } } } } },
      checkins: { where: { status: "passed" }, include: { interrogation: { select: { overallScore: true, passed: true } } } },
    },
  });
  if (!roadmap) return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });

  // Mentor's persona for the preview signature line
  const mentor = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, mentorDisplayName: true },
  });
  const signedBy = mentor?.mentorDisplayName ?? mentor?.name ?? null;

  const existing = await prisma.certificate.findFirst({ where: { userId: menteeId, roadmapId } });
  if (existing) {
    return NextResponse.json({
      alreadyIssued: true,
      verifyCode: existing.verifyCode,
      eligible: false,
      title: existing.title,
      total: existing.totalTasks,
      totalHours: existing.totalHours,
      passRate: existing.passRate,
      signedBy: existing.signedBy ?? signedBy,
    });
  }

  const allTasks = roadmap.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks));
  const total = allTasks.length;
  const verified = allTasks.filter((t) => t.status === "verified").length;
  const eligible = total > 0 && verified === total;

  const interrogations = roadmap.checkins.filter((c) => c.interrogation).map((c) => c.interrogation!);
  const passedCount = interrogations.filter((i) => i.passed).length;
  const passRate = interrogations.length > 0 ? passedCount / interrogations.length : 0;
  const totalHours = allTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);

  return NextResponse.json({
    alreadyIssued: false,
    eligible,
    verified,
    total,
    title: roadmap.title,
    passRate: Number(passRate.toFixed(2)),
    totalHours: Math.round(totalHours),
    signedBy,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: menteeId } = await params;
  const mentorId = session.user.id;

  if (!(await requireMentorOf(mentorId, menteeId))) {
    return NextResponse.json({ error: "Not your mentee" }, { status: 403 });
  }

  const roadmapId = new URL(req.url).searchParams.get("roadmapId");
  if (!roadmapId) return NextResponse.json({ error: "roadmapId required" }, { status: 400 });

  const [roadmap, mentor] = await Promise.all([
    prisma.roadmap.findFirst({
      where: { id: roadmapId, userId: menteeId },
      include: {
        cohort: { select: { name: true } },
        tracks: { include: { phases: { include: { tasks: { select: { status: true, estimatedHours: true } } } } } },
        checkins: { where: { status: "passed" }, include: { interrogation: { select: { overallScore: true, passed: true } } } },
      },
    }),
    prisma.user.findUnique({ where: { id: mentorId }, select: { name: true, mentorDisplayName: true } }),
  ]);
  if (!roadmap) return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });

  const allTasks = roadmap.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks));
  const allVerified = allTasks.length > 0 && allTasks.every((t) => t.status === "verified");
  if (!allVerified) {
    return NextResponse.json({ error: "Mentee hasn't finished every week yet" }, { status: 400 });
  }

  const existing = await prisma.certificate.findFirst({ where: { userId: menteeId, roadmapId } });
  if (existing) {
    return NextResponse.json({ error: "Certificate already issued", verifyCode: existing.verifyCode }, { status: 409 });
  }

  // Accept an optional `signedBy` override in the body — this is the cursive
  // signature the mentor confirmed in the release dialog. Falls back to their
  // mentor persona (mentorDisplayName) if not supplied. Trimmed + capped.
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const customSignature = typeof body.signedBy === "string" ? body.signedBy.trim().slice(0, 60) : "";

  const interrogations = roadmap.checkins.filter((c) => c.interrogation).map((c) => c.interrogation!);
  const passedCount = interrogations.filter((i) => i.passed).length;
  const passRate = interrogations.length > 0 ? passedCount / interrogations.length : 0;
  const totalHours = allTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);
  const signedBy = customSignature || mentor?.mentorDisplayName || mentor?.name || null;

  const cert = await prisma.certificate.create({
    data: {
      userId: menteeId,
      roadmapId,
      title: roadmap.title,
      totalTasks: allTasks.length,
      totalHours: Math.round(totalHours),
      passRate: Number(passRate.toFixed(2)),
      signedBy,
      releasedByMentorId: mentorId,
      cohort: roadmap.cohort?.name ?? null,
    },
  });

  const signature = signCert({
    id: cert.id,
    userId: cert.userId,
    roadmapId: cert.roadmapId,
    title: cert.title,
    totalTasks: cert.totalTasks,
    totalHours: cert.totalHours,
    passRate: cert.passRate,
    issuedAt: cert.issuedAt,
  });

  await prisma.$transaction([
    prisma.certificate.update({ where: { id: cert.id }, data: { signature } }),
    prisma.roadmap.update({ where: { id: roadmapId }, data: { isActive: false } }),
  ]);

  return NextResponse.json({ released: true, verifyCode: cert.verifyCode, signedBy });
}
