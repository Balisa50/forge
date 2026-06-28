/**
 * Admin diagnostic for the email pipeline.
 *
 * GET /api/admin/debug-email?email=<address>
 * Header: x-admin-secret: <ADMIN_SECRET env var>
 *
 * Returns:
 * - whether the user exists in DB
 * - whether RESEND_API_KEY is configured
 * - actual Resend send result (or error) when sending a test email
 *
 * Helps diagnose "I clicked forgot-password but no email arrived" without
 * digging through Vercel logs.
 */
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function GET(req: NextRequest) {
 const expected = process.env.ADMIN_SECRET;
 if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not set" }, { status: 503 });
 if (req.headers.get("x-admin-secret") !== expected) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const email = new URL(req.url).searchParams.get("email")?.trim().toLowerCase();
 if (!email) return NextResponse.json({ error: "email param required" }, { status: 400 });

 const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, createdAt: true } });
 const hasKey = !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "placeholder";
 const from = process.env.RESEND_FROM ?? "The Forge <onboarding@resend.dev>";
 const replyTo = process.env.RESEND_REPLY_TO ?? "theforgelearn@proton.me";

 // Try an ACTUAL test send and capture the error
 let sendResult: unknown = "not attempted (no API key)";
 if (hasKey) {
 try {
 const r = new Resend(process.env.RESEND_API_KEY);
 const result = await r.emails.send({
 from,
 replyTo,
 to: email,
 subject: "FORGE email pipeline diagnostic test",
 html: "<p>If you see this, the pipeline works.</p>",
 });
 sendResult = result;
 } catch (e) {
 sendResult = { error: e instanceof Error ? e.message : String(e) };
 }
 }

 // ── Gmail SMTP diagnostic (the channel notify.ts + /api/mentee/recovery use) ──
 const gmailUser = process.env.GMAIL_USER;
 const gmailPass = process.env.GMAIL_APP_PASSWORD;
 const gmailConfigured = !!gmailUser && !!gmailPass;
 let gmailSendResult: unknown = "not attempted (vars missing)";
 if (gmailConfigured) {
 try {
 const transport = nodemailer.createTransport({
 service: "gmail",
 auth: { user: gmailUser, pass: gmailPass },
 });
 const info = await transport.sendMail({
 from: `The Forge <${gmailUser}>`,
 replyTo: "theforgelearn@proton.me",
 to: email,
 subject: "FORGE Gmail SMTP diagnostic test",
 html: "<p>If you see this, Gmail SMTP works. This is the channel that delivers Personal ID recovery + mentor notifications.</p>",
 });
 gmailSendResult = { accepted: info.accepted, rejected: info.rejected, messageId: info.messageId, response: info.response };
 } catch (e) {
 gmailSendResult = { error: e instanceof Error ? e.message : String(e) };
 }
 }

 return NextResponse.json({
 diagnostics: {
 userExists: !!user,
 user: user ?? null,
 resend: {
 apiKeyConfigured: hasKey,
 from,
 replyTo,
 testSendResult: sendResult,
 },
 gmail: {
 userConfigured: !!gmailUser,
 passwordConfigured: !!gmailPass,
 userValue: gmailUser ? gmailUser.replace(/(.{2}).*(@.*)/, "$1***$2") : null,
 testSendResult: gmailSendResult,
 },
 },
 });
}
