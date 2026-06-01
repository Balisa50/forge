"use client";

/**
 * VideoEmbed — privacy-enhanced YouTube + Loom iframe player.
 *
 * Rule going forward: no learner ever clicks a raw video link.
 * The player lives inside Forge.
 *
 *  YouTube  → www.youtube-nocookie.com/embed/VIDEO_ID?rel=0&modestbranding=1
 *  Loom     → www.loom.com/embed/VIDEO_ID
 *  Other    → if iframe-safe (heuristic), embed; otherwise show "Open in new tab"
 *
 * Accepts any standard URL format:
 *   https://youtu.be/abc
 *   https://www.youtube.com/watch?v=abc&t=42s
 *   https://www.youtube.com/shorts/abc
 *   https://www.loom.com/share/abc
 */

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";

interface Props {
  url: string;
  title?: string;
  /** Hide the title bar above the player */
  bare?: boolean;
  /** Render as lazy thumbnail until clicked — saves bandwidth & blocks autoplay surprises */
  lazy?: boolean;
}

function extractYouTubeId(url: string): string | null {
  // youtu.be/ID
  let m = url.match(/youtu\.be\/([\w-]{6,})/);
  if (m) return m[1];
  // youtube.com/watch?v=ID  ·  youtube.com/embed/ID  ·  youtube.com/shorts/ID
  m = url.match(/youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/|v\/)([\w-]{6,})/);
  if (m) return m[1];
  return null;
}

function extractLoomId(url: string): string | null {
  const m = url.match(/loom\.com\/(?:share|embed)\/([\w-]{8,})/);
  return m ? m[1] : null;
}

function buildEmbedUrl(url: string): { embed: string | null; provider: "youtube" | "loom" | "other"; thumb: string | null } {
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return {
      // playsinline=1 — critical for iOS Safari: without it, tapping the video
      // forces fullscreen instead of playing inline, which looks broken.
      embed: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&controls=1&playsinline=1`,
      provider: "youtube",
      thumb: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
    };
  }
  const loomId = extractLoomId(url);
  if (loomId) {
    return {
      embed: `https://www.loom.com/embed/${loomId}?hide_owner=true&hide_share=true&hideEmbedTopBar=true`,
      provider: "loom",
      thumb: null,
    };
  }
  return { embed: null, provider: "other", thumb: null };
}

export default function VideoEmbed({ url, title, bare, lazy = true }: Props) {
  const { embed, provider, thumb } = buildEmbedUrl(url);
  const [loaded, setLoaded] = useState(!lazy);

  // Not embeddable — clean external-link card.
  if (!embed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.625rem 0.875rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          color: "var(--text-primary)",
          textDecoration: "none",
          fontSize: "0.8125rem",
          fontFamily: "var(--font-body)",
        }}
      >
        <ExternalLink size={14} color="var(--accent)" />
        {title ?? "Open resource"}
      </a>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {!bare && title && (
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          letterSpacing: "0.18em",
          color: "var(--text-dim)",
          textTransform: "uppercase",
          marginBottom: "0.5rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
        }}>
          <span style={{
            display: "inline-block",
            width: 6, height: 6, borderRadius: "50%",
            background: provider === "youtube" ? "#ef4444" : provider === "loom" ? "#625df5" : "var(--accent)",
          }} />
          {title}
        </div>
      )}

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          background: "#000",
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      >
        {loaded ? (
          <iframe
            // The iframe only mounts AFTER the user taps the thumbnail, so we
            // append autoplay + playsinline: one tap loads AND plays the video
            // inline (iOS refuses to start without playsinline; without autoplay
            // mobile users had to tap a second time). #4
            src={embed + (embed.includes("?") ? "&" : "?") + "autoplay=1&playsinline=1"}
            title={title ?? "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              border: 0,
              // Explicit pointer-events ensures tap works even inside complex layouts
              pointerEvents: "auto",
              touchAction: "auto",
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            // touchStart fires before onClick on mobile — fires load immediately
            // on tap without waiting for the 300ms click delay on older iOS.
            onTouchStart={() => setLoaded(true)}
            aria-label={`Play ${title ?? "video"}`}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              border: 0,
              padding: 0,
              cursor: "pointer",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              background: thumb
                ? `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.5)), url(${thumb}) center/cover`
                : "linear-gradient(135deg, #1a1410, #0a0807)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <span style={{
              display: "grid",
              placeItems: "center",
              width: 64, height: 64,
              borderRadius: "50%",
              background: "rgba(212,175,55,0.95)",
              color: "#000",
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            }}>
              <Play size={26} fill="#000" strokeWidth={0} style={{ marginLeft: 3 }} />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
