/**
 * GET /api/me/recovery-token
 *
 * Returns the mentee's recoveryToken so the post-join screen can show
 * them a bookmarkable URL. Only returns it once per session — after
 * the mentee acknowledges, they can re-fetch but the URL is the same.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isCodeOnly: true, recoveryToken: true, name: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    isCodeOnly: user.isCodeOnly,
    recoveryToken: user.recoveryToken,
    name: user.name,
  });
}
