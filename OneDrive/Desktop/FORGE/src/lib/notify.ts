/**
 * Best-effort in-app + email notifications for mentor-mentee events.
 * Always writes to the DB Notification table (in-app bell).
 * Also sends Gmail SMTP email when GMAIL_USER + GMAIL_APP_PASSWORD are set.
 * Never throws, errors are caught and logged.
 */
import nodemailer from "nodemailer";
import { prisma } from "./prisma";

const BASE_URL = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "https://forge-ab.vercel.app";

function getTransport(): nodemailer.Transporter | null {
 const user = process.env.GMAIL_USER;
 const pass = process.env.GMAIL_APP_PASSWORD;
 if (!user || !pass) return null;
 return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

const GMAIL_FROM = process.env.GMAIL_USER ? `The Forge <${process.env.GMAIL_USER}>` : "";

export type NotificationKind =
 | "mentor-left-note"
 | "mentor-shared-resource"
 | "mentor-sent-questions"
 | "mentor-action"
 | "work-verified"
 | "work-rejected"
 | "mentee-replied"
 | "mentee-requested-unlock"
 | "mentee-checked-in";

interface Args {
 recipientId: string;
 actorId: string;
 taskTitle?: string;
 payload?: Record<string, unknown>;
}

export async function sendNotification(kind: NotificationKind, args: Args): Promise<void> {
 try {
 const [recipient, actor] = await Promise.all([
 prisma.user.findUnique({
 where: { id: args.recipientId },
 select: { email: true, name: true, isGuest: true },
 }),
 prisma.user.findUnique({
 where: { id: args.actorId },
 select: { name: true, mentorDisplayName: true },
 }),
 ]);

 if (!recipient || recipient.isGuest) return;

 const actorName = actor?.mentorDisplayName ?? actor?.name ?? "Your mentor";
 const taskTitle = args.taskTitle ?? "your roadmap";
 const { subject, body } = renderTemplate(kind, { actorName, taskTitle, ...args.payload });
 const href = resolveHref(kind, args);

 // ── Always create in-app notification ─────────────────────────
 await prisma.notification.create({
 data: {
 userId: args.recipientId,
 kind,
 title: subject,
 body: typeof args.payload?.body === "string" ? args.payload.body.slice(0, 300) : undefined,
 href,
 },
 });

 // ── Email, only when Gmail creds are configured ───────────────
 const transport = getTransport();
 if (!transport) return;
 if (!recipient.email || recipient.email.endsWith("@forge.guest")) return;

 const link = `${BASE_URL}${href}`;
 await transport.sendMail({
 from: GMAIL_FROM,
 replyTo: "theforgelearn@proton.me",
 to: recipient.email,
 subject,
 html: wrapHtml(body + `<p style="margin-top:24px"><a href="${link}" style="background:#f59e0b;color:#000;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:600">Open in The Forge</a></p>`),
 });
 } catch (err) {
 console.warn("[notify] failed:", err instanceof Error ? err.message : err);
 }
}

function resolveHref(kind: NotificationKind, args: Args): string {
 switch (kind) {
 // Mentee-facing: these land on the mentee's own notes inbox, where the
 // mentor's note / shared resource appears.
 case "mentor-left-note":
 case "mentor-shared-resource":
 return "/dashboard/notes";
 // Mentee-facing: questions land on the week page (the new Mentor Review
 // tab is where the student answers). Dashboard is the safe default
 // when we don't have the slug + week number in scope.
 case "mentor-sent-questions":
 return "/dashboard";
 // Mentor-facing: a mentee replied, asked to unlock, or submitted a
 // check-in. Send the mentor straight to THAT mentee's page (the thread,
 // reply box, and submitted files all live there).
 // Previously "mentee-replied" pointed at /dashboard/notes, which is the
 // mentee inbox, so a mentor clicking it landed on their own empty inbox.
 case "mentee-replied":
 case "mentee-requested-unlock":
 case "mentee-checked-in":
 return `/dashboard/mentor/${args.actorId}`;
 case "mentor-action":
 default:
 return "/dashboard";
 }
}

function renderTemplate(kind: NotificationKind, vars: Record<string, unknown>): { subject: string; body: string } {
 const a = vars.actorName as string;
 const t = vars.taskTitle as string;
 switch (kind) {
 case "mentor-left-note":
 return {
 subject: `${a} left a note on ${t}`,
 body: `<p><strong>${a}</strong> left a note on <em>${t}</em>.</p><blockquote style="border-left:3px solid #f59e0b;margin:0;padding:8px 12px;color:#444">${escape(vars.body as string)}</blockquote>`,
 };
 case "mentor-shared-resource":
 return {
 subject: `${a} shared a resource for ${t}`,
 body: `<p><strong>${a}</strong> recommended <a href="${escape(vars.url as string)}">${escape(vars.title as string)}</a> for <em>${t}</em>.</p>`,
 };
 case "mentor-sent-questions": {
 const count = Number(vars.count ?? 1);
 const noun = count === 1 ? "question" : "questions";
 return {
 subject: `${a} sent you ${count} ${noun} on ${t}`,
 body: `<p><strong>${a}</strong> sent you ${count} ${noun} on <em>${t}</em>. Open the week and answer them on the <strong>Mentor Review</strong> tab.</p>`,
 };
 }
 case "mentor-action":
 return {
 subject: `${a} ${vars.action as string} ${t}`,
 body: `<p><strong>${a}</strong> ${vars.action as string} the task <em>${t}</em>.</p>`,
 };
 case "work-verified":
 return {
 subject: `${a} passed your work on ${t}`,
 body: `<p><strong>${a}</strong> reviewed and <strong>passed</strong> your work on <em>${t}</em>. Nice — your streak grows and the next week opens when they release it.</p>`,
 };
 case "work-rejected":
 return {
 subject: `${a} asked for changes on ${t}`,
 body: `<p><strong>${a}</strong> reviewed your work on <em>${t}</em> and <strong>sent it back for revisions</strong>. Open the week, read their note, and resubmit.</p>`,
 };
 case "mentee-replied":
 return {
 subject: `${a} replied on ${t}`,
 body: `<p><strong>${a}</strong> replied on <em>${t}</em>.</p><blockquote style="border-left:3px solid #f59e0b;margin:0;padding:8px 12px;color:#444">${escape(vars.body as string)}</blockquote>`,
 };
 case "mentee-requested-unlock":
 return {
 subject: `${a} is asking you to unlock ${t}`,
 body: `<p><strong>${a}</strong> is requesting that you unlock <em>${t}</em>.</p><blockquote style="border-left:3px solid #f59e0b;margin:0;padding:8px 12px;color:#444">${escape(vars.body as string)}</blockquote>`,
 };
 case "mentee-checked-in":
 return {
 subject: `${a} checked in on ${t}`,
 body: `<p><strong>${a}</strong> submitted a check-in for <em>${t}</em>. Open their page to review the work${vars.evidenceType === "files" || vars.evidenceType === "mixed" ? " and attached files" : ""}.</p>`,
 };
 }
}

function escape(s: string): string {
 return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrapHtml(body: string): string {
 return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#fafafa;padding:24px;color:#111"><div style="max-width:520px;margin:0 auto;background:#fff;padding:24px;border-radius:8px;border:1px solid #eaeaea">${body}</div></body></html>`;
}
