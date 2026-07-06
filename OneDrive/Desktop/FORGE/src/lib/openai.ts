import OpenAI from "openai";

/**
 * THE FORGE, AI Client
 *
 * Runs on NVIDIA's free OpenAI-compatible endpoint (was OpenRouter). One key,
 * NVIDIA_API_KEY, all free models. The general chain drives the exam engine and
 * everyday generation; THE PROFESSOR (mentor) runs on a heavier reasoning model.
 */

const globalForAI = globalThis as unknown as { openai: OpenAI };

// General-purpose model chain, tried in order on failure. All free on NVIDIA.
export const FORGE_MODELS = [
 process.env.FORGE_AI_MODEL || "mistralai/mistral-medium-3.5-128b",
 "deepseek-ai/deepseek-v4-flash",
 "z-ai/glm-5.2",
];

export const FORGE_MODEL = FORGE_MODELS[0];

// THE PROFESSOR judges real student work and must reason hard, so the mentor
// runs on a heavier model than the general chain. Overridable via env.
export const FORGE_MENTOR_MODEL =
 process.env.FORGE_MENTOR_MODEL || "deepseek-ai/deepseek-v4-pro";

export const openai =
 globalForAI.openai ??
 new OpenAI({
 apiKey: process.env.NVIDIA_API_KEY,
 baseURL: "https://integrate.api.nvidia.com/v1",
 });

if (process.env.NODE_ENV !== "production") {
 globalForAI.openai = openai;
}

/**
 * Try generating a completion with automatic model fallback.
 * If the primary model fails/times out, tries the next one.
 */
export async function createWithFallback(
 params: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, "model">,
 opts?: { timeoutMs?: number },
): Promise<{ completion: OpenAI.Chat.Completions.ChatCompletion; model: string }> {
 const timeoutMs = opts?.timeoutMs ?? 45000;

 for (let i = 0; i < FORGE_MODELS.length; i++) {
 const model = FORGE_MODELS[i];
 try {
 const controller = new AbortController();
 const timeout = setTimeout(() => controller.abort(), timeoutMs);

 const completion = await openai.chat.completions.create(
 { ...params, model },
 { signal: controller.signal },
 );
 clearTimeout(timeout);

 // Check if we got actual content back
 const content = completion.choices[0]?.message?.content;
 if (!content || content.trim().length < 5) {
 console.warn(`Model ${model} returned empty/short response, trying next...`);
 continue;
 }

 return { completion, model };
 } catch (err) {
 const isAbort = err instanceof Error && err.name === "AbortError";
 const isRateLimit = err instanceof Error && err.message?.includes("429");
 const isUnavailable = err instanceof Error && (err.message?.includes("503") || err.message?.includes("unavailable") || err.message?.includes("502"));

 console.warn(
 `Model ${model} failed (attempt ${i + 1}/${FORGE_MODELS.length}):`,
 isAbort ? "timeout" : isRateLimit ? "rate limited" : isUnavailable ? "unavailable" : (err instanceof Error ? err.message : err),
 );

 if (i === FORGE_MODELS.length - 1) throw err; // Last model, rethrow
 }
 }

 throw new Error("All AI models failed");
}
