/**
 * ConceptSections — server-rendered teaching blocks for one concept.
 *
 * Each ConceptSection kind gets a distinct visual treatment so the page reads
 * as a deliberate teaching arc, not a wall of text:
 *   hook      → the stakes, big and gold
 *   intuition → plain-language mental model (no formula yet)
 *   formula   → the method/identity, math foregrounded
 *   worked    → numbered solution steps + a boxed answer
 *   trick     → a speed shortcut, framed as an edge
 *   trap      → a pre-inoculated mistake, framed as a warning
 *   widget    → an interactive sim (client iframe via ConceptWidget)
 *   recall    → active-recall flashcards (client)
 *
 * Prose renders server-side through the shared KaTeX helper; only widget and
 * recall reach for client components.
 */

import { Flame, Lightbulb, Sigma, ListChecks, Zap, AlertTriangle } from "lucide-react";
import { renderRichText } from "@/lib/math";
import ConceptWidget from "@/components/ConceptWidget";
import RecallCards from "@/components/exam/RecallCards";
import type { ConceptSection } from "@/lib/examPaths";

function Label({ icon, text, color }: { icon: React.ReactNode; text: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color }}
    >
      {icon} {text}
    </span>
  );
}

export default function ConceptSections({ sections }: { sections: ConceptSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((s, i) => (
        <Section key={i} s={s} i={i} />
      ))}
    </div>
  );
}

function Section({ s, i }: { s: ConceptSection; i: number }) {
  const body = s.body ? <div style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text-secondary)" }}>{renderRichText(s.body, `s${i}`)}</div> : null;

  switch (s.kind) {
    case "hook":
      return (
        <div className="rounded-2xl border p-6" style={{ borderColor: "rgba(212,175,55,0.3)", background: "linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.02))" }}>
          <Label icon={<Flame size={12} />} text={s.title ?? "Why this matters"} color="var(--accent)" />
          <div className="mt-2" style={{ fontSize: "1.1875rem", lineHeight: 1.55, color: "var(--text-primary)", fontWeight: 500 }}>
            {s.body && renderRichText(s.body, `s${i}`)}
          </div>
        </div>
      );

    case "intuition":
      return (
        <div>
          <Label icon={<Lightbulb size={12} />} text={s.title ?? "The intuition"} color="#60a5fa" />
          <div className="mt-2">{body}</div>
        </div>
      );

    case "formula":
      return (
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-panel)] p-5">
          <Label icon={<Sigma size={12} />} text={s.title ?? "The formula"} color="var(--accent)" />
          <div className="mt-2">{body}</div>
        </div>
      );

    case "worked":
      return (
        <div className="rounded-xl border border-[color:var(--border)] p-5" style={{ background: "var(--bg-panel)" }}>
          <Label icon={<ListChecks size={12} />} text={s.title ?? "Worked example"} color="#a78bfa" />
          {s.body && <div className="mt-2 mb-3">{body}</div>}
          {s.steps && (
            <ol className="mt-3 space-y-2.5">
              {s.steps.map((step, si) => (
                <li key={si} className="flex gap-3">
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 700, background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}
                  >
                    {si + 1}
                  </span>
                  <div style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--text-secondary)", paddingTop: 1 }}>
                    {renderRichText(step, `s${i}step${si}`)}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {s.answer && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.35)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#34d399" }}>Answer</span>
              <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{renderRichText(s.answer, `s${i}ans`)}</span>
            </div>
          )}
        </div>
      );

    case "trick":
      return (
        <div className="rounded-xl border p-5" style={{ borderColor: "rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.05)" }}>
          <Label icon={<Zap size={12} />} text={s.title ?? "Speed trick"} color="#34d399" />
          <div className="mt-2">{body}</div>
        </div>
      );

    case "trap":
      return (
        <div className="rounded-xl border p-5" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
          <Label icon={<AlertTriangle size={12} />} text={s.title ?? "Common trap"} color="#f87171" />
          <div className="mt-2">{body}</div>
        </div>
      );

    case "widget":
      if (!s.widget) return null;
      return (
        <div>
          {s.title && <Label icon={<Zap size={12} />} text={s.title} color="var(--accent)" />}
          <div className={s.title ? "mt-2" : ""}>
            <ConceptWidget id={s.widget.id} params={s.widget.params} caption={s.widget.caption} />
          </div>
        </div>
      );

    case "recall":
      if (!s.cards) return null;
      return (
        <div>
          <Label icon={<Lightbulb size={12} />} text={s.title ?? "Active recall"} color="var(--accent)" />
          <div className="mt-3">
            <RecallCards cards={s.cards} />
          </div>
        </div>
      );

    default:
      return body;
  }
}
