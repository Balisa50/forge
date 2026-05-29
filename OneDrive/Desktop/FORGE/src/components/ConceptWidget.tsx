"use client";

/**
 * ConceptWidget — renders one interactive concept simulation.
 *
 * The widget's HTML/JS comes from the server-side registry
 * (src/lib/conceptWidgets) and is dropped into a fully isolated
 * `<iframe sandbox="allow-scripts">` — NO allow-same-origin, so it cannot
 * read cookies/storage, reach the network, or touch the parent DOM. The only
 * channel out is a `postMessage` carrying its rendered height, which we use to
 * size the iframe so it never shows an internal scrollbar.
 *
 * Performance: the iframe `srcDoc` is only injected once the widget scrolls
 * into view (IntersectionObserver). Off-screen widgets cost nothing.
 */

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { renderWidgetHtml, widgetMeta, type WidgetParams } from "@/lib/conceptWidgets";

interface Props {
  id: string;
  params?: WidgetParams;
  caption?: string;
}

export default function ConceptWidget({ id, params, caption }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [inView, setInView] = useState(false);
  const [height, setHeight] = useState(220);

  const html = renderWidgetHtml(id, params);
  const meta = widgetMeta(id);

  // Lazy mount: only build the iframe document once it's near the viewport.
  useEffect(() => {
    if (!wrapRef.current || inView) return;
    const el = wrapRef.current;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    // Safety net: if the observer never reports within a short window (e.g. a
    // zero-area target that never crosses the threshold, or a non-compositing
    // context where IO callbacks don't fire), check position directly and
    // promote so the widget can't get stuck on the placeholder.
    const t = setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 400 && r.bottom > -400) setInView(true);
    }, 300);
    return () => {
      obs.disconnect();
      clearTimeout(t);
    };
  }, [inView]);

  // Height sync: trust only messages from our own iframe's window.
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      const data = e.data;
      if (!data || data.__forgeWidget !== true || data.type !== "height") return;
      if (frameRef.current && e.source !== frameRef.current.contentWindow) return;
      const h = Number(data.height);
      if (Number.isFinite(h) && h > 40 && h < 4000) setHeight(Math.ceil(h));
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Unknown id → render nothing (graceful: a typo in JSON never breaks the page).
  if (!html || !meta) return null;

  return (
    <div
      ref={wrapRef}
      style={{
        margin: "0.25rem 0 0.75rem",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(212,175,55,0.25)",
        background: "linear-gradient(180deg, rgba(212,175,55,0.05), rgba(212,175,55,0.01))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 0.875rem 0.5rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.5625rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--accent)",
            background: "rgba(212,175,55,0.1)",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: 999,
            padding: "2px 8px",
          }}
        >
          <Sparkles size={10} /> Interactive
        </span>
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
          {meta.title}
        </span>
      </div>
      {caption && (
        <p
          style={{
            padding: "0 0.875rem 0.5rem",
            margin: 0,
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {caption}
        </p>
      )}

      {inView ? (
        <iframe
          ref={frameRef}
          title={meta.title}
          srcDoc={html}
          sandbox="allow-scripts"
          loading="lazy"
          style={{
            display: "block",
            width: "100%",
            height,
            border: "none",
            background: "transparent",
            transition: "height 0.2s ease",
          }}
        />
      ) : (
        <div
          style={{
            height: 180,
            display: "grid",
            placeItems: "center",
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
          }}
        >
          loading interactive…
        </div>
      )}
    </div>
  );
}
