import { prisma } from "./prisma";
import { redirect } from "next/navigation";

/**
 * Ensures the current user has a role that allows access to learning pages
 * (checkin, roadmap, journal, calendar, analytics, defence).
 * Mentors who are also learning are allowed.
 * Redirects mentor-only and bootcamp users to their own dashboards.
 */
export async function requireLearnerAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isAlsoLearning: true },
  });

  if (!user) redirect("/login");

  // Mentor-only → mentor dashboard
  if (user.role === "mentor" && !user.isAlsoLearning) {
    redirect("/dashboard/mentor");
  }

  // Bootcamp admin → org dashboard
  if (user.role === "bootcamp") {
    redirect("/dashboard/org");
  }

  return user;
}
