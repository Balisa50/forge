"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Users, Clock } from "lucide-react";

interface Cohort {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  deadline: string;
  isActive: boolean;
  _count: { enrollments: number };
}

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", startDate: "", deadline: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/org/cohorts")
      .then((r) => r.json())
      .then((d) => { setCohorts(d.cohorts ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.startDate || !form.deadline) {
      setMsg("Name, start date, and deadline required.");
      return;
    }
    const res = await fetch("/api/org/cohorts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setCohorts([data.cohort, ...cohorts]);
      setShowCreate(false);
      setForm({ name: "", description: "", startDate: "", deadline: "" });
      setMsg("");
    } else {
      setMsg(data.error);
    }
  };

  if (loading) return <div style={{ color: "var(--text-dim)", padding: "2rem" }}>Loading cohorts...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem" }}>Cohorts</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="forge-btn forge-btn-primary" style={{ gap: "0.375rem" }}>
          <Plus size={14} /> New Cohort
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="forge-panel" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Cohort Name</label>
              <input type="text" className="forge-input" placeholder="e.g. Full-Stack Batch #3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Description</label>
              <input type="text" className="forge-input" placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Start Date</label>
              <input type="date" className="forge-input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Deadline</label>
              <input type="date" className="forge-input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleCreate} className="forge-btn forge-btn-primary">Create Cohort</button>
            <button onClick={() => setShowCreate(false)} className="forge-btn forge-btn-ghost">Cancel</button>
          </div>
          {msg && <div style={{ marginTop: "0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--red)" }}>{msg}</div>}
        </div>
      )}

      {/* Cohort list */}
      {cohorts.length === 0 ? (
        <div className="forge-panel" style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-dim)", fontSize: "0.9375rem" }}>No cohorts yet. Create your first cohort to organize students into groups with deadlines.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cohorts.map((c) => {
            const start = new Date(c.startDate);
            const deadline = new Date(c.deadline);
            const now = new Date();
            const totalDays = Math.ceil((deadline.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const elapsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const pct = Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)));
            const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div key={c.id} className="forge-panel" style={{ padding: "1.25rem" }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem" }}>{c.name}</h3>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6875rem",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "4px",
                    background: c.isActive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    color: c.isActive ? "var(--green)" : "var(--red)",
                    textTransform: "uppercase",
                  }}>
                    {c.isActive ? "Active" : "Closed"}
                  </div>
                </div>
                {c.description && <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem" }}>{c.description}</p>}

                <div className="flex items-center gap-4 mb-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {c._count.enrollments}</span>
                </div>

                {/* Timeline bar */}
                <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", marginBottom: "0.5rem" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: daysLeft > 7 ? "var(--accent)" : daysLeft > 0 ? "var(--yellow)" : "var(--red)", borderRadius: "2px" }} />
                </div>
                <div className="flex items-center gap-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: daysLeft > 7 ? "var(--text-dim)" : daysLeft > 0 ? "var(--yellow)" : "var(--red)" }}>
                  <Clock size={11} /> {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
