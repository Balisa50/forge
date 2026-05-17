/**
 * Parse the markdown blob stored in `Task.detail` (produced by
 * `weekToTaskDetail` when seeding from a curated roadmap) back into
 * structured sections so the dashboard can render it without showing a
 * wall of text.
 *
 * The blob looks like:
 *   <context paragraph>
 *
 *   **Topics to study:**
 *   - foo
 *   - bar
 *
 *   **Tasks & deliverables:**
 *   1. do x
 *   2. do y
 *
 *   **Real-world project:**
 *   <paragraph>
 *
 *   **Think like an expert — questions on your data:**
 *   Q1: ...
 *
 *   **Practical exercises:**
 *   1. ...
 */

export interface ParsedTaskDetail {
  context: string;
  topics: string[];
  tasks: string[];
  project: string;
  questions: string[];
  exercises: string[];
}

const HEADINGS: { key: keyof Omit<ParsedTaskDetail, "context">; matchers: RegExp[] }[] = [
  { key: "topics",    matchers: [/^\*?\*?topics? to study\*?\*?:?\s*$/i, /^\*?\*?topics?\*?\*?:?\s*$/i] },
  { key: "tasks",     matchers: [/^\*?\*?tasks? (?:&|and) deliverables?\*?\*?:?\s*$/i, /^\*?\*?deliverables?\*?\*?:?\s*$/i] },
  { key: "project",   matchers: [/^\*?\*?real[- ]world project\*?\*?:?\s*$/i, /^\*?\*?project\*?\*?:?\s*$/i] },
  { key: "questions", matchers: [/^\*?\*?think like an?.+\*?\*?:?\s*$/i, /^\*?\*?questions on your data\*?\*?:?\s*$/i] },
  { key: "exercises", matchers: [/^\*?\*?practical exercises?\*?\*?:?\s*$/i, /^\*?\*?exercises?\*?\*?:?\s*$/i] },
];

function whichHeading(line: string): keyof Omit<ParsedTaskDetail, "context"> | null {
  for (const h of HEADINGS) {
    if (h.matchers.some((m) => m.test(line.trim()))) return h.key;
  }
  return null;
}

function stripListMarker(line: string): string {
  return line.replace(/^\s*(?:[-*•]|\d+\.|Q\d+:?)\s*/i, "").trim();
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
      // Don't break sections on blank lines — they're separators in markdown
      continue;
    }

    if (current === null) {
      contextLines.push(line.trim());
    } else if (current === "project") {
      projectLines.push(line.trim());
    } else {
      const stripped = stripListMarker(line);
      if (stripped) out[current].push(stripped);
    }
  }

  out.context = contextLines.join(" ").trim();
  out.project = projectLines.join(" ").trim();
  return out;
}
