"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, MessageSquare, CheckCheck } from "lucide-react";

interface MentorAuthor {
  id: string;
  name: string | null;
  image: string | null;
}

interface Note {
  id: string;
  taskId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  mentor: MentorAuthor;
}

interface TaskMeta {
  id: string;
  title: string;
  phaseTitle: string;
  roadmapTitle: string;
}

export default function MentorNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Record<string, TaskMeta>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mentor-notes");
      if (!res.ok) throw new Error("Could not load notes");
      const data = (await res.json()) as { comments: Note[] };
      setNotes(data.comments);

      // Resolve task titles in one round-trip
      const ids = Array.from(new Set(data.comments.map((c) => c.taskId)));
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    await fetch("/api/mentor-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: id }),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh", color: "var(--text-dim)" }}>
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: "2rem", color: "var(--red)" }}>{error}</div>;
  }

  const unread = notes.filter((n) => !n.readAt);
  const read = notes.filter((n) => n.readAt);

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.875rem" }}>Mentor notes</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginTop: "0.25rem" }}>
          Feedback your mentors have left on your weekly work.
        </p>
      </div>

      {notes.length === 0 && (
        <div className="forge-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <MessageSquare size={32} color="var(--text-dim)" strokeWidth={1.5} style={{ margin: "0 auto 0.75rem" }} />
          <p style={{ color: "var(--text-dim)" }}>No mentor notes yet. They&apos;ll appear here after you check in.</p>
        </div>
      )}

      {unread.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.75rem" }}>
            New · {unread.length}
          </p>
          <ul className="flex flex-col gap-3">
            {unread.map((n) => (
              <NoteCard key={n.id} note={n} task={tasks[n.taskId]} onRead={() => markRead(n.id)} />
            ))}
          </ul>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.75rem" }}>
            Read earlier
          </p>
          <ul className="flex flex-col gap-3">
            {read.map((n) => (
              <NoteCard key={n.id} note={n} task={tasks[n.taskId]} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, task, onRead }: { note: Note; task?: TaskMeta; onRead?: () => void }) {
  return (
    <li
      className="forge-panel"
      style={{
        padding: "1rem 1.25rem",
        borderColor: note.readAt ? "var(--border)" : "var(--accent)",
        background: note.readAt ? "var(--bg-panel)" : "rgba(245,158,11,0.05)",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          {task && (
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
              {task.title}
            </p>
          )}
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", marginTop: "0.125rem" }}>
            {note.mentor.name ?? "Your mentor"} · {new Date(note.createdAt).toLocaleString()}
          </p>
        </div>
        {!note.readAt && onRead && (
          <button
            onClick={onRead}
            className="inline-flex items-center gap-1"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-dim)",
              padding: "0.25rem 0.625rem",
              borderRadius: 6,
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            <CheckCheck size={12} /> Mark read
          </button>
        )}
      </div>
      <p style={{ color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
        {note.body}
      </p>
    </li>
  );
}
