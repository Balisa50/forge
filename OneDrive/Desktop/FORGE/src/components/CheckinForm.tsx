"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Link2, Clock, Loader2, CheckCircle2, Send,
  Upload, X, FileCode2, FileText, File, AlertCircle,
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
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedTrack = roadmap.tracks.find((t) => t.id === selectedTrackId);
  const availableTasks = selectedTrack?.phases
    .flatMap((p) => p.tasks.filter((t) => t.status === "available" || t.status === "in_progress"))
    ?? [];

  const selectedTask = availableTasks.find((t) => t.id === selectedTaskId);

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const totalBytes = attachments.reduce((sum, f) => sum + f.size, 0);

  // Read a browser File into a FileAttachment
  const readFile = (file: File): Promise<FileAttachment | null> => {
    return new Promise((resolve) => {
      const ext = getFileExtension(file.name);
      if (!isAcceptedExtension(ext) && file.name !== "Dockerfile" && !file.name.startsWith(".")) {
        resolve(null);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          filename: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          extension: ext,
          dataUrl,
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const processFiles = useCallback(async (incoming: File[]) => {
    setFileError("");
    const results: FileAttachment[] = [];
    const skipped: string[] = [];

    for (const file of incoming) {
      const ext = getFileExtension(file.name);
      const isSpecialFile = file.name === "Dockerfile" || file.name.startsWith(".");

      if (!isAcceptedExtension(ext) && !isSpecialFile) {
        skipped.push(file.name);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        skipped.push(`${file.name} (too large — max 2 MB per file)`);
        continue;
      }
      // Check total would exceed limit
      const projected = totalBytes + results.reduce((s, f) => s + f.size, 0) + file.size;
      if (projected > MAX_TOTAL_BYTES) {
        skipped.push(`${file.name} (total limit of 3 MB reached)`);
        continue;
      }
      // Check for duplicate
      const alreadyHave = attachments.some(
        (a) => a.filename === file.name && a.size === file.size
      );
      if (alreadyHave) continue;

      const attachment = await readFile(file);
      if (attachment) results.push(attachment);
    }

    if (results.length > 0) {
      setAttachments((prev) => [...prev, ...results]);
    }
    if (skipped.length > 0) {
      setFileError(`Skipped: ${skipped.join(", ")}`);
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
    if (description.trim().length < 50) { setError("Description must be at least 50 characters."); return; }
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
          description,
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

      {/* Description */}
      <div className="forge-panel" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
        <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          What Did You Build? <span style={{ color: "var(--red)" }}>*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="forge-input"
          style={{ minHeight: "140px", resize: "vertical" }}
          placeholder="Describe exactly what you built, learned, or accomplished. Be specific — The Professor will ask you about this. Min 50 characters."
          required
          minLength={50}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
          <div style={{ flex: 1, height: "3px", background: "var(--border)", borderRadius: "2px", marginRight: "0.75rem", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              borderRadius: "2px",
              transition: "width 0.2s, background 0.2s",
              width: `${Math.min(100, (description.length / 200) * 100)}%`,
              background: description.length < 50 ? "var(--red)"
                : description.length < 100 ? "var(--yellow)"
                : "var(--green)",
            }} />
          </div>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            color: description.length < 50 ? "var(--red)"
              : description.length < 100 ? "var(--yellow)"
              : "var(--green)",
            transition: "color 0.2s",
            flexShrink: 0,
          }}>
            {description.length < 50
              ? `${50 - description.length} more to go`
              : description.length >= 150
              ? "✓ Detailed"
              : `${description.length} chars`
            }
          </span>
        </div>
      </div>

      {/* Project URL — now optional when files are attached */}
      <div className="forge-panel" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
        <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Project URL{attachments.length === 0 && <span style={{ color: "var(--red)" }}> *</span>}
          {attachments.length > 0 && <span style={{ color: "var(--text-dim)", fontSize: "0.6875rem", marginLeft: "0.5rem" }}>(optional — you have files attached)</span>}
        </label>
        <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", marginBottom: "0.875rem", lineHeight: 1.5 }}>
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
      </div>

      {/* File upload zone */}
      <div className="forge-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Attach Files{projectUrl && isValidUrl(projectUrl) && <span style={{ color: "var(--text-dim)", fontSize: "0.6875rem", marginLeft: "0.5rem" }}>(optional — you have a URL)</span>}
        </label>
        <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", marginBottom: "1rem", lineHeight: 1.55 }}>
          Python, JavaScript, TypeScript, Go, Rust, Java, SQL, R, Jupyter notebooks, PDFs, Word docs, CSVs, Markdown, VSCode workspace files — anything you actually wrote. Max 2 MB per file, 3 MB total.
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
          <Upload size={24} style={{ color: dragOver ? "var(--accent)" : "var(--text-dim)", margin: "0 auto 0.5rem", display: "block" }} />
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: dragOver ? "var(--accent)" : "var(--text-secondary)", fontSize: "0.9375rem" }}>
            {dragOver ? "Drop it" : "Drop files here or click to browse"}
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
        disabled={submitting || !selectedTaskId || description.length < 50 || !hasProof}
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
