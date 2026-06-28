/**
 * POST /api/pact - sign the Forge Pact (one per user, immutable once signed)
 * GET /api/pact - fetch the current user's pact (or null)
 *
 * The Pact is the binding written commitment a learner makes before they can
 * begin. It is intentionally hard to undo - you do not get to quietly rewrite
 * the reason you started.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
 const session = await auth();
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }
 const pact = await prisma.forgePact.findUnique({ where: { userId: session.user.id } });
 return NextResponse.json({ pact });
}

export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 // One pact per user. Already signed -> refuse (immutable).
 const existing = await prisma.forgePact.findUnique({ where: { userId: session.user.id } });
 if (existing) {
 return NextResponse.json({ error: "You have already signed your Forge Pact." }, { status: 409 });
 }

 const body = await req.json().catch(() => ({}));
 const why = (body.why ?? "").toString().trim();
 const stake = (body.stake ?? "").toString().trim();
 const identity = (body.identity ?? "").toString().trim();
 const signature = (body.signature ?? "").toString().trim();

 // Real commitment requires real words. Enforce minimum depth.
 if (why.length < 20) {
 return NextResponse.json({ error: "Your reason is too thin. Write at least a sentence or two - mean it." }, { status: 400 });
 }
 if (stake.length < 15) {
 return NextResponse.json({ error: "Name the real cost of quitting. Be specific." }, { status: 400 });
 }
 if (identity.length < 10) {
 return NextResponse.json({ error: "Finish the identity statement. Who are you becoming?" }, { status: 400 });
 }
 if (signature.length < 2) {
 return NextResponse.json({ error: "Sign with your full name." }, { status: 400 });
 }

 const pact = await prisma.forgePact.create({
 data: {
 userId: session.user.id,
 why: why.slice(0, 1500),
 stake: stake.slice(0, 1000),
 identity: identity.slice(0, 500),
 signature: signature.slice(0, 120),
 },
 });

 return NextResponse.json({ pact });
}
