import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET, fetch user's org
export async function GET() {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const membership = await prisma.orgMembership.findFirst({
 where: { userId: session.user.id },
 include: {
 org: {
 include: {
 _count: { select: { members: true, cohorts: true } },
 },
 },
 },
 });

 if (!membership) return NextResponse.json({ org: null });
 return NextResponse.json({ org: membership.org, role: membership.role });
}

// POST, create a new organization
export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { name, description, website } = await req.json();
 if (!name || typeof name !== "string" || name.trim().length < 2) {
 return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
 }

 // Check if user already owns an org
 const existing = await prisma.orgMembership.findFirst({
 where: { userId: session.user.id, role: "owner" },
 });
 if (existing) {
 return NextResponse.json({ error: "You already own an organization" }, { status: 400 });
 }

 const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

 const org = await prisma.organization.create({
 data: {
 name: name.trim(),
 slug,
 description: description?.trim() || null,
 website: website?.trim() || null,
 members: {
 create: { userId: session.user.id, role: "owner" },
 },
 },
 });

 // Upgrade user tier to team
 await prisma.user.update({
 where: { id: session.user.id },
 data: { tier: "team" },
 });

 return NextResponse.json({ org }, { status: 201 });
}
