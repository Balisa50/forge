/**
 * Best-effort transactional email when something happens in the
 * mentor-mentee thread. No-ops cleanly when:
 *   - RESEND_API_KEY is missing
 *   - recipient or actor user can't be found
 *   - recipient is a guest user (no real email)
 *
 * Errors are caught and logged — never thrown — so a failing email
 * never breaks the API call that triggered it.
 */
import { prisma } from "./prisma";

const FROM = process.env.RESEND_FROM ?? "The Forge <noreply@theforge.app>";
const BASE_URL = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "https://forge-ab.vercel.app";

export type NotificationKind =
  | "mentor-left-note"
  | "mentor-shared-resource"
  | "mentor-action"
  | "mentee-replied"
  | "mentee-requested-unlock";

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
    const href = resolveHref(kind);

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

    // ── Email — only if domain is configured (no-op without one) ──
    if (!process.env.RESEND_API_KEY) return;
    if (!recipient.email || recipient.email.endsWith("@forge.guest")) return;

    const link = `${BASE_URL}${href}`;
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to: recipient.email,
      subject,
      html: wrapHtml(body + `<p style="margin-top:24px"><a href="${link}" style="background:#f59e0b;color:#000;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:600">Open in The Forge</a></p>`),
    });
  } catch (err) {
    console.warn("[notify] failed:", err instanceof Error ? err.message : err);
  }
}

function resolveHref(kind: NotificationKind): string {
  switch (kind) {
    case "mentor-left-note":
    case "mentee-replied":
      return "/dashboard/notes";
    case "mentee-requested-unlock":
      return "/dashboard/mentor";
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
    case "mentor-action":
      return {
        subject: `${a} ${vars.action as string} ${t}`,
        body: `<p><strong>${a}</strong> ${vars.action as string} the task <em>${t}</em>.</p>`,
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
  }
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrapHtml(body: string): string {
  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#fafafa;padding:24px;color:#111"><div style="max-width:520px;margin:0 auto;background:#fff;padding:24px;border-radius:8px;border:1px solid #eaeaea">${body}</div></body></html>`;
}
