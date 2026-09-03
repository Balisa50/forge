/**
 * GET /api/mentor/mentees/:id
 *
 * Mentor fetches one mentee's full roadmap state + recent check-ins +
 * their own comments on each task. Only returns data when the caller is
 * actually linked as this mentee's mentor (defence in depth).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
 _req: NextRequest,
 { params }: { params: Promise<{ id: string }> },
) {
 const session = await auth();
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const { id: menteeId } = await params;
 const mentorId = session.user.id;

 const link = await prisma.mentorLink.findFirst({
 where: { mentorId, menteeId, isActive: true },
 });
 if (!link) {
 return NextResponse.json({ error: "Not your mentee" }, { status: 403 });
 }

 const mentee = await prisma.user.findUnique({
 where: { id: menteeId },
 select: { id: true, name: true, email: true, image: true, createdAt: true, isCodeOnly: true, personalId: true },
 });
 if (!mentee) {
 return NextResponse.json({ error: "Mentee not found" }, { status: 404 });
 }

 const roadmaps = await prisma.roadmap.findMany({
 where: { userId: menteeId },
 orderBy: { createdAt: "desc" },
 include: {
 tracks: {
 orderBy: { sortOrder: "asc" },
 include: {
 phases: {
 orderBy: { sortOrder: "asc" },
 include: {
 tasks: {
 orderBy: { sortOrder: "asc" },
 include: {
 checkins: {
 where: { userId: menteeId },
 orderBy: { createdAt: "desc" },
 take: 3,
 select: {
 id: true,
 description: true,
 evidenceType: true,
 evidenceUrl: true,
 videoUrl: true,
 evidenceData: true,
 status: true,
 attemptNum: true,
 createdAt: true,
 },
 },
 mentorComments: {
 orderBy: { createdAt: "desc" },
 select: { id: true, body: true, createdAt: true, readAt: true, authorRole: true, kind: true, mentorId: true },
 },
 mentorResources: {
 where: { mentorId },
 orderBy: { createdAt: "desc" },
 select: { id: true, title: true, url: true, note: true, createdAt: true },
 },
 },
 },
 },
 },
 },
 },
 },
 });

 return NextResponse.json({
 mentee,
 roadmaps,
 suspension: link.bannedAt
 ? {
 bannedAt: link.bannedAt.toISOString(),
 reason: link.banReason,
 appeal: link.banAppeal ?? null,
 appealAt: link.banAppealAt ? link.banAppealAt.toISOString() : null,
 }
 : null,
 });
}

/**
 * DELETE /api/mentor/mentees/:id?mode=remove|purge
 *
 * Two tiers of "get rid of a mentee":
 * - mode=remove (default): deactivate the MentorLink. The mentee keeps their
 * account and all progress, they're just no longer on this mentor's roster.
 * Reversible (re-invite them later).
 * - mode=purge: permanently delete the mentee's user account, which cascades
 * away every roadmap, check-in, message, and notification. Only allowed for
 * invite-created (isCodeOnly) accounts that exist solely inside this mentor's
 * program, never a mentee who signed up with their own Google/email login.
 *
 * Either way, only the mentee's own active mentor can do it.
 */
export async function DELETE(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> },
) {
 const session = await auth();
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const { id: menteeId } = await params;
 const mentorId = session.user.id;
 const mode = new URL(req.url).searchParams.get("mode") === "purge" ? "purge" : "remove";

 // Must be the mentor's own active mentee.
 const link = await prisma.mentorLink.findFirst({
 where: { mentorId, menteeId, isActive: true },
 select: { id: true },
 });
 if (!link) {
 return NextResponse.json({ error: "Not your mentee" }, { status: 403 });
 }

 if (mode === "purge") {
 const mentee = await prisma.user.findUnique({
 where: { id: menteeId },
 select: { isCodeOnly: true },
 });
 if (!mentee) {
 return NextResponse.json({ error: "Mentee not found" }, { status: 404 });
 }
 if (!mentee.isCodeOnly) {
 return NextResponse.json(
 { error: "This mentee signed up with their own account, so it can't be deleted. You can remove them from your roster instead." },
 { status: 403 },
 );
 }
 // Cascades: roadmaps -> tracks -> phases -> tasks -> checkins, plus mentor
 // links, comments, notifications, pact, certificates, etc. all drop.
 await prisma.user.delete({ where: { id: menteeId } });
 return NextResponse.json({ status: "purged" });
 }

 // Default: unlink only. Keep the mentee's account and data intact.
 await prisma.mentorLink.update({
 where: { id: link.id },
 data: { isActive: false },
 });
 return NextResponse.json({ status: "removed" });
}
