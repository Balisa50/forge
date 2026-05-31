"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Link2, Clock, Loader2, CheckCircle2, Send,
  Upload, X, FileCode2, FileText, File, AlertCircle, Lock, ExternalLink,
} from "lucide-react";
import {
  type FileAttachment,
  MAX_TOTAL_BYTES,
  MAX_FILE_BYTES,
  getFileExtension,
  isAcceptedExtension,
  getFileCategory,
  formatFileSize,
  getLanguageLabel,
  ACCEPTED_MIME_TYPES,
} from "@/lib/submission-types";
import { upload } from "@vercel/blob/client";

interface Task {
  id: string;
  title: string;
  detail: string;
  status: string;
  sortOrder: number;
  estimatedHours?: number | null;
}

interface Phase {
  id: string;
  title: string;
  tasks: Task[];
}

interface Track {
  id: string;
  title: string;
  color: string;
  phases: Phase[];
}

interface Roadmap {
  id: string;
  title: string;
  tracks: Track[];
}

function fileIcon(ext: string) {
  const cat = getFileCategory(ext);
  if (cat === "code" || cat === "notebook" || cat === "vscode") {
    return <FileCode2 size={15} style={{ color: "var(--blue)", flexShrink: 0 }} />;
  }
  if (cat === "document") {
    return <FileText size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />;
  }
  return <File size={15} style={{ color: "var(--text-dim)", flexShrink: 0 }} />;
}

export default function CheckinForm({
  roadmap,
}: {
  roadmap: Roadmap;
  userId: string;
  userName: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTrackId, setSelectedTrackId] = useState(roadmap.tracks[0]?.id ?? "");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Draft persistence: the whole submission (track, task, URL, and any
  // uploaded files) survives a refresh or navigating away. The only things
  // that clear it are the owner removing files / editing fields, or a
  // successful submit. Scoped per-roadmap so different roadmaps don't collide.
  const DRAFT_KEY = `forge:checkin-draft:${roadmap.id}`;
  const [hydrated, setHydrated] = useState(false);

  // Hydrate the saved draft once, on mount.
  useEffect(() => {
    if (typeof window === "undefined") { setHydrated(true); return; }
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as {
          trackId?: string; taskId?: string; projectUrl?: string; attachments?: FileAttachment[];
        };
        if (d.trackId && roadmap.tracks.some((t) => t.id === d.trackId)) setSelectedTrackId(d.trackId);
        if (typeof d.taskId === "string") setSelectedTaskId(d.taskId);
        if (typeof d.projectUrl === "string") setProjectUrl(d.projectUrl);
        if (Array.isArray(d.attachments)) setAttachments(d.attachments);
      }
    } catch { /* corrupt draft — ignore */ }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the draft on every change, but only after hydration so the
  // initial empty state never clobbers a saved draft.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ trackId: selectedTrackId, taskId: selectedTaskId, projectUrl, attachments }),
      );
    } catch { /* quota exceeded (large files) — skip persisting this change */ }
  }, [hydrated, DRAFT_KEY, selectedTrackId, selectedTaskId, projectUrl, attachments]);

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* */ }
    }
  };

  // Engagement preflight — server tells us whether the selected week is
  // ready to submit (every learn-item ticked). null until a task is picked
  // or while loading.
  interface Preflight {
    gated: boolean;
    complete?: boolean;
    missing?: number;
    total?: number;
    learnUrl?: string;
  }
  const [preflight, setPreflight] = useState<Preflight | null>(null);
  const [preflightLoading, setPreflightLoading] = useState(false);

  const selectedTrack = roadmap.tracks.find((t) => t.id === selectedTrackId);
  const availableTasks = selectedTrack?.phases
    .flatMap((p) => p.tasks.filter((t) => t.status === "available" || t.status === "in_progress"))
    ?? [];

  const selectedTask = availableTasks.find((t) => t.id === selectedTaskId);

  // Re-run preflight every time the task changes
  useEffect(() => {
    if (!selectedTaskId) { setPreflight(null); return; }
    setPreflightLoading(true);
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/checkins/preflight?taskId=${encodeURIComponent(selectedTaskId)}`);
        if (!res.ok) throw new Error("preflight failed");
        const data = (await res.json()) as Preflight;
        if (!cancelled) setPreflight(data);
      } catch {
        if (!cancelled) setPreflight({ gated: false }); // fail open — server will still gate
      } finally {
        if (!cancelled) setPreflightLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedTaskId]);

  // Submit is blocked if the week is gated AND incomplete.
  const engagementBlocked = !!preflight?.gated && preflight.complete === false;

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const totalBytes = attachments.reduce((sum, f) => sum + f.size, 0);

  // Upload a browser File straight to Vercel Blob and return its attachment
  // (with the public blob URL). Throws on failure so the caller can surface it.
  const readFile = async (file: File): Promise<FileAttachment | null> => {
    const ext = getFileExtension(file.name);
    if (!isAcceptedExtension(ext) && file.name !== "Dockerfile" && !file.name.startsWith(".")) {
      return null;
    }
    if (file.size > MAX_FILE_BYTES) {
      return null;
    }
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: file.type || undefined,
    });
    return {
      filename: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      extension: ext,
      url: blob.url,
    };
  };

  const processFiles = useCallback(async (incoming: File[]) => {
    setFileError("");
    const results: FileAttachment[] = [];
    const skipped: string[] = [];
    setUploading(true);

    try {
      for (const file of incoming) {
        const ext = getFileExtension(file.name);
        const isSpecialFile = file.name === "Dockerfile" || file.name.startsWith(".");

        if (!isAcceptedExtension(ext) && !isSpecialFile) {
          skipped.push(file.name);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          skipped.push(`${file.name} (too large — max ${formatFileSize(MAX_FILE_BYTES)} per file)`);
          continue;
        }
        // Check total would exceed limit
        const projected = totalBytes + results.reduce((s, f) => s + f.size, 0) + file.size;
        if (projected > MAX_TOTAL_BYTES) {
          skipped.push(`${file.name} (total limit of ${formatFileSize(MAX_TOTAL_BYTES)} reached)`);
          continue;
        }
        // Check for duplicate
        const alreadyHave = attachments.some(
          (a) => a.filename === file.name && a.size === file.size
        );
        if (alreadyHave) continue;

        try {
          const attachment = await readFile(file);
          if (attachment) results.push(attachment);
        } catch {
          skipped.push(`${file.name} (upload failed — try again)`);
        }
      }

      if (results.length > 0) {
        setAttachments((prev) => [...prev, ...results]);
      }
      if (skipped.length > 0) {
        setFileError(`Skipped: ${skipped.join(", ")}`);
      }
    } finally {
      setUploading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachments, totalBytes]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      await processFiles(files);
      // Reset input so the same file can be re-added after removal
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [processFiles]
  );

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
  };

  const hasProof = (projectUrl.trim() && isValidUrl(projectUrl.trim())) || attachments.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedTaskId) { setError("Select a task."); return; }
    if (engagementBlocked) {
      setError(`Tick every day item on the week page first — ${preflight?.missing}/${preflight?.total} unticked. Open ${preflight?.learnUrl ?? "the week page"}.`);
      return;
    }
    if (!hasProof) {
      setError("Add at least one piece of proof — a URL, a code file, or a document.");
      return;
    }
    if (projectUrl.trim() && !isValidUrl(projectUrl.trim())) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmapId: roadmap.id,
          trackId: selectedTrackId,
          taskId: selectedTaskId,
          projectUrl: projectUrl.trim() || null,
          files: attachments.length > 0 ? attachments : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Submission failed.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      clearDraft();
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="forge-panel" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <CheckCircle2 size={48} style={{ color: "var(--green)", margin: "0 auto 1rem" }} />
        <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", marginBottom: "0.5rem" }}>Check-in submitted</h2>
        <p style={{ color: "var(--text-secondary)" }}>Proof recorded. Returning to your dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      {error && (
        <div style={{ background: "rgba(255,45,45,0.1)", border: "1px solid var(--red)", borderRadius: "4px", padding: "0.75rem 1rem", marginBottom: "1.5rem", color: "var(--red)", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      {/* Track selector */}
      <div className="forge-panel" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
        <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Track
        </label>
        <div className="flex gap-2 flex-wrap">
          {roadmap.tracks.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => { setSelectedTrackId(track.id); setSelectedTaskId(""); }}
              style={{
                padding: "0.375rem 1rem",
                borderRadius: "4px",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.875rem",
                border: selectedTrackId === track.id ? `1px solid ${track.color}` : "1px solid var(--border)",
                background: selectedTrackId === track.id ? `${track.color}20` : "transparent",
                color: selectedTrackId === track.id ? track.color : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {track.title}
            </button>
          ))}
        </div>
      </div>

      {/* Task selector */}
      <div className="forge-panel" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
        <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Task Completed
        </label>
        {availableTasks.length === 0 ? (
          <p style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>No available tasks on this track. Check your roadmap.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {availableTasks.map((task) => (
              <label
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "6px",
                  border: selectedTaskId === task.id ? "1px solid var(--blue)" : "1px solid var(--border)",
                  background: selectedTaskId === task.id ? "rgba(0,200,255,0.05)" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="radio"
                  name="taskId"
                  value={task.id}
                  checked={selectedTaskId === task.id}
                  onChange={() => setSelectedTaskId(task.id)}
                  style={{ accentColor: "var(--blue)", marginTop: "0.2rem" }}
                />
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.9375rem" }}>{task.title}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{task.detail.slice(0, 120)}...</div>
                  {task.estimatedHours && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", marginTop: "0.375rem" }}>
                      <Clock size={11} /> ~{task.estimatedHours}h estimated
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Engagement preflight banner — fires the moment a task is picked */}
      {selectedTask && preflightLoading && (
        <div style={{ marginBottom: "1.25rem", padding: "0.75rem 1rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-dim)", fontSize: "0.8125rem" }}>
          <Loader2 size={13} className="animate-spin" /> Checking your day-by-day progress…
        </div>
      )}
      {selectedTask && !preflightLoading && engagementBlocked && (
        <div style={{
          marginBottom: "1.25rem", padding: "1rem 1.125rem",
          background: "rgba(234,179,8,0.06)", border: "1px solid var(--yellow)",
          borderRadius: 8,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", marginBottom: "0.5rem" }}>
            <Lock size={15} style={{ color: "var(--yellow)", flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, color: "var(--yellow)", fontSize: "0.9375rem", marginBottom: "0.25rem" }}>
                Finish the days first
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                You haven&apos;t ticked <strong style={{ color: "var(--text-primary)" }}>{preflight?.missing} of {preflight?.total}</strong> items
                on this week&apos;s daily breakdown. Open every link, tick every box — then submit.
              </p>
            </div>
          </div>
          {preflight?.learnUrl && (
            <Link
              href={preflight.learnUrl}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--yellow)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textDecoration: "none", paddingLeft: "1.625rem" }}
            >
              <ExternalLink size={11} /> Open this week&apos;s days
            </Link>
          )}
        </div>
      )}
      {selectedTask && !preflightLoading && preflight?.gated && preflight.complete && (
        <div style={{ marginBottom: "1.25rem", padding: "0.625rem 1rem", background: "rgba(34,197,94,0.06)", border: "1px solid var(--green)", borderRadius: 8, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--green)", fontSize: "0.8125rem" }}>
          <CheckCircle2 size={13} /> All {preflight.total} day items ticked. You&apos;re cleared to submit.
        </div>
      )}

      {/* Proof — a single section. EITHER a URL OR file(s) satisfies it.
          A green check appears the moment one is provided so the mentee
          knows they're done with this requirement. */}
      <div className="forge-panel" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", gap: "0.5rem", flexWrap: "wrap" }}>
          <label style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Proof of Your Work <span style={{ color: "var(--red)" }}>*</span>
          </label>
          {hasProof && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--green)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
              <CheckCircle2 size={12} /> proof attached
            </span>
          )}
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", marginBottom: "1rem", lineHeight: 1.5 }}>
          Provide <strong style={{ color: "var(--text-secondary)" }}>at least one</strong> — a URL <em>or</em> a file. Some weeks (Excel spreadsheets, paper exercises, hand-drawn diagrams) won&apos;t have a repo — just upload your file.
        </p>

        {/* Sub-label for URL option */}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Option A — Link
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginBottom: "0.625rem", lineHeight: 1.5 }}>
          GitHub repo, deployed app, CodeSandbox, Colab notebook, etc.
        </p>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: projectUrl && isValidUrl(projectUrl) ? "var(--green)" : "var(--text-dim)" }}>
            {projectUrl && isValidUrl(projectUrl) ? <CheckCircle2 size={16} /> : <Link2 size={16} />}
          </span>
          <input
            type="url"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            className="forge-input"
            style={{
              paddingLeft: "2.5rem",
              borderColor: projectUrl && !isValidUrl(projectUrl) ? "var(--red)"
                : projectUrl && isValidUrl(projectUrl) ? "var(--green)"
                : undefined,
              transition: "border-color 0.2s",
            }}
            placeholder="https://github.com/username/project"
          />
        </div>
        {projectUrl && !isValidUrl(projectUrl) && (
          <div style={{ color: "var(--red)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", marginTop: "0.375rem" }}>
            ✕ Must start with https:// or http://
          </div>
        )}
        {projectUrl && isValidUrl(projectUrl) && (
          <div style={{ color: "var(--green)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", marginTop: "0.375rem" }}>
            ✓ Valid URL
          </div>
        )}

        {/* OR divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", margin: "1.25rem 0 0.875rem" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Or
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Sub-label for file option */}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Option B — File(s)
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginBottom: "1rem", lineHeight: 1.55 }}>
          .xlsx · .pdf · .docx · .csv · .py · .js · .ipynb · .sql · screenshots · whatever proves your work. Max 10 MB per file, 25 MB total.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "8px",
            padding: "2rem 1rem",
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.15s, background 0.15s",
            background: dragOver ? "rgba(0,255,136,0.04)" : "transparent",
            marginBottom: attachments.length > 0 ? "1rem" : 0,
          }}
        >
          {uploading
            ? <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)", margin: "0 auto 0.5rem", display: "block" }} />
            : <Upload size={24} style={{ color: dragOver ? "var(--accent)" : "var(--text-dim)", margin: "0 auto 0.5rem", display: "block" }} />}
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: dragOver || uploading ? "var(--accent)" : "var(--text-secondary)", fontSize: "0.9375rem" }}>
            {uploading ? "Uploading…" : dragOver ? "Drop it" : "Drop files here or click to browse"}
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", marginTop: "0.375rem" }}>
            .py .js .ts .go .rs .java .sql .r .ipynb .pdf .docx .md .csv + more
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_MIME_TYPES}
            onChange={handleFileInput}
            style={{ display: "none" }}
          />
        </div>

        {/* Size meter */}
        {attachments.length > 0 && (
          <div style={{ marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.6875rem", fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
                Total size
              </span>
              <span style={{ fontSize: "0.6875rem", fontFamily: "var(--font-mono)", color: totalBytes > MAX_TOTAL_BYTES * 0.85 ? "var(--yellow)" : "var(--text-secondary)" }}>
                {formatFileSize(totalBytes)} / {formatFileSize(MAX_TOTAL_BYTES)}
              </span>
            </div>
            <div style={{ height: "3px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                borderRadius: "2px",
                transition: "width 0.2s, background 0.2s",
                width: `${Math.min(100, (totalBytes / MAX_TOTAL_BYTES) * 100)}%`,
                background: totalBytes > MAX_TOTAL_BYTES * 0.85 ? "var(--yellow)" : "var(--accent)",
              }} />
            </div>
          </div>
        )}

        {/* File list */}
        {attachments.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {attachments.map((f, i) => (
              <div
                key={`${f.filename}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.5rem 0.75rem",
                  background: "var(--bg-card)",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              >
                {fileIcon(f.extension)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.filename}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", marginTop: "0.125rem" }}>
                    {getLanguageLabel(f.extension)} &middot; {formatFileSize(f.size)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0.25rem", borderRadius: "4px", display: "flex", alignItems: "center", flexShrink: 0 }}
                  title="Remove file"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* File validation errors */}
        {fileError && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", marginTop: "0.75rem", padding: "0.625rem 0.75rem", background: "rgba(255,200,0,0.08)", border: "1px solid var(--yellow)", borderRadius: "6px" }}>
            <AlertCircle size={14} style={{ color: "var(--yellow)", flexShrink: 0, marginTop: "0.125rem" }} />
            <span style={{ color: "var(--yellow)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>{fileError}</span>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="forge-btn forge-btn-primary"
        style={{ width: "100%", maxWidth: "480px", padding: "1rem", fontSize: "1rem" }}
        disabled={submitting || uploading || !selectedTaskId || !hasProof || engagementBlocked}
      >
        {submitting
          ? <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Loader2 size={18} className="animate-spin" />
              Submitting…
            </span>
          : <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Send size={18} strokeWidth={1.5} />
              Submit check-in
            </span>
        }
      </button>

      {selectedTask && (
        <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textAlign: "center", marginTop: "1rem" }}>
          Submitting proof for <strong style={{ color: "var(--text-secondary)" }}>{selectedTask.title}</strong>. Your mentor (if assigned) will review.
        </p>
      )}
    </form>
  );
}
