"use client";

import { useState, useEffect } from "react";
import {
  ExternalLink, FileCode2, FileText, File, Image, Film,
  Download, ChevronDown, ChevronUp, Link2,
} from "lucide-react";
import {
  type FileAttachment,
  type EvidenceData,
  isTextRenderable,
  getLanguageLabel,
  formatFileSize,
  getFileCategory,
  fileHref,
  isVideo,
  isAudio,
  detectUrlType,
} from "@/lib/submission-types";

interface SubmissionViewerProps {
  evidenceType: string;
  evidenceUrl: string | null;
  evidenceData: EvidenceData | null;
}

function fileIcon(ext: string, size = 15) {
  const cat = getFileCategory(ext);
  if (cat === "code" || cat === "notebook" || cat === "vscode") {
    return <FileCode2 size={size} style={{ color: "var(--blue)", flexShrink: 0 }} />;
  }
  if (cat === "document") {
    return <FileText size={size} style={{ color: "var(--accent)", flexShrink: 0 }} />;
  }
  if (cat === "media") {
    return <Film size={size} style={{ color: "#a78bfa", flexShrink: 0 }} />;
  }
  return <File size={size} style={{ color: "var(--text-dim)", flexShrink: 0 }} />;
}

function FilePreviewCard({ file }: { file: FileAttachment }) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const canPreview = isTextRenderable(file.extension);
  const isPdf = file.extension === "pdf";
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(file.extension);
  const isVid = isVideo(file.extension);
  const isAud = isAudio(file.extension);
  const href = fileHref(file);

  // Load text content lazily on first expand. Blob-URL files are fetched;
  // legacy base64 data URLs are decoded inline.
  useEffect(() => {
    if (!expanded || !canPreview || isImage || isPdf || text !== null) return;
    let cancelled = false;
    (async () => {
      try {
        if (file.dataUrl) {
          const commaIdx = file.dataUrl.indexOf(",");
          setText(commaIdx === -1 ? "(preview unavailable)" : atob(file.dataUrl.slice(commaIdx + 1)));
        } else if (file.url) {
          const res = await fetch(file.url);
          const t = await res.text();
          if (!cancelled) setText(t.slice(0, 100_000));
        } else {
          setText("(preview unavailable)");
        }
      } catch {
        if (!cancelled) setText("(preview unavailable)");
      }
    })();
    return () => { cancelled = true; };
  }, [expanded, canPreview, isImage, isPdf, text, file]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = href;
    a.download = file.filename;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.click();
  };

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "8px",
        overflow: "hidden",
        background: "var(--bg-card)",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          padding: "0.625rem 0.875rem",
          borderBottom: expanded ? "1px solid var(--border)" : "none",
          cursor: canPreview || isPdf || isImage ? "pointer" : "default",
        }}
        onClick={() => (canPreview || isPdf || isImage || isVid || isAud) && setExpanded((v) => !v)}
      >
        {fileIcon(file.extension)}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem",
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file.filename}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              color: "var(--text-dim)",
              marginTop: "0.1rem",
            }}
          >
            {getLanguageLabel(file.extension)} &middot; {formatFileSize(file.size)}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          {/* Download */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            title="Download file"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-dim)",
              padding: "0.25rem",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Download size={14} />
          </button>

          {/* Expand toggle */}
          {(canPreview || isPdf || isImage || isVid || isAud) && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-dim)",
                padding: "0.25rem",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
              }}
              title={expanded ? "Collapse" : "Preview"}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded preview */}
      {expanded && (
        <div style={{ padding: 0 }}>
          {isImage && (
            <div style={{ padding: "0.75rem", display: "flex", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={href}
                alt={file.filename}
                style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "4px", objectFit: "contain" }}
              />
            </div>
          )}
          {isPdf && (
            <div style={{ padding: "0.5rem" }}>
              <iframe
                src={href}
                style={{ width: "100%", height: "500px", border: "none", borderRadius: "4px" }}
                title={file.filename}
              />
            </div>
          )}
          {isVid && (
            <div style={{ padding: "0.5rem", display: "flex", justifyContent: "center" }}>
              <video
                src={href}
                controls
                preload="metadata"
                style={{ maxWidth: "100%", maxHeight: "480px", borderRadius: "4px", background: "#000" }}
              />
            </div>
          )}
          {isAud && (
            <div style={{ padding: "0.75rem" }}>
              <audio src={href} controls preload="metadata" style={{ width: "100%" }} />
            </div>
          )}
          {canPreview && !isImage && !isPdf && (
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  color: "var(--text-dim)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  pointerEvents: "none",
                }}
              >
                {getLanguageLabel(file.extension)}
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "2.5rem 1rem 1rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  lineHeight: 1.65,
                  color: "var(--text-secondary)",
                  background: "rgba(0,0,0,0.3)",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  maxHeight: "480px",
                  overflowY: "auto",
                }}
              >
                <code>{text ?? "Loading…"}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SubmissionViewer({ evidenceType, evidenceUrl, evidenceData }: SubmissionViewerProps) {
  // Nothing to show at all
  if (evidenceType === "url" && !evidenceUrl) return null;
  if (!evidenceType) return null;

  const files: FileAttachment[] = evidenceData?.files ?? [];

  // Legacy screenshot (base64 image stored directly in evidenceData)
  const isLegacyScreenshot = evidenceType === "screenshot" && evidenceData?.dataUrl;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginTop: "0.625rem" }}>
      {/* URL evidence — with a detection badge so the mentor knows what it is
          (GitHub repo, Google Drive video, Colab, etc.) before clicking. */}
      {evidenceUrl && evidenceType !== "screenshot" && (() => {
        const d = detectUrlType(evidenceUrl);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", maxWidth: "100%", minWidth: 0 }}>
            {d && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.06em", color: d.color, background: `${d.color}1f`, border: `1px solid ${d.color}55`, borderRadius: 5, padding: "0.1rem 0.45rem" }}>
                {d.isVideo ? <Film size={11} /> : <Link2 size={11} />} {d.label}
              </span>
            )}
            <a
              href={evidenceUrl}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                color: "var(--accent)",
                fontSize: "0.8125rem",
                fontFamily: "var(--font-mono)",
                textDecoration: "none",
                minWidth: 0,
                flex: "1 1 auto",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, flex: "1 1 auto" }}>
                {evidenceUrl}
              </span>
              <ExternalLink size={11} style={{ flexShrink: 0 }} />
            </a>
          </div>
        );
      })()}

      {/* Legacy screenshot */}
      {isLegacyScreenshot && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
            <Image size={13} />
            {evidenceData?.filename ?? "screenshot"}
            {evidenceData?.size ? ` · ${formatFileSize(evidenceData.size)}` : ""}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={evidenceData!.dataUrl}
            alt="submitted screenshot"
            style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "6px", objectFit: "contain", border: "1px solid var(--border)" }}
          />
        </div>
      )}

      {/* File attachments */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ fontSize: "0.6875rem", fontFamily: "var(--font-mono)", color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {files.length} file{files.length !== 1 ? "s" : ""} attached
          </div>
          {files.map((file, i) => (
            <FilePreviewCard key={`${file.filename}-${i}`} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}
