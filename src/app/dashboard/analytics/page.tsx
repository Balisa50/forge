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

 const [checkins, roadmaps] = await Promise.all([
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

 prisma.roadmap.findMany({
 where: { userId },
 select: {
 tracks: {
 select: {
 phases: {
 select: {
 tasks: {
 select: { id: true, status: true },
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

 return (
 <AnalyticsDashboard
 checkins={serializedCheckins}
 verifiedTasks={verifiedCount}
 totalTasks={totalTasks}
 />
 );
}
