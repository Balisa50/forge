"use client";

/**
 * MentorWeekDetail — the re-engineered mentor view of one week (Task).
 *
 * Replaces the old single-column wall of text with: a header bar carrying status
 * + deadline controls, then tabbed content (Overview / Mastery / Resources /
 * Submission / Conversation / Activity). Every content section has a pencil that
 * opens an inline editor; saving PUTs to /api/mentor/tasks/:id/content (the DB
 * Task row — per-mentee, production-safe) and calls onChanged() to refresh.
 *
 * Lifecycle actions (release/extend/close/unlock/verify/reopen) stay owned by
 * the page (they open shared dialogs) and arrive as onRelease / onAction props.
 */

import { useState } from "react";
import {
  Pencil, Plus, Trash2, Check, ArrowUp, ArrowDown, Clock, Unlock, Lock,
  ShieldCheck, RotateCcw, Send, Pin, Link2, ExternalLink, Loader2, ListChecks,
  BookOpen, Upload, MessageSquare, Activity as ActivityIcon, FileText,
} from "lucide-react";
import { parseTaskDetail } from "@/lib/parse-task-detail";
import ForgeMarkdown from "@/components/ForgeMarkdown";
import SubmissionConfigPicker from "@/components/SubmissionConfigPicker";
import SubmissionViewer from "@/components/SubmissionViewer";
import MentorQuestionBank from "@/components/MentorQuestionBank";
import type { EvidenceData } from "@/lib/submission-types";

interface Checkin {
  id: string; description: string; evidenceType: string;
  evidenceUrl: string | null; videoUrl: string | null;
  evidenceData: EvidenceData | null; status: string; attemptNum: number; createdAt: string;
}
interface Comment {
  id: string; body: string; createdAt: string; readAt: string | null;
  authorRole: "mentor" | "mentee"; kind: string; mentorId: string;
}
interface GrantedResource { id: string; title: string; url: string; note: string | null; createdAt: string; }

export interface WeekTask {
  id: string; title: string; detail: string; why: string | null; milestone: string | null;
  resources: string[]; estimatedHours: number | null; status: string;
  verifiedAt: string | null; releasedAt: string | null; deadline: string | null; closedAt: string | null;
  submissionConfig: unknown; checkins: Checkin[]; mentorComments: Comment[]; mentorResources: GrantedResource[];
}

const STATUS_COLOR: Record<string, string> = {
  locked: "var(--text-dim)", available: "var(--accent)", in_progress: "var(--blue)",
  pending_verification: "var(--yellow)", verified: "var(--green)", failed: "var(--red)",
};
const STATUS_LABEL: Record<string, string> = {
  locked: "Locked", available: "Available", in_progress: "In progress",
  pending_verification: "Awaiting review", verified: "Passed", failed: "Failed",
};

const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const sectionLabel: React.CSSProperties = {
  ...mono, fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase",
  color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "0.4rem",
};
const card: React.CSSProperties = {
  padding: "0.75rem 0.875rem", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)",
};

/** "Title — URL (note)" → parts; tolerant of legacy em-dash / hyphen separators. */
function parseResource(raw: string): { title: string; url: string; note: string } {
  const url = raw.match(/(https?:\/\/[^\s)]+)/)?.[0] ?? "";
  const note = raw.match(/\(([^)]+)\)\s*$/)?.[1] ?? "";
  let title = raw;
  if (url) title = title.replace(/\s+[-—–]?\s*https?:\/\/\S+.*$/, "").trim();
  if (note) title = title.replace(/\s*\([^)]+\)\s*$/, "").trim();
  if (title === raw) title = raw.split(/\s+[—–-]\s+/)[0]?.trim() || raw;
  return { title, url, note };
}
function composeResource(r: { title: string; url: string; note: string }): string {
  const base = r.url ? `${r.title} — ${r.url}` : r.title;
  return r.note.trim() ? `${base} (${r.note.trim()})` : base;
}

function IconBtn({ onClick, title, children, color }: { onClick: () => void; title: string; children: React.ReactNode; color?: string }) {
  return (
    <button type="button" onClick={onClick} title={title}
      style={{ background: "none", border: "none", cursor: "pointer", color: color ?? "var(--text-dim)", padding: "0.2rem", display: "inline-flex", alignItems: "center", borderRadius: 4 }}>
      {children}
    </button>
  );
}

/** Inline single-text editor (textarea). */
function TextEditor({ initial, onSave, onCancel, saving, placeholder, rows = 4 }: {
  initial: string; onSave: (v: string) => void; onCancel: () => void; saving: boolean; placeholder?: string; rows?: number;
}) {
  const [v, setV] = useState(initial);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
      <textarea value={v} onChange={(e) => setV(e.target.value)} rows={rows} placeholder={placeholder}
        style={{ width: "100%", padding: "0.5rem 0.75rem", background: "var(--bg)", border: "1px solid var(--accent)", borderRadius: 8, color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "0.875rem", resize: "vertical" }} />
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} className="forge-btn forge-btn-ghost" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8125rem" }}>Cancel</button>
        <button type="button" onClick={() => onSave(v)} disabled={saving} className="forge-btn forge-btn-primary" style={{ padding: "0.35rem 0.875rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
        </button>
      </div>
    </div>
  );
}

/** Inline list editor: rows of text with add / remove / reorder. */
function ListEditor({ initial, onSave, onCancel, saving, placeholder }: {
  initial: string[]; onSave: (v: string[]) => void; onCancel: () => void; saving: boolean; placeholder?: string;
}) {
  const [rows, setRows] = useState<string[]>(initial.length ? initial : [""]);
  const set = (i: number, val: string) => setRows((r) => r.map((x, j) => (j === i ? val : x)));
  const add = () => setRows((r) => [...r, ""]);
  const del = (i: number) => setRows((r) => (r.length === 1 ? [""] : r.filter((_, j) => j !== i)));
  const move = (i: number, d: -1 | 1) => setRows((r) => {
    const j = i + d; if (j < 0 || j >= r.length) return r;
    const c = [...r]; [c[i], c[j]] = [c[j], c[i]]; return c;
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: "0.35rem", alignItems: "flex-start" }}>
          <span style={{ ...mono, fontSize: "0.75rem", color: "var(--text-dim)", paddingTop: "0.5rem", width: 18, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
          <textarea value={row} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} rows={1}
            style={{ flex: 1, minWidth: 0, padding: "0.4rem 0.6rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "0.85rem", resize: "vertical" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <IconBtn onClick={() => move(i, -1)} title="Move up"><ArrowUp size={12} /></IconBtn>
            <IconBtn onClick={() => move(i, 1)} title="Move down"><ArrowDown size={12} /></IconBtn>
          </div>
          <IconBtn onClick={() => del(i)} title="Remove" color="var(--red)"><Trash2 size={13} /></IconBtn>
        </div>
      ))}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
        <button type="button" onClick={add} className="forge-btn forge-btn-ghost" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", display: "inline-flex", gap: "0.3rem", alignItems: "center" }}><Plus size={12} /> Add</button>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" onClick={onCancel} className="forge-btn forge-btn-ghost" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8125rem" }}>Cancel</button>
          <button type="button" onClick={() => onSave(rows.map((r) => r.trim()).filter(Boolean))} disabled={saving} className="forge-btn forge-btn-primary" style={{ padding: "0.35rem 0.875rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

type TabKey = "overview" | "mastery" | "resources" | "submission" | "conversation" | "activity";

export default function MentorWeekDetail({
  task, menteeId, menteeName, busy, onRelease, onAction, onChanged,
}: {
  task: WeekTask;
  menteeId: string;
  menteeName: string;
  busy: boolean;
  onRelease: (mode: "release" | "extend") => void;
  onAction: (action: "unlock" | "verify" | "reopen" | "close") => void;
  onChanged: () => void | Promise<void>;
}) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [posting, setPosting] = useState(false);
  const [newRes, setNewRes] = useState({ title: "", url: "", note: "" });

  const d = parseTaskDetail(task.detail ?? "");
  const checkpoints = [...d.questions, ...d.exercises];
  const messages = task.mentorComments.filter((c) => c.kind !== "action_log");
  const logs = task.mentorComments.filter((c) => c.kind === "action_log");
  const curated = task.resources.map(parseResource);

  async function saveContent(payload: Record<string, unknown>) {
    setSaving(true);
    try {
      const r = await fetch(`/api/mentor/tasks/${task.id}/content`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Save failed");
      setEditing(null);
      await onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function postMessage(kind: "message" | "note") {
    if (!msg.trim()) return;
    setPosting(true);
    try {
      const r = await fetch("/api/mentor/comments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, menteeId, body: msg.trim(), kind }),
      });
      if (!r.ok) throw new Error("Failed to post");
      setMsg("");
      await onChanged();
    } finally {
      setPosting(false);
    }
  }

  async function grantResource() {
    if (!newRes.title.trim() || !newRes.url.trim()) return;
    setPosting(true);
    try {
      const r = await fetch("/api/mentor/resources", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, menteeId, title: newRes.title.trim(), url: newRes.url.trim(), note: newRes.note.trim() || undefined }),
      });
      if (!r.ok) throw new Error("Failed to add");
      setNewRes({ title: "", url: "", note: "" });
      await onChanged();
    } finally {
      setPosting(false);
    }
  }

  async function deleteGranted(id: string) {
    setPosting(true);
    try {
      await fetch(`/api/mentor/resources?id=${id}`, { method: "DELETE" });
      await onChanged();
    } finally {
      setPosting(false);
    }
  }

  const editPencil = (key: string) => <IconBtn onClick={() => setEditing(key)} title="Edit"><Pencil size={13} /></IconBtn>;

  const TABS: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "overview", label: "Overview", icon: <FileText size={13} /> },
    { key: "mastery", label: "Mastery", icon: <ListChecks size={13} />, count: checkpoints.length || undefined },
    { key: "resources", label: "Resources", icon: <BookOpen size={13} />, count: (curated.length + task.mentorResources.length) || undefined },
    { key: "submission", label: "Submission", icon: <Upload size={13} />, count: task.checkins.length || undefined },
    { key: "conversation", label: "Conversation", icon: <MessageSquare size={13} />, count: messages.length || undefined },
    { key: "activity", label: "Activity", icon: <ActivityIcon size={13} />, count: logs.length || undefined },
  ];

  return (
    <div style={{ padding: "0 1rem 1rem 1rem", borderTop: "1px solid var(--border)" }}>
      {/* ── Header bar: status + hours + deadline controls (top-right) ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between", marginTop: "0.875rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 0.875rem", alignItems: "center" }}>
          <span style={{ ...mono, fontSize: "0.6875rem", padding: "0.15rem 0.6rem", borderRadius: 10, border: `1px solid ${STATUS_COLOR[task.status] ?? "var(--border)"}`, color: STATUS_COLOR[task.status] ?? "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {STATUS_LABEL[task.status] ?? task.status}
          </span>
          <span style={{ ...mono, fontSize: "0.75rem", color: "var(--text-dim)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <Clock size={11} /> {task.estimatedHours != null ? `~${task.estimatedHours}h` : "—"}
            {editPencil("hours")}
          </span>
          {task.closedAt ? (
            <span style={{ ...mono, fontSize: "0.7rem", color: "var(--red)" }}>CLOSED {new Date(task.closedAt).toLocaleDateString()}</span>
          ) : task.deadline ? (
            <span style={{ ...mono, fontSize: "0.7rem", color: "var(--accent)" }}>Due {new Date(task.deadline).toLocaleDateString()}</span>
          ) : task.releasedAt ? (
            <span style={{ ...mono, fontSize: "0.7rem", color: "var(--accent)" }}>Released · no deadline</span>
          ) : null}
        </div>
        {/* Deadline / lifecycle controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {task.status === "locked" && !task.closedAt && (
            <button onClick={() => onRelease("release")} disabled={busy} className="forge-btn forge-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}><Unlock size={12} /> Release</button>
          )}
          {(task.deadline || task.closedAt) && task.status !== "verified" && (
            <button onClick={() => onRelease("extend")} disabled={busy} className="forge-btn forge-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.7rem", fontSize: "0.78rem", color: "var(--accent)", borderColor: "rgba(245,158,11,0.3)" }}><Clock size={12} /> {task.closedAt ? "Reopen + extend" : "Extend"}</button>
          )}
          {(task.status === "available" || task.status === "in_progress") && !task.closedAt && (
            <button onClick={() => onAction("close")} disabled={busy} className="forge-btn forge-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.7rem", fontSize: "0.78rem", color: "var(--red)", borderColor: "rgba(239,68,68,0.3)" }}><Lock size={12} /> Close</button>
          )}
          {(task.status === "available" || task.status === "in_progress" || task.status === "pending_verification") && (
            <button onClick={() => onAction("verify")} disabled={busy} className="forge-btn forge-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.7rem", fontSize: "0.78rem", color: "var(--green)", borderColor: "rgba(34,197,94,0.3)" }}><ShieldCheck size={12} /> Verify</button>
          )}
          {(task.status === "verified" || task.status === "failed") && (
            <button onClick={() => onAction("reopen")} disabled={busy} className="forge-btn forge-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.7rem", fontSize: "0.78rem", color: "var(--blue)", borderColor: "rgba(59,130,246,0.3)" }}><RotateCcw size={12} /> Reopen</button>
          )}
          {task.status === "locked" && (
            <button onClick={() => onAction("unlock")} disabled={busy} className="forge-btn forge-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.7rem", fontSize: "0.72rem", color: "var(--text-dim)" }}>Unlock (no deadline)</button>
          )}
        </div>
      </div>

      {editing === "hours" && (
        <div style={{ ...card, marginTop: "0.5rem" }}>
          <span style={sectionLabel}>Estimated hours</span>
          <TextEditor initial={task.estimatedHours != null ? String(task.estimatedHours) : ""} rows={1} placeholder="e.g. 14" saving={saving}
            onCancel={() => setEditing(null)}
            onSave={(v) => saveContent({ estimatedHours: v.trim() === "" ? null : Number(v) })} />
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", margin: "0.875rem 0", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.7rem", borderRadius: 7,
              border: tab === t.key ? "1px solid var(--accent)" : "1px solid transparent",
              background: tab === t.key ? "rgba(245,158,11,0.1)" : "transparent",
              color: tab === t.key ? "var(--accent)" : "var(--text-secondary)",
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer",
            }}>
            {t.icon} {t.label}
            {t.count != null && <span style={{ ...mono, fontSize: "0.625rem", background: "var(--bg-card)", borderRadius: 8, padding: "0 0.35rem", color: "var(--text-dim)" }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={sectionLabel}><FileText size={11} /> Week brief</span>{editPencil("brief")}
            </div>
            {editing === "brief"
              ? <TextEditor initial={d.context} saving={saving} placeholder="What this week is about…" onCancel={() => setEditing(null)} onSave={(v) => saveContent({ context: v })} />
              : d.context ? <ForgeMarkdown>{d.context}</ForgeMarkdown> : <p style={{ fontSize: "0.875rem" }}><em style={{ color: "var(--text-dim)" }}>No brief yet — click the pencil to add one.</em></p>}
          </div>

          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={sectionLabel}>Why this week</span>{editPencil("why")}
            </div>
            {editing === "why"
              ? <TextEditor initial={task.why ?? ""} rows={2} saving={saving} placeholder="Why this matters…" onCancel={() => setEditing(null)} onSave={(v) => saveContent({ why: v })} />
              : <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.55, fontStyle: task.why ? "italic" : "normal" }}>{task.why || <span style={{ color: "var(--text-dim)", fontStyle: "normal" }}>—</span>}</p>}
          </div>

          <ListSection title="Topics to study" items={d.topics} ordered={false} editKey="topics"
            editing={editing} saving={saving} onEdit={() => setEditing("topics")} onCancel={() => setEditing(null)}
            onSave={(arr) => saveContent({ topics: arr })} placeholder="A topic to study" />

          <ListSection title="Tasks & deliverables" items={d.tasks} ordered editKey="tasks"
            editing={editing} saving={saving} onEdit={() => setEditing("tasks")} onCancel={() => setEditing(null)}
            onSave={(arr) => saveContent({ tasks: arr })} placeholder="A task or deliverable" />

          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={sectionLabel}>Real-world project</span>{editPencil("project")}
            </div>
            {editing === "project"
              ? <TextEditor initial={d.project} saving={saving} placeholder="The project for this week…" onCancel={() => setEditing(null)} onSave={(v) => saveContent({ project: v })} />
              : d.project ? <ForgeMarkdown>{d.project}</ForgeMarkdown> : <p style={{ fontSize: "0.875rem" }}><em style={{ color: "var(--text-dim)" }}>—</em></p>}
          </div>
        </div>
      )}

      {/* ── MASTERY ── */}
      {tab === "mastery" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <MasterySection title="Think like an expert — questions" items={d.questions} editing={editing === "questions"}
            saving={saving} onEdit={() => setEditing("questions")} onCancel={() => setEditing(null)} onSave={(arr) => saveContent({ questions: arr })} />
          <MasterySection title="Practical exercises" items={d.exercises} editing={editing === "exercises"}
            saving={saving} onEdit={() => setEditing("exercises")} onCancel={() => setEditing(null)} onSave={(arr) => saveContent({ exercises: arr })} />
          {checkpoints.length === 0 && <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontStyle: "italic" }}>No mastery checkpoints yet. Add questions or exercises with the pencils above.</p>}
        </div>
      )}

      {/* ── RESOURCES ── */}
      {tab === "resources" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ ...sectionLabel, color: "var(--accent)" }}><Link2 size={11} /> Curated resources</span>
              {editing !== "resources" && editPencil("resources")}
            </div>
            {editing === "resources" ? (
              <ResourcesEditor initial={curated} saving={saving} onCancel={() => setEditing(null)} onSave={(list) => saveContent({ resources: list.map(composeResource) })} />
            ) : curated.length ? (
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.4rem", listStyle: "none", margin: 0, padding: 0 }}>
                {curated.map((r, i) => (
                  <li key={i} style={card}>
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noreferrer noopener" style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", color: "var(--text-primary)", textDecoration: "none", overflowWrap: "anywhere" }}>
                        <ExternalLink size={13} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
                        <span><span style={{ fontWeight: 500 }}>{r.title}</span>{r.note && <span style={{ color: "var(--text-dim)", fontSize: "0.78rem", display: "block" }}>{r.note}</span>}</span>
                      </a>
                    ) : (
                      <span><span style={{ fontWeight: 500 }}>{r.title}</span>{r.note && <span style={{ color: "var(--text-dim)", fontSize: "0.78rem", display: "block" }}>{r.note}</span>}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontStyle: "italic" }}>No curated resources. Click the pencil to add some.</p>}
          </div>

          <div>
            <span style={sectionLabel}>Extra resources you&apos;ve given {menteeName || "them"}</span>
            {task.mentorResources.length > 0 && (
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.4rem", listStyle: "none", margin: "0.5rem 0", padding: 0 }}>
                {task.mentorResources.map((r) => (
                  <li key={r.id} style={{ ...card, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Link2 size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                    <a href={r.url} target="_blank" rel="noreferrer noopener" style={{ flex: 1, fontSize: "0.85rem", color: "var(--text-primary)", textDecoration: "none" }}>
                      <span style={{ fontWeight: 500 }}>{r.title}</span>{r.note && <span style={{ color: "var(--text-dim)", fontSize: "0.78rem", marginLeft: "0.5rem" }}>— {r.note}</span>}
                    </a>
                    <IconBtn onClick={() => deleteGranted(r.id)} title="Remove" color="var(--text-dim)"><Trash2 size={12} /></IconBtn>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr auto", gap: "0.35rem", marginTop: "0.5rem" }}>
              <input value={newRes.title} onChange={(e) => setNewRes({ ...newRes, title: e.target.value })} placeholder="Resource title"
                style={{ padding: "0.4rem 0.6rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem" }} />
              <input value={newRes.url} onChange={(e) => setNewRes({ ...newRes, url: e.target.value })} placeholder="https://..."
                style={{ padding: "0.4rem 0.6rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem", ...mono }} />
              <button type="button" onClick={grantResource} disabled={!newRes.title.trim() || !newRes.url.trim() || posting} className="forge-btn forge-btn-primary" style={{ padding: "0.4rem 0.7rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.25rem", alignItems: "center" }}><Plus size={13} /> Grant</button>
            </div>
            <input value={newRes.note} onChange={(e) => setNewRes({ ...newRes, note: e.target.value })} placeholder="Why this resource? (optional)"
              style={{ marginTop: "0.35rem", width: "100%", padding: "0.4rem 0.6rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem" }} />
          </div>
        </div>
      )}

      {/* ── SUBMISSION ── */}
      {tab === "submission" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <SubmissionConfigPicker taskId={task.id} initialConfig={task.submissionConfig} />
          <div>
            <span style={sectionLabel}>Submissions</span>
            {task.checkins.length ? (
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", listStyle: "none", margin: "0.5rem 0 0", padding: 0 }}>
                {task.checkins.map((c) => (
                  <li key={c.id} style={card}>
                    <div style={{ ...mono, fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: "0.25rem" }}>Attempt {c.attemptNum} · {new Date(c.createdAt).toLocaleString()}</div>
                    {c.description && <p style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{c.description}</p>}
                    <SubmissionViewer evidenceType={c.evidenceType} evidenceUrl={c.evidenceUrl} videoUrl={c.videoUrl} evidenceData={c.evidenceData} />
                  </li>
                ))}
              </ul>
            ) : <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontStyle: "italic", marginTop: "0.5rem" }}>No submissions yet on this week.</p>}
          </div>
          <MentorQuestionBank taskId={task.id} menteeId={menteeId} />
        </div>
      )}

      {/* ── CONVERSATION ── */}
      {tab === "conversation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {messages.length ? (
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", listStyle: "none", margin: 0, padding: 0 }}>
              {messages.map((cm) => {
                const fromMentee = cm.authorRole === "mentee";
                const isRequest = cm.kind === "request_unlock";
                return (
                  <li key={cm.id} style={{ ...card, background: isRequest ? "rgba(244,114,182,0.08)" : fromMentee ? "var(--bg-card)" : "rgba(245,158,11,0.07)", border: isRequest ? "1px solid rgba(244,114,182,0.25)" : fromMentee ? "1px solid var(--border)" : "1px solid rgba(245,158,11,0.2)" }}>
                    <p style={{ ...mono, fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: isRequest ? "#f472b6" : fromMentee ? "var(--text-dim)" : "var(--accent)", marginBottom: "0.25rem" }}>
                      {isRequest ? "Unlock request" : fromMentee ? (menteeName || "Mentee") : "You"}
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{cm.body}</p>
                    <p style={{ ...mono, fontSize: "0.625rem", color: "var(--text-dim)", marginTop: "0.25rem" }}>{new Date(cm.createdAt).toLocaleString()} {cm.readAt ? "· read" : "· unread"}</p>
                  </li>
                );
              })}
            </ul>
          ) : <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontStyle: "italic" }}>No messages yet. Start the conversation below.</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={2} placeholder="Message about this week's work…"
              style={{ width: "100%", padding: "0.5rem 0.75rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "0.875rem", resize: "vertical", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => postMessage("note")} disabled={!msg.trim() || posting} className="forge-btn forge-btn-ghost" title="Pin to the mentee's permanent Notes page" style={{ padding: "0.45rem 0.8rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.35rem", alignItems: "center" }}><Pin size={13} /> Pin as note</button>
              <button type="button" onClick={() => postMessage("message")} disabled={!msg.trim() || posting} className="forge-btn forge-btn-primary" style={{ padding: "0.45rem 0.8rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>{posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Send</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVITY ── */}
      {tab === "activity" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {logs.length ? logs.map((cm) => (
            <div key={cm.id} style={{ ...card, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)" }}>
              <p style={{ ...mono, fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#60a5fa", marginBottom: "0.25rem" }}>Action log</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{cm.body}</p>
              <p style={{ ...mono, fontSize: "0.625rem", color: "var(--text-dim)", marginTop: "0.25rem" }}>{new Date(cm.createdAt).toLocaleString()}</p>
            </div>
          )) : <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontStyle: "italic" }}>No automated events yet. Release/close/verify actions will appear here.</p>}
        </div>
      )}
    </div>
  );
}

/** A titled list section (topics / tasks) with a pencil → ListEditor. */
function ListSection({ title, items, ordered, editKey, editing, saving, onEdit, onCancel, onSave, placeholder }: {
  title: string; items: string[]; ordered: boolean; editKey: string; editing: string | null; saving: boolean;
  onEdit: () => void; onCancel: () => void; onSave: (arr: string[]) => void; placeholder: string;
}) {
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={sectionLabel}>{title}</span>
        {editing !== editKey && <IconBtn onClick={onEdit} title="Edit"><Pencil size={13} /></IconBtn>}
      </div>
      {editing === editKey ? (
        <ListEditor initial={items} saving={saving} onCancel={onCancel} onSave={onSave} placeholder={placeholder} />
      ) : items.length ? (
        <ol style={{ margin: 0, paddingLeft: ordered ? "1.25rem" : 0, listStyle: ordered ? "decimal" : "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {items.map((t, i) => (
            <li key={i} style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.5, display: "flex", gap: "0.5rem" }}>
              {!ordered && <span style={{ color: "var(--accent)", flexShrink: 0 }}>•</span>}{t}
            </li>
          ))}
        </ol>
      ) : <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontStyle: "italic" }}>None yet — click the pencil to add.</p>}
    </div>
  );
}

/** Mastery checkpoints rendered as numbered cards, with a pencil → ListEditor. */
function MasterySection({ title, items, editing, saving, onEdit, onCancel, onSave }: {
  title: string; items: string[]; editing: boolean; saving: boolean; onEdit: () => void; onCancel: () => void; onSave: (arr: string[]) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={sectionLabel}><ListChecks size={11} /> {title}</span>
        {!editing && <IconBtn onClick={onEdit} title="Edit"><Pencil size={13} /></IconBtn>}
      </div>
      {editing ? (
        <ListEditor initial={items} saving={saving} onCancel={onCancel} onSave={onSave} placeholder="A checkpoint question or exercise" />
      ) : items.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {items.map((q, i) => (
            <div key={i} style={{ ...card, display: "flex", gap: "0.6rem" }}>
              <span style={{ ...mono, fontSize: "0.8rem", fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>{i + 1}.</span>
              <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.55, margin: 0 }}>{q}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Editable curated-resource list: title / url / note rows + add / remove / reorder. */
function ResourcesEditor({ initial, onSave, onCancel, saving }: {
  initial: { title: string; url: string; note: string }[]; onSave: (v: { title: string; url: string; note: string }[]) => void; onCancel: () => void; saving: boolean;
}) {
  const [rows, setRows] = useState(initial.length ? initial : [{ title: "", url: "", note: "" }]);
  const set = (i: number, k: "title" | "url" | "note", v: string) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const add = () => setRows((r) => [...r, { title: "", url: "", note: "" }]);
  const del = (i: number) => setRows((r) => (r.length === 1 ? [{ title: "", url: "", note: "" }] : r.filter((_, j) => j !== i)));
  const move = (i: number, d: -1 | 1) => setRows((r) => { const j = i + d; if (j < 0 || j >= r.length) return r; const c = [...r]; [c[i], c[j]] = [c[j], c[i]]; return c; });
  const inp: React.CSSProperties = { padding: "0.4rem 0.6rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.82rem" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {rows.map((row, i) => (
        <div key={i} style={{ ...card, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...mono, fontSize: "0.7rem", color: "var(--text-dim)" }}>#{i + 1}</span>
            <div style={{ display: "flex", gap: "0.1rem" }}>
              <IconBtn onClick={() => move(i, -1)} title="Move up"><ArrowUp size={12} /></IconBtn>
              <IconBtn onClick={() => move(i, 1)} title="Move down"><ArrowDown size={12} /></IconBtn>
              <IconBtn onClick={() => del(i)} title="Remove" color="var(--red)"><Trash2 size={13} /></IconBtn>
            </div>
          </div>
          <input value={row.title} onChange={(e) => set(i, "title", e.target.value)} placeholder="Title" style={inp} />
          <input value={row.url} onChange={(e) => set(i, "url", e.target.value)} placeholder="https://…" style={{ ...inp, ...mono }} />
          <input value={row.note} onChange={(e) => set(i, "note", e.target.value)} placeholder="Why / note (optional)" style={inp} />
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button type="button" onClick={add} className="forge-btn forge-btn-ghost" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", display: "inline-flex", gap: "0.3rem", alignItems: "center" }}><Plus size={12} /> Add resource</button>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" onClick={onCancel} className="forge-btn forge-btn-ghost" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8125rem" }}>Cancel</button>
          <button type="button" onClick={() => onSave(rows.filter((r) => r.title.trim()))} disabled={saving} className="forge-btn forge-btn-primary" style={{ padding: "0.35rem 0.875rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>{saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save</button>
        </div>
      </div>
    </div>
  );
}
