"use client";

import { useMemo, useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle, Users, Calendar } from "lucide-react";

interface MenteeRow {
  id: string;
  name: string;
  email: string;
  roadmapTitle: string | null;
  nextWeek: { number: number | null; title: string } | null;
  releasedActiveCount: number;
  totalCount: number;
}

interface Track {
  title: string;
  mentees: MenteeRow[];
}

interface Result {
  released: { menteeId: string; menteeName: string; weekTitle: string; weekNumber: number | null }[];
  skipped: { menteeId: string; menteeName: string; reason: string }[];
}

export default function BulkReleaseForm({ tracks }: { tracks: Track[] }) {
  const allMentees = useMemo(() => tracks.flatMap((t) => t.mentees), [tracks]);
  const releasable = useMemo(
    () => new Set(allMentees.filter((m) => m.nextWeek).map((m) => m.id)),
    [allMentees],
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set(releasable));

  const defaultDate = new Date(Date.now() + 7 * 86_400_000).toISOString().split("T")[0];
  const [deadline, setDeadline] = useState(defaultDate);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleTrack = (track: Track) => {
    const ids = track.mentees.filter((m) => m.nextWeek).map((m) => m.id);
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  };

  const selectedCount = selected.size;
  const deadlineValid =
    deadline && new Date(deadline + "T23:59:00").getTime() > Date.now();

  const handleSubmit = async () => {
    if (!selectedCount || !deadlineValid) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/mentor/release-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menteeIds: Array.from(selected),
          deadlineAt: new Date(deadline + "T23:59:00").toISOString(),
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed (${res.status})`);
      setResult(data);
      // Drop the released ones from the selection so the form is ready for the next round.
      const releasedIds = new Set<string>(data.released.map((r: { menteeId: string }) => r.menteeId));
      setSelected((prev) => new Set(Array.from(prev).filter((id) => !releasedIds.has(id))));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (allMentees.length === 0) {
    return (
      <div className="forge-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--text-dim)" }}>
        You don&apos;t have any active mentees yet. Invite one first.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mentees grouped by track */}
      {tracks.map((track) => {
        const releasableInTrack = track.mentees.filter((m) => m.nextWeek);
        const allInTrackSelected =
          releasableInTrack.length > 0 &&
          releasableInTrack.every((m) => selected.has(m.id));
        return (
          <div key={track.title} className="forge-panel" style={{ padding: "1.25rem 1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "0.875rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={15} color="var(--accent)" />
                <span style={{ fontFamily: "var(--font-headline)", fontSize: "1rem" }}>{track.title}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {track.mentees.length} {track.mentees.length === 1 ? "mentee" : "mentees"}
                </span>
              </div>
              {releasableInTrack.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggleTrack(track)}
                  className="forge-btn forge-btn-ghost"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", minHeight: "unset" }}
                >
                  {allInTrackSelected ? "Deselect all" : "Select all in track"}
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {track.mentees.map((m) => {
                const canRelease = !!m.nextWeek;
                const isSelected = selected.has(m.id);
                return (
                  <label
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 0.875rem",
                      background: isSelected ? "rgba(245,158,11,0.06)" : "var(--bg-card)",
                      border: isSelected ? "1px solid rgba(245,158,11,0.3)" : "1px solid var(--border)",
                      borderRadius: 8,
                      cursor: canRelease ? "pointer" : "not-allowed",
                      opacity: canRelease ? 1 : 0.55,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!canRelease}
                      onChange={() => toggle(m.id)}
                      style={{ width: 16, height: 16, flexShrink: 0, accentColor: "var(--accent)" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{m.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                        {m.email}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "0.8125rem", flexShrink: 0 }}>
                      {m.nextWeek ? (
                        <>
                          <div style={{ color: "var(--accent)", fontWeight: 600 }}>
                            Next: Week {m.nextWeek.number ?? "?"}
                          </div>
                          <div style={{ color: "var(--text-dim)", fontSize: "0.6875rem", fontFamily: "var(--font-mono)", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {m.nextWeek.title}
                          </div>
                        </>
                      ) : m.totalCount === 0 ? (
                        <span style={{ color: "var(--text-dim)" }}>No roadmap yet</span>
                      ) : (
                        <span style={{ color: "var(--green)" }}>All weeks released</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Shared deadline + note */}
      <div className="forge-panel" style={{ padding: "1.25rem 1.5rem" }}>
        <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", marginBottom: "1rem" }}>Shared release settings</h3>
        <div style={{ display: "grid", gap: "0.875rem" }}>
          <div>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "var(--text-dim)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "0.375rem",
              }}
            >
              Deadline (applies to everyone you select)
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={15} color="var(--text-dim)" />
              <input
                type="date"
                value={deadline}
                min={new Date(Date.now() + 86_400_000).toISOString().split("T")[0]}
                onChange={(e) => setDeadline(e.target.value)}
                className="forge-input"
                style={{ fontFamily: "var(--font-mono)", maxWidth: 240 }}
              />
            </div>
            {!deadlineValid && deadline && (
              <p style={{ color: "var(--red)", fontSize: "0.75rem", marginTop: "0.375rem", fontFamily: "var(--font-mono)" }}>
                Pick a future date.
              </p>
            )}
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "var(--text-dim)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "0.375rem",
              }}
            >
              Note to everyone (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Focus on the pivots this week. Send me a screenshot of your Q1 result before Day 5."
              className="forge-input"
              style={{ resize: "vertical", lineHeight: 1.55 }}
            />
            <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginTop: "0.375rem" }}>
              This note appears prominently on each selected mentee&apos;s dashboard. Want a different note per mentee? Open them individually instead.
            </p>
          </div>
        </div>
      </div>

      {/* Submit + result */}
      <div className="forge-panel" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ fontSize: "0.875rem" }}>
          <strong style={{ color: selectedCount ? "var(--accent)" : "var(--text-dim)" }}>{selectedCount}</strong> mentee{selectedCount === 1 ? "" : "s"} selected
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedCount || !deadlineValid || submitting}
          className="forge-btn forge-btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", minHeight: "unset" }}
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Release to {selectedCount || 0} mentee{selectedCount === 1 ? "" : "s"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "0.875rem 1.125rem", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "var(--red)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {result && (
        <div style={{ padding: "1rem 1.25rem", borderRadius: 8, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
            <CheckCircle2 size={16} color="var(--green)" />
            <span style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", color: "var(--green)" }}>
              {result.released.length} released, {result.skipped.length} skipped
            </span>
          </div>
          {result.released.length > 0 && (
            <ul style={{ fontSize: "0.875rem", marginBottom: result.skipped.length ? "0.75rem" : 0, color: "var(--text-secondary)" }}>
              {result.released.map((r) => (
                <li key={r.menteeId} style={{ padding: "0.25rem 0" }}>
                  ✓ <strong style={{ color: "var(--text-primary)" }}>{r.menteeName}</strong> - {r.weekTitle}
                </li>
              ))}
            </ul>
          )}
          {result.skipped.length > 0 && (
            <ul style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              {result.skipped.map((s) => (
                <li key={s.menteeId} style={{ padding: "0.25rem 0" }}>
                  • <strong style={{ color: "var(--text-primary)" }}>{s.menteeName}</strong> - {s.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
