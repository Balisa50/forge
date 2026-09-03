/**
 * Mentee "I forgot my Personal ID" recovery flow, bell-only edition.
 *
 * Email was unreliable (spam, @forge.local synthetic accounts, Gmail rate
 * limits), so the recovery path is now in-app:
 *
 * POST /api/mentee/recovery
 * body: { name, mentorIdentifier }
 * → drops a Notification on the mentor's bell + a MentorComment in
 * their inbox audit trail. Mentor opens the mentee's drilldown,
 * hits Copy on the Personal ID card, sends via WhatsApp/SMS.
 *
 * GET /api/mentee/recovery?mentor=...
 * Lightweight existence check used by the form.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Loose name-match used in invite redeem too. */
function norm(s: string): string {
 return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

async function findMentor(identifier: string) {
 const id = identifier.trim().toLowerCase();
 let mentor = await prisma.user.findFirst({
 where: { email: id, role: "mentor" },
 select: { id: true, name: true, email: true },
 });
 if (!mentor) {
 const all = await prisma.user.findMany({
 where: { role: "mentor" },
 select: { id: true, name: true, email: true },
 });
 mentor = all.find((m) => norm(m.name ?? "") === norm(identifier)) ?? null;
 }
 return mentor;
}

export async function GET(req: NextRequest) {
 const id = new URL(req.url).searchParams.get("mentor");
 if (!id) return NextResponse.json({ found: false });
 const mentor = await findMentor(id);
 return NextResponse.json({ found: !!mentor, mentorFirstName: mentor?.name?.split(" ")[0] ?? null });
}

export async function POST(req: NextRequest) {
 const body = await req.json().catch(() => ({}));
 const name = (body.name as string | undefined)?.trim();
 const mentorIdentifier = (body.mentorIdentifier as string | undefined)?.trim();
 if (!name || !mentorIdentifier) {
 return NextResponse.json({ error: "Name and mentor are required" }, { status: 400 });
 }

 const mentor = await findMentor(mentorIdentifier);
 if (!mentor) {
 return NextResponse.json({ error: "Mentor not found by that name/email" }, { status: 404 });
 }

 // Find the mentee user via the mentor's active links + name match
 const links = await prisma.mentorLink.findMany({
 where: { mentorId: mentor.id, isActive: true },
 include: { mentee: { select: { id: true, name: true, personalId: true } } },
 });
 const match = links.find((l) => norm(l.mentee.name ?? "") === norm(name));
 if (!match) {
 return NextResponse.json({ error: "We couldn't find you under that mentor. Check spelling." }, { status: 404 });
 }

 // Audit-trail comment on the mentee's first task, keeps the history
 // discoverable on the drilldown.
 const firstTask = await prisma.task.findFirst({
 where: { phase: { track: { roadmap: { userId: match.mentee.id } } } },
 select: { id: true },
 orderBy: { sortOrder: "asc" },
 });
 if (firstTask) {
 try {
 await prisma.mentorComment.create({
 data: {
 taskId: firstTask.id,
 mentorId: mentor.id,
 menteeId: match.mentee.id,
 body: `${match.mentee.name} requested their Personal ID. Use the "Personal ID" card on their drilldown to Copy + send privately.`,
 authorRole: "mentee",
 kind: "request_unlock",
 },
 });
 } catch (e) {
 console.warn("[recovery] comment create failed:", e instanceof Error ? e.message : e);
 }
 }

 // The actionable signal: a bell notification that links straight to the
 // mentee's drilldown, where the mentor can one-tap copy the Personal ID.
 try {
 await prisma.notification.create({
 data: {
 userId: mentor.id,
 kind: "mentee-requested-recovery",
 title: `${match.mentee.name} forgot their Personal ID`,
 body: `Open their drilldown and hit Copy on the Personal ID card. Send it via WhatsApp / SMS.`,
 href: `/dashboard/mentor/${match.mentee.id}`,
 },
 });
 } catch (e) {
 console.warn("[recovery] notification create failed:", e instanceof Error ? e.message : e);
 }

 return NextResponse.json({
 success: true,
 mentorFirstName: mentor.name?.split(" ")[0] ?? null,
 });
}
