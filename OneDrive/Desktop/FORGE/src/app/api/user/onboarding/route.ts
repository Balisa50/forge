import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH: Save role + mark onboarding as complete
export async function PATCH(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { role, isAlsoLearning } = await req.json();

 const validRoles = ["learner", "student", "mentor", "bootcamp"];
 if (!role || !validRoles.includes(role)) {
 return NextResponse.json({ error: "Invalid role" }, { status: 400 });
 }

 try {
 await prisma.user.update({
 where: { id: session.user.id },
 data: {
 role,
 isAlsoLearning: role === "mentor" ? Boolean(isAlsoLearning) : false,
 onboardingDone: true,
 },
 });
 return NextResponse.json({ ok: true });
 } catch (err: unknown) {
 const message = err instanceof Error ? err.message : String(err);
 console.error("[ONBOARDING] Failed to save:", message, err);
 return NextResponse.json({ error: message }, { status: 500 });
 }
}

// GET: Check onboarding status
export async function GET() {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const user = await prisma.user.findUnique({
 where: { id: session.user.id },
 select: { onboardingDone: true, role: true },
 });

 return NextResponse.json({ onboardingDone: user?.onboardingDone ?? false, role: user?.role ?? "learner" });
}
