import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

const BASE_URL = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalised }, select: { id: true, name: true } });

  // Always return success — don't leak whether the email exists
  if (!user) return NextResponse.json({ ok: true });

  // Delete any existing reset token for this email
  await prisma.verificationToken.deleteMany({ where: { identifier: `reset:${normalised}` } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.verificationToken.create({
    data: { identifier: `reset:${normalised}`, token, expires },
  });

  const resetUrl = `${BASE_URL}/reset-password?token=${token}&email=${encodeURIComponent(normalised)}`;

  // Fire-and-forget — token is stored, user can contact support if email fails
  sendPasswordResetEmail(normalised, user.name ?? "there", resetUrl).catch(() => {});

  return NextResponse.json({ ok: true });
}
