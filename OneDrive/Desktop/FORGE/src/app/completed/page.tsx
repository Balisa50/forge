import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Trophy, Award, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 300; // cache for 5 minutes

interface CompletedRow {
  userName: string | null;
  roadmapTitle: string;
  totalTasks: number;
  verifiedAt: Date;
  mentorName: string | null;
}

export default async function WallOfFamePage() {
  // A roadmap is "completed" when every task on it has status=verified.
  // Compute at query time so we never need a new DB column.
  const roadmaps = await prisma.roadmap.findMany({
    where: { isActive: true },
    select: {
      title: true,
      user: {
        select: {
          name: true,
          // The MentorLinks where this user is the mentee (relation "MenteeUser").
          mentees: {
            where: { isActive: true },
            select: { mentor: { select: { name: true, mentorDisplayName: true } } },
            take: 1,
          },
        },
      },
      tracks: {
        select: {
          phases: {
            select: {
              tasks: { select: { status: true, verifiedAt: true } },
            },
          },
        },
      },
    },
  });

  const completed: CompletedRow[] = [];
  for (const r of roadmaps) {
    const tasks = r.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks));
    if (tasks.length === 0) continue;
    const allVerified = tasks.every((t) => t.status === "verified");
    if (!allVerified) continue;
    const latestVerifiedAt = tasks
      .map((t) => t.verifiedAt)
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    completed.push({
      userName: r.user.name,
      roadmapTitle: r.title,
      totalTasks: tasks.length,
      verifiedAt: latestVerifiedAt ?? new Date(),
      mentorName: r.user.mentees[0]?.mentor.mentorDisplayName ?? r.user.mentees[0]?.mentor.name ?? null,
    });
  }
  // Most recent finishers first.
  completed.sort((a, b) => b.verifiedAt.getTime() - a.verifiedAt.getTime());

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: "2rem 1.25rem 4rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)", marginBottom: "1.5rem" }}
        >
          <ArrowLeft size={12} /> home
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <Trophy size={28} color="var(--accent)" />
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.25rem", letterSpacing: "0.04em" }}>
            Wall of Fame
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "2.5rem" }}>
          Students who completed every week of their roadmap. Mentor-verified, every task. This is what real
          accountability looks like.
        </p>

        {completed.length === 0 ? (
          <div className="forge-panel" style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
            <Award size={36} color="var(--text-dim)" style={{ margin: "0 auto 1rem" }} />
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "0.5rem" }}>
              The wall is still empty.
            </p>
            <p style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>
              The first FORGE graduate is being trained right now. Their name will appear here when they
              ship.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {completed.map((c, i) => (
              <li
                key={`${c.userName}-${i}`}
                className="forge-panel"
                style={{
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background:
                      i === 0
                        ? "linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)"
                        : "var(--bg-card)",
                    color: i === 0 ? "white" : "var(--accent)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    fontFamily: "var(--font-headline)",
                    fontSize: "1.125rem",
                  }}
                >
                  {i === 0 ? <Trophy size={20} /> : <Award size={20} />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem" }}>
                    {c.userName ?? "Anonymous"}
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.125rem" }}>
                    Completed <strong style={{ color: "var(--accent)" }}>{c.roadmapTitle}</strong>
                    {c.mentorName && (
                      <>
                        {" "}with{" "}
                        <span style={{ color: "var(--text-primary)" }}>{c.mentorName}</span>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {c.totalTasks} weeks
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.125rem" }}>
                    {c.verifiedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
