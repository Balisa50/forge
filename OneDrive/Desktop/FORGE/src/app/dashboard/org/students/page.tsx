"use client";

import { useState, useEffect } from "react";
import { Search, AlertTriangle, Shield, Flame, ChevronDown, UserPlus } from "lucide-react";

interface Student {
  user: { id: string; name: string; email: string; image: string | null; integrityScore: number };
  membershipId: string;
  roadmapTitle: string | null;
  progress: number;
  verifiedTasks: number;
  totalTasks: number;
  currentStreak: number;
  bestStreak: number;
  checkedInToday: boolean;
  recentPassRate: number;
  avgScore: number;
  antiCheatFlags: number;
  integrityScore: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"progress" | "integrity" | "streak" | "score">("progress");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");

  useEffect(() => {
    fetch("/api/org/students")
      .then((r) => r.json())
      .then((d) => { setStudents(d.students ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = students
    .filter((s) => s.user.name.toLowerCase().includes(search.toLowerCase()) || s.user.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "progress") return b.progress - a.progress;
      if (sortBy === "integrity") return b.integrityScore - a.integrityScore;
      if (sortBy === "streak") return b.currentStreak - a.currentStreak;
      return b.avgScore - a.avgScore;
    });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    const res = await fetch("/api/org/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: "student" }),
    });
    const data = await res.json();
    setInviteMsg(res.ok ? "Student added successfully." : data.error);
    if (res.ok) { setInviteEmail(""); setTimeout(() => location.reload(), 1000); }
  };

  if (loading) return <div style={{ color: "var(--text-dim)", padding: "2rem" }}>Loading students...</div>;

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 mb-6" style={{ flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
          <Search size={14} color="var(--text-dim)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="forge-input"
            style={{ paddingLeft: "2.25rem" }}
          />
        </div>
        <div className="flex items-center gap-3">
          <div style={{ position: "relative" }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="forge-input"
              style={{ paddingRight: "2rem", width: "auto", fontSize: "0.8125rem" }}
            >
              <option value="progress">Sort: Progress</option>
              <option value="integrity">Sort: Integrity</option>
              <option value="streak">Sort: Streak</option>
              <option value="score">Sort: Avg Score</option>
            </select>
          </div>
          <button onClick={() => setShowInvite(!showInvite)} className="forge-btn forge-btn-primary" style={{ gap: "0.375rem" }}>
            <UserPlus size={14} /> Add Student
          </button>
        </div>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="forge-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div className="flex items-end gap-3">
            <div style={{ flex: 1 }}>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.375rem" }}>Student Email</label>
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="forge-input" placeholder="student@example.com" />
            </div>
            <button onClick={handleInvite} className="forge-btn forge-btn-primary">Add</button>
          </div>
          {inviteMsg && <div style={{ marginTop: "0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: inviteMsg.includes("success") ? "var(--green)" : "var(--red)" }}>{inviteMsg}</div>}
        </div>
      )}

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="forge-card" style={{ padding: "0.75rem 1rem" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Total</div>
          <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", color: "var(--text-primary)" }}>{students.length}</div>
        </div>
        <div className="forge-card" style={{ padding: "0.75rem 1rem" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Checked In Today</div>
          <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", color: "var(--green)" }}>{students.filter((s) => s.checkedInToday).length}</div>
        </div>
        <div className="forge-card" style={{ padding: "0.75rem 1rem" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>At Risk</div>
          <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", color: "var(--red)" }}>{students.filter((s) => s.integrityScore < 50).length}</div>
        </div>
        <div className="forge-card" style={{ padding: "0.75rem 1rem" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Anti-Cheat Flags</div>
          <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", color: "var(--orange)" }}>{students.reduce((s, st) => s + st.antiCheatFlags, 0)}</div>
        </div>
      </div>

      {/* Students table */}
      <div className="forge-panel" style={{ overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 80px 60px", padding: "0.75rem 1.5rem", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          <span>Student</span>
          <span>Roadmap</span>
          <span>Progress</span>
          <span>Streak</span>
          <span>Avg Score</span>
          <span>Integrity</span>
          <span>Flags</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "2rem 1.5rem", color: "var(--text-dim)", fontSize: "0.875rem", textAlign: "center" }}>No students found.</div>
        ) : (
          filtered.map((s) => (
            <div key={s.user.id} style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 80px 80px 80px 80px 60px",
              padding: "0.875rem 1.5rem",
              borderBottom: "1px solid var(--border)",
              alignItems: "center",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Student info */}
              <div className="flex items-center gap-3">
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: s.checkedInToday ? "rgba(34,197,94,0.1)" : "var(--bg-card)",
                  border: s.checkedInToday ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: s.checkedInToday ? "var(--green)" : "var(--text-dim)",
                }}>
                  {s.user.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem" }}>{s.user.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>{s.user.email}</div>
                </div>
              </div>

              {/* Roadmap */}
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: s.roadmapTitle ? "var(--text-secondary)" : "var(--text-dim)" }}>
                {s.roadmapTitle ?? "None"}
              </div>

              {/* Progress */}
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>{s.progress}%</div>
                <div style={{ height: "3px", background: "var(--border)", borderRadius: "2px", marginTop: "0.25rem" }}>
                  <div style={{ height: "100%", width: `${s.progress}%`, background: "var(--accent)", borderRadius: "2px" }} />
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-1">
                <Flame size={12} color={s.currentStreak > 0 ? "var(--accent)" : "var(--text-dim)"} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: s.currentStreak > 0 ? "var(--accent)" : "var(--text-dim)" }}>
                  {s.currentStreak}
                </span>
              </div>

              {/* Avg Score */}
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: s.avgScore >= 7 ? "var(--green)" : s.avgScore >= 5 ? "var(--yellow)" : s.avgScore > 0 ? "var(--red)" : "var(--text-dim)" }}>
                {s.avgScore > 0 ? s.avgScore.toFixed(1) : "—"}
              </div>

              {/* Integrity */}
              <div className="flex items-center gap-1">
                <Shield size={12} color={s.integrityScore >= 80 ? "var(--green)" : s.integrityScore >= 50 ? "var(--yellow)" : "var(--red)"} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: s.integrityScore >= 80 ? "var(--green)" : s.integrityScore >= 50 ? "var(--yellow)" : "var(--red)" }}>
                  {s.integrityScore}
                </span>
              </div>

              {/* Flags */}
              <div>
                {s.antiCheatFlags > 0 ? (
                  <div className="flex items-center gap-1">
                    <AlertTriangle size={12} color="var(--red)" />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--red)" }}>{s.antiCheatFlags}</span>
                  </div>
                ) : (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-dim)" }}>0</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
