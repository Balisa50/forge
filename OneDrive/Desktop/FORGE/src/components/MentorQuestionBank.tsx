"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Loader2, Save, ListChecks } from "lucide-react";

interface Question {
  id: string;
  taskId: string;
  position: number;
  prompt: string;
  rubric: string | null;
  idealAnswer: string | null;
}

export default function MentorQuestionBank({ taskId, menteeId }: { taskId: string; menteeId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ prompt: "", rubric: "", idealAnswer: "" });
  const [edits, setEdits] = useState<Record<string, Partial<Question>>>({});

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
        alert(data.error || "Failed");
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

  const remove = async (id: string) => {
    if (!confirm("Remove this question?")) return;
    await fetch(`/api/mentor/questions?id=${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div style={{ marginTop: "0.875rem", paddingTop: "0.875rem", borderTop: "1px dashed var(--border)" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
        <ListChecks size={11} /> Your questions for this week
      </p>
      <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "0.75rem", lineHeight: 1.55 }}>
        When you author questions here, the mentee takes <strong>your interrogation</strong> instead of the AI Professor.
        After they submit, you review and grade each answer.
      </p>

      {loading ? (
        <div style={{ color: "var(--text-dim)", fontSize: "0.8125rem" }}><Loader2 size={12} className="inline animate-spin mr-1" /> Loading…</div>
      ) : (
        <>
          {questions.length > 0 && (
            <ul className="flex flex-col gap-2 mb-3">
              {questions.map((q, i) => {
                const edit = edits[q.id];
                return (
                  <li key={q.id} style={{ padding: "0.625rem 0.75rem", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.375rem" }}>
                      <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(245,158,11,0.15)", color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", display: "grid", placeItems: "center", flexShrink: 0 }}>Q{i + 1}</span>
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
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                value={draft.idealAnswer}
                onChange={(e) => setDraft({ ...draft, idealAnswer: e.target.value })}
                placeholder="Ideal answer notes (optional)"
                style={{ flex: 1, padding: "0.375rem 0.625rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.75rem" }}
              />
              <button onClick={add} disabled={!draft.prompt.trim() || saving} className="forge-btn forge-btn-primary" style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.25rem", alignItems: "center" }}>
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
