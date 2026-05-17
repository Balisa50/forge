import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyProjectUrl } from "@/lib/verify-url";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const formData = await req.formData();
  const roadmapId = formData.get("roadmapId") as string;
  const trackId = formData.get("trackId") as string;
  const taskId = formData.get("taskId") as string;
  const description = formData.get("description") as string;
  const projectUrl = (formData.get("projectUrl") as string | null)?.trim() || null;
  const screenshotFile = formData.get("screenshot") as File | null;

  if (!roadmapId || !trackId || !taskId || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (description.trim().length < 50) {
    return NextResponse.json({ error: "Description too short (min 50 characters)" }, { status: 400 });
  }

  // The contract requires proof: either a verifiable URL (live repo / deploy)
  // OR a screenshot. If a URL is supplied, we verify it before allowing the
  // check-in to start. This is what "Submit Real Proof" promises.
  if (!projectUrl && !screenshotFile) {
    return NextResponse.json({ error: "Submit proof: a GitHub repo, a deployed URL, or a screenshot." }, { status: 400 });
  }

  if (projectUrl) {
    const result = await verifyProjectUrl(projectUrl);
    if (!result.verified) {
      return NextResponse.json({ error: result.error ?? "Couldn't verify that URL." }, { status: 400 });
    }
  }

  // Verify ownership
  const roadmap = await prisma.roadmap.findFirst({
    where: { id: roadmapId, userId },
  });
  if (!roadmap) return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });

  // Check duplicate today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await prisma.checkin.findFirst({
    where: { userId, roadmapId, createdAt: { gte: today, lt: tomorrow }, status: "passed" },
  });
  if (existing) {
    return NextResponse.json({ error: "Already checked in successfully today" }, { status: 409 });
  }

  // Process evidence. URL evidence is preferred (and already verified above);
  // a screenshot is stored as a fallback.
  let evidenceUrl: string | null = projectUrl;
  let evidenceType = projectUrl ? "url" : "screenshot";
  let evidenceData: Record<string, unknown> | null = null;

  if (screenshotFile) {
    const bytes = await screenshotFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = screenshotFile.type || "image/png";
    if (!evidenceUrl) evidenceUrl = `data:${mimeType};base64,${base64.slice(0, 100)}...`;
    evidenceData = {
      filename: screenshotFile.name,
      size: screenshotFile.size,
      type: screenshotFile.type,
      dataUrl: `data:${mimeType};base64,${base64}`,
    };
  }

  // Verify task belongs to this roadmap/track
  const task = await prisma.task.findFirst({
    where: { id: taskId, phase: { trackId, track: { roadmapId } } },
  });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  // Create check-in record
  const checkin = await prisma.checkin.create({
    data: {
      userId,
      roadmapId,
      trackId,
      taskId,
      description,
      evidenceType,
      evidenceUrl,
      evidenceData: evidenceData as object,
      status: "failed", // Will update to "passed" when interrogation passes
    },
  });

  // Create interrogation record
  const interrogation = await prisma.interrogation.create({
    data: {
      checkinId: checkin.id,
      transcript: [],
    },
  });

  // Update task status to in_progress
  await prisma.task.update({
    where: { id: taskId },
    data: { status: "in_progress" },
  });

  return NextResponse.json({
    checkinId: checkin.id,
    interrogationId: interrogation.id,
  }, { status: 201 });
}
