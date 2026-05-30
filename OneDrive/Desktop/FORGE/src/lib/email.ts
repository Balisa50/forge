/**
 * Centralized email service — all Forge transactional emails.
 * Uses Gmail SMTP via nodemailer. Requires GMAIL_USER + GMAIL_APP_PASSWORD env vars.
 * Silently no-ops if either is missing.
 */
import nodemailer from "nodemailer";

const GMAIL_USER  = process.env.GMAIL_USER ?? "";
const REPLY_TO    = process.env.EMAIL_REPLY_TO ?? "theforgelearn@proton.me";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "theforgelearn@proton.me";
export { SUPPORT_EMAIL };

const BASE_URL =
  process.env.NEXTAUTH_URL ??
  process.env.AUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const FROM = GMAIL_USER ? `The Forge <${GMAIL_USER}>` : "";

function getTransport(): nodemailer.Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass || user.trim() === "" || pass.trim() === "") return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const transport = getTransport();
  if (!transport) return; // env vars not set — silent no-op
  await transport.sendMail({ from: FROM, replyTo: REPLY_TO, to, subject, html });
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 520px;
  margin: 0 auto;
  background: #09090e;
  color: #e8e8ea;
  border-radius: 12px;
  border: 1px solid #1a1d2a;
  overflow: hidden;
`;

function header(title: string): string {
  return `
    <div style="background:#0c0c12;border-bottom:1px solid #1a1d2a;padding:1.5rem 2rem;">
      <span style="font-size:1.25rem;font-weight:900;letter-spacing:0.1em;color:#f59e0b;">⚡ THE FORGE</span>
    </div>
    <div style="padding:2rem;">
      <h1 style="margin:0 0 0.25rem;font-size:1.5rem;color:#f59e0b;letter-spacing:0.05em;">${title}</h1>
  `;
}

function footer(): string {
  return `
    </div>
    <div style="background:#060608;border-top:1px solid #1a1d2a;padding:1rem 2rem;text-align:center;">
      <p style="margin:0;font-size:0.75rem;color:#3a3d4a;font-family:monospace;">
        THE FORGE · You're receiving this because you have an account.
      </p>
      <a href="${BASE_URL}/dashboard/settings" style="font-size:0.75rem;color:#6b7084;text-decoration:none;">Manage notifications</a>
    </div>
  `;
}

function ctaButton(label: string, href: string, color = "#f59e0b"): string {
  const textColor = color === "#f59e0b" ? "#000" : "#fff";
  return `
    <a href="${href}"
      style="display:inline-block;background:${color};color:${textColor};padding:0.875rem 2rem;
             border-radius:6px;text-decoration:none;font-weight:700;font-size:0.9375rem;
             margin:1.5rem 0;letter-spacing:0.02em;">
      ${label}
    </a>
  `;
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export function welcomeEmailHtml(name: string): string {
  return `
    <div style="${BASE_STYLE}">
      ${header("Welcome to The Forge")}
      <p style="color:#6b7084;margin:0 0 1.5rem;">The accountability platform that doesn't play.</p>
      <p style="margin:0 0 1rem;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 1rem;line-height:1.7;color:#adadb5;">
        You just signed up for something that is going to challenge you. Every committed day,
        you submit a verified project URL and answer 3 questions from THE PROFESSOR about what you built.
        No faking. No shortcuts.
      </p>
      <p style="margin:0 0 1.5rem;line-height:1.7;color:#adadb5;">
        Your roadmap is waiting. Pick a path, commit to a schedule, and start forging.
      </p>
      ${ctaButton("Go to Your Dashboard →", `${BASE_URL}/dashboard`)}
      <div style="border:1px solid #1a1d2a;border-radius:8px;padding:1rem;margin-top:1rem;">
        <p style="margin:0 0 0.5rem;font-size:0.8125rem;color:#6b7084;font-family:monospace;letter-spacing:0.08em;text-transform:uppercase;">What happens next</p>
        <ul style="margin:0;padding:0 0 0 1.25rem;color:#adadb5;font-size:0.875rem;line-height:1.8;">
          <li>Pick a roadmap (38 curated paths from roadmap.sh, or describe your own)</li>
          <li>Set your check-in schedule</li>
          <li>Show up. Submit proof. Pass the mastery checks.</li>
          <li>Build a verified public record of your work</li>
        </ul>
      </div>
      ${footer()}
    </div>
  `;
}

export function checkinReminderEmailHtml(name: string, taskTitle: string): string {
  return `
    <div style="${BASE_STYLE}">
      ${header("You haven't checked in yet")}
      <p style="color:#6b7084;margin:0 0 1.5rem;font-family:monospace;font-size:0.8125rem;">${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      <p style="margin:0 0 1rem;line-height:1.7;">Hey ${name},</p>
      <p style="margin:0 0 1.5rem;line-height:1.7;color:#adadb5;">
        Your committed day is almost over and you haven't checked in yet.
        The path is still open. Your task is waiting.
      </p>
      ${taskTitle ? `
        <div style="border-left:3px solid #f59e0b;padding:0.875rem 1rem;background:#0c0c12;border-radius:0 6px 6px 0;margin-bottom:1.5rem;">
          <p style="margin:0;font-size:0.75rem;color:#f59e0b;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.25rem;">Current Task</p>
          <p style="margin:0;font-weight:600;color:#e8e8ea;">${taskTitle}</p>
        </div>
      ` : ""}
      ${ctaButton("Check In Now →", `${BASE_URL}/dashboard/checkin`)}
      <p style="margin:0;font-size:0.8125rem;color:#3a3d4a;line-height:1.6;">
        Don't have time today? Use a grace day instead — you have up to 5 per month.
      </p>
      ${footer()}
    </div>
  `;
}

export function interrogationResultEmailHtml(
  name: string,
  passed: boolean,
  score: number,
  maxScore: number,
  verdict: string,
  taskTitle: string,
): string {
  const color = passed ? "#22c55e" : "#ef4444";
  const label = passed ? "PASSED" : "FAILED";
  const pct = Math.round((score / maxScore) * 100);

  return `
    <div style="${BASE_STYLE}">
      ${header(`Check-In ${label}`)}
      <p style="color:${color};margin:0 0 1.5rem;font-family:monospace;font-size:0.75rem;letter-spacing:0.15em;">${taskTitle}</p>

      <div style="text-align:center;padding:1.5rem;background:#0c0c12;border:1px solid ${color}30;border-radius:10px;margin-bottom:1.5rem;">
        <div style="font-size:3.5rem;font-weight:900;color:${color};letter-spacing:0.1em;line-height:1;">${label}</div>
        <div style="font-size:1.25rem;color:#adadb5;margin-top:0.5rem;font-family:monospace;">${score}/${maxScore} pts</div>
        <div style="font-size:0.75rem;color:#6b7084;font-family:monospace;margin-top:0.25rem;">${pct}% · need 40% to pass</div>
      </div>

      ${verdict ? `
        <div style="background:#0c0c12;border:1px solid #1a1d2a;border-radius:8px;padding:1.25rem;margin-bottom:1.5rem;">
          <p style="margin:0 0 0.5rem;font-family:monospace;font-size:0.6875rem;color:#3b82f6;letter-spacing:0.2em;text-transform:uppercase;">⚡ VERDICT</p>
          <p style="margin:0;color:#adadb5;font-size:0.9375rem;line-height:1.7;">${verdict}</p>
        </div>
      ` : ""}

      ${passed
        ? ctaButton("View Your Dashboard →", `${BASE_URL}/dashboard`)
        : ctaButton("Try Again", `${BASE_URL}/dashboard/checkin`, "#ef4444")
      }

      ${!passed ? `
        <p style="margin:1rem 0 0;font-size:0.8125rem;color:#6b7084;line-height:1.6;">
          Failed sessions don't count against you. Review what you built, try again tomorrow.
          You'll get different questions.
        </p>
      ` : ""}
      ${footer()}
    </div>
  `;
}

export function podActivityEmailHtml(
  name: string,
  podName: string,
  members: Array<{ name: string; checkedIn: boolean; progress: number }>,
): string {
  const checkedInCount = members.filter((m) => m.checkedIn).length;
  return `
    <div style="${BASE_STYLE}">
      ${header("Weekly Pod Update")}
      <p style="color:#6b7084;margin:0 0 1.5rem;font-family:monospace;font-size:0.8125rem;">${podName} · Week of ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>

      <p style="margin:0 0 1rem;line-height:1.7;">Hey ${name},</p>
      <p style="margin:0 0 1.5rem;line-height:1.7;color:#adadb5;">
        ${checkedInCount} of ${members.length} pod members checked in this week.
        Here's where everyone stands:
      </p>

      <div style="border:1px solid #1a1d2a;border-radius:10px;overflow:hidden;margin-bottom:1.5rem;">
        ${members.map((m, i) => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1.25rem;${i < members.length - 1 ? "border-bottom:1px solid #1a1d2a;" : ""}">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div style="width:8px;height:8px;border-radius:50%;background:${m.checkedIn ? "#22c55e" : "#ef4444"};flex-shrink:0;"></div>
              <span style="font-weight:600;color:${m.checkedIn ? "#e8e8ea" : "#6b7084"};">${m.name}</span>
            </div>
            <div style="display:flex;align-items:center;gap:1rem;">
              <span style="font-family:monospace;font-size:0.75rem;color:#6b7084;">${m.progress}% done</span>
              <span style="font-family:monospace;font-size:0.6875rem;padding:0.125rem 0.5rem;border-radius:4px;
                background:${m.checkedIn ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)"};
                color:${m.checkedIn ? "#22c55e" : "#ef4444"};">
                ${m.checkedIn ? "✓ ACTIVE" : "QUIET"}
              </span>
            </div>
          </div>
        `).join("")}
      </div>

      ${ctaButton("View Your Pod →", `${BASE_URL}/dashboard/pod`)}
      ${footer()}
    </div>
  `;
}

export function passwordResetEmailHtml(name: string, resetUrl: string): string {
  return `
    <div style="${BASE_STYLE}">
      ${header("Reset Your Password")}
      <p style="color:#6b7084;margin:0 0 1.5rem;">One-time link · expires in 1 hour</p>
      <p style="margin:0 0 1rem;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 1.5rem;line-height:1.7;color:#adadb5;">
        Click the button below to set a new password. This link expires in 1 hour and can only be used once.
      </p>
      ${ctaButton("Reset Password →", resetUrl, "#3b82f6")}
      <p style="margin:0;font-size:0.8125rem;color:#3a3d4a;line-height:1.6;">
        Or copy this link: <a href="${resetUrl}" style="color:#6b7084;">${resetUrl}</a>
      </p>
      <p style="margin:1rem 0 0;font-size:0.8125rem;color:#3a3d4a;">
        If you didn't request this, ignore this email — your password won't change.
      </p>
      ${footer()}
    </div>
  `;
}

export function applicationApprovedEmailHtml(
  name: string,
  inviteCode: string,
  registerUrl: string,
): string {
  return `
    <div style="${BASE_STYLE}">
      ${header("You have been accepted.")}
      <p style="color:#22c55e;margin:0 0 1.5rem;font-family:monospace;font-size:0.75rem;letter-spacing:0.15em;">APPLICATION APPROVED</p>

      <p style="margin:0 0 1rem;line-height:1.7;">Hi ${name},</p>
      <p style="margin:0 0 1.5rem;line-height:1.7;color:#adadb5;">
        Your application to The Forge has been reviewed and accepted.
        Here is your personal invite code — this is your key in. Do not share it.
      </p>

      <div style="background:#0c0c12;border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:1.5rem;text-align:center;margin-bottom:1.5rem;">
        <p style="margin:0 0 0.375rem;font-family:monospace;font-size:0.6875rem;color:#6b7084;letter-spacing:0.2em;text-transform:uppercase;">Your invite code</p>
        <div style="font-size:2rem;font-weight:900;color:#f59e0b;letter-spacing:0.15em;font-family:monospace;">${inviteCode}</div>
      </div>

      <p style="margin:0 0 0.5rem;font-weight:700;color:#e8e8ea;">How to enrol — 3 steps:</p>
      <ol style="margin:0 0 1.5rem;padding:0 0 0 1.25rem;color:#adadb5;font-size:0.9375rem;line-height:1.9;">
        <li>Go to <a href="${registerUrl}" style="color:#f59e0b;">${registerUrl}</a> and create your account.</li>
        <li>During onboarding, select <strong style="color:#e8e8ea;">Mentee</strong> when asked who you are.</li>
        <li>Enter your invite code <strong style="color:#f59e0b;font-family:monospace;">${inviteCode}</strong> when prompted. That's it — you're in.</li>
      </ol>

      ${ctaButton("Create Your Account →", registerUrl)}

      <p style="margin:1rem 0 0;font-size:0.8125rem;color:#3a3d4a;line-height:1.6;">
        This code is single-use and locked to your name. If you have any trouble, reply to this email.
      </p>
      ${footer()}
    </div>
  `;
}

// ─── Send helpers ─────────────────────────────────────────────────────────────

export async function sendApplicationApprovedEmail(to: string, name: string, inviteCode: string) {
  const registerUrl = `${BASE_URL}/register`;
  try {
    await sendMail(
      to,
      `⚡ You're in — your Forge invite code`,
      applicationApprovedEmailHtml(name, inviteCode, registerUrl),
    );
  } catch (e) {
    console.error("[email] sendApplicationApprovedEmail failed:", (e as Error).message);
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await sendMail(to, `Welcome to The Forge, ${name} ⚡`, welcomeEmailHtml(name));
  } catch (e) {
    console.error("[email] sendWelcomeEmail failed:", (e as Error).message);
  }
}

export async function sendCheckinReminderEmail(to: string, name: string, taskTitle: string) {
  try {
    await sendMail(
      to,
      `⚡ ${name}, you haven't checked in yet today`,
      checkinReminderEmailHtml(name, taskTitle),
    );
  } catch (e) {
    console.error("[email] sendCheckinReminderEmail failed:", (e as Error).message);
  }
}

export async function sendInterrogationResultEmail(
  to: string,
  name: string,
  passed: boolean,
  score: number,
  maxScore: number,
  verdict: string,
  taskTitle: string,
) {
  try {
    await sendMail(
      to,
      passed ? `✅ You passed today's check-in — The Forge` : `❌ Check-in failed — The Forge`,
      interrogationResultEmailHtml(name, passed, score, maxScore, verdict, taskTitle),
    );
  } catch (e) {
    console.error("[email] sendInterrogationResultEmail failed:", (e as Error).message);
  }
}

export async function sendPodActivityEmail(
  to: string,
  name: string,
  podName: string,
  members: Array<{ name: string; checkedIn: boolean; progress: number }>,
) {
  try {
    await sendMail(to, `Your pod this week — The Forge`, podActivityEmailHtml(name, podName, members));
  } catch (e) {
    console.error("[email] sendPodActivityEmail failed:", (e as Error).message);
  }
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  try {
    await sendMail(to, "Reset your Forge password", passwordResetEmailHtml(name, resetUrl));
  } catch (e) {
    console.error("[email] sendPasswordResetEmail failed:", (e as Error).message);
  }
}
