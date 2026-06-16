import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyProjectUrl } from "@/lib/verify-url";
import {
 type FileAttachment, MAX_TOTAL_BYTES, MAX_FILE_BYTES, getFileExtension, isAcceptedExtension,
 normalizeSubmissionConfig, validateSubmission,
} from "@/lib/submission-types";
import { loadRoadmap } from "@/lib/roadmaps";
import { curatedSlugForTitle } from "@/lib/curated-slug";
import { sendNotification } from "@/lib/notify";

function isHttpUrl(s: string): boolean {
 try {
 const u = new URL(s);
 return u.protocol === "http:" || u.protocol === "https:";
 } catch {
 return false;
 }
}

/**
 * Engagement gate: a mentee can't submit a check-in for Week N until they've
 * gone through every day's items on /learn/[slug]/N. Returns null when the
 * week is complete, or an error message naming what's missing.
 */
async function engagementBlockerFor(userId: string, roadmapTitle: string, taskTitle: string): Promise<string | null> {
 // taskTitle looks like "Week 7: Build the dashboard", pull the number out.
 const m = taskTitle.match(/^Week\s+(\d+)\s*[:\-]/i);
 if (!m) return null; // not a weekly task, skip the gate
 const weekNumber = parseInt(m[1], 10);

 // Map the roadmap.title back to its curated slug (resilient to title drift
 // between the static client list and the curriculum data files).
 const slug = curatedSlugForTitle(roadmapTitle);
 if (!slug) return null; // custom / non-curated roadmap, no gate

 const curriculum = loadRoadmap(slug);
 if (!curriculum) return null;
 const week = curriculum.weeks.find((w) => w.number === weekNumber);
 if (!week || !week.days || week.days.length === 0) return null; // nothing to gate

 const requiredKeys: string[] = [];
 for (const d of week.days) {
 d.items.forEach((_, i) => requiredKeys.push(`d${d.number}-i${i}`));
 }
 if (requiredKeys.length === 0) return null;

 const completed = await prisma.learningProgress.findMany({
 where: { userId, slug, week: weekNumber, itemKey: { in: requiredKeys } },
 select: { itemKey: true },
 });
 const completedSet = new Set(completed.map((c) => c.itemKey));
 const missingCount = requiredKeys.length - completedSet.size;
 if (missingCount === 0) return null;

 return `You haven't worked through this week yet, ${missingCount} of ${requiredKeys.length} items are unticked on /learn/${slug}/${weekNumber}. Open the resources and tick each item before submitting.`;
}

function validateFileAttachments(files: unknown[]): { valid: FileAttachment[]; error?: string } {
 const valid: FileAttachment[] = [];
 let totalBytes = 0;

 for (const f of files) {
 if (typeof f !== "object" || f === null) continue;
 const file = f as Record<string, unknown>;

 const hasBlobUrl = typeof file.url === "string";
 const hasDataUrl = typeof file.dataUrl === "string";
 if (
 typeof file.filename !== "string" ||
 typeof file.size !== "number" ||
 typeof file.mimeType !== "string" ||
 typeof file.extension !== "string" ||
 (!hasBlobUrl && !hasDataUrl)
 ) {
 return { valid: [], error: "Malformed file attachment in request." };
 }

 const ext = getFileExtension(file.filename);
 const isSpecial = file.filename === "Dockerfile" || (file.filename as string).startsWith(".");
 if (!isAcceptedExtension(ext) && !isSpecial) {
 return { valid: [], error: `File type not accepted: ${file.filename}` };
 }

 if (file.size > MAX_FILE_BYTES) {
 return { valid: [], error: `${file.filename} exceeds the ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB per-file limit.` };
 }

 totalBytes += file.size as number;
 if (totalBytes > MAX_TOTAL_BYTES) {
 return { valid: [], error: `Total attachment size exceeds ${Math.round(MAX_TOTAL_BYTES / (1024 * 1024))} MB.` };
 }

 // New path: a Vercel Blob URL. Pin it to the blob host so an arbitrary URL
 // can't be passed off as an uploaded file.
 if (hasBlobUrl) {
 let host = "";
 try { host = new URL(file.url as string).hostname; } catch { /* invalid */ }
 if (!host.endsWith(".blob.vercel-storage.com")) {
 return { valid: [], error: `Invalid file URL for ${file.filename}.` };
 }
 valid.push({
 filename: file.filename,
 size: file.size,
 mimeType: file.mimeType,
 extension: file.extension,
 url: file.url as string,
 });
 continue;
 }

 // Legacy path: inline base64 data URL.
 if (!(file.dataUrl as string).startsWith("data:")) {
 return { valid: [], error: `Invalid file data for ${file.filename}.` };
 }
 valid.push({
 filename: file.filename,
 size: file.size,
 mimeType: file.mimeType,
 extension: file.extension,
 dataUrl: file.dataUrl as string,
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
 let projectUrl: string | null = null;
 let videoUrl: string | null = null;
 let screenshotFile: File | null = null;
 let incomingFiles: unknown[] = [];
 let incomingAnswers: Array<{ questionId?: unknown; answer?: unknown }> = [];

 if (contentType.includes("application/json")) {
 const body = await req.json().catch(() => ({} as Record<string, unknown>));
 roadmapId = body.roadmapId as string | undefined;
 trackId = body.trackId as string | undefined;
 taskId = body.taskId as string | undefined;
 projectUrl = ((body.projectUrl as string | null | undefined) ?? "").trim() || null;
 videoUrl = ((body.videoUrl as string | null | undefined) ?? "").trim() || null;
 if (Array.isArray(body.files)) incomingFiles = body.files;
 if (Array.isArray(body.answers)) incomingAnswers = body.answers;
 } else {
 const formData = await req.formData();
 roadmapId = formData.get("roadmapId") as string | undefined;
 trackId = formData.get("trackId") as string | undefined;
 taskId = formData.get("taskId") as string | undefined;
 projectUrl = ((formData.get("projectUrl") as string | null) ?? "").trim() || null;
 videoUrl = ((formData.get("videoUrl") as string | null) ?? "").trim() || null;
 screenshotFile = formData.get("screenshot") as File | null;
 }

 if (!roadmapId || !trackId || !taskId) {
 return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
 const hasVideo = !!videoUrl;

 // A video link must be a real http(s) URL. We never fetch it (Drive/YouTube
 // links routinely refuse server-side requests), so this is format-only.
 if (videoUrl && !isHttpUrl(videoUrl)) {
 return NextResponse.json({ error: "Video link must be a valid http(s) URL." }, { status: 400 });
 }

 // Verify ownership
 const roadmap = await prisma.roadmap.findFirst({
 where: { id: roadmapId, userId },
 });
 if (!roadmap) return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });

 // Fetch the task + its mentor-chosen submission config up-front so we can
 // validate the submission's SHAPE against what the mentor requires this week.
 const task = await prisma.task.findFirst({
 where: { id: taskId, phase: { trackId, track: { roadmapId } } },
 select: { id: true, title: true, submissionConfig: true },
 });
 if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

 // SUBMISSION-SHAPE GATE, link / video / file requirement is the mentor's
 // call per week. One shared validator (also used by the student form) decides.
 const submissionConfig = normalizeSubmissionConfig(task.submissionConfig);
 const shapeError = validateSubmission(submissionConfig.type, {
 hasLink: hasUrl, hasVideo, hasFile: hasFiles,
 });
 if (shapeError) {
 return NextResponse.json({ error: shapeError, kind: "submission-shape" }, { status: 400 });
 }

 // Verify the project link (reachability) if one was provided.
 if (projectUrl) {
 const result = await verifyProjectUrl(projectUrl);
 if (!result.verified) {
 return NextResponse.json({ error: result.error ?? "Couldn't verify that URL." }, { status: 400 });
 }
 }

 // ── ONE ROW PER (USER, TASK), see /api/mentee/review-answers for the
 // same pattern. If a Checkin already exists for this (user, task), we will
 // UPDATE it instead of creating a duplicate. Same-day double-submits across
 // DIFFERENT tasks of the same roadmap are still blocked (the daily-check-in
 // rhythm only allows one per day).
 const existingForTask = await prisma.checkin.findFirst({
 where: { userId, taskId },
 orderBy: { createdAt: "desc" },
 include: { interrogation: true },
 });

 if (!existingForTask) {
 // Only run the same-day guard on first submission. Resubmits for the
 // same task ignore the daily limit, by design, a mentor reopen invites
 // a same-day rework.
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 const tomorrow = new Date(today);
 tomorrow.setDate(tomorrow.getDate() + 1);
 const dailyDuplicate = await prisma.checkin.findFirst({
 where: { userId, roadmapId, createdAt: { gte: today, lt: tomorrow }, status: "passed" },
 });
 if (dailyDuplicate) {
 return NextResponse.json({ error: "Already checked in successfully today" }, { status: 409 });
 }
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
 evidenceType = "mixed"; // URL + files
 } else {
 evidenceType = "files"; // files only
 evidenceUrl = null;
 }
 evidenceData = { files: validatedFiles };
 } else if (projectUrl) {
 // URL only
 evidenceType = "url";
 } else {
 // Video-only submission (the shape gate guarantees a video is present here).
 evidenceType = "video";
 evidenceUrl = null;
 }

 // ENGAGEMENT GATE, block submission until the mentee has actually gone
 // through every day's items for this week. Pure no-op for non-curated
 // roadmaps or weeks that don't have day-by-day content.
 const blocker = await engagementBlockerFor(userId, roadmap.title, task.title);
 if (blocker) {
 return NextResponse.json({ error: blocker, kind: "engagement-required" }, { status: 400 });
 }

 // MENTOR-QUESTION GATE, if the mentor authored questions for this task, the
 // mentee must answer ALL of them to submit. Their answers become a
 // mentor_async interrogation that lands in the mentor's review queue.
 const mentorQuestions = await prisma.mentorQuestion.findMany({
 // Only published (sent) questions block the check-in. Drafts stay invisible.
 where: { taskId, isActive: true, publishedAt: { not: null } },
 orderBy: { position: "asc" },
 });
 const answerById = new Map<string, string>();
 for (const a of incomingAnswers) {
 if (typeof a?.questionId === "string" && typeof a?.answer === "string") {
 answerById.set(a.questionId, a.answer.trim());
 }
 }
 if (mentorQuestions.length > 0) {
 const allAnswered = mentorQuestions.every((q) => (answerById.get(q.id) ?? "").length > 0);
 if (!allAnswered) {
 return NextResponse.json(
 { error: "Answer your mentor's questions before submitting this week.", kind: "questions-required" },
 { status: 400 },
 );
 }
 }

 // Does this mentee have an active mentor? If yes, the user spec is strict:
 // "A student passes only when I say they pass." That means EVERY submission
 // by a mentored student must wait for explicit mentor approval, even when
 // no mentor questions have been written. We enforce this by creating a
 // placeholder Interrogation in mentor_async mode, the Journal/week page
 // status pill derives 'AWAITING REVIEW' from it until the mentor grades.
 const activeMentorLink = await prisma.mentorLink.findFirst({
 where: { menteeId: userId, isActive: true },
 select: { mentorId: true },
 });
 const hasMentor = !!activeMentorLink;

 // UPSERT: update the existing Checkin row for this (user, task) if one
 // exists; otherwise create the first one. Bump attemptNum on every
 // resubmission so the audit trail is honest.
 const checkin = existingForTask
 ? await prisma.checkin.update({
 where: { id: existingForTask.id },
 data: {
 evidenceType,
 evidenceUrl,
 videoUrl,
 evidenceData: evidenceData as object,
 status: "passed", // reset placeholder; pill derives from interrogation
 attemptNum: existingForTask.attemptNum + 1,
 },
 })
 : await prisma.checkin.create({
 data: {
 userId,
 roadmapId,
 trackId,
 taskId,
 description: "",
 evidenceType,
 evidenceUrl,
 videoUrl,
 evidenceData: evidenceData as object,
 // placeholder. Journal + dashboard derive the user-facing status
 // from Interrogation.mentorReviewedAt + passed when one exists.
 status: "passed",
 },
 });

 await prisma.task.update({
 where: { id: taskId },
 data: { status: "in_progress" },
 });

 // Build the transcript. If the mentor wrote questions, lay them in pair-by-
 // pair with the student's answers. Otherwise the transcript is empty, the
 // Interrogation is still created so the mentor's Reviews queue picks it up
 // and the student's Journal shows AWAITING REVIEW.
 const transcript: Array<Record<string, unknown>> = [];
 mentorQuestions.forEach((q, i) => {
 transcript.push({ role: "assistant", type: "MENTOR_AUTHORED", questionNumber: i + 1, content: JSON.stringify({ question: q.prompt }) });
 transcript.push({ role: "user", questionNumber: i + 1, content: answerById.get(q.id) ?? "", pendingReview: true });
 });

 if (mentorQuestions.length > 0 || hasMentor) {
 try {
 // UPSERT the interrogation too: a resubmit replaces the prior
 // transcript on the existing row instead of inserting a duplicate.
 // This keeps the Journal at exactly one entry per (user, task).
 if (existingForTask?.interrogation) {
 await prisma.interrogation.update({
 where: { id: existingForTask.interrogation.id },
 data: {
 transcript: transcript as unknown as object,
 mentorReviewedAt: null,
 passed: false,
 overallScore: 0,
 feedback: null,
 completedAt: new Date(),
 mentorReviewerId: mentorQuestions[0]?.mentorId ?? activeMentorLink?.mentorId ?? null,
 isDefence: mentorQuestions.length > 0,
 },
 });
 } else {
 await prisma.interrogation.create({
 data: {
 checkinId: checkin.id,
 mode: "mentor_async",
 isDefence: mentorQuestions.length > 0,
 mentorReviewerId: mentorQuestions[0]?.mentorId ?? activeMentorLink?.mentorId ?? null,
 transcript: transcript as unknown as object,
 completedAt: new Date(),
 },
 });
 }
 } catch (err) {
 console.warn("[checkins] interrogation upsert failed:", err instanceof Error ? err.message : err);
 }
 }

 // Notify every active mentor of this mentee that a check-in landed, with a
 // link straight to the mentee's page (where the submission + files show).
 // Best-effort and non-blocking, never let a notification failure break the
 // submission response.
 try {
 const mentorLinks = await prisma.mentorLink.findMany({
 where: { menteeId: userId, isActive: true },
 select: { mentorId: true },
 });
 for (const ml of mentorLinks) {
 void sendNotification("mentee-checked-in", {
 recipientId: ml.mentorId,
 actorId: userId,
 taskTitle: task.title,
 payload: { evidenceType },
 });
 }
 } catch (err) {
 console.warn("[checkins] mentor notify failed:", err instanceof Error ? err.message : err);
 }

 return NextResponse.json({ checkinId: checkin.id, passed: true }, { status: 201 });
}
