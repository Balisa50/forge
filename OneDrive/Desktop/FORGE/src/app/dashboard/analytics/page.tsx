import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireLearnerAccess } from "@/lib/role-guard";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const userId = session.user.id;
  await requireLearnerAccess(userId);

  const [user, checkins, integrityLogs, roadmaps] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { integrityScore: true },
      }),

      prisma.checkin.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          status: true,
          createdAt: true,
          interrogation: {
            select: {
              overallScore: true,
              passed: true,
            },
          },
        },
      }),

      prisma.integrityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          event: true,
          description: true,
          delta: true,
          scoreAfter: true,
          createdAt: true,
        },
      }),

      prisma.roadmap.findMany({
        where: { userId },
        select: {
          tracks: {
            select: {
              phases: {
                select: {
                  tasks: {
                    select: { id: true, status: true, estimatedHours: true },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

  const allTasks = roadmaps.flatMap((r) =>
    r.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks))
  );
  const verifiedCount = allTasks.filter((t) => t.status === "verified").length;
  const totalTasks = allTasks.length;
  const totalStudyHours = allTasks
    .filter((t) => t.status === "verified")
    .reduce((sum, t) => sum + (t.estimatedHours ?? 0), 0);

  const serializedCheckins = checkins.map((c) => ({
    id: c.id,
    status: c.status as string,
    createdAt: c.createdAt.toISOString(),
    interrogation: c.interrogation
      ? {
          overallScore: c.interrogation.overallScore,
          passed: c.interrogation.passed,
        }
      : null,
  }));

  const serializedLogs = integrityLogs.map((l) => ({
    id: l.id,
    event: l.event,
    description: l.description,
    delta: l.delta,
    scoreAfter: l.scoreAfter,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <AnalyticsDashboard
      checkins={serializedCheckins}
      integrityScore={user?.integrityScore ?? 0}
      integrityLogs={serializedLogs}
      verifiedTasks={verifiedCount}
      totalTasks={totalTasks}
      totalStudyHours={totalStudyHours}
    />
  );
}
