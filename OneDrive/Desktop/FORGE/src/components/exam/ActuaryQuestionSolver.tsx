"use client";

/**
 * ActuaryQuestionSolver, study-mode question card for the actuarial paths.
 *
 * Unlike MasteryQuiz (timed, no help, the real gate), this is the LEARNING
 * surface: the student can reveal, on demand, the four-step breakdown the spec
 * mandates, * Decode (Step 1: English → experiment / sample space / event / given)
 * Trick (Rule 2: the fastest way to solve this TYPE)
 * Diagram (Rule 1: a Venn / tree / bell-curve SVG)
 * Solution (Step 3 compute, in order, + Step 4 sanity checks)
 * Check (pick a choice → correct/incorrect + why)
 *
 * Every panel is OPTIONAL, a button only appears when the question carries that
 * field, so a plain generated question still works. All math renders via the
 * shared KaTeX helper (renderRichText), so Rule 6 (LaTeX everywhere) holds.
 */

import { useState } from "react";
import {
 ScanSearch, Zap, Shapes, ListChecks, CheckCircle2, XCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { renderRichText } from "@/lib/math";
import type { MasteryQuestion } from "@/lib/examPaths";
import Diagram from "@/components/exam/ExamDiagrams";

type PanelKey = "decode" | "trick" | "diagram" | "solution";

const RT = (s: string, k: string) => <>{renderRichText(s, k)}</>;
const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function ActuaryQuestionSolver({ question }: { question: MasteryQuestion }) {
 const [open, setOpen] = useState<Record<PanelKey, boolean>>({ decode: false, trick: false, diagram: false, solution: false });
 const [picked, setPicked] = useState<number | null>(null);
 const [checked, setChecked] = useState(false);

 const toggle = (k: PanelKey) => setOpen((o) => ({ ...o, [k]: !o[k] }));

 const tools: { key: PanelKey; label: string; icon: typeof Zap; show: boolean }[] = [
 { key: "decode", label: "Decode", icon: ScanSearch, show: !!question.decode?.length },
 { key: "trick", label: "Trick", icon: Zap, show: !!question.trick },
 { key: "diagram", label: "Diagram", icon: Shapes, show: !!question.diagram },
 { key: "solution", label: "Solution", icon: ListChecks, show: !!(question.steps?.length || question.explain) },
 ];

 const isCorrect = checked && picked === question.correct;

 return (
 <div style={{ borderLeft: "3px solid var(--border)", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
 {/* Stem */}
 <div style={{ fontSize: "1rem", color: "var(--text-primary)", lineHeight: 1.7 }}>
 {RT(question.q, "stem")}
 </div>

 {/* Choices (Check workflow) */}
 <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
 {question.choices.map((c, i) => {
 const right = checked && i === question.correct;
 const wrongPick = checked && i === picked && i !== question.correct;
 const border = right ? "var(--green)" : wrongPick ? "var(--red)" : picked === i ? "var(--accent)" : "var(--border)";
 const bg = right ? "rgba(34,197,94,0.08)" : wrongPick ? "rgba(239,68,68,0.08)" : picked === i ? "rgba(212,175,55,0.06)" : "var(--bg-card)";
 return (
 <button
 key={i}
 type="button"
 disabled={checked}
 onClick={() => setPicked(i)}
 style={{
 display: "flex", alignItems: "flex-start", gap: "0.625rem", textAlign: "left",
 padding: "0.625rem 0.875rem", borderRadius: 8, border: `1px solid ${border}`, background: bg,
 cursor: checked ? "default" : "pointer", color: "var(--text-primary)", fontSize: "0.9375rem",
 }}
 >
 <span style={{ flexShrink: 0, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-dim)" }}>{LETTERS[i]}</span>
 <span style={{ flex: 1, minWidth: 0 }}>{RT(c, `c${i}`)}</span>
 {right && <CheckCircle2 size={16} style={{ color: "var(--green)", flexShrink: 0 }} />}
 {wrongPick && <XCircle size={16} style={{ color: "var(--red)", flexShrink: 0 }} />}
 </button>
 );
 })}
 </div>

 {/* Tool buttons */}
 <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
 {tools.filter((t) => t.show).map((t) => {
 const Icon = t.icon;
 const active = open[t.key];
 return (
 <button
 key={t.key}
 type="button"
 onClick={() => toggle(t.key)}
 style={{
 display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.375rem 0.75rem",
 borderRadius: 7, border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
 background: active ? "rgba(212,175,55,0.1)" : "transparent",
 color: active ? "var(--accent)" : "var(--text-secondary)", cursor: "pointer",
 fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.04em",
 }}
 >
 <Icon size={13} /> {t.label} {active ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
 </button>
 );
 })}
 <button
 type="button"
 onClick={() => setChecked(true)}
 disabled={picked === null || checked}
 className="forge-btn forge-btn-primary"
 style={{ marginLeft: "auto", padding: "0.375rem 1rem", fontSize: "0.8125rem", opacity: picked === null || checked ? 0.5 : 1 }}
 >
 Check
 </button>
 </div>

 {/* Check result */}
 {checked && (
 <div style={{ padding: "0.75rem 1rem", borderRadius: 8, background: isCorrect ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)", border: `1px solid ${isCorrect ? "var(--green)" : "var(--red)"}` }}>
 <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: isCorrect ? "var(--green)" : "var(--red)", marginBottom: "0.375rem" }}>
 {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
 {isCorrect ? "Correct" : `Not quite, the answer is ${LETTERS[question.correct]}`}
 </div>
 <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{RT(question.explain, "explain")}</div>
 </div>
 )}

 {/* Panels */}
 {open.decode && question.decode && (
 <Panel title="Step 1, Decode the English" icon={ScanSearch}>
 <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
 <tbody>
 {question.decode.map((row, i) => (
 <tr key={i}>
 <td style={{ padding: "0.375rem 0.625rem 0.375rem 0", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", whiteSpace: "nowrap", verticalAlign: "top", borderBottom: "1px solid var(--border)" }}>{row.label}</td>
 <td style={{ padding: "0.375rem 0", color: "var(--text-primary)", borderBottom: "1px solid var(--border)" }}>{RT(row.value, `d${i}`)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </Panel>
 )}

 {open.trick && question.trick && (
 <Panel title="The trick" icon={Zap} accent="#60a5fa">
 <div style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{RT(question.trick, "trick")}</div>
 </Panel>
 )}

 {open.diagram && question.diagram && (
 <Panel title="Diagram" icon={Shapes}>
 <Diagram kind={question.diagram.kind} labels={question.diagram.labels} />
 {question.diagram.caption && (
 <div style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--text-dim)", marginTop: "0.375rem" }}>{RT(question.diagram.caption, "cap")}</div>
 )}
 </Panel>
 )}

 {open.solution && (
 <Panel title="Step-by-step solution" icon={ListChecks} accent="#22c55e">
 {question.formula && (
 <div style={{ marginBottom: "0.625rem" }}>
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.25rem" }}>Formula</div>
 <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>{RT(question.formula, "formula")}</div>
 </div>
 )}
 {question.steps?.length ? (
 <ol style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
 {question.steps.map((s, i) => (
 <li key={i} style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{RT(s, `s${i}`)}</li>
 ))}
 </ol>
 ) : (
 <div style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{RT(question.explain, "sol")}</div>
 )}
 {question.sanity?.length ? (
 <div style={{ marginTop: "0.75rem" }}>
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "0.375rem" }}>Step 4, Sanity check</div>
 <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
 {question.sanity.map((s, i) => (
 <li key={i} style={{ display: "flex", gap: "0.4rem", alignItems: "flex-start", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
 <CheckCircle2 size={13} style={{ color: "var(--green)", flexShrink: 0, marginTop: 3 }} />
 <span>{RT(s, `sn${i}`)}</span>
 </li>
 ))}
 </ul>
 </div>
 ) : null}
 </Panel>
 )}
 </div>
 );
}

function Panel({ title, icon: Icon, accent = "var(--accent)", children }: { title: string; icon: typeof Zap; accent?: string; children: React.ReactNode }) {
 // Flat reveal: a colored left rule keys the panel to its purpose, content
 // sits directly on the page (no box).
 return (
 <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: "1rem" }}>
 <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: "0.625rem", fontWeight: 700 }}>
 <Icon size={12} /> {title}
 </div>
 {children}
 </div>
 );
}
