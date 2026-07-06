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
