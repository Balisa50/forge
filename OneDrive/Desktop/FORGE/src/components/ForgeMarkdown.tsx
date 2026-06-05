"use client";

/**
 * ForgeMarkdown — rich content renderer for Forge roadmap body text.
 *
 * Handles the specific format used in Forge JSON data:
 *   • Markdown headings (# ## ###)
 *   • Bold **text**, italic *text*, inline `code`
 *   • Action labels [READ] [COPY] [PRODUCE] [EXAMPLE] [WRITE] [BUILD] [WATCH]
 *   • Unordered lists (- item), ordered lists (1. item)
 *   • Checklist items (☐ item)
 *   • Indented code blocks with copy button + basic syntax colors
 *   • CODE CELL / MARKDOWN CELL instruction blocks
 *   • STEP N — title / body numbered steps
 *   • Section dividers (─────── LABEL ───────)
 *   • ☐ PASS CRITERIA checklist sections
 *   • ## TL;DR rendered as a gold callout box
 *
 * No external dependencies. All styling uses Forge CSS variables.
 */

import { useState, useCallback } from "react";
import {
  Copy, Check, Code2, PenLine, AlertCircle,
  ChevronRight, FileCode2, BookOpen,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Block types
// ─────────────────────────────────────────────────────────────────────────────

type HeadingBlock = { t: "h1" | "h2" | "h3"; text: string; isTldr: boolean };
type ParagraphBlock = { t: "p"; text: string };
type UlBlock = { t: "ul"; items: string[] };
type OlBlock = { t: "ol"; items: string[] };
type ChecklistBlock = { t: "checklist"; items: string[] };
type CodeBlock = { t: "code"; content: string };
type MdTemplateBlock = { t: "mdtemplate"; content: string };
type CellBlock = { t: "cell"; kind: "code" | "markdown"; label: string; bodyLines: string[] };
type StepBlock = { t: "step"; number: string; title: string; bodyLines: string[] };
type DividerBlock = { t: "divider"; label?: string };
type PassBlock = { t: "pass"; items: string[] };

type Block =
  | HeadingBlock | ParagraphBlock | UlBlock | OlBlock
  | ChecklistBlock | CodeBlock | MdTemplateBlock | CellBlock | StepBlock
  | DividerBlock | PassBlock;

/** Is an indented block actually a markdown TEMPLATE (a structure the student
 *  should write — headings + prose) rather than real code? Heading present and
 *  no code signals. Keeps git/python/SQL as copyable code, promotes memo /
 *  notebook-markdown templates to a rendered preview so "## X" reads as a
 *  heading instead of leaking raw hashes. */
function looksLikeMarkdownTemplate(content: string): boolean {
  const hasHeading = /(^|\n)\s*#{1,4}\s+\S/.test(content);
  if (!hasHeading) return false;
  const codeSignal =
    /(^|\n)\s*(import |from \w|def |class |return\b|print\(|pip install|npm |yarn |git |cd |mkdir |sudo |SELECT |INSERT |CREATE |for \w+ in |while .+:|if .+:)/i.test(content) ||
    /\bpd\.|\bplt\.|\bnp\.|\bdf\[|\.read_|\.groupby\(|=>|;\s*$/m.test(content);
  return !codeSignal;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline formatter
// ─────────────────────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
  READ: "#60a5fa", COPY: "#34d399", PRODUCE: "#f59e0b",
  EXAMPLE: "#c084fc", WRITE: "#f472b6", CODE: "#34d399",
  BUILD: "#fb923c", WATCH: "#fb7185", THINK: "#818cf8",
};

function InlineText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /(\[(?:READ|COPY|PRODUCE|EXAMPLE|WRITE|CODE|BUILD|WATCH|THINK)\]|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0, k = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    const tok = m[0];

    if (tok.startsWith("[")) {
      const tag = tok.slice(1, -1);
      const color = ACTION_COLORS[tag] ?? "#9ca3af";
      parts.push(
        <span key={k++} style={{
          display: "inline-block",
          padding: "1px 7px",
          borderRadius: 4,
          background: `${color}1a`,
          border: `1px solid ${color}44`,
          color,
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.14em",
          fontWeight: 700,
          textTransform: "uppercase",
          verticalAlign: "middle",
          marginRight: "0.4rem",
          lineHeight: 1.8,
        }}>{tag}</span>
      );
    } else if (tok.startsWith("**")) {
      parts.push(<strong key={k++} style={{ color: "var(--text-primary)", fontWeight: 700 }}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("`")) {
      parts.push(
        <code key={k++} style={{
          fontFamily: "var(--font-mono)",
          background: "rgba(212,175,55,0.12)",
          color: "var(--accent)",
          padding: "1px 6px",
          borderRadius: 4,
          fontSize: "0.875em",
          border: "1px solid rgba(212,175,55,0.22)",
        }}>{tok.slice(1, -1)}</code>
      );
    } else {
      parts.push(<em key={k++} style={{ color: "var(--text-secondary)" }}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Basic syntax coloring (no library — CSS-class approach)
// ─────────────────────────────────────────────────────────────────────────────

type Chunk = { text: string; color?: string };

function colorize(line: string): Chunk[] {
  // Git commands
  if (/^git\s/.test(line.trim())) {
    const [cmd, sub, ...rest] = line.trim().split(/\s+/);
    const out: Chunk[] = [
      { text: cmd, color: "#34d399" },
      { text: " " },
    ];
    if (sub) out.push({ text: sub, color: "#60a5fa" });
    if (rest.length) out.push({ text: " " + rest.join(" "), color: "#d1d5db" });
    return out;
  }

  // Python comment
  if (/^\s*#/.test(line)) {
    return [{ text: line, color: "#6b7280" }];
  }

  // Python import / from
  if (/^\s*(import|from)\s/.test(line)) {
    return line.split(/\b/).map((tok) => {
      if (["import", "from", "as"].includes(tok)) return { text: tok, color: "#c084fc" };
      return { text: tok };
    });
  }

  // Python def / class
  if (/^\s*(def|class)\s/.test(line)) {
    return line.split(/\b/).map((tok) => {
      if (["def", "class", "return", "if", "else", "elif", "for", "while", "in", "not", "and", "or"].includes(tok))
        return { text: tok, color: "#f472b6" };
      return { text: tok };
    });
  }

  // Shell commands (echo, mkdir, cd, etc.)
  if (/^\s*(echo|mkdir|cd|ls|cat|rm|cp|mv|touch|chmod|export|source)\s/.test(line.trim())) {
    const parts = line.trim().split(/\s+/);
    return [
      { text: parts[0], color: "#34d399" },
      { text: " " + parts.slice(1).join(" "), color: "#d1d5db" },
    ];
  }

  // String literals (very basic)
  if (line.includes('"') || line.includes("'")) {
    const chunks: Chunk[] = [];
    const strRe = /(["'])(?:(?!\1).)*\1/g;
    let lastIdx = 0;
    let sm: RegExpExecArray | null;
    while ((sm = strRe.exec(line))) {
      if (sm.index > lastIdx) chunks.push({ text: line.slice(lastIdx, sm.index) });
      chunks.push({ text: sm[0], color: "#fbbf24" });
      lastIdx = sm.index + sm[0].length;
    }
    if (lastIdx < line.length) chunks.push({ text: line.slice(lastIdx) });
    return chunks;
  }

  return [{ text: line }];
}

// ─────────────────────────────────────────────────────────────────────────────
// Code block component with line numbers + copy button
// ─────────────────────────────────────────────────────────────────────────────

function CodeBlock({ content, label }: { content: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const lines = content.split("\n");

  const copy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  return (
    <div
      // The `.forge-code-block` class lets globals.css enforce two things that
      // inline styles can't conditionally do: (1) wrap code lines on mobile so
      // the student doesn't swipe sideways, (2) tighten the line-number
      // gutter so the code column lines up with paragraph text on desktop.
      className="forge-code-block"
      style={{
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(212,175,55,0.22)",
        background: "rgba(5, 8, 15, 0.85)",
        marginTop: "0.75rem",
        marginBottom: "0.75rem",
        marginLeft: 0,
        marginRight: 0,
        maxWidth: "100%",
      }}
    >
      {/* Code block header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.4375rem 0.875rem",
        borderBottom: "1px solid rgba(212,175,55,0.12)",
        background: "rgba(212,175,55,0.05)",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.625rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(212,175,55,0.7)",
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
        }}>
          <FileCode2 size={11} />
          {label ?? "code"}
        </span>
        <button
          onClick={copy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            background: "none",
            border: "1px solid rgba(212,175,55,0.25)",
            borderRadius: 5,
            padding: "0.1875rem 0.5rem",
            cursor: "pointer",
            color: copied ? "#34d399" : "rgba(212,175,55,0.7)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.5625rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            transition: "color 0.2s, border-color 0.2s",
          }}
          aria-label="Copy code"
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Lines */}
      <div
        className="forge-code-scroll"
        style={{
          overflowX: "auto",
          padding: "0.875rem 0",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <table style={{
          borderCollapse: "collapse",
          width: "100%",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8125rem",
          lineHeight: 1.65,
        }}>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} style={{ verticalAlign: "top" }}>
                <td
                  className="forge-code-gutter"
                  style={{
                    userSelect: "none",
                    // Tightened from 1rem/1rem so the code column aligns
                    // closer to paragraph text on desktop. Mobile shrinks
                    // further via globals.css.
                    padding: "0 0.5rem 0 0.625rem",
                    color: "rgba(255,255,255,0.18)",
                    textAlign: "right",
                    fontSize: "0.6875rem",
                    minWidth: "1.75rem",
                    lineHeight: 1.65,
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                    verticalAlign: "top",
                  }}
                >
                  {idx + 1}
                </td>
                <td
                  className="forge-code-line"
                  style={{
                    // Tightened from 1.25rem; matches paragraph left padding
                    // for a clean alignment with body text on desktop.
                    padding: "0 0.875rem",
                    whiteSpace: "pre",
                    lineHeight: 1.65,
                  }}
                >
                  {colorize(line).map((chunk, ci) => (
                    <span key={ci} style={{ color: chunk.color ?? "#e2e8f0" }}>{chunk.text}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step block component
// ─────────────────────────────────────────────────────────────────────────────

function StepBlock({ number, title, bodyLines }: { number: string; title: string; bodyLines: string[] }) {
  const body = bodyLines.join("\n");
  const subBlocks = body.trim() ? parse(body) : [];

  return (
    <div style={{
      display: "flex",
      gap: "0.875rem",
      alignItems: "flex-start",
      padding: "0.875rem 1rem",
      borderRadius: 10,
      background: "rgba(245,158,11,0.04)",
      border: "1px solid rgba(245,158,11,0.18)",
      marginTop: "0.625rem",
      marginBottom: "0.625rem",
    }}>
      {/* Step number badge */}
      <div style={{
        flexShrink: 0,
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "rgba(245,158,11,0.15)",
        border: "1.5px solid rgba(245,158,11,0.4)",
        color: "var(--accent)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        fontWeight: 800,
        display: "grid",
        placeItems: "center",
        lineHeight: 1,
      }}>
        {number}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.9375rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          lineHeight: 1.4,
          marginBottom: subBlocks.length ? "0.5rem" : 0,
        }}>
          <InlineText text={title} />
        </p>
        {subBlocks.length > 0 && (
          <div style={{ marginTop: "0.375rem" }}>
            <BlockList blocks={subBlocks} nested />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cell instruction block (CODE CELL / MARKDOWN CELL)
// ─────────────────────────────────────────────────────────────────────────────

function CellBlock({ kind, label, bodyLines }: { kind: "code" | "markdown"; label: string; bodyLines: string[] }) {
  const isCode = kind === "code";
  const accent = isCode ? "#34d399" : "#60a5fa";
  const Icon = isCode ? Code2 : PenLine;
  const badge = isCode ? "CODE CELL" : "MARKDOWN CELL";
  const instruction = isCode ? "Write this code cell" : "Write this markdown cell";

  const bodyContent = bodyLines.map((l) => l.trimStart()).join("\n").trim();

  return (
    <div style={{
      borderRadius: 10,
      overflow: "hidden",
      border: `1px solid ${accent}33`,
      marginTop: "0.75rem",
      marginBottom: "0.75rem",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0.875rem",
        background: `${accent}0f`,
        borderBottom: `1px solid ${accent}22`,
      }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.625rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: accent,
          fontWeight: 700,
        }}>
          <Icon size={11} />
          {badge}
        </span>
        <span style={{
          display: "inline-block",
          padding: "1px 7px",
          borderRadius: 4,
          background: "#f59e0b1a",
          border: "1px solid #f59e0b44",
          color: "#f59e0b",
          fontFamily: "var(--font-mono)",
          fontSize: "0.5625rem",
          letterSpacing: "0.12em",
          fontWeight: 700,
          textTransform: "uppercase",
        }}>
          PRODUCE
        </span>
      </div>

      {/* Body — split: label/instruction sit in a padded inner div, but
          the CodeBlock itself renders FLUSH with the cell border so its
          left edge matches every other code block on the page. Without
          this, code in a CODE CELL appeared 0.875 rem to the right of
          top-level code — the indent inconsistency Abdoulie reported. */}
      {(label || (!label && !bodyContent)) && (
        <div style={{ padding: "0.75rem 0.875rem 0" }}>
          {label && (
            <p style={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.4,
              marginBottom: bodyContent ? "0.5rem" : 0,
            }}>
              <InlineText text={label} />
            </p>
          )}
          {!label && !bodyContent && (
            <p style={{ fontSize: "0.875rem", color: "var(--text-dim)", fontStyle: "italic" }}>
              {instruction}
            </p>
          )}
        </div>
      )}
      {bodyContent && (
        <div style={{ padding: isCode ? "0.5rem 0 0" : "0.5rem 0.875rem 0" }}>
          {isCode ? (
            <CodeBlock content={bodyContent} label="python" />
          ) : (
            // Markdown cell: show a rendered PREVIEW of what the student should
            // type, so headings/bullets read as headings/bullets — not raw "##".
            <div style={{ borderRadius: 8, border: "1px dashed rgba(96,165,250,0.35)", background: "rgba(96,165,250,0.04)", padding: "0.625rem 0.875rem 0.25rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#60a5fa", display: "block", marginBottom: "0.4rem", opacity: 0.8 }}>
                Preview — type this into the cell
              </span>
              <BlockList blocks={parse(bodyContent)} nested />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TL;DR callout wrapper
// ─────────────────────────────────────────────────────────────────────────────

function TldrCallout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: 10,
      padding: "0.875rem 1rem",
      background: "rgba(212,175,55,0.07)",
      border: "1px solid rgba(212,175,55,0.3)",
      marginTop: "0.75rem",
      marginBottom: "0.75rem",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontFamily: "var(--font-mono)",
        fontSize: "0.6rem",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--accent)",
        marginBottom: "0.5rem",
        fontWeight: 700,
      }}>
        <AlertCircle size={11} />
        TL;DR — Key takeaways
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Parser
// ─────────────────────────────────────────────────────────────────────────────

function parse(raw: string): Block[] {
  const blocks: Block[] = [];
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip blank
    if (!trimmed) { i++; continue; }

    // Fenced code block: ```lang ... ```  (standard markdown)
    if (trimmed.startsWith("```")) {
      const code: string[] = [];
      i++; // skip opening fence
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      while (code.length && !code[code.length - 1].trim()) code.pop();
      while (code.length && !code[0].trim()) code.shift();
      if (code.length) blocks.push({ t: "code", content: code.join("\n") });
      continue;
    }

    // Heading: # ## ###
    const hm = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (hm) {
      const lvl = hm[1].length as 1 | 2 | 3;
      const text = hm[2].trim();
      const isTldr = /^tl[;:]?dr/i.test(text.replace(/\s+/g, ""));
      blocks.push({ t: `h${lvl}` as "h1" | "h2" | "h3", text, isTldr });
      i++;
      continue;
    }

    // Section divider: ───── LABEL ───── or plain ──────
    if (/^[─━═\-]{3,}/.test(trimmed)) {
      const labelM = trimmed.match(/[─━═\-]{2,}\s*([A-Za-z][A-Za-z0-9\s&/+.]+?)\s*[─━═\-]{2,}/);
      blocks.push({ t: "divider", label: labelM?.[1]?.trim() });
      i++;
      continue;
    }

    // STEP N — title
    const stepM = trimmed.match(/^STEP\s+(\d+)\s*[—–\-]+\s*(.+)$/i);
    if (stepM) {
      i++;
      const bodyLines: string[] = [];
      while (i < lines.length) {
        const l = lines[i];
        const tr = l.trim();
        if (!tr) {
          // Look ahead: if next non-blank line is a new step, stop
          let j = i + 1;
          while (j < lines.length && !lines[j].trim()) j++;
          if (j < lines.length && /^STEP\s+\d+\s*[—–\-]/i.test(lines[j].trim())) break;
          if (j < lines.length && /^[─━═]{3,}/.test(lines[j].trim())) break;
          if (j < lines.length && /^#{1,3}\s/.test(lines[j].trim())) break;
          bodyLines.push("");
          i++;
          continue;
        }
        if (/^STEP\s+\d+\s*[—–\-]/i.test(tr)) break;
        if (/^[─━═]{3,}/.test(tr)) break;
        if (/^#{1,3}\s/.test(tr)) break;
        bodyLines.push(l);
        i++;
      }
      while (bodyLines.length && !bodyLines[bodyLines.length - 1].trim()) bodyLines.pop();
      blocks.push({ t: "step", number: stepM[1], title: stepM[2].trim(), bodyLines });
      continue;
    }

    // CODE CELL or MARKDOWN CELL
    const cellM = trimmed.match(/^(CODE CELL|MARKDOWN CELL)\s*\d*\s*[—–:\-]?\s*(.*)/i);
    if (cellM) {
      const kind: "code" | "markdown" = cellM[1].toUpperCase().startsWith("CODE") ? "code" : "markdown";
      const label = cellM[2].trim().replace(/^['"]|['"]$/g, "");
      i++;
      const bodyLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith("  ") || lines[i].startsWith("\t"))) {
        bodyLines.push(lines[i]);
        i++;
      }
      blocks.push({ t: "cell", kind, label, bodyLines });
      continue;
    }

    // ☐ Pass criteria
    if (/^☐\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^☐\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().slice(2).trim());
        i++;
      }
      blocks.push({ t: "pass", items });
      continue;
    }

    // Unordered list
    if (/^[-*•]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s/.test(lines[i]) && lines[i].trim()) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ""));
        i++;
      }
      blocks.push({ t: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+[.)]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s/.test(lines[i]) && lines[i].trim()) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push({ t: "ol", items });
      continue;
    }

    // Indented code block (6+ spaces = code in Forge content format)
    if (line.startsWith("      ") || (line.startsWith("    ") && !/^\s*[-*•]/.test(line.trim()))) {
      const codeLines: string[] = [];
      while (i < lines.length) {
        const l = lines[i];
        if (!l.trim()) { codeLines.push(""); i++; continue; }
        if (!l.startsWith("    ")) break;
        // Don't eat list items
        if (/^\s{0,3}[-*•]/.test(l)) break;
        codeLines.push(l.startsWith("      ") ? l.slice(6) : l.startsWith("    ") ? l.slice(4) : l);
        i++;
      }
      while (codeLines.length && !codeLines[codeLines.length - 1].trim()) codeLines.pop();
      while (codeLines.length && !codeLines[0].trim()) codeLines.shift();
      if (codeLines.length) {
        const content = codeLines.join("\n");
        blocks.push(looksLikeMarkdownTemplate(content) ? { t: "mdtemplate", content } : { t: "code", content });
      }
      continue;
    }

    // Paragraph — collect until blank or next block-starting line
    const paraLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      const tr = l.trim();
      if (!tr) { i++; break; }
      if (/^#{1,3}\s/.test(tr)) break;
      if (/^[─━═\-]{3,}/.test(tr)) break;
      if (/^STEP\s+\d+/i.test(tr)) break;
      if (/^(CODE CELL|MARKDOWN CELL)/i.test(tr)) break;
      if (/^[-*•]\s/.test(tr)) break;
      if (/^\d+[.)]\s/.test(tr)) break;
      if (/^☐\s/.test(tr)) break;
      if (l.startsWith("      ")) break;
      paraLines.push(tr);
      i++;
    }
    if (paraLines.length) {
      blocks.push({ t: "p", text: paraLines.join(" ") });
    }
  }

  return blocks;
}

// ─────────────────────────────────────────────────────────────────────────────
// Block list renderer
// ─────────────────────────────────────────────────────────────────────────────

function BlockList({ blocks, nested, inTldr }: { blocks: Block[]; nested?: boolean; inTldr?: boolean }) {
  let tldrOpen = false;
  const output: React.ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];

    // TL;DR heading opens the callout wrapper
    if (b.t === "h2" && (b as HeadingBlock).isTldr) {
      tldrOpen = true;
      // Collect following ul/ol/p blocks into the callout
      const calloutChildren: Block[] = [];
      let j = i + 1;
      while (j < blocks.length && ["ul", "ol", "p"].includes(blocks[j].t)) {
        calloutChildren.push(blocks[j]);
        j++;
      }
      output.push(
        <TldrCallout key={i}>
          <BlockList blocks={calloutChildren} inTldr />
        </TldrCallout>
      );
      i = j - 1;
      tldrOpen = false;
      continue;
    }

    output.push(<BlockRenderer key={i} block={b} nested={nested} inTldr={inTldr} />);
  }

  return <>{output}</>;
}

function BlockRenderer({
  block, nested, inTldr,
}: {
  block: Block;
  nested?: boolean;
  inTldr?: boolean;
}) {
  switch (block.t) {
    case "h1":
      return (
        <h2 style={{
          fontFamily: "var(--font-headline)",
          fontSize: nested ? "1.125rem" : "1.375rem",
          fontWeight: 800,
          color: "var(--text-primary)",
          lineHeight: 1.2,
          marginTop: "1.25rem",
          marginBottom: "0.5rem",
          paddingBottom: "0.375rem",
          borderBottom: "1px solid var(--border)",
        }}>
          <InlineText text={block.text} />
        </h2>
      );

    case "h2":
      return (
        <h3 style={{
          fontFamily: "var(--font-headline)",
          fontSize: nested ? "1rem" : "1.125rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1.3,
          marginTop: "1rem",
          marginBottom: "0.375rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}>
          <ChevronRight size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <InlineText text={block.text} />
        </h3>
      );

    case "h3":
      return (
        <h4 style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "var(--text-secondary)",
          lineHeight: 1.4,
          marginTop: "0.75rem",
          marginBottom: "0.25rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          <InlineText text={block.text} />
        </h4>
      );

    case "p":
      return (
        <p style={{
          fontSize: nested ? "0.875rem" : "0.9375rem",
          color: inTldr ? "var(--text-primary)" : "var(--text-secondary)",
          lineHeight: 1.7,
          marginBottom: "0.625rem",
          marginTop: 0,
        }}>
          <InlineText text={block.text} />
        </p>
      );

    case "ul":
      return (
        <ul style={{
          listStyle: "none",
          padding: 0,
          margin: "0.375rem 0 0.625rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.3125rem",
        }}>
          {block.items.map((item, i) => (
            <li key={i} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              fontSize: "0.9375rem",
              color: inTldr ? "var(--text-primary)" : "var(--text-secondary)",
              lineHeight: 1.6,
            }}>
              <span style={{
                flexShrink: 0,
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--accent)",
                marginTop: "0.5rem",
                opacity: 0.7,
              }} />
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol style={{
          listStyle: "none",
          padding: 0,
          margin: "0.375rem 0 0.625rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.375rem",
          counterReset: "forge-ol",
        }}>
          {block.items.map((item, i) => (
            <li key={i} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.625rem",
              fontSize: "0.9375rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}>
              <span style={{
                flexShrink: 0,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(212,175,55,0.12)",
                border: "1px solid rgba(212,175,55,0.25)",
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                fontWeight: 700,
                display: "grid",
                placeItems: "center",
                lineHeight: 1,
              }}>
                {i + 1}
              </span>
              <span style={{ paddingTop: "0.1875rem" }}>
                <InlineText text={item} />
              </span>
            </li>
          ))}
        </ol>
      );

    case "checklist":
      return (
        <ul style={{
          listStyle: "none",
          padding: 0,
          margin: "0.375rem 0 0.625rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.3125rem",
        }}>
          {block.items.map((item, i) => (
            <li key={i} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}>
              <span style={{
                flexShrink: 0,
                width: 16,
                height: 16,
                borderRadius: 4,
                border: "1.5px solid rgba(212,175,55,0.4)",
                marginTop: "0.1875rem",
              }} />
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );

    case "code":
      return <CodeBlock content={block.content} />;

    case "mdtemplate":
      // A "write this structure" template (memo outline, notebook markdown):
      // render a parsed preview so headings/bullets read correctly.
      return (
        <div style={{ borderRadius: 8, border: "1px dashed rgba(96,165,250,0.35)", background: "rgba(96,165,250,0.04)", padding: "0.625rem 0.875rem 0.25rem", margin: "0.75rem 0" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#60a5fa", display: "block", marginBottom: "0.4rem", opacity: 0.8 }}>
            Template — write this in your document
          </span>
          <BlockList blocks={parse(block.content)} nested />
        </div>
      );

    case "cell":
      return <CellBlock kind={block.kind} label={block.label} bodyLines={block.bodyLines} />;

    case "step":
      return <StepBlock number={block.number} title={block.title} bodyLines={block.bodyLines} />;

    case "divider":
      return (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          margin: "1.125rem 0",
          opacity: 0.5,
        }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          {block.label && (
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.5625rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--text-dim)",
              whiteSpace: "nowrap",
            }}>
              {block.label}
            </span>
          )}
          {block.label && <div style={{ flex: 1, height: 1, background: "var(--border)" }} />}
        </div>
      );

    case "pass":
      return (
        <div style={{
          borderRadius: 10,
          padding: "0.875rem 1rem",
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.2)",
          marginTop: "0.75rem",
          marginBottom: "0.75rem",
        }}>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.625rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#22c55e",
            marginBottom: "0.5rem",
            fontWeight: 700,
          }}>
            Pass criteria
          </p>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            {block.items.map((item, i) => (
              <li key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: 1.55,
              }}>
                <span style={{
                  flexShrink: 0,
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: "1.5px solid rgba(34,197,94,0.5)",
                  background: "rgba(34,197,94,0.08)",
                  marginTop: "0.125rem",
                  display: "grid",
                  placeItems: "center",
                }}>
                  <BookOpen size={9} style={{ color: "#22c55e" }} />
                </span>
                <InlineText text={item} />
              </li>
            ))}
          </ul>
        </div>
      );

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

interface ForgeMarkdownProps {
  children: string;
  /** Reduce font sizes for use inside smaller cards */
  compact?: boolean;
}

export default function ForgeMarkdown({ children, compact: _compact }: ForgeMarkdownProps) {
  if (!children?.trim()) return null;
  const blocks = parse(children);
  if (!blocks.length) return null;

  return (
    <div style={{ lineHeight: 1.7 }}>
      <BlockList blocks={blocks} />
    </div>
  );
}
