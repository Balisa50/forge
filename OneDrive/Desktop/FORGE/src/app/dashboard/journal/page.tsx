import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

/**
 * Journal — the student's permanent record of every check-in.
 *
 * IMPORTANT: a check-in is NEVER displayed as "PASSED" automatically just
 * because the student submitted it. The display status is derived:
 *   - If the check-in has a mentor_async Interrogation that the mentor has
 *     not yet reviewed (mentorReviewedAt is null) -> "AWAITING REVIEW"
 *   - If the mentor reviewed and passed=true   -> "PASSED" (+ score + rating)
 *   - If the mentor reviewed and passed=false  -> "NEEDS REWORK"
 *   - If there is no interrogation (no mentor questions)
 *       -> fall back to checkin.status (the FORGE solo-learner default)
 *
 * The mentor's 1-5 rating (Task.mentorRating) and final feedback are surfaced
 * here too, so the student sees how they performed without hunting for it.
 */
export default async function JournalPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const checkins = await prisma.checkin.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      interrogation: true,
      task: { select: { title: true, mentorRating: true } },
      track: { select: { title: true, color: true } },
    },
  });

  return (
    <div>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", marginBottom: "0.5rem" }}>Journal</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Every session, permanently recorded.</p>

      {checkins.length === 0 ? (
        <div className="forge-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📖</div>
          <p style={{ color: "var(--text-secondary)" }}>No sessions yet. Complete your first check-in to start your journal.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {checkins.map((c) => {
            const interrogation = c.interrogation;
            const awaitingReview = !!interrogation && !interrogation.mentorReviewedAt;
            const mentorPassed = !!interrogation && !!interrogation.mentorReviewedAt && interrogation.passed;
            const mentorRejected = !!interrogation && !!interrogation.mentorReviewedAt && !interrogation.passed;
            const display: { label: string; tone: "green" | "red" | "yellow" } =
              awaitingReview
                ? { label: "AWAITING REVIEW", tone: "yellow" }
                : mentorPassed
                ? { label: "PASSED", tone: "green" }
                : mentorRejected
                ? { label: "NEEDS REWORK", tone: "red" }
                : c.status === "passed"
                ? { label: "PASSED", tone: "green" }
                : c.status === "failed"
                ? { label: "FAILED", tone: "red" }
                : { label: String(c.status).toUpperCase(), tone: "yellow" };
            const toneColor = display.tone === "green" ? "var(--green)" : display.tone === "red" ? "var(--red)" : "var(--yellow)";
            const toneBg = display.tone === "green" ? "rgba(0,255,136,0.1)" : display.tone === "red" ? "rgba(255,45,45,0.1)" : "rgba(255,214,10,0.1)";
            return (
              <div key={c.id} className="forge-panel" style={{ padding: "1.5rem" }}>
                <div className="flex items-start justify-between gap-4 mb-3" style={{ flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.125rem", letterSpacing: "0.05em" }}>{c.task.title}</div>
                    <div className="flex items-center gap-2 mt-1" style={{ flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6875rem", color: "var(--text-dim)" }}>{formatDate(c.createdAt)}</span>
                      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6875rem", color: c.track.color }}>● {c.track.title}</span>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: toneColor,
                    background: toneBg,
                    border: `1px solid ${toneColor}`,
                    padding: "0.25rem 0.75rem",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                  }}>
                    {display.label}
                  </div>
                </div>

                <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: interrogation ? "1rem" : 0 }}>
                  {c.description || (awaitingReview ? "Submitted — waiting for the mentor's review." : "Submitted.")}
                </p>

                {interrogation && interrogation.mentorReviewedAt && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.875rem" }}>
                    <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                      <span
                        className="score-pill"
                        style={{
                          color:
                            interrogation.overallScore >= 7
                              ? "var(--green)"
                              : interrogation.overallScore >= 5
                              ? "var(--yellow)"
                              : "var(--red)",
                        }}
                      >
                        Score: {interrogation.overallScore.toFixed(1)}/10
                      </span>
                      {c.task.mentorRating !== null && c.task.mentorRating !== undefined && (
                        <span className="score-pill" style={{ color: "var(--accent)" }}>
                          Mentor rating: {c.task.mentorRating}/5
                        </span>
                      )}
                    </div>
                    {interrogation.feedback && (
                      <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", marginTop: "0.625rem", fontStyle: "italic" }}>
                        &ldquo;{interrogation.feedback}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {interrogation && !interrogation.mentorReviewedAt && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.875rem" }}>
                    <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", fontStyle: "italic" }}>
                      Your mentor has not reviewed this submission yet. The result here will update the moment they do.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
