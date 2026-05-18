/**
 * Admin password reset endpoint.
 *
 *   POST /api/admin/reset-password
 *     Headers: x-admin-secret: <ADMIN_SECRET env var>
 *     Body:    { email: string, newPassword: string }
 *
 * Use case: you're locked out, email reset isn't working (no RESEND key),
 * and you need to reset YOUR account on prod. Set ADMIN_SECRET in Vercel
 * env, then call this with curl.
 *
 * Example:
 *   curl -X POST https://forge-ab.vercel.app/api/admin/reset-password \
 *     -H "Content-Type: application/json" \
 *     -H "x-admin-secret: $ADMIN_SECRET" \
 *     -d '{"email":"you@example.com","newPassword":"MyNewPass!"}'
 *
 * NEVER commit ADMIN_SECRET. Set it via Vercel env vars only.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SECRET not configured on the server" },
      { status: 503 },
    );
  }
  if (!secret || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const email = (body.email as string | undefined)?.trim().toLowerCase();
  const newPassword = body.newPassword as string | undefined;

  if (!email || !newPassword) {
    return NextResponse.json({ error: "email and newPassword required" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 chars" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: `No user with email '${email}'` }, { status: 404 });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash },
  });
  const wiped = await prisma.session.deleteMany({ where: { userId: user.id } });

  return NextResponse.json({
    ok: true,
    userId: user.id,
    sessionsWiped: wiped.count,
    message: "Password updated. Sign in with the new password.",
  });
}
