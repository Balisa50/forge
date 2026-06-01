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
 * Render a paragraph of text that interleaves prose with `$...$` inline math,
 * `$$...$$` display math, `**bold**`, and `` `code` ``.
 *
 * One left-to-right tokenizer handles every mark in a single pass. The order
 * matters for one reason only — **bold can wrap math** (e.g. `**the mean $\mu$
 * matters**`). The earlier two-stage approach split on `$` first, which orphaned
 * the `**` markers into separate prose segments and rendered them as literal
 * asterisks on the page. Here a bold span is matched whole, then its inner text
 * is rendered recursively, so any math (or code) inside it still resolves.
 */
const TOKEN_RE = /(\$\$[^$]+?\$\$)|(\$[^$\n]+?\$)|(\*\*[\s\S]+?\*\*)|(`[^`]+?`)/g;

export function renderRichText(text: string, keyPrefix = "m"): React.ReactNode[] {
  if (!text) return [];
  const nodes: React.ReactNode[] = [];
  const re = new RegExp(TOKEN_RE.source, "g");
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      nodes.push(<React.Fragment key={`${keyPrefix}-p${k++}`}>{text.slice(last, m.index)}</React.Fragment>);
    }
    const tok = m[0];
    if (m[1]) {
      // $$ ... $$ display math
      nodes.push(
        <span
          key={`${keyPrefix}-d${k++}`}
          style={{ display: "block", margin: "0.75rem 0", overflowX: "auto" }}
          dangerouslySetInnerHTML={{ __html: renderTeX(tok.slice(2, -2), true) }}
        />,
      );
    } else if (m[2]) {
      // $ ... $ inline math
      nodes.push(
        <span key={`${keyPrefix}-i${k++}`} dangerouslySetInnerHTML={{ __html: renderTeX(tok.slice(1, -1), false) }} />,
      );
    } else if (m[3]) {
      // **bold** — recurse so inner math / code still render
      nodes.push(
        <strong key={`${keyPrefix}-b${k}`} style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {renderRichText(tok.slice(2, -2), `${keyPrefix}-b${k++}`)}
        </strong>,
      );
    } else if (m[4]) {
      // `code`
      nodes.push(
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
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) {
    nodes.push(<React.Fragment key={`${keyPrefix}-p${k++}`}>{text.slice(last)}</React.Fragment>);
  }
  return nodes;
}

/** Convenience block: a <p> of rich text. */
export function RichText({ text, style }: { text: string; style?: React.CSSProperties }) {
  return <p style={style}>{renderRichText(text)}</p>;
}
