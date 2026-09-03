/**
 * Server-side math rendering for the actuary concept path.
 *
 * Content strings use inline `$...$` and display `$$...$$` LaTeX, plus
 * `**bold**`, `*italic*`, and `` `code` ``. KaTeX renders to static HTML on the
 * server (no client JS, no layout shift). The output is our own trusted
 * content, so dangerouslySetInnerHTML on the KaTeX span is safe.
 *
 * The KaTeX stylesheet is imported once by the exam route segment, so these
 * components only emit the markup KaTeX produces.
 *
 * THE DOLLAR PROBLEM. A literal dollar is authored as `\$` and appears in BOTH
 * contexts:
 *   - in prose  ("costs \$5000")            -> must display as a plain "$"
 *   - inside math ("$... = \$747.26$")      -> KaTeX's own escape for "$"
 * So a `\$` must NEVER be treated as a math delimiter. The tokenizer enforces
 * that with a negative lookbehind `(?<!\\)` on every `$` delimiter: an escaped
 * dollar can never open or close math. Inside a math token `\$` is passed to
 * KaTeX untouched (it renders "$"); in prose it is unescaped to "$". This
 * replaces an earlier sentinel hack that corrupted in-math `\$` with a NUL and
 * made KaTeX dump raw LaTeX onto the page.
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
 * One left-to-right tokenizer for every mark, in a single pass. Order matters:
 * display before inline math, bold before italic. `(?<!\\)` guards keep an
 * escaped `\$` from ever acting as a math delimiter; inside inline math the
 * `(?:\\.|[^$\n])` body lets escapes like `\$`, `\,`, `\{` live in the formula.
 */
const TOKEN_RE = /((?<!\\)\$\$[\s\S]+?(?<!\\)\$\$)|((?<!\\)\$(?:\\.|[^$\n])+?(?<!\\)\$)|(\*\*[\s\S]+?\*\*)|((?<!\*)\*(?:\\.|[^*\n])+?\*(?!\*))|(`[^`]+?`)/g;

// In prose, LaTeX escapes like `\$`, `\%`, `\&` should display as the literal
// symbol — KaTeX only runs inside `$...$`, so in prose the backslash would show
// verbatim ("8\%"). Strip it. (In-math text is untouched, where `\%` is correct.)
const plainProse = (s: string) => s.replace(/\\([$%&#_])/g, "$1");

export function renderRichText(text: string, keyPrefix = "m"): React.ReactNode[] {
  if (!text) return [];
  const nodes: React.ReactNode[] = [];
  const re = new RegExp(TOKEN_RE.source, "g");
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      nodes.push(<React.Fragment key={`${keyPrefix}-p${k++}`}>{plainProse(text.slice(last, m.index))}</React.Fragment>);
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
      // *italic* — recurse so inner math still renders
      nodes.push(
        <em key={`${keyPrefix}-e${k}`}>
          {renderRichText(tok.slice(1, -1), `${keyPrefix}-e${k++}`)}
        </em>,
      );
    } else if (m[5]) {
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
    nodes.push(<React.Fragment key={`${keyPrefix}-p${k++}`}>{plainProse(text.slice(last))}</React.Fragment>);
  }
  return nodes;
}

/** Convenience block: a <p> of rich text. */
export function RichText({ text, style }: { text: string; style?: React.CSSProperties }) {
  return <p style={style}>{renderRichText(text)}</p>;
}
