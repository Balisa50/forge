/**
 * THE FORGE — AI Interrogation Engine
 *
 * Open-ended grading: the Professor generates a typed question with a
 * hidden rubric, the student writes a free-form answer, a second model
 * grades it against the rubric. 10 questions, 10 points each, 70 to pass.
 */

export const TOTAL_QUESTIONS = 10;
export const MAX_POINTS_PER_QUESTION = 10;
export const PASS_THRESHOLD = 70; // out of TOTAL_QUESTIONS * MAX_POINTS_PER_QUESTION

export type QuestionType =
  | "APPLICATION"
  | "DEBUGGING"
  | "CONCEPTUAL_DEPTH"
  | "EVIDENCE_CROSS_CHECK"
  | "EDGE_CASE"
  | "TRADE_OFF"
  | "DEEPER_APPLICATION"
  | "HISTORY_RECALL"
  | "HISTORY_CONNECTION"
  | "SYNTHESIS";

export interface QuestionRubric {
  idealAnswer: string;
  mustMention: string[];
  pitfalls: string[];
  scoring: Record<string, string>;
}

export interface GeneratedQuestion {
  questionNumber: number;
  type: QuestionType;
  question: string;
  topic: string;
  rubric: QuestionRubric;
}

export interface GradedAnswer {
  score: number;
  feedback: string;
  hitKeypoints: string[];
  missedKeypoints: string[];
}

// Backward compatibility — some older code paths may import this name
export type MCQQuestion = GeneratedQuestion;

export const PROFESSOR_SYSTEM_PROMPT = (
  studentName: string,
  taskTitle: string,
  taskDetail: string,
  description: string,
  evidenceContext: string,
  previousTopics: string[],
) => `You are THE PROFESSOR — a relentless AI examiner for THE FORGE accountability platform.

STUDENT: ${studentName}
TODAY'S TASK: ${taskTitle}
TASK REQUIREMENTS: ${taskDetail}
STUDENT'S CLAIMED WORK: ${description}
EVIDENCE CONTEXT: ${evidenceContext}

YOUR PERSONA:
- Tough, direct, zero-nonsense. Respect excellent work, roast lazy work.
- Address the student by name: ${studentName}.
- Reference specific details from their evidence and code.
- Never teach — only interrogate. Push back on vague work.

STRICT SCOPE RULE — CRITICAL:
You MUST ONLY ask questions about what ${studentName} claimed they did in their submission.
NEVER ask about topics, techniques, or tools they did NOT mention.
If they said they built a login form, ask about that. NOT about databases they never mentioned.

PREVIOUSLY ASKED TOPICS (avoid repeating):
${previousTopics.length > 0 ? previousTopics.join(", ") : "None yet"}

QUESTION FORMAT — RETURN EXACTLY ONE QUESTION AS VALID JSON:
{
  "questionNumber": <number 1-${TOTAL_QUESTIONS}>,
  "type": "<APPLICATION|DEBUGGING|CONCEPTUAL_DEPTH|EVIDENCE_CROSS_CHECK|EDGE_CASE|TRADE_OFF|DEEPER_APPLICATION|HISTORY_RECALL|HISTORY_CONNECTION|SYNTHESIS>",
  "question": "<the question text — can include markdown code blocks>",
  "topic": "<short topic tag for anti-repetition tracking>",
  "rubric": {
    "idealAnswer": "<2-4 sentence model answer demonstrating mastery>",
    "mustMention": ["<key concept 1>", "<key concept 2>", "<key concept 3>"],
    "pitfalls": ["<common wrong answer 1>", "<common wrong answer 2>"],
    "scoring": {
      "10": "Mentions all must-haves with depth and accuracy",
      "7": "Mentions most must-haves with reasonable depth",
      "4": "Mentions some must-haves but shallow or with errors",
      "0": "Misses must-haves or factually wrong"
    }
  }
}

QUESTION SEQUENCE (follow this order):
Q1: APPLICATION — realistic scenario using their actual work
Q2: DEBUGGING — "if you change X to Y, what breaks and why?"
Q3: CONCEPTUAL_DEPTH — the WHY question
Q4: EVIDENCE_CROSS_CHECK — based on something in evidence they didn't mention
Q5: EDGE_CASE — beyond the happy path
Q6: TRADE_OFF — "why X over Y? consequences?"
Q7: DEEPER_APPLICATION — different aspect than Q1
Q8: HISTORY_RECALL — references past session (if none: ask about a concept they should know)
Q9: HISTORY_CONNECTION — connects past to today
Q10: SYNTHESIS — hardest, connects multiple concepts

CODE QUESTIONS: At least 3 of ${TOTAL_QUESTIONS} questions must include a code snippet in markdown fence blocks.
Use the student's actual code if available from evidence. Otherwise write realistic code based on their work.

PASS THRESHOLD: ${PASS_THRESHOLD}/${TOTAL_QUESTIONS * MAX_POINTS_PER_QUESTION} total points.`;

export const GRADE_PROMPT = (
  studentName: string,
  question: string,
  rubric: QuestionRubric,
  answerText: string,
) => `You are THE PROFESSOR grading ${studentName}'s answer against a hidden rubric.

QUESTION:
${question}

RUBRIC:
- Ideal answer: ${rubric.idealAnswer}
- Must mention: ${rubric.mustMention.join(", ")}
- Common pitfalls to penalise: ${rubric.pitfalls.join(", ")}
- Scoring tiers:
${Object.entries(rubric.scoring).map(([pts, desc]) => `  ${pts}/10 → ${desc}`).join("\n")}

${studentName.toUpperCase()}'S ANSWER:
"""
${answerText || "(no answer provided)"}
"""

Grade strictly and fairly. An empty or "I don't know" answer is 0. Hand-waving is 1-3. Partial understanding is 4-6. Solid is 7-9. Mastery is 10.

Return ONLY this JSON, no commentary:
{
  "score": <0-${MAX_POINTS_PER_QUESTION}>,
  "feedback": "<1-2 sentences, direct, address ${studentName} by name>",
  "hitKeypoints": ["<must-mention items the student covered>"],
  "missedKeypoints": ["<must-mention items the student missed>"]
}`;

export const VERDICT_PROMPT = (
  studentName: string,
  answers: Array<{ question: string; score: number; topic: string; missed: string[] }>,
  totalScore: number,
  passed: boolean,
) => `You are THE PROFESSOR. ${studentName} has completed the interrogation.

RESULTS (total ${totalScore}/${TOTAL_QUESTIONS * MAX_POINTS_PER_QUESTION}, ${passed ? "PASSED" : "FAILED"} — need ${PASS_THRESHOLD} to pass):
${answers.map((a, i) => `Q${i + 1} (${a.topic}): ${a.score}/${MAX_POINTS_PER_QUESTION}${a.missed.length ? ` — missed: ${a.missed.join(", ")}` : ""}`).join("\n")}

Write a 2-3 sentence verdict for ${studentName}. Be direct, specific, and reference their actual scores.
If passed: acknowledge what they proved, name a weak spot from the lowest-scoring questions. Be tough but fair.
If failed: be blunt about what they couldn't demonstrate. No sympathy, but professional.

Return ONLY the verdict text. No JSON.`;

export interface InterrogationState {
  interrogationId: string;
  currentQuestion: number;
  questions: GeneratedQuestion[];
  answers: Array<{
    questionNumber: number;
    answerText: string;
    score: number;
    topic: string;
  }>;
  totalScore: number;
  passed: boolean;
  completed: boolean;
  verdict: string;
}

// Tokenized syntax highlighter — prevents regex corruption of HTML
export function highlightCode(code: string, language = "javascript"): string {
  void language;
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const tokens: Record<string, string> = {};
  let tokenIndex = 0;
  let result = escaped;

  const addToken = (html: string): string => {
    const key = `__TOKEN_${tokenIndex++}__`;
    tokens[key] = html;
    return key;
  };

  // Strings
  result = result.replace(/(&#34;[^&#34;]*&#34;|'[^']*'|`[^`]*`)/g, (m) =>
    addToken(`<span style="color:#a6e3a1">${m}</span>`)
  );

  // Comments
  result = result.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, (m) =>
    addToken(`<span style="color:#6c7086;font-style:italic">${m}</span>`)
  );

  // Keywords
  const keywords =
    /\b(const|let|var|function|return|if|else|for|while|class|import|export|default|from|async|await|try|catch|throw|new|typeof|instanceof|null|undefined|true|false|void|this|super|extends|implements|interface|type|enum|in|of|do|switch|case|break|continue|yield|static|public|private|protected|readonly|abstract)\b/g;
  result = result.replace(keywords, (m) =>
    addToken(`<span style="color:#cba6f7;font-weight:bold">${m}</span>`)
  );

  // Numbers
  result = result.replace(/\b(\d+\.?\d*)\b/g, (m) =>
    addToken(`<span style="color:#fab387">${m}</span>`)
  );

  // Functions
  result = result.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, (_, name) =>
    addToken(`<span style="color:#89b4fa">${name}</span>`)
  );

  // Operators
  result = result.replace(/(===|!==|=>|&&|\|\||[+\-*/%=<>!&|^~?:])/g, (m) =>
    addToken(`<span style="color:#89dceb">${m}</span>`)
  );

  // Replace all tokens with their HTML
  Object.entries(tokens).forEach(([key, html]) => {
    result = result.replace(key, html);
  });

  return result;
}
