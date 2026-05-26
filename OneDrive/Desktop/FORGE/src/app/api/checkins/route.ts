import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyProjectUrl } from "@/lib/verify-url";
import { type FileAttachment, MAX_TOTAL_BYTES, MAX_FILE_BYTES, getFileExtension, isAcceptedExtension } from "@/lib/submission-types";

function validateFileAttachments(files: unknown[]): { valid: FileAttachment[]; error?: string } {
  const valid: FileAttachment[] = [];
  let totalBytes = 0;

  for (const f of files) {
    if (typeof f !== "object" || f === null) continue;
    const file = f as Record<string, unknown>;

    if (
      typeof file.filename !== "string" ||
      typeof file.size !== "number" ||
      typeof file.mimeType !== "string" ||
      typeof file.extension !== "string" ||
      typeof file.dataUrl !== "string"
    ) {
      return { valid: [], error: "Malformed file attachment in request." };
    }

    const ext = getFileExtension(file.filename);
    const isSpecial = file.filename === "Dockerfile" || (file.filename as string).startsWith(".");
    if (!isAcceptedExtension(ext) && !isSpecial) {
      return { valid: [], error: `File type not accepted: ${file.filename}` };
    }

    if (file.size > MAX_FILE_BYTES) {
      return { valid: [], error: `${file.filename} exceeds the 2 MB per-file limit.` };
    }

    totalBytes += file.size as number;
    if (totalBytes > MAX_TOTAL_BYTES) {
      return { valid: [], error: "Total attachment size exceeds 3 MB." };
    }

    // Verify the dataUrl starts with "data:" — don't let arbitrary strings through
    if (!(file.dataUrl as string).startsWith("data:")) {
      return { valid: [], error: `Invalid file data for ${file.filename}.` };
    }

    valid.push({
      filename: file.filename,
      size: file.size,
      mimeType: file.mimeType,
      extension: file.extension,
      dataUrl: file.dataUrl,
    });
  }

  return { valid };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Accept either JSON (current CheckinForm) or multipart formData (legacy screenshot path).
  const contentType = req.headers.get("content-type") ?? "";
  let roadmapId: string | undefined;
  let trackId: string | undefined;
  let taskId: string | undefined;
  let description: string | undefined;
  let projectUrl: string | null = null;
  let screenshotFile: File | null = null;
  let incomingFiles: unknown[] = [];

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    roadmapId = body.roadmapId as string | undefined;
    trackId = body.trackId as string | undefined;
    taskId = body.taskId as string | undefined;
    description = body.description as string | undefined;
    projectUrl = ((body.projectUrl as string | null | undefined) ?? "").trim() || null;
    if (Array.isArray(body.files)) incomingFiles = body.files;
  } else {
    const formData = await req.formData();
    roadmapId = formData.get("roadmapId") as string | undefined;
    trackId = formData.get("trackId") as string | undefined;
    taskId = formData.get("taskId") as string | undefined;
    description = formData.get("description") as string | undefined;
    projectUrl = ((formData.get("projectUrl") as string | null) ?? "").trim() || null;
    screenshotFile = formData.get("screenshot") as File | null;
  }

  if (!roadmapId || !trackId || !taskId || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (description.trim().length < 50) {
    return NextResponse.json({ error: "Description too short (min 50 characters)" }, { status: 400 });
  }

  // Validate file attachments if provided
  let validatedFiles: FileAttachment[] = [];
  if (incomingFiles.length > 0) {
    const { valid, error: fileErr } = validateFileAttachments(incomingFiles);
    if (fileErr) return NextResponse.json({ error: fileErr }, { status: 400 });
    validatedFiles = valid;
  }

  const hasFiles = validatedFiles.length > 0 || !!screenshotFile;
  const hasUrl = !!projectUrl;

  // Require at least one form of proof
  if (!hasUrl && !hasFiles) {
    return NextResponse.json(
      { error: "Submit proof: a GitHub repo, a deployed URL, or attach a file." },
      { status: 400 }
    );
  }

  // Verify URL if provided
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

  // Build evidenceType, evidenceUrl, evidenceData
  let evidenceUrl: string | null = projectUrl;
  let evidenceType: string;
  let evidenceData: Record<string, unknown> | null = null;

  if (screenshotFile) {
    // Legacy screenshot path
    const bytes = await screenshotFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = screenshotFile.type || "image/png";
    evidenceType = projectUrl ? "mixed" : "screenshot";
    evidenceData = {
      filename: screenshotFile.name,
      size: screenshotFile.size,
      type: screenshotFile.type,
      dataUrl: `data:${mimeType};base64,${base64}`,
    };
  } else if (validatedFiles.length > 0) {
    // New file submission path
    if (projectUrl) {
      evidenceType = "mixed";     // URL + files
    } else {
      evidenceType = "files";     // files only
      evidenceUrl = null;
    }
    evidenceData = { files: validatedFiles };
  } else {
    // URL only
    evidenceType = "url";
  }

  // Verify task belongs to this roadmap/track
  const task = await prisma.task.findFirst({
    where: { id: taskId, phase: { trackId, track: { roadmapId } } },
  });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

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
      status: "passed",
    },
  });

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "in_progress" },
  });

  return NextResponse.json({ checkinId: checkin.id, passed: true }, { status: 201 });
}
