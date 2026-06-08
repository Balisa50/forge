import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, MapIcon, Zap, ArrowRight, Clock, Building2, Target, Flame, Lock, Hourglass, BookOpen, MessageSquare } from "lucide-react";
import WeekVerifiedCelebration from "@/components/WeekVerifiedCelebration";
import ForgePactCard from "@/components/ForgePactCard";
import ShippedChain from "@/components/ShippedChain";

/** Map a seeded Roadmap.title back to its curated slug so we can deep-link into
 *  /learn. Keyed by the CANONICAL JSON titles that the seeding actually writes to
 *  the DB (loadRoadmap().title) — these differ from the onboarding picker titles
 *  for a few tracks (e.g. DB "DevOps & Cloud" vs picker "DevOps and Cloud",
 *  "Cybersecurity Engineering" vs "Cybersecurity", "BI Analytics" vs "Business
 *  Intelligence"). That mismatch returned a null slug and bounced the mentee to
 *  the check-in page. Hardcoded (not loaded via fs) so it's reliable in the
 *  Vercel page bundle; a normalised fallback guards against future drift. */
const CANONICAL_TITLE_TO_SLUG: Record<string, string> = {
  "AI Engineering": "ai-engineering",
  "ML Engineering": "ml-engineering",
  "Full Stack Web": "full-stack-web",
  "Mobile Engineering": "mobile-engineering",
  "DevOps & Cloud": "devops-cloud",
  "Cybersecurity Engineering": "cybersecurity",
  "Data Science": "data-science",
  "Data Analysis": "data-analysis",
  "BI Analytics": "bi-analytics",
  "AI Automation": "ai-automation",
};
const normaliseTitle = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
const NORM_TITLE_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(CANONICAL_TITLE_TO_SLUG).map(([title, slug]) => [normaliseTitle(title), slug]),
);
/** Resolve a roadmap title to its slug, tolerant of "&"/"and" and punctuation drift. */
function resolveSlug(title: string | null | undefined): string | null {
  if (!title) return null;
  return CANONICAL_TITLE_TO_SLUG[title] ?? NORM_TITLE_TO_SLUG[normaliseTitle(title)] ?? null;
}

/** Pull the week number out of a task title like "Week 7: Build the dashboard". */
function parseWeekNumber(taskTitle: string): number | null {
  const m = taskTitle.match(/^Week\s+(\d+)\s*[:\-]/i);
  return m ? parseInt(m[1], 10) : null;
}

function getDaysRemaining(targetDate: Date | null | undefined): number | null {
  if (!targetDate) return null;
  const now = new Date();
  return Math.ceil((new Date(targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getRecommendedPace(remainingTasks: number, daysLeft: number | null): string | null {
  if (daysLeft === null || daysLeft <= 0 || remainingTasks === 0) return null;
  const perDay = remainingTasks / daysLeft;
  return perDay <= 1 ? "~1 task/day" : `~${Math.ceil(perDay)} tasks/day`;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  // Single query to get user data + role check (avoids extra round-trip)
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true, isAlsoLearning: true, integrityScore: true, createdAt: true },
  });

  // Role-based redirect: mentors (who don't learn) and admins get their own dashboards
  if (dbUser?.role === "mentor" && !dbUser.isAlsoLearning) redirect("/dashboard/mentor");
  if (dbUser?.role === "bootcamp") redirect("/dashboard/org");

  const isStudent = dbUser?.role === "student";
  const isMentorLearner = dbUser?.role === "mentor" && dbUser.isAlsoLearning;

  // Combine remaining queries in parallel (user data already fetched above)
  const [activeRoadmap, orgMembership] = await Promise.all([
    prisma.roadmap.findFirst({
      where: { userId, isActive: true },
      include: {
        tracks: {
          include: {
            phases: {
              include: {
                tasks: { orderBy: { sortOrder: "asc" } },
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        checkins: {
          orderBy: { createdAt: "desc" },
          take: 7,
          include: { interrogation: true },
        },
      },
    }),
    // Only fetch org data for students
    isStudent
      ? prisma.orgMembership.findFirst({
          where: { userId },
          include: {
            org: { select: { name: true } },
          },
        })
      : Promise.resolve(null),
  ]);

  const user = dbUser;

  const recentCheckins = activeRoadmap?.checkins ?? [];

  // Check if checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkedInToday = recentCheckins.some((c) => {
    const d = new Date(c.createdAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  // Re-entry flow: detect if user has been absent 3+ days.
  // Any submitted check-in counts as activity — including ones still
  // awaiting mentor review (we used to filter by status === "passed",
  // which mis-flagged active mentees as "absent" because their check-ins
  // sit at awaiting_review until graded).
  const lastCheckin = recentCheckins[0] ?? null;
  const daysSinceLastCheckin = lastCheckin
    ? Math.floor((Date.now() - new Date(lastCheckin.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isReturning = daysSinceLastCheckin !== null && daysSinceLastCheckin >= 3;

  // ── Mentor-controlled mode ────────────────────────────────────────────
  // If user has any active MentorLink, the dashboard becomes "mentor releases
  // your weeks". Auto-close any task whose deadline has passed since last load.
  const mentorLinks = await prisma.mentorLink.findMany({
    where: { menteeId: userId, isActive: true },
    include: { mentor: { select: { id: true, name: true, mentorDisplayName: true } } },
  });
  const hasMentor = mentorLinks.length > 0;
  // Mentees see the mentor's persona name (mentorDisplayName) if set, never
  // the real account name - keeps personal channels separate from FORGE.
  const rawMentor = mentorLinks[0]?.mentor ?? null;
  const primaryMentor = rawMentor
    ? { id: rawMentor.id, name: rawMentor.mentorDisplayName ?? rawMentor.name }
    : null;

  if (hasMentor && activeRoadmap) {
    const now = new Date();
    const expired = activeRoadmap.tracks
      .flatMap((t) => t.phases.flatMap((p) => p.tasks))
      .filter((t) => t.deadline && t.deadline < now && !t.closedAt && t.status !== "verified")
      .map((t) => t.id);
    if (expired.length > 0) {
      await prisma.task.updateMany({
        where: { id: { in: expired } },
        data: { closedAt: now },
      });
      // Refresh in-memory copy so the UI reflects the change
      for (const track of activeRoadmap.tracks) {
        for (const phase of track.phases) {
          for (const task of phase.tasks) {
            if (expired.includes(task.id)) task.closedAt = now;
          }
        }
      }
    }
  }

  // Find the current task (first non-verified, non-locked task)
  const currentTask = activeRoadmap?.tracks
    .flatMap((t) => t.phases.flatMap((p) => p.tasks.map((task) => ({ ...task, trackTitle: t.title, trackColor: t.color, phaseTitle: p.title }))))
    .find((t) => (t.status === "in_progress" || t.status === "available") && !t.closedAt);

  // Mentee-specific: the released week (any task that has been released by mentor)
  const releasedWeek = hasMentor
    ? activeRoadmap?.tracks
        .flatMap((t) => t.phases.flatMap((p) => p.tasks.map((task) => ({ ...task, trackTitle: t.title, trackColor: t.color }))))
        .find((t) => t.releasedAt && t.status !== "verified" && !t.closedAt)
    : null;
  // Latest mentor "note" comment for the released week — shown prominently
  const releasedNote = releasedWeek
    ? await prisma.mentorComment.findFirst({
        where: { taskId: releasedWeek.id, kind: "note", authorRole: "mentor" },
        orderBy: { createdAt: "desc" },
        select: { body: true, createdAt: true },
      })
    : null;
  // Most-recently-closed task (so we can show a "closed — ask mentor to extend" card)
  const lastClosed = hasMentor
    ? activeRoadmap?.tracks
        .flatMap((t) => t.phases.flatMap((p) => p.tasks.map((task) => ({ ...task, trackTitle: t.title, trackColor: t.color }))))
        .filter((t) => t.closedAt && t.status !== "verified")
        .sort((a, b) => (b.closedAt!.getTime() - a.closedAt!.getTime()))[0]
    : null;

  // Compute overall roadmap progress
  const allTasks = activeRoadmap?.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks)) ?? [];
  const verifiedTasks = allTasks.filter((t) => t.status === "verified").length;
  const totalTasks = allTasks.length;
  const overallPct = totalTasks > 0 ? Math.round((verifiedTasks / totalTasks) * 100) : 0;

  // Celebration + streak. orderedTasks is sort-stable by phase/sortOrder, so
  // we can walk from the END to find the contiguous run of verified weeks.
  const orderedTasks = activeRoadmap?.tracks
    .flatMap((t) => t.phases.flatMap((p) => p.tasks))
    ?? [];
  const latestVerified = [...orderedTasks]
    .filter((t) => t.status === "verified" && t.verifiedAt)
    .sort((a, b) => (b.verifiedAt!.getTime() - a.verifiedAt!.getTime()))[0];
  let streakWeeks = 0;
  for (let i = orderedTasks.length - 1; i >= 0; i--) {
    const t = orderedTasks[i];
    if (t.status === "verified") streakWeeks++;
    else if (t.status === "locked" && !t.releasedAt) continue;
    else break;
  }

  // Position of the latest verified task within the ordered task list (1-indexed)
  // — feeds the celebration's "Week N of T" chain line.
  const latestVerifiedIdx = latestVerified
    ? orderedTasks.findIndex((t) => t.id === latestVerified.id)
    : -1;
  const latestVerifiedWeekNumber = latestVerifiedIdx >= 0 ? latestVerifiedIdx + 1 : null;

  // (MentorReplay removed — mentees no longer see a replayed mentor note.)

  // Not used — analytics page handles detailed scores

  // ── MENTEE MODE: mentor controls every week release ────────────────
  if (hasMentor) {
    return (
      <div>
        <WeekVerifiedCelebration
          latestVerifiedId={latestVerified?.id ?? null}
          latestVerifiedTitle={latestVerified?.title ?? null}
          streakWeeks={streakWeeks}
          menteeFirstName={user?.name?.split(" ")[0] ?? "You"}
          weekNumber={latestVerifiedWeekNumber}
          totalWeeks={totalTasks}
          verifyingMentor={primaryMentor?.name ?? null}
        />
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
            Welcome, {user?.name?.split(" ")[0]}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            Mentored by <span style={{ color: "var(--accent)" }}>{primaryMentor?.name ?? "your mentor"}</span>
          </p>
        </div>

        <ForgePactCard />

        <ShippedChain shipped={verifiedTasks} total={totalTasks} streak={streakWeeks} />

        {/* Current released week */}
        {releasedWeek && (() => {
          const deadlineDate = releasedWeek.deadline ? new Date(releasedWeek.deadline) : null;
          const msLeft = deadlineDate ? deadlineDate.getTime() - Date.now() : null;
          const daysLeft = msLeft !== null ? Math.floor(msLeft / 86_400_000) : null;
          const hoursLeft = msLeft !== null ? Math.floor((msLeft / 3_600_000) % 24) : null;
          const urgent = daysLeft !== null && daysLeft <= 1;
          return (
            <div className="forge-panel" style={{ padding: "1.25rem", marginBottom: "1rem", borderColor: urgent ? "var(--red)" : "var(--accent)", background: urgent ? "rgba(239,68,68,0.05)" : "rgba(245,158,11,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Zap size={18} color={urgent ? "var(--red)" : "var(--accent)"} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.15em", color: urgent ? "var(--red)" : "var(--accent)" }}>
                  Released by your mentor
                </span>
              </div>
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>{releasedWeek.title}</h2>
              {releasedNote && (
                <div style={{ marginBottom: "1rem", padding: "0.875rem 1rem", borderRadius: 8, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.25)" }}>
                  <p style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--blue)", marginBottom: "0.375rem" }}>
                    <MessageSquare size={12} /> Note from {primaryMentor?.name?.split(" ")[0] ?? "your mentor"}
                  </p>
                  <p style={{ color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                    {releasedNote.body}
                  </p>
                </div>
              )}
              {/* Detail body removed — the full lesson lives on the week page.
                  The dashboard card is the gateway, not the lesson itself. */}
              {deadlineDate && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.875rem", borderRadius: 8, background: urgent ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${urgent ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`, marginBottom: "1rem" }}>
                  <Hourglass size={14} color={urgent ? "var(--red)" : "var(--accent)"} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: urgent ? "var(--red)" : "var(--accent)", fontWeight: 600 }}>
                    {daysLeft !== null && daysLeft >= 0
                      ? <>Closes in <strong>{daysLeft}d {hoursLeft}h</strong> · {deadlineDate.toLocaleDateString()}</>
                      : "Deadline passed"}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {(() => {
                  const slug = activeRoadmap ? resolveSlug(activeRoadmap.title) : null;
                  const wNum = parseWeekNumber(releasedWeek.title);
                  if (slug && wNum) {
                    return (
                      <Link href={`/learn/${slug}/${wNum}`} className="forge-btn forge-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                        <BookOpen size={14} /> Open this week
                      </Link>
                    );
                  }
                  return (
                    <Link href="/dashboard/checkin" className="forge-btn forge-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                      <ArrowRight size={14} /> Open this week
                    </Link>
                  );
                })()}
                {/* "Submit work" button removed — submission lives inside the
                    Submission tab once the student opens the week. Avoids
                    duplicate entry points to the same flow. */}
                <Link href={`/dashboard/notes?task=${releasedWeek.id}`} className="forge-btn forge-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  Message mentor
                </Link>
              </div>
            </div>
          );
        })()}

        {/* Closed-week card */}
        {!releasedWeek && lastClosed && (
          <div className="forge-panel" style={{ padding: "1.25rem", marginBottom: "1rem", borderColor: "var(--red)", background: "rgba(239,68,68,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Lock size={18} color="var(--red)" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--red)" }}>
                Closed by deadline
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>{lastClosed.title}</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem" }}>
              This week closed on {lastClosed.closedAt && new Date(lastClosed.closedAt).toLocaleDateString()}. You can't access the content until your mentor extends the deadline or reopens it.
            </p>
            <Link href={`/dashboard/notes?task=${lastClosed.id}&intent=extend`} className="forge-btn forge-btn-primary">Ask {primaryMentor?.name?.split(" ")[0] ?? "your mentor"} to extend</Link>
          </div>
        )}

        {/* Waiting state — distinguish a brand-new mentee (no weeks ever) from
            someone who's finished the released weeks and is between assignments. */}
        {!releasedWeek && !lastClosed && (() => {
          const mentorName = primaryMentor?.name ?? "Your mentor";
          const caughtUp = verifiedTasks > 0;
          // Name the next week to release: first task that isn't verified yet.
          const nextTask = allTasks.find((t) => t.status !== "verified");
          const nextWeekLabel = nextTask?.title.match(/^Week\s+\d+/i)?.[0] ?? null;
          return (
            <div className="forge-panel" style={{ padding: "2rem 1.25rem", textAlign: "center", marginBottom: "1rem" }}>
              <Hourglass size={40} color="var(--text-dim)" strokeWidth={1.5} style={{ margin: "0 auto 1rem" }} />
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                {caughtUp ? "You're all caught up" : "Waiting for your first week"}
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", maxWidth: 460, margin: "0 auto 1.5rem" }}>
                {caughtUp
                  ? `Nice work — you've completed ${verifiedTasks} week${verifiedTasks === 1 ? "" : "s"}. ${mentorName} hasn't released ${nextWeekLabel ?? "your next week"} yet; it'll appear here the moment they do.`
                  : `${mentorName} hasn't released ${nextWeekLabel ?? "any weeks"} yet. You'll see the work here the moment they do.`}
              </p>
              <Link href="/dashboard/notes" className="forge-btn forge-btn-ghost">Message your mentor</Link>
            </div>
          );
        })()}

        {/* Quick stats: weeks complete */}
        {totalTasks > 0 && verifiedTasks > 0 && (
          <div className="forge-panel" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <CheckCircle2 size={20} color="var(--green)" />
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Verified weeks</div>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", color: "var(--green)" }}>{verifiedTasks} / {totalTasks}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
          Welcome Back, {user?.name?.split(" ")[0]}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <ForgePactCard />

      {/* Re-entry: Welcome back after 3+ days absence */}
      {isReturning && !checkedInToday && (
        <div
          className="forge-panel"
          style={{ padding: "1.25rem", marginBottom: "1rem", borderColor: "var(--accent)", background: "rgba(245,158,11,0.04)" }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Flame size={22} color="var(--accent)" strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", marginBottom: "0.25rem" }}>
                Welcome back, {user?.name?.split(" ")[0]}.
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "0.25rem" }}>
                It&apos;s been {daysSinceLastCheckin} day{daysSinceLastCheckin === 1 ? "" : "s"} since your last verified session.
                {" "}The path is still here. Your next task is waiting.
              </p>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                {lastCheckin && `Last session: ${new Date(lastCheckin.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Focus — appears ABOVE Check-in Required so a learner sees
          WHAT they're working on before the alarm to do it. Card is
          compact: title + estimated hours + Resume button straight to the
          week's Content tab. Full lesson lives on the week page. */}
      {activeRoadmap && currentTask && (() => {
        const slug = resolveSlug(activeRoadmap.title);
        const wNum = parseWeekNumber(currentTask.title);
        const resumeHref = slug && wNum ? `/learn/${slug}/${wNum}` : "/dashboard/roadmap";
        return (
          <div className="forge-panel" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} color="var(--accent)" strokeWidth={2} />
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", letterSpacing: "0.05em" }}>Current Focus</h2>
            </div>
            <div style={{ borderLeft: `3px solid ${currentTask.trackColor}`, paddingLeft: "1rem", marginBottom: "1rem" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: currentTask.trackColor, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.375rem" }}>
                {currentTask.trackTitle} → {currentTask.phaseTitle}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "1.0625rem", marginBottom: currentTask.estimatedHours ? "0.5rem" : 0 }}>
                {currentTask.title}
              </div>
              {currentTask.estimatedHours && (
                <div className="flex items-center gap-1" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                  <Clock size={12} /> ~{currentTask.estimatedHours}h estimated
                </div>
              )}
            </div>
            <Link href={resumeHref} className="forge-btn forge-btn-primary" style={{ marginTop: "0.25rem", padding: "0.75rem 2rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              Resume this week <ArrowRight size={14} />
            </Link>
          </div>
        );
      })()}

      {/* Check-in CTA — secondary; the focus card above already tells the
          learner WHAT they're doing today. */}
      {!checkedInToday && activeRoadmap && (
        <div
          className="forge-panel"
          style={{ padding: "1.25rem", marginBottom: "1rem", borderColor: "var(--red)", background: "rgba(255,45,45,0.05)" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", fontWeight: 700, color: "var(--red)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <AlertTriangle size={18} /> Check-in Required
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>You haven&apos;t checked in today. Complete your session before midnight.</div>
            </div>
            <Link href="/dashboard/checkin" className="forge-btn forge-btn-primary">Start Check-in</Link>
          </div>
        </div>
      )}

      {checkedInToday && (
        <div className="forge-panel" style={{ padding: "1.25rem", marginBottom: "1rem", borderColor: "var(--green)", background: "rgba(34,197,94,0.05)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <CheckCircle2 size={28} color="var(--green)" strokeWidth={1.5} />
          <div>
            <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", fontWeight: 700, color: "var(--green)" }}>Today&apos;s Session Complete</div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>You proved your work today. Come back tomorrow.</div>
          </div>
        </div>
      )}

      {/* Student: Org context */}
      {isStudent && orgMembership && (
        <div className="forge-panel" style={{ padding: "0.875rem 1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: "36px", height: "36px", borderRadius: "8px",
              background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-headline)", fontSize: "0.875rem", color: "var(--green)",
            }}>
              <Building2 size={16} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9375rem" }}>{orgMembership.org.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Your Organization</div>
            </div>
          </div>
          <Link href="/dashboard/org" style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--blue)", display: "flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}>
            View Org <ArrowRight size={12} />
          </Link>
        </div>
      )}


      {!activeRoadmap && (
        <div className="forge-panel" style={{ padding: "2.5rem 1.5rem", marginBottom: "1rem", textAlign: "center" }}>
          <div style={{ color: "var(--accent)", marginBottom: "1rem", display: "flex", justifyContent: "center" }}><MapIcon size={48} strokeWidth={1.5} /></div>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", marginBottom: "0.5rem" }}>No Active Roadmap</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>
            Create your learning roadmap to begin. The AI will generate a structured curriculum with real resources.
          </p>
          <Link href="/dashboard/roadmap" className="forge-btn forge-btn-primary" style={{ padding: "0.75rem 2rem" }}>Create Roadmap</Link>
        </div>
      )}

      {activeRoadmap && (
        <>
          {/* Progress + Deadline — compact row */}
          {(() => {
            const daysLeft = getDaysRemaining(activeRoadmap.targetDate);
            const remainingTasks = totalTasks - verifiedTasks;
            const pace = getRecommendedPace(remainingTasks, daysLeft);
            return (
              <div className="forge-panel" style={{ padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                {/* Progress */}
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: "0.25rem" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Progress</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-secondary)" }}>{verifiedTasks}/{totalTasks} · {overallPct}%</span>
                  </div>
                  <div style={{ height: "5px", background: "var(--border)", borderRadius: "3px" }}>
                    <div style={{ height: "100%", width: `${overallPct}%`, background: "var(--accent)", borderRadius: "3px", transition: "width 0.5s" }} />
                  </div>
                </div>

                {/* Deadline */}
                {daysLeft !== null && (
                  <>
                    <div style={{ width: "1px", height: "28px", background: "var(--border)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Target size={16} color={daysLeft <= 7 ? "var(--red)" : daysLeft <= 21 ? "var(--yellow)" : "var(--text-dim)"} />
                      <div>
                        <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", color: daysLeft <= 0 ? "var(--red)" : daysLeft <= 7 ? "var(--red)" : daysLeft <= 21 ? "var(--yellow)" : "var(--text-primary)" }}>
                          {daysLeft <= 0 ? "OVERDUE" : `${daysLeft}d`}
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", color: "var(--text-dim)", letterSpacing: "0.05em" }}>
                          {pace ?? "LEFT"}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* Current Focus card moved ABOVE the Check-in CTA so learners
              see what they're doing before they see the alarm to do it. */}

          {/* Track-progress + Recent-Sessions cards were removed —
              both duplicated content that already lives elsewhere:
                • Roadmap page (Journey card) shows track progress better.
                • Journal page shows sessions in full fidelity.
              Keeping them here created two sources of truth and a cluttered
              overview. The dashboard is now: Pact → Check-in → Progress
              row → Current Focus. Done. */}
        </>
      )}
    </div>
  );
}
