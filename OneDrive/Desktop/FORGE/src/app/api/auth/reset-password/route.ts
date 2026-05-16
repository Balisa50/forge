import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, email, newPassword } = await req.json();
  if (!token || !email || !newPassword) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: `reset:${normalised}`, token },
  });

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired reset link. Request a new one." }, { status: 400 });
  }

  if (new Date() > record.expires) {
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier: record.identifier, token: record.token } } });
    return NextResponse.json({ error: "Reset link has expired. Request a new one." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: normalised }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const hash = await bcrypt.hash(newPassword, 12);
  await Promise.all([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } }),
    prisma.verificationToken.delete({ where: { identifier_token: { identifier: record.identifier, token: record.token } } }),
  ]);

  return NextResponse.json({ ok: true });
}
