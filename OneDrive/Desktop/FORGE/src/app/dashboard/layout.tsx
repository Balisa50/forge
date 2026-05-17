import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/DashboardNav";
import { effectiveVisibility } from "@/lib/visibility";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [dbUser, membership, mentorLinks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id! },
      select: { role: true, onboardingDone: true, isAlsoLearning: true, isGuest: true },
    }),
    prisma.orgMembership.findFirst({
      where: { userId: session.user.id! },
      select: { role: true },
    }),
    // Pull every active mentor's visibility settings for this user.
    // Used to filter dashboard nav items.
    prisma.mentorLink.findMany({
      where: { menteeId: session.user.id!, isActive: true },
      select: { visibility: true },
    }),
  ]);

  // Stale JWT pointing to a deleted user — boot back to login
  if (!dbUser) redirect("/login");

  // Force onboarding if not completed
  if (!dbUser.onboardingDone) redirect("/onboarding");

  const visibility = effectiveVisibility(mentorLinks.map((l) => l.visibility));

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex" }}>
      <div style={{ display: "flex", flex: 1, width: "100%" }}>
        <DashboardNav
          user={session.user}
          userRole={dbUser.role}
          orgRole={membership?.role ?? null}
          isAlsoLearning={dbUser.isAlsoLearning}
          visibility={visibility}
        />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}
