import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
 const session = await auth();
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const userId = session.user.id;

 // Cascading deletes in the Prisma schema handle the dependent rows
 // (roadmaps/tracks/phases/tasks/checkins/interrogations) automatically.
 await prisma.user.delete({ where: { id: userId } });

 return NextResponse.json({ ok: true });
}
