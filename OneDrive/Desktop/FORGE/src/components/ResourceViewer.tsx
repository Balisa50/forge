"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ExternalLink, Maximize2, Loader2 } from "lucide-react";

/**
 * In-app viewer for external resources. Embeds:
 *   - YouTube videos (youtube.com/watch?v=, youtu.be/, /results?search_query=...)
 *   - PDFs (Mozilla pdf.js compatible)
 *   - Any URL the remote site allows in an iframe (no X-Frame-Options block)
 *
 * If embedding fails (X-Frame-Options: DENY/SAMEORIGIN from the source), we
 * detect the load timeout and offer "Open in new tab" — graceful fallback.
 */

export interface ViewerProps {
  url: string;
  label: string;
  onClose: () => void;
}

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    // Direct video
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let videoId = "";
      if (u.hostname.includes("youtu.be")) videoId = u.pathname.slice(1);
      if (u.searchParams.get("v")) videoId = u.searchParams.get("v")!;
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;

      // YouTube search results — embed the first hit via search-results widget URL
      const q = u.searchParams.get("search_query");
      if (q) {
        // YouTube doesn't allow embedding search results pages — fall back
        return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function isPdf(url: string): boolean {
  return /\.pdf(?:\?|#|$)/i.test(url);
}

export default function ResourceViewer({ url, label, onClose }: ViewerProps) {
  const [loading, setLoading] = useState(true);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Timeout fallback: many sites X-Frame-Options block. If we don't get a load
  // event in 6s, surface the "open in tab" fallback.
  useEffect(() => {
    const t = setTimeout(() => {
      if (loading) setIframeBlocked(true);
    }, 6000);
    return () => clearTimeout(t);
  }, [loading]);

  const embedUrl = youtubeEmbed(url);
  const finalUrl = embedUrl ?? url;
  const isYouTube = !!embedUrl;
  const pdf = isPdf(url);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setIframeBlocked(false);
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(5,8,15,0.85)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1100px, 100%)",
          height: "min(720px, 92vh)",
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)" }}>
          <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: "0.9375rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {label}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--text-dim)", fontSize: "0.75rem", textDecoration: "none", padding: "0.25rem 0.5rem" }}
            title="Open in new tab"
          >
            <Maximize2 size={13} /> Open
          </a>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0.25rem" }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, position: "relative", background: "#000" }}>
          {loading && !iframeBlocked && (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--text-dim)" }}>
              <Loader2 size={22} className="animate-spin" />
            </div>
          )}

          {iframeBlocked ? (
            <div style={{ height: "100%", display: "grid", placeItems: "center", padding: "2rem", textAlign: "center", background: "var(--bg-panel)" }}>
              <div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  This site blocks in-app embedding. Open it in a new tab:
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="forge-btn forge-btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1rem" }}
                >
                  <ExternalLink size={14} /> Open resource
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={finalUrl}
              onLoad={handleLoad}
              title={label}
              allow={isYouTube ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" : ""}
              allowFullScreen
              referrerPolicy="no-referrer"
              sandbox={pdf ? "allow-scripts allow-same-origin" : "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"}
              style={{ width: "100%", height: "100%", border: 0, background: "#000" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
