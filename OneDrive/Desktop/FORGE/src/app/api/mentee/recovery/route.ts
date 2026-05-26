/**
 * Mentee "I forgot my personal ID" recovery flow.
 *
 *  POST /api/mentee/recovery
 *    body: { name: string, mentorIdentifier: string }
 *  Creates a MentorComment(kind="recovery_request") on the mentor's inbox so
 *  the mentor sees the request and can one-click resend.
 *
 *  GET  /api/mentee/recovery?mentor=...
 *    Quick lookup so the mentee form can validate the mentor exists before
 *    they submit. Returns just first-name to avoid leaking accounts.
 */
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

/** Loose name-match used in invite redeem too. */
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

async function findMentor(identifier: string) {
  const id = identifier.trim().toLowerCase();
  // Try email exact, then name fuzzy
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

  // Drop a recovery request as a MentorComment so it lands in the mentor's inbox.
  // We reuse the existing MentorComment surface — no new table needed.
  // For taskId we need a placeholder — use the mentee's first task.
  const firstTask = await prisma.task.findFirst({
    where: { phase: { track: { roadmap: { userId: match.mentee.id } } } },
    select: { id: true },
    orderBy: { sortOrder: "asc" },
  });
  if (firstTask) {
    await prisma.mentorComment.create({
      data: {
        taskId: firstTask.id,
        mentorId: mentor.id,
        menteeId: match.mentee.id,
        body: `🔑 ${match.mentee.name} requested their personal ID via the forgot-code page. Personal ID on file: ${match.mentee.personalId ?? "(none — needs regeneration)"}. Send it to them privately.`,
        authorRole: "mentee",
        kind: "request_unlock", // reuse existing kind so it shows in inbox
      },
    });
  }

  // ── Notify the mentor: in-app bell + email ─────────────────────────
  // We do this directly (instead of via sendNotification) so we can write
  // a recovery-specific title/body and embed the actual personal ID for
  // the mentor to forward to the mentee.
  const notifTitle = `🔑 ${match.mentee.name} forgot their Personal ID`;
  const notifBody = match.mentee.personalId
    ? `Personal ID on file: ${match.mentee.personalId}. Send it to them privately.`
    : `No Personal ID on file — you'll need to regenerate one for them.`;

  try {
    await prisma.notification.create({
      data: {
        userId: mentor.id,
        kind: "mentee-requested-recovery",
        title: notifTitle,
        body: notifBody,
        href: `/dashboard/mentor/${match.mentee.id}`,
      },
    });
  } catch (e) {
    console.warn("[recovery] notification create failed:", e instanceof Error ? e.message : e);
  }

  // Email the mentor — best effort, never blocks the response
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (gmailUser && gmailPass && mentor.email && !mentor.email.endsWith("@forge.guest") && !mentor.email.endsWith("@forge.local")) {
    try {
      const transport = nodemailer.createTransport({ service: "gmail", auth: { user: gmailUser, pass: gmailPass } });
      const baseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "https://forge-ab.vercel.app";
      const link = `${baseUrl}/dashboard/mentor/${match.mentee.id}`;
      await transport.sendMail({
        from: `The Forge <${gmailUser}>`,
        replyTo: "theforgelearn@proton.me",
        to: mentor.email,
        subject: notifTitle,
        html: `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#fafafa;padding:24px;color:#111"><div style="max-width:520px;margin:0 auto;background:#fff;padding:24px;border-radius:8px;border:1px solid #eaeaea"><p><strong>${escapeHtml(match.mentee.name ?? "Your mentee")}</strong> used the "Forgot my Personal ID" form on the login page.</p><p style="background:#fff7ed;border-left:3px solid #f59e0b;padding:12px 14px;border-radius:4px;margin:16px 0"><strong>Personal ID on file:</strong><br><code style="font-family:'SF Mono',Menlo,monospace;font-size:1.05em;color:#111">${escapeHtml(match.mentee.personalId ?? "(none — please regenerate)")}</code></p><p style="font-size:0.9em;color:#444">Send this to them through a private channel they trust — text, WhatsApp, in person. Don't post it publicly.</p><p style="margin-top:24px"><a href="${link}" style="background:#f59e0b;color:#000;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:600">Open their dashboard</a></p></div></body></html>`,
      });
    } catch (e) {
      console.warn("[recovery] mentor email send failed:", e instanceof Error ? e.message : e);
    }
  } else {
    console.warn("[recovery] mentor email skipped — GMAIL_USER/GMAIL_APP_PASSWORD not set or mentor email is internal");
  }

  return NextResponse.json({ success: true, mentorFirstName: mentor.name?.split(" ")[0] ?? null });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
