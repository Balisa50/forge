import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { currentPassword, newPassword } = await req.json();
 if (!currentPassword || !newPassword) {
 return NextResponse.json({ error: "Both fields are required" }, { status: 400 });
 }
 if (newPassword.length < 6) {
 return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
 }

 const user = await prisma.user.findUnique({
 where: { id: session.user.id },
 select: { passwordHash: true },
 });

 if (!user?.passwordHash) {
 return NextResponse.json({ error: "No password set on this account (Google sign-in)" }, { status: 400 });
 }

 const valid = await bcrypt.compare(currentPassword, user.passwordHash);
 if (!valid) {
 return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
 }

 const newHash = await bcrypt.hash(newPassword, 12);
 await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: newHash } });

 return NextResponse.json({ ok: true });
}
