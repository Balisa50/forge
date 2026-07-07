/**
 * THE PROFESSOR (mentor) LLM wrapper.
 *
 * Runs on NVIDIA's free endpoint via the shared FORGE client, using the heavy
 * reasoning model (FORGE_MENTOR_MODEL) so verdicts on real student work are
 * sharp. Was Anthropic Claude Sonnet; the paid key ran out.
 */

import { composeSystemPrompt, type VerificationResult } from "./persona";
import { openai, FORGE_MENTOR_MODEL } from "../openai";

export interface ProfessorCallOpts {
 studentFirstName: string;
 trackTitle: string;
 weekNumber: number;
 weekTitle: string;
 weekBrief?: string;
 priorWarningCount: number;
 priorInteractionSummary?: string;
 /** The user's message to The Professor for this turn. */
 userMessage: string;
 /** Optional: force JSON output (used for verification calls). */
 requireJson?: boolean;
 /** Optional: max output tokens. Default 1500. */
 maxTokens?: number;
}

export interface ProfessorCallResult {
 text: string;
 inputTokens: number;
 outputTokens: number;
 costUsd: number;
}

/**
 * Calls Claude with The Professor persona. Returns the raw text + token
 * accounting. Throws if the API key is missing or the SDK fails.
 *
 * IMPORTANT: This function MUST NOT be called when the feature flag is
 * off. Callers should check aiMentorEnabled() first.
 */
export async function callTheProfessor(opts: ProfessorCallOpts): Promise<ProfessorCallResult> {
 if (!process.env.NVIDIA_API_KEY) {
 throw new Error("NVIDIA_API_KEY is not set - cannot call The Professor");
 }

 const systemPrompt = composeSystemPrompt({
 studentFirstName: opts.studentFirstName,
 trackTitle: opts.trackTitle,
 weekNumber: opts.weekNumber,
 weekTitle: opts.weekTitle,
 weekBrief: opts.weekBrief,
 priorWarningCount: opts.priorWarningCount,
 priorInteractionSummary: opts.priorInteractionSummary,
 });

 const userContent = opts.requireJson
 ? `${opts.userMessage}\n\nReturn ONLY a JSON object matching the VerificationResult schema. No prose before or after.`
 : opts.userMessage;

 const response = await openai.chat.completions.create({
 model: FORGE_MENTOR_MODEL,
 max_tokens: opts.maxTokens ?? 1500,
 messages: [
 { role: "system", content: systemPrompt },
 { role: "user", content: userContent },
 ],
 });

 const text = response.choices[0]?.message?.content ?? "";
 const inputTokens = response.usage?.prompt_tokens ?? 0;
 const outputTokens = response.usage?.completion_tokens ?? 0;
 const costUsd = 0; // NVIDIA free endpoint

 return { text, inputTokens, outputTokens, costUsd };
}

/**
 * Verification-specific wrapper. Forces JSON output and validates the shape.
 */
export async function verifyWithTheProfessor(
 opts: Omit<ProfessorCallOpts, "requireJson"> & { masteryAnswers: string[]; evidenceSummary: string },
): Promise<{ result: VerificationResult; raw: ProfessorCallResult }> {
 const userMessage = `${opts.userMessage}

Mastery question answers:
${opts.masteryAnswers.map((a, i) => `Q${i + 1}: ${a}`).join("\n\n")}

Evidence I have access to:
${opts.evidenceSummary}`;

 const raw = await callTheProfessor({
 ...opts,
 userMessage,
 requireJson: true,
 maxTokens: 2000,
 });

 // Parse the JSON response. If it fails, log it - we'd rather know than silently 200.
 let parsed: unknown;
 try {
 // Strip any accidental code fence wrapping
 const cleaned = raw.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
 parsed = JSON.parse(cleaned);
 } catch (e) {
 throw new Error(`The Professor returned invalid JSON: ${(e as Error).message}\nRaw: ${raw.text.slice(0, 500)}`);
 }

 // Light validation - we don't want a malformed object to slip through.
 const p = parsed as Partial<VerificationResult>;
 if (!p.verdict || !["verified", "needs_work", "rejected"].includes(p.verdict)) {
 throw new Error(`The Professor returned invalid verdict: ${JSON.stringify(p.verdict)}`);
 }
 if (typeof p.feedback !== "string" || p.feedback.length < 10) {
 throw new Error(`The Professor returned invalid feedback`);
 }

 return {
 result: {
 verdict: p.verdict,
 feedback: p.feedback,
 question_checks: p.question_checks ?? [],
 praised: p.praised,
 next_step: p.next_step,
 raise_warning: p.raise_warning ?? false,
 },
 raw,
 };
}

/**
 * Generate a short reaction + defence questions from the student's actual work.
 *
 * The questions must be answerable ONLY by someone who did THIS work — each one
 * anchored to a concrete detail in the inspected evidence (a function they
 * wrote, a parameter they chose, a number they reported). This is the viva: the
 * student then answers, and verifyWithTheProfessor grades the answers strictly.
 */
export async function generateDefenceQuestions(
 opts: Omit<ProfessorCallOpts, "requireJson"> & { evidenceSummary: string; count?: number },
): Promise<{ reaction: string; questions: string[]; raw: ProfessorCallResult }> {
 const n = opts.count ?? 3;
 const userMessage = `${opts.userMessage}

The student's inspected evidence (their actual source code, README, commit history, live site):
${opts.evidenceSummary}

Return ONLY a JSON object, no prose, exactly this shape:
{"reaction": "one or two blunt sentences reacting to what you see", "questions": ["...", "...", "..."]}

Write exactly ${n} questions ENGINEERED so that an AI answering on the student's behalf cannot fake them, and only someone who genuinely lived this work can answer. Rules for the questions:
- Anchor every question to a concrete, specific detail visible in THEIR evidence: a function or line they wrote, a variable or parameter they named, a library or value they chose, a metric they reported, a commit they made.
- Prefer EXPERIENTIAL and DECISION questions over definitional ones: what broke while they built this and how they found it; what they tried first that did not work; why they chose X over Y for THEIR specific data/case; what would break if a particular function or line were removed; what they would change if they rebuilt it; an odd result and what caused it.
- BAN textbook / definitional questions ("what is X?", "explain how Y works") — an AI answers those perfectly and they prove nothing. Every question must be about THIS project, not the concept in general.
- If the evidence is thin, empty, or looks fabricated, ask questions whose only honest answer exposes that.
Return ONLY the JSON.`;

 const raw = await callTheProfessor({ ...opts, userMessage, requireJson: false, maxTokens: 900 });

 const cleaned = raw.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
 let parsed: { reaction?: unknown; questions?: unknown } = {};
 try {
 parsed = JSON.parse(cleaned);
 } catch {
 // Fall back: pull anything that looks like a question line.
 const lines = raw.text.split("\n").map((l) => l.replace(/^[\s\d.)*-]+/, "").trim()).filter((l) => l.endsWith("?"));
 parsed = { reaction: "", questions: lines };
 }

 const questions = Array.isArray(parsed.questions)
 ? parsed.questions.filter((q): q is string => typeof q === "string" && q.trim().length > 3).slice(0, n)
 : [];
 const reaction = typeof parsed.reaction === "string" ? parsed.reaction.trim() : "";
 return { reaction, questions, raw };
}
