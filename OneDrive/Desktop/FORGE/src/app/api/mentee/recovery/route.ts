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
    include: { mentee: { select: { id: true, name: true, email: true, personalId: true } } },
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

  // ── Email both sides — best effort, never blocks the response ──────
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "https://forge-ab.vercel.app";

  // The mentee's "real" email — code-only mentees get synthetic addresses
  // like mentee_xxxx@forge.local which can't actually receive mail. Detect
  // those so we can tell the user whether the email will actually arrive.
  const menteeEmail = match.mentee.email ?? "";
  const menteeEmailIsReal =
    !!menteeEmail &&
    !menteeEmail.endsWith("@forge.local") &&
    !menteeEmail.endsWith("@forge.guest") &&
    menteeEmail.includes("@");

  let menteeEmailSent = false;
  let mentorEmailSent = false;
  let emailError: string | null = null;

  if (!gmailUser || !gmailPass) {
    emailError = "Email service is not configured on the server (GMAIL_USER / GMAIL_APP_PASSWORD missing).";
    console.warn("[recovery] " + emailError);
  } else {
    const transport = nodemailer.createTransport({ service: "gmail", auth: { user: gmailUser, pass: gmailPass } });

    // 1. Email the MENTEE their Personal ID directly (if real email)
    if (menteeEmailIsReal && match.mentee.personalId) {
      try {
        await transport.sendMail({
          from: `The Forge <${gmailUser}>`,
          replyTo: "theforgelearn@proton.me",
          to: menteeEmail,
          subject: `🔑 Your Personal ID for The Forge`,
          html: `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#fafafa;padding:24px;color:#111"><div style="max-width:520px;margin:0 auto;background:#fff;padding:24px;border-radius:8px;border:1px solid #eaeaea"><h2 style="margin:0 0 12px;font-size:1.25rem">Welcome back, ${escapeHtml(match.mentee.name ?? "")}</h2><p>You asked for your Personal ID. Here it is:</p><p style="background:#fff7ed;border-left:3px solid #f59e0b;padding:14px 18px;border-radius:4px;margin:16px 0;text-align:center"><code style="font-family:'SF Mono',Menlo,monospace;font-size:1.4em;font-weight:700;color:#111;letter-spacing:0.04em">${escapeHtml(match.mentee.personalId)}</code></p><p style="font-size:0.9em;color:#444">Paste this <strong>exactly as shown</strong> (including the FORGE- prefix) into the "Mentee? Return with your Personal ID" box on the sign-in page.</p><p style="margin-top:24px"><a href="${baseUrl}/login" style="background:#f59e0b;color:#000;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600">Sign in to The Forge</a></p><p style="font-size:0.8em;color:#888;margin-top:24px;border-top:1px solid #eee;padding-top:14px">Didn't request this? Someone may have typed your name on the forgot-code page. The ID itself is only useful to you — anyone else sees it as gibberish.</p></div></body></html>`,
        });
        menteeEmailSent = true;
      } catch (e) {
        emailError = `Mentee email failed: ${e instanceof Error ? e.message : String(e)}`;
        console.warn("[recovery] " + emailError);
      }
    }

    // 2. Notify the MENTOR (always — they need to know a recovery happened)
    if (mentor.email && !mentor.email.endsWith("@forge.guest") && !mentor.email.endsWith("@forge.local")) {
      try {
        const link = `${baseUrl}/dashboard/mentor/${match.mentee.id}`;
        await transport.sendMail({
          from: `The Forge <${gmailUser}>`,
          replyTo: "theforgelearn@proton.me",
          to: mentor.email,
          subject: notifTitle,
          html: `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#fafafa;padding:24px;color:#111"><div style="max-width:520px;margin:0 auto;background:#fff;padding:24px;border-radius:8px;border:1px solid #eaeaea"><p><strong>${escapeHtml(match.mentee.name ?? "Your mentee")}</strong> used the "Forgot my Personal ID" form.</p><p style="background:#fff7ed;border-left:3px solid #f59e0b;padding:12px 14px;border-radius:4px;margin:16px 0"><strong>Personal ID on file:</strong><br><code style="font-family:'SF Mono',Menlo,monospace;font-size:1.05em;color:#111">${escapeHtml(match.mentee.personalId ?? "(none — please regenerate)")}</code></p>${menteeEmailSent ? `<p style="font-size:0.9em;color:#0a7a30;background:#ecfdf5;padding:10px 14px;border-radius:4px;border-left:3px solid #10b981">✓ We emailed the Personal ID directly to <strong>${escapeHtml(menteeEmail)}</strong>. You don't need to do anything unless they say they didn't get it.</p>` : `<p style="font-size:0.9em;color:#b45309;background:#fffbeb;padding:10px 14px;border-radius:4px;border-left:3px solid #f59e0b">⚠ We couldn't email them directly (no real email on file). Please send this Personal ID to them through a private channel — text, WhatsApp, in person.</p>`}<p style="margin-top:24px"><a href="${link}" style="background:#f59e0b;color:#000;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:600">Open their dashboard</a></p></div></body></html>`,
        });
        mentorEmailSent = true;
      } catch (e) {
        if (!emailError) emailError = `Mentor email failed: ${e instanceof Error ? e.message : String(e)}`;
        console.warn("[recovery] mentor email failed:", e instanceof Error ? e.message : e);
      }
    }
  }

  // Obfuscate the mentee email for the response (a@b.com → a***@b.com)
  const obfuscatedEmail = menteeEmailIsReal ? obfuscate(menteeEmail) : null;

  return NextResponse.json({
    success: true,
    mentorFirstName: mentor.name?.split(" ")[0] ?? null,
    menteeEmailSent,
    mentorEmailSent,
    menteeEmailObfuscated: obfuscatedEmail,
    menteeHasRealEmail: menteeEmailIsReal,
    emailError, // surface for the form to show if delivery silently failed
  });
}

function obfuscate(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  const shown = local.length <= 2 ? local[0] : local.slice(0, 2);
  return `${shown}${"*".repeat(Math.max(2, local.length - shown.length))}${domain}`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
