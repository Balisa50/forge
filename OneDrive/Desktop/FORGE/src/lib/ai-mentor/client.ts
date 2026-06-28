/**
 * Anthropic Claude wrapper for THE PROFESSOR.
 *
 * Lazy: we DO NOT import the @anthropic-ai/sdk at module load time. The
 * SDK is only required when an actual call is made AND the API key is
 * present AND the feature flag is on. This keeps build + cold-start
 * costs at zero while the feature is dormant.
 */

import { composeSystemPrompt, type VerificationResult } from "./persona";

// Pricing per million tokens (Sonnet 4.5 standard rates - update when Anthropic adjusts)
// Used purely to estimate cost-per-interaction for the audit log.
const SONNET_INPUT_COST_PER_M_TOKENS = 3.0;
const SONNET_OUTPUT_COST_PER_M_TOKENS = 15.0;

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
 const apiKey = process.env.ANTHROPIC_API_KEY;
 if (!apiKey) {
 throw new Error("ANTHROPIC_API_KEY is not set - cannot call The Professor");
 }

 // Dynamic import keeps the SDK out of the build until first actual use.
 const { default: Anthropic } = await import("@anthropic-ai/sdk");
 const client = new Anthropic({ apiKey });

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

 const response = await client.messages.create({
 model: "claude-sonnet-4-5",
 max_tokens: opts.maxTokens ?? 1500,
 system: systemPrompt,
 messages: [{ role: "user", content: userContent }],
 });

 // Extract text from the response content blocks
 let text = "";
 for (const block of response.content) {
 if (block.type === "text") text += block.text;
 }

 const inputTokens = response.usage.input_tokens;
 const outputTokens = response.usage.output_tokens;
 const costUsd =
 (inputTokens * SONNET_INPUT_COST_PER_M_TOKENS) / 1_000_000 +
 (outputTokens * SONNET_OUTPUT_COST_PER_M_TOKENS) / 1_000_000;

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
