"use client";

import { useState } from "react";
import {
  ExternalLink, FileCode2, FileText, File, Image,
  Download, ChevronDown, ChevronUp, Link2,
} from "lucide-react";
import {
  type FileAttachment,
  type EvidenceData,
  isTextRenderable,
  getLanguageLabel,
  formatFileSize,
  getFileCategory,
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
  return <File size={size} style={{ color: "var(--text-dim)", flexShrink: 0 }} />;
}

function FilePreviewCard({ file }: { file: FileAttachment }) {
  const [expanded, setExpanded] = useState(false);
  const canPreview = isTextRenderable(file.extension);
  const isPdf = file.extension === "pdf";
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(file.extension);

  // Extract raw text content from a text/* dataUrl for preview
  const getTextContent = (): string => {
    try {
      const commaIdx = file.dataUrl.indexOf(",");
      if (commaIdx === -1) return "(preview unavailable)";
      const b64 = file.dataUrl.slice(commaIdx + 1);
      return atob(b64);
    } catch {
      return "(preview unavailable)";
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = file.dataUrl;
    a.download = file.filename;
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
        onClick={() => (canPreview || isPdf || isImage) && setExpanded((v) => !v)}
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
          {(canPreview || isPdf || isImage) && (
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
                src={file.dataUrl}
                alt={file.filename}
                style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "4px", objectFit: "contain" }}
              />
            </div>
          )}
          {isPdf && (
            <div style={{ padding: "0.5rem" }}>
              <iframe
                src={file.dataUrl}
                style={{ width: "100%", height: "500px", border: "none", borderRadius: "4px" }}
                title={file.filename}
              />
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
                <code>{getTextContent()}</code>
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
      {/* URL evidence */}
      {evidenceUrl && evidenceType !== "screenshot" && (
        <a
          href={evidenceUrl}
          target="_blank"
          rel="noreferrer noopener"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            color: "var(--accent)",
            fontSize: "0.8125rem",
            fontFamily: "var(--font-mono)",
            textDecoration: "none",
            width: "fit-content",
          }}
        >
          <Link2 size={13} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "320px" }}>
            {evidenceUrl}
          </span>
          <ExternalLink size={11} style={{ flexShrink: 0 }} />
        </a>
      )}

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
