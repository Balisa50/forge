/**
 * GET /api/mentor/mentees/:id
 *
 * Mentor fetches one mentee's full roadmap state + recent check-ins +
 * their own comments on each task. Only returns data when the caller is
 * actually linked as this mentee's mentor (defence in depth).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: menteeId } = await params;
  const mentorId = session.user.id;

  const link = await prisma.mentorLink.findFirst({
    where: { mentorId, menteeId, isActive: true },
  });
  if (!link) {
    return NextResponse.json({ error: "Not your mentee" }, { status: 403 });
  }

  const mentee = await prisma.user.findUnique({
    where: { id: menteeId },
    select: { id: true, name: true, email: true, image: true, createdAt: true },
  });
  if (!mentee) {
    return NextResponse.json({ error: "Mentee not found" }, { status: 404 });
  }

  const roadmaps = await prisma.roadmap.findMany({
    where: { userId: menteeId },
    orderBy: { createdAt: "desc" },
    include: {
      tracks: {
        orderBy: { sortOrder: "asc" },
        include: {
          phases: {
            orderBy: { sortOrder: "asc" },
            include: {
              tasks: {
                orderBy: { sortOrder: "asc" },
                include: {
                  checkins: {
                    where: { userId: menteeId },
                    orderBy: { createdAt: "desc" },
                    take: 3,
                    select: {
                      id: true,
                      description: true,
                      evidenceType: true,
                      evidenceUrl: true,
                      videoUrl: true,
                      evidenceData: true,
                      status: true,
                      attemptNum: true,
                      createdAt: true,
                    },
                  },
                  mentorComments: {
                    orderBy: { createdAt: "desc" },
                    select: { id: true, body: true, createdAt: true, readAt: true, authorRole: true, kind: true, mentorId: true },
                  },
                  mentorResources: {
                    where: { mentorId },
                    orderBy: { createdAt: "desc" },
                    select: { id: true, title: true, url: true, note: true, createdAt: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    mentee,
    roadmaps,
    suspension: link.bannedAt
      ? {
          bannedAt: link.bannedAt.toISOString(),
          reason: link.banReason,
          appeal: link.banAppeal ?? null,
          appealAt: link.banAppealAt ? link.banAppealAt.toISOString() : null,
        }
      : null,
  });
}
