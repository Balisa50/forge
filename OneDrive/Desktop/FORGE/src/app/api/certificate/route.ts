import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signCert } from "@/lib/cert-signature";
// POST: Generate a certificate for a completed roadmap
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const { roadmapId } = await req.json();
  if (!roadmapId) return NextResponse.json({ error: "roadmapId required" }, { status: 400 });

  // Mentored learners can't self-issue — only their mentor can release.
  // Solo learners (no active mentor link) keep the original self-issue path.
  const hasMentor = await prisma.mentorLink.findFirst({
    where: { menteeId: userId, isActive: true },
    select: { id: true },
  });
  if (hasMentor) {
    return NextResponse.json(
      { error: "Your mentor will release your certificate when you finish." },
      { status: 403 },
    );
  }

  const roadmap = await prisma.roadmap.findFirst({
    where: { id: roadmapId, userId },
    include: {
      tracks: { include: { phases: { include: { tasks: { select: { status: true, estimatedHours: true } } } } } },
      checkins: {
        where: { status: "passed" },
        include: { interrogation: { select: { overallScore: true, passed: true } } },
      },
    },
  });

  if (!roadmap) return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });

  const allTasks = roadmap.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks));
  const allVerified = allTasks.every((t) => t.status === "verified");
  if (!allVerified) {
    return NextResponse.json({ error: "All tasks must be verified to earn a certificate" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const interrogations = roadmap.checkins.filter((c) => c.interrogation).map((c) => c.interrogation!);
  const n = interrogations.length || 1;
  const avgScore = interrogations.reduce((s, x) => s + x.overallScore, 0) / n;
  const passedCount = interrogations.filter((i) => i.passed).length;
  const passRate = interrogations.length > 0 ? passedCount / interrogations.length : 0;
  const totalHours = allTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);

  const pct = avgScore * 10;
  let grade: string, gradeLabel: string;
  if (pct >= 90) { grade = "S"; gradeLabel = "FORGED IN FIRE"; }
  else if (pct >= 80) { grade = "A"; gradeLabel = "EXCEPTIONAL"; }
  else if (pct >= 70) { grade = "B"; gradeLabel = "STRONG"; }
  else if (pct >= 60) { grade = "C"; gradeLabel = "COMPETENT"; }
  else if (pct >= 50) { grade = "D"; gradeLabel = "DEVELOPING"; }
  else { grade = "P"; gradeLabel = "PASSED"; }

  const certificateData = {
    userName: user.name,
    roadmapTitle: roadmap.title,
    completedAt: new Date().toISOString(),
    startedAt: roadmap.startedAt.toISOString(),
    totalTasks: allTasks.length,
    totalCheckins: roadmap.checkins.length,
    totalHours: Math.round(totalHours),
    grade,
    gradeLabel,
    avgScore: Math.round(avgScore * 10) / 10,
    passRate: Math.round(passRate * 100),
  };

  const existing = await prisma.certificate.findFirst({ where: { userId, roadmapId } });
  if (existing) {
    return NextResponse.json({ error: "Certificate already issued for this roadmap", verifyCode: existing.verifyCode }, { status: 409 });
  }

  // Create the certificate first (assigns id, verifyCode, issuedAt), then
  // sign canonical fields with HMAC-SHA256 and store the signature back.
  const cert = await prisma.certificate.create({
    data: {
      userId,
      roadmapId,
      title: roadmap.title,
      totalTasks: allTasks.length,
      totalHours: Math.round(totalHours),
      passRate: Number(passRate.toFixed(2)),
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
    prisma.roadmap.update({
      where: { id: roadmapId },
      data: { isActive: false, description: JSON.stringify(certificateData) },
    }),
  ]);

  return NextResponse.json({ ...certificateData, id: cert.id, verifyCode: cert.verifyCode, signature }, { status: 201 });
}

// GET: Verify a certificate by code
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Verification code required" }, { status: 400 });

  const cert = await prisma.certificate.findUnique({ where: { verifyCode: code } });
  if (!cert) return NextResponse.json({ valid: false, error: "Certificate not found" }, { status: 404 });

  return NextResponse.json({ valid: true, certificate: cert });
}
