"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2, MessageSquare, CheckCheck, Link2, Send, Sparkles, Unlock, Trash2 } from "lucide-react";

interface MentorAuthor {
  id: string;
  name: string | null;
  image?: string | null;
}

interface Comment {
  id: string;
  taskId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  authorRole: "mentor" | "mentee";
  kind: "note" | "message" | "request_unlock" | "action_log";
  mentor: MentorAuthor;
}

interface GrantedResource {
  id: string;
  taskId: string;
  title: string;
  url: string;
  note: string | null;
  createdAt: string;
  mentor: MentorAuthor;
}

interface TaskMeta {
  id: string;
  title: string;
  phaseTitle: string;
  roadmapTitle: string;
}

export default function MentorNotesPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [resources, setResources] = useState<GrantedResource[]>([]);
  const [tasks, setTasks] = useState<Record<string, TaskMeta>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  // A specific week the mentee arrived here to message about (e.g. clicked
  // "Ask mentor to extend" on a closed week). We always show a composer for it,
  // even if the mentor hasn't started a thread yet — otherwise the page is a
  // dead end with no way to reach the mentor.
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [focusIntent, setFocusIntent] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  // Read ?task= & ?intent= from the URL once on mount (no useSearchParams so we
  // avoid the Suspense-boundary requirement for a single read).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setFocusTaskId(params.get("task"));
    setFocusIntent(params.get("intent"));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mentor-notes");
      if (!res.ok) throw new Error("Could not load notes");
      const data = (await res.json()) as { comments: Comment[]; resources: GrantedResource[] };
      setComments(data.comments);
      setResources(data.resources);

      const ids = Array.from(new Set([
        ...data.comments.map((c) => c.taskId),
        ...data.resources.map((r) => r.taskId),
        ...(focusTaskId ? [focusTaskId] : []),
      ]));
      if (ids.length > 0) {
        const taskRes = await fetch(`/api/tasks/meta?ids=${ids.join(",")}`);
        if (taskRes.ok) {
          const taskData = await taskRes.json();
          const map: Record<string, TaskMeta> = {};
          for (const t of taskData.tasks ?? []) map[t.id] = t;
          setTasks(map);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [focusTaskId]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    setComments((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    await fetch("/api/mentor-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: id }),
    });
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Remove this note from your inbox? Your mentor will still see it in their history.")) return;
    // Optimistic: drop locally first, restore on failure
    const prev = comments;
    setComments((p) => p.filter((c) => c.id !== id));
    const res = await fetch(`/api/mentor-notes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Couldn't remove. Try again.");
      setComments(prev);
    }
  };

  const sendReply = async (taskId: string, kind: "note" | "request_unlock" = "note") => {
    const body = reply[taskId]?.trim();
    if (!body) return;
    setSending(taskId);
    try {
      const res = await fetch("/api/mentee/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, body, kind }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed");
      }
      setReply({ ...reply, [taskId]: "" });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setSending(null);
    }
  };

  // Group by task
  const grouped = useMemo(() => {
    const byTask: Record<string, { task?: TaskMeta; comments: Comment[]; resources: GrantedResource[] }> = {};
    for (const c of comments) {
      byTask[c.taskId] ??= { task: tasks[c.taskId], comments: [], resources: [] };
      byTask[c.taskId].comments.push(c);
    }
    for (const r of resources) {
      byTask[r.taskId] ??= { task: tasks[r.taskId], comments: [], resources: [] };
      byTask[r.taskId].resources.push(r);
    }
    // Always include a composer group for the focused week, even with no thread.
    if (focusTaskId && !byTask[focusTaskId]) {
      byTask[focusTaskId] = { task: tasks[focusTaskId], comments: [], resources: [] };
    }
    // Sort each task by most recent activity
    return Object.entries(byTask)
      .map(([taskId, g]) => ({
        taskId,
        task: g.task,
        comments: g.comments.slice().reverse(), // oldest → newest in display
        resources: g.resources,
        lastActivity: Math.max(
          0,
          ...g.comments.map((c) => +new Date(c.createdAt)),
          ...g.resources.map((r) => +new Date(r.createdAt)),
        ),
      }))
      // Focused week first (so its composer is immediately visible), then by
      // most recent activity.
      .sort((a, b) => {
        if (a.taskId === focusTaskId) return -1;
        if (b.taskId === focusTaskId) return 1;
        return b.lastActivity - a.lastActivity;
      });
  }, [comments, resources, tasks, focusTaskId]);

  // Prefill a polite extension request when the mentee arrived via
  // "Ask mentor to extend" on a closed week.
  useEffect(() => {
    if (prefilled || !focusTaskId || focusIntent !== "extend") return;
    setReply((prev) => {
      if (prev[focusTaskId]) return prev;
      return {
        ...prev,
        [focusTaskId]: "Hi — this week closed on its deadline before I could finish. Could you extend the deadline or reopen it so I can complete the work? Thank you.",
      };
    });
    setPrefilled(true);
  }, [focusTaskId, focusIntent, prefilled]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh", color: "var(--text-dim)" }}>
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }
  if (error) return <div style={{ padding: "2rem", color: "var(--red)" }}>{error}</div>;

  return (
    <div style={{ paddingBottom: "4rem", maxWidth: 800 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.875rem" }}>Mentor messages</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginTop: "0.25rem" }}>
          Messages, resources and notes your mentor has sent, grouped by week.
        </p>
        {/* Anti-confusion banner: questions live ON THE WEEK, not in chat. */}
        <div
          role="note"
          style={{
            marginTop: "0.875rem",
            padding: "0.75rem 0.875rem",
            background: "rgba(212,175,55,0.06)",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: 8,
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            lineHeight: 1.55,
          }}
        >
          Looking for your <strong style={{ color: "var(--accent)" }}>mentor&apos;s questions</strong> for a week? Open the week from your dashboard — questions, answers, and your mentor&apos;s verdict + rating live in the <strong>Mentor Review</strong> section at the bottom of each week, not here.
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="forge-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <MessageSquare size={32} color="var(--text-dim)" strokeWidth={1.5} style={{ margin: "0 auto 0.75rem" }} />
          <p style={{ color: "var(--text-dim)" }}>Nothing here yet. After you check in, your mentor&apos;s notes and resource recommendations show up here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map((g) => (
            <section key={g.taskId} className="forge-panel" style={{ padding: "1.25rem 1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.18em", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  {g.task?.roadmapTitle ?? "Roadmap"} · {g.task?.phaseTitle ?? ""}
                </p>
                <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.0625rem", marginTop: "0.25rem" }}>{g.task?.title ?? "Week"}</h2>
              </div>

              {g.resources.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.16em", color: "var(--accent)", textTransform: "uppercase", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Sparkles size={11} /> Resources your mentor recommends
                  </p>
                  <ul className="flex flex-col gap-2">
                    {g.resources.map((r) => (
                      <li key={r.id}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.625rem",
                            padding: "0.625rem 0.875rem",
                            background: "rgba(245,158,11,0.06)",
                            border: "1px solid rgba(245,158,11,0.2)",
                            borderRadius: 8,
                            color: "var(--text-primary)",
                            textDecoration: "none",
                          }}
                        >
                          <Link2 size={14} style={{ color: "var(--accent)", marginTop: "0.2rem", flexShrink: 0 }} />
                          <span style={{ flex: 1 }}>
                            <span style={{ fontWeight: 600 }}>{r.title}</span>
                            {r.note && <span style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "0.125rem" }}>{r.note}</span>}
                            <span style={{ display: "block", color: "var(--text-dim)", fontSize: "0.6875rem", fontFamily: "var(--font-mono)", marginTop: "0.25rem" }}>From {r.mentor.name ?? "your mentor"} · {new Date(r.createdAt).toLocaleDateString()}</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {g.comments.length > 0 && (
                <ul className="flex flex-col gap-2" style={{ marginBottom: "1rem" }}>
                  {g.comments.map((c) => {
                    const fromMentor = c.authorRole === "mentor";
                    const isAction = c.kind === "action_log";
                    const isRequest = c.kind === "request_unlock";
                    return (
                      <li
                        key={c.id}
                        style={{
                          padding: "0.625rem 0.875rem",
                          borderRadius: 8,
                          background: isAction
                            ? "rgba(59,130,246,0.06)"
                            : fromMentor
                              ? (c.readAt ? "var(--bg-card)" : "rgba(245,158,11,0.07)")
                              : "rgba(244,114,182,0.04)",
                          border: isAction
                            ? "1px solid rgba(59,130,246,0.18)"
                            : fromMentor
                              ? (c.readAt ? "1px solid var(--border)" : "1px solid rgba(245,158,11,0.3)")
                              : "1px solid rgba(244,114,182,0.18)",
                        }}
                      >
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: isAction ? "#60a5fa" : fromMentor ? "var(--accent)" : "#f472b6", marginBottom: "0.25rem" }}>
                          {isAction ? "System" : fromMentor ? (c.mentor.name ?? "Your mentor") : isRequest ? "You · unlock request" : "You"}
                        </p>
                        <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{c.body}</p>
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.375rem", fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", alignItems: "center" }}>
                          <span>{new Date(c.createdAt).toLocaleString()}</span>
                          {fromMentor && !c.readAt && (
                            <button onClick={() => markRead(c.id)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                              <CheckCheck size={11} /> Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNote(c.id)}
                            title="Remove from your inbox"
                            style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: 0, marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Reply composer */}
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <textarea
                  value={reply[g.taskId] ?? ""}
                  onChange={(e) => setReply({ ...reply, [g.taskId]: e.target.value })}
                  placeholder="Reply to your mentor…"
                  rows={2}
                  style={{ flex: 1, padding: "0.5rem 0.75rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "0.875rem", resize: "vertical" }}
                />
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => sendReply(g.taskId, "note")}
                    disabled={!reply[g.taskId]?.trim() || sending === g.taskId}
                    className="forge-btn forge-btn-primary"
                    style={{ padding: "0.4rem 0.75rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.375rem", alignItems: "center" }}
                  >
                    {sending === g.taskId ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Reply
                  </button>
                  <button
                    onClick={() => sendReply(g.taskId, "request_unlock")}
                    disabled={!reply[g.taskId]?.trim() || sending === g.taskId}
                    className="forge-btn forge-btn-ghost"
                    style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", display: "inline-flex", gap: "0.375rem", alignItems: "center", color: "var(--accent)", borderColor: "rgba(245,158,11,0.3)" }}
                    title="Ask your mentor to unlock the next step"
                  >
                    <Unlock size={11} /> Request unlock
                  </button>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
