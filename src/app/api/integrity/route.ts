import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
 const session = await auth();
 if (!session?.user?.id)
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const userId = session.user.id;

 const [user, recentLogs] = await Promise.all([
 prisma.user.findUniqueOrThrow({
 where: { id: userId },
 select: { integrityScore: true },
 }),
 prisma.integrityLog.findMany({
 where: { userId },
 orderBy: { createdAt: "desc" },
 take: 20,
 select: {
 id: true,
 event: true,
 description: true,
 scoreBefore: true,
 scoreAfter: true,
 delta: true,
 createdAt: true,
 },
 }),
 ]);

 return NextResponse.json({
 integrityScore: user.integrityScore,
 logs: recentLogs,
 });
}

export async function PATCH(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id)
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const userId = session.user.id;
 const body = await req.json();
 const { event, delta, description } = body;

 const VALID_EVENTS = ["clean_streak", "perfect_defence", "helped_peer", "own_words"];
 if (!event || typeof delta !== "number" || !description) {
 return NextResponse.json(
 { error: "event (string), delta (number), and description (string) are required" },
 { status: 400 }
 );
 }
 if (!VALID_EVENTS.includes(event)) {
 return NextResponse.json(
 { error: `Invalid event. Must be one of: ${VALID_EVENTS.join(", ")}` },
 { status: 400 }
 );
 }

 const user = await prisma.user.findUniqueOrThrow({
 where: { id: userId },
 select: { integrityScore: true },
 });

 const scoreBefore = user.integrityScore;
 const scoreAfter = Math.max(0, Math.min(200, scoreBefore + delta));

 const result = await prisma.$transaction(async (tx) => {
 await tx.user.update({
 where: { id: userId },
 data: { integrityScore: scoreAfter },
 });

 const log = await tx.integrityLog.create({
 data: {
 userId,
 event,
 description,
 scoreBefore,
 scoreAfter,
 delta,
 },
 });

 return log;
 });

 return NextResponse.json({
 integrityScore: scoreAfter,
 log: {
 id: result.id,
 event: result.event,
 description: result.description,
 scoreBefore: result.scoreBefore,
 scoreAfter: result.scoreAfter,
 delta: result.delta,
 createdAt: result.createdAt,
 },
 });
}
