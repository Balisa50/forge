/**
 * Parse the markdown blob stored in `Task.detail` (produced by
 * `weekToTaskDetail` when seeding from a curated roadmap) back into
 * structured sections so the dashboard can render it without showing a
 * wall of text.
 *
 * The blob looks like:
 * <context paragraph>
 *
 * **Topics to study:**
 * - foo
 * - bar
 *
 * **Tasks & deliverables:**
 * 1. do x
 * 2. do y
 *
 * **Real-world project:**
 * <paragraph>
 *
 * **Think like an expert, questions on your data:**
 * Q1: ...
 *
 * **Practical exercises:**
 * 1. ...
 */

export interface ParsedTaskDetail {
 context: string;
 topics: string[];
 tasks: string[];
 project: string;
 questions: string[];
 exercises: string[];
}

/** Recognised section headings, matched against the line AFTER its `**`
 * markers and trailing colon have been stripped. */
const HEADINGS: { key: keyof Omit<ParsedTaskDetail, "context">; matchers: RegExp[] }[] = [
 { key: "topics", matchers: [/^topics? to study$/i, /^what you'?ll learn( this week)?$/i, /^topics?$/i] },
 { key: "tasks", matchers: [/^tasks? (?:&|and) deliverables?$/i, /^what to do$/i, /^deliverables?$/i] },
 { key: "project", matchers: [/^real[- ]world project$/i, /^build this.*$/i, /^project$/i] },
 { key: "questions", matchers: [/^think like an?.+$/i, /^questions on your data$/i, /^think for yourself$/i, /^questions to ask yourself$/i] },
 { key: "exercises", matchers: [/^practical exercises?$/i, /^practice exercises?$/i, /^practice.*try these$/i, /^exercises?$/i] },
];

/** Strip leading/trailing **, then trailing colon, then whitespace. */
function cleanHeadingCandidate(line: string): string {
 return line
 .trim()
 .replace(/^\*+/, "")
 .replace(/\*+$/, "")
 .replace(/:$/, "")
 .trim();
}

function whichHeading(line: string): keyof Omit<ParsedTaskDetail, "context"> | null {
 const clean = cleanHeadingCandidate(line);
 if (!clean) return null;
 for (const h of HEADINGS) {
 if (h.matchers.some((m) => m.test(clean))) return h.key;
 }
 return null;
}

function stripListMarker(line: string): string {
 return line.replace(/^\s*(?:[-*•]|\d+\.|Q\d+:?)\s*/i, "").trim();
}

/** Strip the markdown formatting markers (** and ___) and normalise dashes
 * so the rendered content reads like prose, not like an LLM output. */
function humanise(text: string): string {
 if (!text) return "";
 return text
 .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold** → bold
 .replace(/__([^_]+)__/g, "$1") // __bold__ → bold
 .replace(/\*([^*]+)\*/g, "$1") // *italic* → italic
 .replace(/, /g, ", ") // tighten em-dashes
 .replace(/\s{2,}/g, " ")
 .trim();
}

/** The inverse of parseTaskDetail: rebuild the markdown blob from structured
 * sections so a mentor's per-section edits persist back into Task.detail and
 * re-parse cleanly. Empty sections are omitted. Canonical headings are used so
 * the next parseTaskDetail() round-trips. */
export function serializeTaskDetail(p: ParsedTaskDetail): string {
 const parts: string[] = [];
 const ctx = (p.context || "").trim();
 if (ctx) parts.push(ctx);
 if (p.topics.length) {
 parts.push("**Topics to study:**\n" + p.topics.map((t) => `- ${t.trim()}`).join("\n"));
 }
 if (p.tasks.length) {
 parts.push("**Tasks & deliverables:**\n" + p.tasks.map((t, i) => `${i + 1}. ${t.trim()}`).join("\n"));
 }
 const proj = (p.project || "").trim();
 if (proj) parts.push("**Real-world project:**\n" + proj);
 if (p.questions.length) {
 parts.push("**Think like an expert, questions on your data:**\n" + p.questions.map((q, i) => `${i + 1}. ${q.trim()}`).join("\n"));
 }
 if (p.exercises.length) {
 parts.push("**Practical exercises:**\n" + p.exercises.map((e, i) => `${i + 1}. ${e.trim()}`).join("\n"));
 }
 return parts.join("\n\n");
}

export function parseTaskDetail(detail: string): ParsedTaskDetail {
 if (!detail) {
 return { context: "", topics: [], tasks: [], project: "", questions: [], exercises: [] };
 }

 const lines = detail.split(/\r?\n/);
 const out: ParsedTaskDetail = {
 context: "",
 topics: [],
 tasks: [],
 project: "",
 questions: [],
 exercises: [],
 };

 let current: keyof Omit<ParsedTaskDetail, "context"> | null = null;
 const contextLines: string[] = [];
 const projectLines: string[] = [];

 for (const raw of lines) {
 const line = raw.replace(/\s+$/, "");
 const heading = whichHeading(line);

 if (heading) {
 current = heading;
 continue;
 }

 if (line.trim() === "") {
 // Don't break sections on blank lines, they're separators in markdown
 continue;
 }

 if (current === null) {
 contextLines.push(line.trim());
 } else if (current === "project") {
 projectLines.push(line.trim());
 } else {
 const stripped = stripListMarker(line);
 if (stripped) out[current].push(humanise(stripped));
 }
 }

 out.context = humanise(contextLines.join(" "));
 out.project = humanise(projectLines.join(" "));
 return out;
}
