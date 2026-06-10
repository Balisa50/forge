import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/DashboardNav";
import SuspensionLetter from "@/components/SuspensionLetter";
import InviteRequired from "@/components/InviteRequired";
import ClientRememberName from "@/components/ClientRememberName";
import { effectiveVisibility } from "@/lib/visibility";
import { soloModeEnabled } from "@/lib/modes";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
 const session = await auth();
 if (!session?.user) redirect("/login");

 const [dbUser, membership, mentorLinks, forgePact] = await Promise.all([
 prisma.user.findUnique({
 where: { id: session.user.id! },
 select: { role: true, onboardingDone: true, isAlsoLearning: true, isGuest: true, name: true, mentorDisplayName: true },
 }),
 prisma.orgMembership.findFirst({
 where: { userId: session.user.id! },
 select: { role: true },
 }),
 // Pull every active mentor's visibility + suspension state for this user.
 // Mentee surfaces ALWAYS show mentorDisplayName when set (persona name),
 // never the mentor's real name.
 prisma.mentorLink.findMany({
 where: { menteeId: session.user.id!, isActive: true },
 select: {
 visibility: true,
 bannedAt: true,
 banReason: true,
 banAppeal: true,
 mentor: { select: { name: true, mentorDisplayName: true } },
 },
 }),
 prisma.forgePact.findUnique({ where: { userId: session.user.id! }, select: { id: true } }),
 ]);

 // Stale JWT pointing to a deleted user, boot via signout so the cookie
 // is cleared. Just `redirect("/login")` would loop infinitely because the
 // proxy sees a valid token and sends you back to /dashboard.
 if (!dbUser) redirect("/api/auth/signout?callbackUrl=/login");

 // SUSPENSION GATE: if ANY active mentor has suspended this mentee, the
 // whole app is replaced with the suspension letter. Nothing else renders.
 const suspension = mentorLinks.find((l) => l.bannedAt);
 if (suspension) {
 // Pull their Forge Pact "why" - the most powerful moment to show it back
 // is the moment they have stopped. This is what they signed.
 const pact = await prisma.forgePact.findUnique({
 where: { userId: session.user.id! },
 select: { why: true },
 });
 return (
 <SuspensionLetter
 menteeName={dbUser.name}
 mentorName={suspension.mentor?.mentorDisplayName ?? suspension.mentor?.name ?? null}
 reason={suspension.banReason}
 bannedAt={suspension.bannedAt!.toISOString()}
 pactWhy={pact?.why ?? null}
 hasAppeal={suspension.banAppeal !== null}
 />
 );
 }

 // Force onboarding if not completed
 if (!dbUser.onboardingDone) redirect("/onboarding");

 // THE FORGE PACT GATE: every learner signs the binding commitment before
 // they can reach their dashboard. Pure mentors (not also learning) are
 // exempt - they are not on a roadmap themselves.
 const isLearner =
 dbUser.role === "learner" ||
 dbUser.role === "student" ||
 (dbUser.role === "mentor" && dbUser.isAlsoLearning);
 if (isLearner && !forgePact) redirect("/pact");

 // SOLO-MODE GATE: while SOLO_MODE_ENABLED is off, FORGE is mentor-required.
 // A solo learner ("learner" role) with no mentor link has no valid path -
 // show them the invite-required screen. Mentors + mentees are unaffected.
 if (!soloModeEnabled() && dbUser.role === "learner" && mentorLinks.length === 0) {
 return <InviteRequired />;
 }

 const visibility = effectiveVisibility(mentorLinks.map((l) => l.visibility));
 const hasMentor = mentorLinks.length > 0;

 return (
 <div style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex" }}>
 <div style={{ display: "flex", flex: 1, width: "100%" }}>
 <DashboardNav
 user={{
 ...session.user,
 // Always use the DB name/persona, not the stale JWT name. When
 // mentorDisplayName is set ("Allen"), the mentor sees that in
 // their own nav too, consistent with what their mentees see.
 name: dbUser.mentorDisplayName ?? dbUser.name ?? session.user.name,
 }}
 userRole={dbUser.role}
 orgRole={membership?.role ?? null}
 isAlsoLearning={dbUser.isAlsoLearning}
 visibility={visibility}
 hasMentor={hasMentor}
 />
 <main className="dashboard-main">
 {/* Inline maxWidth backup, the .dashboard-content CSS class also
 caps at 1200 px on >=1025px, but inline style guarantees the
 cap regardless of whether the CSS bundle landed correctly on
 a given Vercel build. Belt and braces. */}
 <div className="dashboard-content" style={{ width: "100%", maxWidth: 1200, marginLeft: "auto", marginRight: "auto" }}>
 <ClientRememberName name={dbUser.name ?? null} />
 {children}
 </div>
 </main>
 </div>
 </div>
 );
}
