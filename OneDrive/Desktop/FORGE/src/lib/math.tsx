/**
 * Server-side math rendering for the actuary concept path.
 *
 * Content strings use inline `$...$` and display `$$...$$` LaTeX. KaTeX renders
 * to static HTML on the server (no client JS, no layout shift). The output is
 * our own trusted content, so dangerouslySetInnerHTML on the KaTeX span is safe.
 *
 * The KaTeX stylesheet is imported once by the exam route segment, so these
 * components only emit the markup KaTeX produces.
 */

import katex from "katex";
import React from "react";

function renderTeX(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: false,
      output: "html",
    });
  } catch {
    // Never let a bad formula crash the page — show the raw source instead.
    return `<code>${tex.replace(/</g, "&lt;")}</code>`;
  }
}

/** Inline math span. */
export function Tex({ children, block = false }: { children: string; block?: boolean }) {
  return <span dangerouslySetInnerHTML={{ __html: renderTeX(children, block) }} />;
}

/**
 * Render a paragraph of text that may interleave plain prose with `$...$`
 * inline math and `$$...$$` display math. Returns an array of React nodes.
 */
export function renderRichText(text: string, keyPrefix = "m"): React.ReactNode[] {
  if (!text) return [];
  const nodes: React.ReactNode[] = [];
  // Split on display math first ($$ ... $$), keeping the delimiters via capture.
  const displayParts = text.split(/(\$\$[^$]+?\$\$)/g);
  let k = 0;
  for (const part of displayParts) {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const tex = part.slice(2, -2);
      nodes.push(
        <span
          key={`${keyPrefix}-d${k++}`}
          style={{ display: "block", margin: "0.75rem 0", overflowX: "auto" }}
          dangerouslySetInnerHTML={{ __html: renderTeX(tex, true) }}
        />,
      );
      continue;
    }
    // Within non-display segments, split on inline math ($ ... $).
    const inlineParts = part.split(/(\$[^$\n]+?\$)/g);
    for (const seg of inlineParts) {
      if (seg.startsWith("$") && seg.endsWith("$") && seg.length > 2) {
        const tex = seg.slice(1, -1);
        nodes.push(
          <span key={`${keyPrefix}-i${k++}`} dangerouslySetInnerHTML={{ __html: renderTeX(tex, false) }} />,
        );
      } else if (seg) {
        // Plain prose — support lightweight **bold** and `code` inline marks.
        nodes.push(...renderInlineMarks(seg, `${keyPrefix}-t${k++}`));
      }
    }
  }
  return nodes;
}

/** Minimal inline markdown: **bold** and `code`. No HTML injection — text only. */
function renderInlineMarks(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const parts = text.split(/(\*\*[^*]+?\*\*|`[^`]+?`)/g);
  let k = 0;
  for (const p of parts) {
    if (p.startsWith("**") && p.endsWith("**")) {
      out.push(
        <strong key={`${keyPrefix}-b${k++}`} style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {p.slice(2, -2)}
        </strong>,
      );
    } else if (p.startsWith("`") && p.endsWith("`")) {
      out.push(
        <code
          key={`${keyPrefix}-c${k++}`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.875em",
            background: "rgba(212,175,55,0.1)",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: 4,
            padding: "0.05rem 0.3rem",
          }}
        >
          {p.slice(1, -1)}
        </code>,
      );
    } else if (p) {
      out.push(<React.Fragment key={`${keyPrefix}-s${k++}`}>{p}</React.Fragment>);
    }
  }
  return out;
}

/** Convenience block: a <p> of rich text. */
export function RichText({ text, style }: { text: string; style?: React.CSSProperties }) {
  return <p style={style}>{renderRichText(text)}</p>;
}
