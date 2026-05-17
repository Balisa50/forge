/**
 * Mentor invite codes. One mentor can have many active codes, each
 * optionally scoped to a single curated roadmap path.
 *
 * GET    /api/mentor/invites              — list mentor's own codes
 * POST   /api/mentor/invites              — generate a new code
 *          body: { roadmapSlug?, label?, maxUses?, expiresInDays? }
 * DELETE /api/mentor/invites?id=...       — deactivate one code
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "node:crypto";

const VALID_SLUGS = new Set([
  "ai-engineering",
  "ml-engineering",
  "full-stack-web",
  "mobile-engineering",
  "devops-cloud",
  "cybersecurity",
  "data-science",
  "data-analysis",
  "bi-analytics",
]);

/** Generate a 10-char code: FORGE-XXXX-XXXX, base32 (no confusable chars). */
function makeCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1, U
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return `${out.slice(0, 4)}-${out.slice(4, 8)}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const invites = await prisma.mentorInvite.findMany({
    where: { mentorId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ invites });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const roadmapSlug = (body.roadmapSlug as string | undefined)?.trim() || null;
  const label = (body.label as string | undefined)?.trim() || null;
  const maxUses = typeof body.maxUses === "number" && body.maxUses > 0 ? Math.floor(body.maxUses) : null;
  const expiresInDays = typeof body.expiresInDays === "number" && body.expiresInDays > 0 ? Math.floor(body.expiresInDays) : null;

  if (roadmapSlug && !VALID_SLUGS.has(roadmapSlug)) {
    return NextResponse.json({ error: "Unknown roadmap" }, { status: 400 });
  }

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86400_000)
    : null;

  // Loop guard: extremely unlikely collision (32^8 codes) but keep safe
  let code = makeCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const exists = await prisma.mentorInvite.findUnique({ where: { code } });
    if (!exists) break;
    code = makeCode();
  }

  const invite = await prisma.mentorInvite.create({
    data: {
      code,
      mentorId: session.user.id,
      roadmapSlug,
      label,
      maxUses,
      expiresAt,
    },
  });

  return NextResponse.json({ invite }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const result = await prisma.mentorInvite.updateMany({
    where: { id, mentorId: session.user.id },
    data: { isActive: false },
  });
  return NextResponse.json({ deactivated: result.count });
}
