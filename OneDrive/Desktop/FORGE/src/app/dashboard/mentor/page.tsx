import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Users, TrendingUp, Eye, ArrowRight, MessageSquare, UserPlus, Send } from "lucide-react";

export default async function MentorDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const mentor = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  // Get all mentee links for this user
  const mentorLinks = await prisma.mentorLink.findMany({
    where: { mentorId: session.user.id, isActive: true },
    include: {
      mentee: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          integrityScore: true,
        },
      },
    },
  });

  if (mentorLinks.length === 0) {
    return (
      <div>
        {/* Header */}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
              Welcome, {mentor?.name?.split(" ")[0]}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link href="/dashboard/mentor/invite" className="forge-btn forge-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.125rem" }}>
            <UserPlus size={15} /> Invite a mentee
          </Link>
        </div>

        <div className="forge-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <Users size={48} color="var(--text-dim)" strokeWidth={1.5} style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>No mentees yet</h2>
          <p style={{ color: "var(--text-dim)", fontSize: "0.9375rem", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6 }}>
            Generate an invite for your first mentee using the button above — you&apos;ll get a join link and a permanent Personal ID to send them privately.
          </p>
        </div>
      </div>
    );
  }

  // Fetch detailed progress for each mentee. Per-mentee try/catch so one
  // broken record doesn't crash the entire dashboard.
  const mentees = (await Promise.all(
    mentorLinks.map(async (link) => {
      try {
        const roadmap = await prisma.roadmap.findFirst({
          where: { userId: link.mentee.id, isActive: true },
          include: {
            tracks: { include: { phases: { include: { tasks: true } } } },
            checkins: {
              orderBy: { createdAt: "desc" },
              take: 10,
              include: {
                task: { select: { title: true } },
              },
            },
          },
        });

        const allTasks = roadmap?.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks)) ?? [];
        const verifiedTasks = allTasks.filter((t) => t.status === "verified").length;
        const totalTasks = allTasks.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastCheckin = roadmap?.checkins[0];
        const lastDate = lastCheckin ? new Date(lastCheckin.createdAt) : null;
        if (lastDate) lastDate.setHours(0, 0, 0, 0);

        return {
          user: link.mentee,
          note: link.note,
          roadmapTitle: roadmap?.title ?? null,
          progress: totalTasks > 0 ? Math.round((verifiedTasks / totalTasks) * 100) : 0,
          verifiedTasks,
          totalTasks,
          checkedInToday: lastDate?.getTime() === today.getTime(),
          recentCheckins: roadmap?.checkins ?? [],
        };
      } catch (e) {
        console.error(`[mentor-dashboard] Failed to load mentee ${link.mentee.id}:`, e);
        return {
          user: link.mentee,
          note: link.note,
          roadmapTitle: null,
          progress: 0,
          verifiedTasks: 0,
          totalTasks: 0,
          checkedInToday: false,
          recentCheckins: [],
        };
      }
    })
  ));

  // Aggregate stats
  const totalMentees = mentees.length;
  const activeToday = mentees.filter((m) => m.checkedInToday).length;
  const atRisk = mentees.filter((m) => m.user.integrityScore < 60).length;
  const avgIntegrity = Math.round(mentees.reduce((s, m) => s + m.user.integrityScore, 0) / totalMentees);
  const avgStreak = 0; // removed streak tracking
  const avgProgress = Math.round(mentees.reduce((s, m) => s + m.progress, 0) / totalMentees);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
            Welcome, {mentor?.name?.split(" ")[0]}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/dashboard/mentor/release" className="forge-btn forge-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.125rem" }}>
            <Send size={15} /> Release a week
          </Link>
          <Link href="/dashboard/mentor/invite" className="forge-btn forge-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.125rem" }}>
            <UserPlus size={15} /> Invite a mentee
          </Link>
        </div>
      </div>

      {/* At-risk alert */}
      {atRisk > 0 && (
        <div className="forge-panel" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem", borderColor: "var(--red)", background: "rgba(255,45,45,0.05)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <AlertTriangle size={18} color="var(--red)" />
          <div>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, color: "var(--red)", fontSize: "0.9375rem" }}>
              {atRisk} student{atRisk !== 1 ? "s" : ""} at risk
            </span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginLeft: "0.5rem" }}>
              — integrity score below 60. They may need your attention.
            </span>
          </div>
        </div>
      )}

      {/* Aggregate Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Mentees", value: totalMentees, icon: Users, color: "var(--blue)" },
          { label: "Active Today", value: `${activeToday}/${totalMentees}`, icon: Eye, color: activeToday === totalMentees ? "var(--green)" : "var(--yellow)" },
          { label: "Avg Integrity", value: avgIntegrity, icon: Shield, color: avgIntegrity >= 20 ? "var(--green)" : "var(--yellow)" },
          { label: "Avg Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "var(--green)" },
        ].map((stat) => (
          <div key={stat.label} className="forge-panel" style={{ padding: "1.25rem 1.5rem" }}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} color={stat.color} />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{stat.label}</div>
            </div>
            <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", color: stat.color, lineHeight: 1 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Avg Integrity bar */}
      <div className="forge-panel" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Shield size={16} color={avgIntegrity >= 80 ? "var(--green)" : avgIntegrity >= 50 ? "var(--yellow)" : "var(--red)"} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>Avg Integrity</div>
        <div style={{ flex: 1, height: "6px", background: "var(--border)", borderRadius: "3px" }}>
          <div style={{ height: "100%", width: `${avgIntegrity}%`, background: avgIntegrity >= 80 ? "var(--green)" : avgIntegrity >= 50 ? "var(--yellow)" : "var(--red)", borderRadius: "3px", transition: "width 0.5s" }} />
        </div>
        <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", color: avgIntegrity >= 80 ? "var(--green)" : avgIntegrity >= 50 ? "var(--yellow)" : "var(--red)", flexShrink: 0 }}>{avgIntegrity}</div>
      </div>

      {/* Section title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Your Mentees
        </div>
        <Link
          href="/dashboard/mentor/reviews"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--accent)", padding: "0.4rem 0.75rem", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 6 }}
        >
          Pending reviews <ArrowRight size={11} />
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {mentees.map((m) => (
          <Link
            key={m.user.id}
            href={`/dashboard/mentor/${m.user.id}`}
            className="forge-panel"
            style={{ padding: "1.5rem", display: "block", textDecoration: "none", color: "inherit", transition: "border-color 0.15s" }}
          >
            {/* Mentee header */}
            <div className="flex items-center justify-between mb-4" style={{ flexWrap: "wrap", gap: "1rem" }}>
              <div className="flex items-center gap-3">
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  background: m.checkedInToday ? "rgba(34,197,94,0.1)" : "var(--bg-card)",
                  border: m.checkedInToday ? "2px solid var(--green)" : "2px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-headline)", fontSize: "1rem",
                  color: m.checkedInToday ? "var(--green)" : "var(--text-dim)",
                }}>
                  {m.user.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "1.0625rem" }}>{m.user.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
                    {m.roadmapTitle ?? "No roadmap"}{m.note ? ` · ${m.note}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Shield size={14} color={m.user.integrityScore >= 80 ? "var(--green)" : m.user.integrityScore >= 50 ? "var(--yellow)" : "var(--red)"} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", fontWeight: 600, color: m.user.integrityScore >= 80 ? "var(--green)" : m.user.integrityScore >= 50 ? "var(--yellow)" : "var(--red)" }}>{m.user.integrityScore}</span>
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6875rem",
                  padding: "0.25rem 0.625rem",
                  borderRadius: "4px",
                  background: m.checkedInToday ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                  color: m.checkedInToday ? "var(--green)" : "var(--red)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {m.checkedInToday ? "Active Today" : "No Check-in"}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-4">
              <div style={{ flex: 1, height: "6px", background: "var(--border)", borderRadius: "3px" }}>
                <div style={{ height: "100%", width: `${m.progress}%`, background: "var(--accent)", borderRadius: "3px", transition: "width 0.5s" }} />
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-secondary)", flexShrink: 0 }}>
                {m.progress}% · {m.verifiedTasks}/{m.totalTasks}
              </span>
            </div>

            {/* Recent sessions */}
            {m.recentCheckins.length > 0 && (
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Recent Sessions</div>
                <div className="flex flex-col gap-1">
                  {m.recentCheckins.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between" style={{ padding: "0.375rem 0", borderBottom: "1px solid var(--border)" }}>
                      <div className="flex items-center gap-2">
                        {c.status === "passed"
                          ? <CheckCircle2 size={12} color="var(--green)" />
                          : <XCircle size={12} color="var(--red)" />
                        }
                        <span style={{ fontSize: "0.8125rem" }}>{c.task?.title ?? "—"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {c.interrogation && (
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: c.interrogation.passed ? "var(--green)" : "var(--red)" }}>
                            {c.interrogation.overallScore.toFixed(1)}
                          </span>
                        )}
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
                          {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Click to open roadmap · leave per-week notes
              </span>
              <ArrowRight size={14} style={{ color: "var(--text-dim)" }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
