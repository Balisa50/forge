"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Loader2, Save, ListChecks, ChevronDown, ChevronRight, Send } from "lucide-react";
import Dialog, { type DialogConfig } from "@/components/Dialog";

interface Question {
 id: string;
 taskId: string;
 position: number;
 prompt: string;
 rubric: string | null;
 idealAnswer: string | null;
 /// NULL = draft (mentor-only). Date = published (sent to student).
 publishedAt: string | null;
}

export default function MentorQuestionBank({ taskId, menteeId }: { taskId: string; menteeId: string }) {
 const [questions, setQuestions] = useState<Question[]>([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [draft, setDraft] = useState({ prompt: "", rubric: "", idealAnswer: "" });
 const [edits, setEdits] = useState<Record<string, Partial<Question>>>({});
 const [dialog, setDialog] = useState<DialogConfig | null>(null);
 // Section is OPTIONAL - collapsed by default. Auto-opens when the mentor
 // has already authored questions for this week (so they don't get hidden).
 const [open, setOpen] = useState(false);
 useEffect(() => {
 if (!loading && questions.length > 0) setOpen(true);
 }, [loading, questions.length]);

 const load = useCallback(async () => {
 setLoading(true);
 const res = await fetch(`/api/mentor/questions?taskId=${taskId}&menteeId=${menteeId}`);
 if (res.ok) {
 const data = await res.json();
 setQuestions(data.questions);
 }
 setLoading(false);
 }, [taskId, menteeId]);

 useEffect(() => { load(); }, [load]);

 const add = async () => {
 if (!draft.prompt.trim()) return;
 setSaving(true);
 try {
 const res = await fetch("/api/mentor/questions", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ taskId, menteeId, prompt: draft.prompt, rubric: draft.rubric || undefined, idealAnswer: draft.idealAnswer || undefined }),
 });
 if (res.ok) {
 setDraft({ prompt: "", rubric: "", idealAnswer: "" });
 await load();
 } else {
 const data = await res.json().catch(() => ({}));
 setDialog({ kind: "alert", title: "Couldn't add question", message: data.error || "Failed" });
 }
 } finally {
 setSaving(false);
 }
 };

 const save = async (id: string) => {
 const patch = edits[id];
 if (!patch) return;
 setSaving(true);
 try {
 await fetch(`/api/mentor/questions?id=${id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(patch),
 });
 setEdits((e) => { const c = { ...e }; delete c[id]; return c; });
 await load();
 } finally {
 setSaving(false);
 }
 };

 const remove = (id: string) => {
 setDialog({
 kind: "confirm",
 title: "Remove this question?",
 message: "It won't appear in your mentee's mastery checks for this week anymore.",
 confirmText: "Remove",
 danger: true,
 onConfirm: async () => {
 await fetch(`/api/mentor/questions?id=${id}`, { method: "DELETE" });
 await load();
 },
 });
 };

 // Count drafts so we can show / disable the Send button accordingly.
 const draftCount = questions.filter((q) => !q.publishedAt).length;
 const sentCount = questions.length - draftCount;

 /** "Send Questions to Student", flips every draft on this task to
 * published. Student-side queries filter publishedAt IS NOT NULL, so this
 * is the moment the student actually sees them. */
 const publish = () => {
 setDialog({
 kind: "confirm",
 title: `Send ${draftCount} question${draftCount === 1 ? "" : "s"} to the student?`,
 message:
 "Drafts will become visible on the student's Mentor Review tab immediately. You can still edit each question's prompt or rubric afterwards.",
 confirmText: "Send to student",
 onConfirm: async () => {
 setSaving(true);
 try {
 const res = await fetch("/api/mentor/questions/publish", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ taskId }),
 });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 throw new Error(data.error ?? "Send failed");
 }
 await load();
 } finally {
 setSaving(false);
 }
 },
 });
 };

 return (
 <div style={{ marginTop: "0.875rem", paddingTop: "0.875rem", borderTop: "1px dashed var(--border)" }}>
 <button
 type="button"
 onClick={() => setOpen((o) => !o)}
 style={{
 display: "flex",
 alignItems: "center",
 gap: "0.5rem",
 background: "none",
 border: "none",
 padding: "0.25rem 0",
 cursor: "pointer",
 fontFamily: "var(--font-mono)",
 fontSize: "0.6875rem",
 letterSpacing: "0.18em",
 textTransform: "uppercase",
 color: "var(--accent)",
 minHeight: "unset",
 }}
 aria-expanded={open}
 >
 {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
 <ListChecks size={11} />
 Your questions for this week
 <span style={{ color: "var(--text-dim)", letterSpacing: 0, textTransform: "none", fontFamily: "var(--font-body)", fontSize: "0.75rem", marginLeft: "0.375rem" }}>
 (optional{questions.length > 0 ? ` - ${questions.length} authored` : ""})
 </span>
 </button>

 {!open ? null : loading ? (
 <div style={{ color: "var(--text-dim)", fontSize: "0.8125rem", marginTop: "0.5rem" }}><Loader2 size={12} className="inline animate-spin mr-1" /> Loading...</div>
 ) : (
 <>
 <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", margin: "0.625rem 0 0.75rem", lineHeight: 1.55 }}>
 Add as many questions as you want, each starts as a <strong>draft</strong>, only visible to you.
 When you&apos;re ready, click <strong>Send Questions to Student</strong> and they all appear on the student&apos;s Mentor Review tab at once.
 You review and grade their answers from the <strong>Reviews</strong> page.
 </p>
 {questions.length > 0 && (
 <ul className="flex flex-col gap-2 mb-3">
 {questions.map((q, i) => {
 const edit = edits[q.id];
 return (
 <li key={q.id} style={{ padding: "0.625rem 0.75rem", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
 <div className="flex-col-on-mobile" style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
 <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(245,158,11,0.15)", color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", display: "grid", placeItems: "center", flexShrink: 0 }}>Q{i + 1}</span>
 {/* Draft / Sent badge, quick visual scan of who's seen what. */}
 <span
 title={q.publishedAt ? `Sent ${new Date(q.publishedAt).toLocaleDateString()}` : "Draft, not visible to student yet"}
 style={{
 flexShrink: 0,
 padding: "0.125rem 0.5rem",
 borderRadius: 999,
 fontFamily: "var(--font-mono)",
 fontSize: "0.625rem",
 letterSpacing: "0.1em",
 textTransform: "uppercase",
 color: q.publishedAt ? "var(--green)" : "var(--text-dim)",
 background: q.publishedAt ? "rgba(34,197,94,0.1)" : "var(--bg-card)",
 border: q.publishedAt ? "1px solid rgba(34,197,94,0.35)" : "1px solid var(--border)",
 }}
 >
 {q.publishedAt ? "Sent" : "Draft"}
 </span>
 <textarea
 value={edit?.prompt ?? q.prompt}
 onChange={(e) => setEdits({ ...edits, [q.id]: { ...edit, prompt: e.target.value } })}
 rows={2}
 style={{ flex: 1, padding: "0.375rem 0.5rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem", resize: "vertical" }}
 />
 <div className="flex flex-col gap-1">
 {edit && (
 <button onClick={() => save(q.id)} disabled={saving} className="forge-btn forge-btn-primary" style={{ padding: "0.3rem 0.5rem", fontSize: "0.6875rem" }}>
 <Save size={11} />
 </button>
 )}
 <button onClick={() => remove(q.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0.25rem" }}>
 <Trash2 size={12} />
 </button>
 </div>
 </div>
 <details>
 <summary style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", cursor: "pointer" }}>Rubric & ideal answer (private)</summary>
 <input
 value={edit?.rubric ?? q.rubric ?? ""}
 onChange={(e) => setEdits({ ...edits, [q.id]: { ...edit, rubric: e.target.value } })}
 placeholder="Rubric (what to look for)"
 style={{ display: "block", width: "100%", marginTop: "0.375rem", padding: "0.375rem 0.5rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.75rem" }}
 />
 <textarea
 value={edit?.idealAnswer ?? q.idealAnswer ?? ""}
 onChange={(e) => setEdits({ ...edits, [q.id]: { ...edit, idealAnswer: e.target.value } })}
 placeholder="Ideal answer (notes for yourself)"
 rows={2}
 style={{ display: "block", width: "100%", marginTop: "0.25rem", padding: "0.375rem 0.5rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.75rem", resize: "vertical" }}
 />
 </details>
 </li>
 );
 })}
 </ul>
 )}

 {/* "Send Questions to Student", visible only when there is at least
 one draft. Until clicked, drafts stay invisible to the student. */}
 {questions.length > 0 && (
 <div
 style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 gap: "0.75rem",
 padding: "0.625rem 0.75rem",
 marginBottom: "0.75rem",
 borderRadius: 8,
 background: draftCount > 0 ? "rgba(245,158,11,0.07)" : "rgba(34,197,94,0.07)",
 border: `1px solid ${draftCount > 0 ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`,
 flexWrap: "wrap",
 }}
 >
 <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
 {draftCount > 0
 ? `${draftCount} draft${draftCount === 1 ? "" : "s"} waiting to be sent`
 : `${sentCount} question${sentCount === 1 ? "" : "s"} already sent to the student.`}
 {sentCount > 0 && draftCount > 0 ? ` (${sentCount} already sent)` : ""}
 </span>
 <button
 type="button"
 onClick={publish}
 disabled={draftCount === 0 || saving}
 className="forge-btn forge-btn-primary"
 style={{
 padding: "0.4rem 0.875rem",
 fontSize: "0.8125rem",
 display: "inline-flex",
 gap: "0.375rem",
 alignItems: "center",
 opacity: draftCount === 0 || saving ? 0.6 : 1,
 cursor: draftCount === 0 || saving ? "not-allowed" : "pointer",
 }}
 title={draftCount === 0 ? "No drafts to send" : "Make every draft visible to the student"}
 >
 {saving ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
 Send Questions to Student
 </button>
 </div>
 )}

 {/* New question form */}
 <div style={{ padding: "0.625rem 0.75rem", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8 }}>
 <textarea
 value={draft.prompt}
 onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
 placeholder="Question for the mentee (e.g. 'Why did you choose Redux over Context here? What would change at 1k components?')"
 rows={2}
 style={{ width: "100%", padding: "0.5rem 0.625rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem", resize: "vertical", marginBottom: "0.375rem" }}
 />
 <input
 value={draft.rubric}
 onChange={(e) => setDraft({ ...draft, rubric: e.target.value })}
 placeholder="Rubric (optional, only you see this)"
 style={{ width: "100%", padding: "0.375rem 0.625rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.75rem", marginBottom: "0.375rem" }}
 />
 <div className="flex-col-on-mobile" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
 <input
 value={draft.idealAnswer}
 onChange={(e) => setDraft({ ...draft, idealAnswer: e.target.value })}
 placeholder="Ideal answer notes (optional)"
 style={{ flex: 1, minWidth: 0, padding: "0.375rem 0.625rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.75rem" }}
 />
 <button
 onClick={add}
 disabled={!draft.prompt.trim() || saving}
 className="forge-btn forge-btn-primary"
 title="Adds this question as a DRAFT (only you see it). Use 'Send Questions to Student' above to actually deliver."
 style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.25rem", alignItems: "center" }}
 >
 {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add draft
 </button>
 </div>
 </div>
 </>
 )}
 <Dialog config={dialog} onClose={() => setDialog(null)} />
 </div>
 );
}
