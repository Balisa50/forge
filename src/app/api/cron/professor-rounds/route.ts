/**
 * GET /api/cron/professor-rounds - THE PROFESSOR's daily rounds.
 *
 * The proactive layer. Every other AI interaction is reactive - it waits
 * for the student to act. This is the opposite: once a day, THE PROFESSOR
 * scans every active mentee and notices the ones going quiet.
 *
 * For each mentee it does a CHEAP db check first (no AI cost):
 * - days since last check-in
 * - whether a released week's deadline is imminent or blown
 * - whether they have an active week at all
 *
 * Only mentees who are SLIPPING get attention:
 * - If AI_MENTOR_ENABLED: THE PROFESSOR composes a direct outreach
 * message and logs it as an AIMentorInteraction the student sees.
 * - Always: a flag comment is dropped into the mentor thread so the
 * human mentor is not blindsided.
 *
 * Protected by CRON_SECRET.
 * Schedule (vercel.json): 07:00 UTC daily.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aiMentorEnabled } from "@/lib/ai-mentor/feature-flag";
import { callTheProfessor } from "@/lib/ai-mentor/client";
import { checkBudget } from "@/lib/ai-mentor/budget";

const SILENT_DAYS_THRESHOLD = 3; // no check-in for 3+ days = slipping

export async function GET(req: NextRequest) {
 const authHeader = req.headers.get("authorization");
 if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const now = Date.now();

 // Every active mentee + their mentor + their roadmap tasks + last check-in.
 const links = await prisma.mentorLink.findMany({
 where: { isActive: true, bannedAt: null },
 select: {
 mentorId: true,
 menteeId: true,
 mentee: {
 select: {
 name: true,
 roadmaps: {
 where: { isActive: true },
 select: {
 title: true,
 tracks: {
 select: {
 phases: {
 select: {
 tasks: {
 select: {
 id: true,
 title: true,
 detail: true,
 status: true,
 releasedAt: true,
 deadline: true,
 },
 },
 },
 },
 },
 },
 },
 },
 },
 },
 },
 });

 const flags: Array<{ menteeId: string; menteeName: string; reason: string; taskId?: string }> = [];

 for (const link of links) {
 const tasks = link.mentee.roadmaps[0]?.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks)) ?? [];
 const released = tasks.find((t) => t.releasedAt && t.status !== "verified" && !t.deadline === false);
 const activeWeek = tasks.find((t) => t.releasedAt && t.status !== "verified");

 // Cheap check 1: last check-in across all their tasks.
 const lastCheckin = await prisma.checkin.findFirst({
 where: { userId: link.menteeId },
 orderBy: { createdAt: "desc" },
 select: { createdAt: true },
 });
 const daysSilent = lastCheckin
 ? Math.floor((now - lastCheckin.createdAt.getTime()) / 86_400_000)
 : 999;

 let reason: string | null = null;

 // Cheap check 2: deadline blown or imminent on the active week.
 if (activeWeek?.deadline) {
 const msToDeadline = activeWeek.deadline.getTime() - now;
 if (msToDeadline < 0) {
 reason = `Week "${activeWeek.title}" deadline passed and it is still not verified.`;
 } else if (msToDeadline < 24 * 3_600_000 && daysSilent >= 1) {
 reason = `Week "${activeWeek.title}" deadline is under 24 hours away and ${link.mentee.name?.split(" ")[0] ?? "they"} has been quiet.`;
 }
 }
 // Cheap check 3: prolonged silence with an active week.
 if (!reason && activeWeek && daysSilent >= SILENT_DAYS_THRESHOLD) {
 reason = `No check-in for ${daysSilent === 999 ? "a long time" : `${daysSilent} days`} while Week "${activeWeek.title}" is open.`;
 }

 if (!reason) continue; // on track - skip
 void released;

 flags.push({
 menteeId: link.menteeId,
 menteeName: link.mentee.name ?? "Mentee",
 reason,
 taskId: activeWeek?.id,
 });

 // Always: flag the human mentor so they are not blindsided.
 if (activeWeek) {
 await prisma.mentorComment.create({
 data: {
 taskId: activeWeek.id,
 mentorId: link.mentorId,
 menteeId: link.menteeId,
 authorRole: "mentor",
 kind: "action_log",
 body: `THE PROFESSOR's rounds flagged ${link.mentee.name?.split(" ")[0] ?? "this mentee"}: ${reason}`,
 },
 });
 }

 // If the AI is funded + enabled, THE PROFESSOR reaches out directly.
 if (aiMentorEnabled({ userId: link.menteeId }) && activeWeek) {
 const budget = await checkBudget(link.menteeId);
 if (!budget.withinBudget) continue;
 const weekNumberMatch = activeWeek.title.match(/^Week\s+(\d+)/i);
 try {
 const result = await callTheProfessor({
 studentFirstName: link.mentee.name?.split(" ")[0] ?? "Student",
 trackTitle: link.mentee.roadmaps[0]?.title ?? "",
 weekNumber: weekNumberMatch ? parseInt(weekNumberMatch[1], 10) : 0,
 weekTitle: activeWeek.title,
 weekBrief: activeWeek.detail,
 priorWarningCount: 0,
 userMessage: `This is a proactive check, not a reply. ${link.mentee.name?.split(" ")[0] ?? "The student"} is slipping: ${reason} Write a short, direct message to them. Notice the silence. Do not be soft, do not be cruel. Remind them the deadline does not move. Two to four sentences.`,
 maxTokens: 300,
 });
 await prisma.aIMentorInteraction.create({
 data: {
 userId: link.menteeId,
 taskId: activeWeek.id,
 kind: "warning",
 response: result.text,
 warningCount: 1,
 evidence: { trigger: "professor-rounds", reason },
 tokensUsed: result.inputTokens + result.outputTokens,
 costUsd: result.costUsd,
 },
 });
 } catch {
 // AI outreach failed - the mentor flag above still landed. Continue.
 }
 }
 }

 return NextResponse.json({
 scanned: links.length,
 flagged: flags.length,
 flags: flags.map((f) => ({ menteeName: f.menteeName, reason: f.reason })),
 aiOutreach: aiMentorEnabled() ? "enabled" : "dormant",
 });
}
