import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST, issue a certificate for a completed roadmap
export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { roadmapId } = await req.json();
 if (!roadmapId) return NextResponse.json({ error: "Roadmap ID required" }, { status: 400 });

 const roadmap = await prisma.roadmap.findFirst({
 where: { id: roadmapId, userId: session.user.id },
 include: {
 tracks: { include: { phases: { include: { tasks: true } } } },
 checkins: {
 include: { interrogation: { select: { overallScore: true, passed: true } } },
 },
 },
 });

 if (!roadmap) return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });

 const allTasks = roadmap.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks));
 const verified = allTasks.filter((t) => t.status === "verified").length;

 if (verified < allTasks.length) {
 return NextResponse.json({ error: `Roadmap not complete. ${verified}/${allTasks.length} tasks verified.` }, { status: 400 });
 }

 // Already issued?
 const existing = await prisma.certificate.findFirst({
 where: { userId: session.user.id, roadmapId },
 });
 if (existing) return NextResponse.json({ certificate: existing });

 const interrogations = roadmap.checkins
 .filter((c) => c.interrogation)
 .map((c) => c.interrogation!);

 const passedCount = interrogations.filter((i) => i.passed).length;
 const passRate = interrogations.length > 0 ? passedCount / interrogations.length : 0;
 const totalHours = allTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);

 const cert = await prisma.certificate.create({
 data: {
 userId: session.user.id,
 roadmapId,
 title: roadmap.title,
 totalTasks: allTasks.length,
 totalHours,
 passRate: Number(passRate.toFixed(2)),
 },
 });

 return NextResponse.json({ certificate: cert }, { status: 201 });
}

// GET, list user's certificates
export async function GET() {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const certs = await prisma.certificate.findMany({
 where: { userId: session.user.id },
 orderBy: { issuedAt: "desc" },
 });

 return NextResponse.json({ certificates: certs });
}
