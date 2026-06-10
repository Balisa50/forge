/**
 * Mentor toggles which dashboard sections their mentee can see.
 *
 * GET /api/mentor/visibility?menteeId=... → current flags
 * PATCH /api/mentor/visibility → { menteeId, visibility: Partial<VisibilityMap> }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_VISIBILITY, parseVisibility, type VisibilityMap } from "@/lib/visibility";

export async function GET(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const url = new URL(req.url);
 const menteeId = url.searchParams.get("menteeId");
 if (!menteeId) return NextResponse.json({ error: "menteeId required" }, { status: 400 });

 const link = await prisma.mentorLink.findFirst({
 where: { mentorId: session.user.id, menteeId, isActive: true },
 select: { visibility: true },
 });
 if (!link) return NextResponse.json({ error: "Not your mentee" }, { status: 403 });

 const visibility: VisibilityMap = { ...DEFAULT_VISIBILITY, ...parseVisibility(link.visibility) };
 return NextResponse.json({ visibility });
}

export async function PATCH(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const body = await req.json().catch(() => ({}));
 const menteeId = body.menteeId as string | undefined;
 if (!menteeId) return NextResponse.json({ error: "menteeId required" }, { status: 400 });

 const patch = parseVisibility(body.visibility);

 const link = await prisma.mentorLink.findFirst({
 where: { mentorId: session.user.id, menteeId, isActive: true },
 select: { id: true, visibility: true },
 });
 if (!link) return NextResponse.json({ error: "Not your mentee" }, { status: 403 });

 const current = parseVisibility(link.visibility);
 const merged = { ...current, ...patch };

 await prisma.mentorLink.update({
 where: { id: link.id },
 data: { visibility: merged as unknown as object },
 });

 const visibility: VisibilityMap = { ...DEFAULT_VISIBILITY, ...merged };
 return NextResponse.json({ visibility });
}
