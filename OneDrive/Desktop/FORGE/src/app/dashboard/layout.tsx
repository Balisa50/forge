import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/DashboardNav";
import SuspensionLetter from "@/components/SuspensionLetter";
import { effectiveVisibility } from "@/lib/visibility";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [dbUser, membership, mentorLinks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id! },
      select: { role: true, onboardingDone: true, isAlsoLearning: true, isGuest: true, name: true },
    }),
    prisma.orgMembership.findFirst({
      where: { userId: session.user.id! },
      select: { role: true },
    }),
    // Pull every active mentor's visibility + suspension state for this user.
    prisma.mentorLink.findMany({
      where: { menteeId: session.user.id!, isActive: true },
      select: {
        visibility: true,
        bannedAt: true,
        banReason: true,
        mentor: { select: { name: true } },
      },
    }),
  ]);

  // Stale JWT pointing to a deleted user — boot via signout so the cookie
  // is cleared. Just `redirect("/login")` would loop infinitely because the
  // proxy sees a valid token and sends you back to /dashboard.
  if (!dbUser) redirect("/api/auth/signout?callbackUrl=/login");

  // SUSPENSION GATE: if ANY active mentor has suspended this mentee, the
  // whole app is replaced with the suspension letter. Nothing else renders.
  const suspension = mentorLinks.find((l) => l.bannedAt);
  if (suspension) {
    return (
      <SuspensionLetter
        menteeName={dbUser.name}
        mentorName={suspension.mentor?.name ?? null}
        reason={suspension.banReason}
        bannedAt={suspension.bannedAt!.toISOString()}
      />
    );
  }

  // Force onboarding if not completed
  if (!dbUser.onboardingDone) redirect("/onboarding");

  const visibility = effectiveVisibility(mentorLinks.map((l) => l.visibility));
  const hasMentor = mentorLinks.length > 0;

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex" }}>
      <div style={{ display: "flex", flex: 1, width: "100%" }}>
        <DashboardNav
          user={session.user}
          userRole={dbUser.role}
          orgRole={membership?.role ?? null}
          isAlsoLearning={dbUser.isAlsoLearning}
          visibility={visibility}
          hasMentor={hasMentor}
        />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}
