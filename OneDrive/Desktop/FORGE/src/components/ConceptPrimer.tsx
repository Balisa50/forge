"use client";

/**
 * ConceptPrimer — visual-first card at the top of a week's brief.
 *
 * Image first, explanation below. Stolen from Zoonk's lesson opener,
 * adapted to Forge's dark/gold aesthetic.
 *
 * Renders nothing if no primer text is provided. Image is optional — when
 * absent, the card is text-only but still visually distinct from the
 * day list below it.
 *
 * Markdown subset supported: **bold**, *italic*, `inline code`, two-line
 * paragraph breaks. No external markdown dep — keeps the bundle small.
 */

import { Lightbulb } from "lucide-react";

interface Props {
  primer: string;
  imageUrl?: string;
}

function inlineFormat(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Tokenise: **bold** | *italic* | `code` | plain
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={key++} style={{ color: "var(--text-primary)" }}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) parts.push(<code key={key++} style={{ fontFamily: "var(--font-mono)", background: "rgba(212,175,55,0.08)", color: "var(--accent)", padding: "1px 5px", borderRadius: 4, fontSize: "0.9em" }}>{tok.slice(1, -1)}</code>);
    else parts.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    lastIndex = m.index + tok.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export default function ConceptPrimer({ primer, imageUrl }: Props) {
  const paragraphs = primer.trim().split(/\n\n+/);

  return (
    <div style={{
      marginBottom: "1.5rem",
      borderRadius: 12,
      overflow: "hidden",
      background: "linear-gradient(180deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02))",
      border: "1px solid rgba(212,175,55,0.25)",
    }}>
      {imageUrl && (
        <div style={{
          width: "100%",
          aspectRatio: "16 / 9",
          maxHeight: 320,
          background: `url(${imageUrl}) center/cover, #1a1410`,
          borderBottom: "1px solid rgba(212,175,55,0.18)",
        }} />
      )}
      <div style={{ padding: "1.25rem 1.375rem 1.375rem" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.625rem",
          letterSpacing: "0.28em",
          color: "var(--accent)",
          textTransform: "uppercase",
          marginBottom: "0.75rem",
        }}>
          <Lightbulb size={11} /> Concept primer
        </div>
        {paragraphs.map((p, i) => (
          <p key={i} style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9375rem",
            lineHeight: 1.65,
            color: "var(--text-secondary)",
            marginBottom: i < paragraphs.length - 1 ? "0.875rem" : 0,
          }}>
            {inlineFormat(p)}
          </p>
        ))}
      </div>
    </div>
  );
}
