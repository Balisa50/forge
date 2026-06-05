"use client";

import { useState, useEffect } from "react";
import { Plus, ArrowRight, X, UserCheck } from "lucide-react";

interface MLink {
  id: string;
  mentor: { id: string; name: string; email: string; image: string | null };
  mentee: { id: string; name: string; email: string; image: string | null; integrityScore: number };
  note: string | null;
  createdAt: string;
}

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

export default function MentorsPage() {
  const [links, setLinks] = useState<MLink[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPair, setShowPair] = useState(false);
  const [mentorId, setMentorId] = useState("");
  const [menteeId, setMenteeId] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/org/mentors").then((r) => r.json()),
      fetch("/api/org/members").then((r) => r.json()),
    ]).then(([linksData, membersData]) => {
      setLinks(linksData.links ?? []);
      setMembers(membersData.members ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const mentors = members.filter((m) => ["owner", "admin", "instructor", "mentor"].includes(m.role));
  const students = members.filter((m) => m.role === "student");

  const handlePair = async () => {
    if (!mentorId || !menteeId) { setMsg("Select both mentor and student."); return; }
    const res = await fetch("/api/org/mentors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId, menteeId, note }),
    });
    const data = await res.json();
    if (res.ok) {
      setShowPair(false);
      setMsg("");
      location.reload();
    } else {
      setMsg(data.error);
    }
  };

  const handleRemove = async (linkId: string) => {
    await fetch("/api/org/mentors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId }),
    });
    setLinks(links.filter((l) => l.id !== linkId));
  };

  if (loading) return <div style={{ color: "var(--text-dim)", padding: "2rem" }}>Loading mentor pairs...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem" }}>Mentor Pairs</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Pair mentors with students for guided accountability.
          </p>
        </div>
        <button onClick={() => setShowPair(!showPair)} className="forge-btn forge-btn-primary" style={{ gap: "0.375rem" }}>
          <Plus size={14} /> Pair Mentor
        </button>
      </div>

      {showPair && (
        <div className="forge-panel" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Mentor</label>
              <select className="forge-input" value={mentorId} onChange={(e) => setMentorId(e.target.value)}>
                <option value="">Select mentor...</option>
                {mentors.map((m) => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name} ({m.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Student</label>
              <select className="forge-input" value={menteeId} onChange={(e) => setMenteeId(e.target.value)}>
                <option value="">Select student...</option>
                {students.map((m) => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Note (optional)</label>
              <input type="text" className="forge-input" placeholder="e.g. Focus on React" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePair} className="forge-btn forge-btn-primary">Create Pair</button>
            <button onClick={() => setShowPair(false)} className="forge-btn forge-btn-ghost">Cancel</button>
          </div>
          {msg && <div style={{ marginTop: "0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--red)" }}>{msg}</div>}
        </div>
      )}

      {links.length === 0 ? (
        <div className="forge-panel" style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
          <UserCheck size={36} color="var(--text-dim)" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-dim)", fontSize: "0.9375rem" }}>No mentor pairs yet. Pair a mentor with a student to enable guided oversight.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {links.map((l) => (
            <div key={l.id} className="forge-panel" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <div className="flex items-center gap-4">
                {/* Mentor */}
                <div className="flex items-center gap-2">
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--blue)",
                  }}>
                    {l.mentor.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem" }}>{l.mentor.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--blue)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Mentor</div>
                  </div>
                </div>

                <ArrowRight size={16} color="var(--text-dim)" />

                {/* Mentee */}
                <div className="flex items-center gap-2">
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--accent)",
                  }}>
                    {l.mentee.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem" }}>{l.mentee.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)" }}>
                      Integrity: <span style={{ color: l.mentee.integrityScore >= 80 ? "var(--green)" : l.mentee.integrityScore >= 50 ? "var(--yellow)" : "var(--red)" }}>{l.mentee.integrityScore}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {l.note && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>{l.note}</span>}
                <button
                  onClick={() => handleRemove(l.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0.375rem", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
