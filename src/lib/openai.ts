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
// leads with a heavier model than the general chain. But a viva/grade/release
// must NEVER hard-fail on one flaky call, so it falls back down a chain of
// progressively lighter free models. Overridable via env.
export const FORGE_MENTOR_MODELS = [
 process.env.FORGE_MENTOR_MODEL || "deepseek-ai/deepseek-v4-pro",
 "deepseek-ai/deepseek-v4-flash",
 "mistralai/mistral-medium-3.5-128b",
 "z-ai/glm-5.2",
];

export const FORGE_MENTOR_MODEL = FORGE_MENTOR_MODELS[0];

export const openai =
 globalForAI.openai ??
 new OpenAI({
 // Placeholder when unset so the SDK constructor never throws at build/
 // module-load time (Next evaluates this during "collect page data").
 // Real calls 401 only if NVIDIA_API_KEY is genuinely missing at runtime.
 apiKey: process.env.NVIDIA_API_KEY || "nvapi-not-set",
 baseURL: "https://integrate.api.nvidia.com/v1",
 });

if (process.env.NODE_ENV !== "production") {
 globalForAI.openai = openai;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A failure worth retrying the SAME model for (transient, not a bad request). */
function isTransient(err: unknown): boolean {
 if (!(err instanceof Error)) return false;
 if (err.name === "AbortError") return true; // our timeout
 const m = err.message || "";
 return (
 m.includes("429") || // rate limited
 m.includes("500") ||
 m.includes("502") ||
 m.includes("503") || // unavailable
 m.includes("504") ||
 m.includes("ECONNRESET") ||
 m.includes("ETIMEDOUT") ||
 m.toLowerCase().includes("timeout") ||
 m.toLowerCase().includes("unavailable") ||
 m.toLowerCase().includes("overloaded")
 );
}

/**
 * Core resilience loop: walk a model chain, and for each model retry a few
 * times on transient errors with a short backoff, before falling to the next
 * model. Only throws once every model in the chain is exhausted.
 */
async function runChat(
 models: string[],
 params: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, "model">,
 opts?: { timeoutMs?: number; retriesPerModel?: number },
): Promise<{ completion: OpenAI.Chat.Completions.ChatCompletion; model: string }> {
 const timeoutMs = opts?.timeoutMs ?? 45000;
 const retriesPerModel = opts?.retriesPerModel ?? 1;
 let lastErr: unknown;

 for (let i = 0; i < models.length; i++) {
 const model = models[i];
 for (let attempt = 0; attempt <= retriesPerModel; attempt++) {
 try {
 const controller = new AbortController();
 const timeout = setTimeout(() => controller.abort(), timeoutMs);
 const completion = await openai.chat.completions.create(
 { ...params, model },
 { signal: controller.signal },
 );
 clearTimeout(timeout);

 const content = completion.choices[0]?.message?.content;
 if (!content || content.trim().length < 5) {
 lastErr = new Error(`Model ${model} returned empty/short response`);
 console.warn(`Model ${model} returned empty/short response, trying next...`);
 break; // treat as this-model failure → next model
 }
 return { completion, model };
 } catch (err) {
 lastErr = err;
 const transient = isTransient(err);
 console.warn(
 `Model ${model} failed (model ${i + 1}/${models.length}, attempt ${attempt + 1}/${retriesPerModel + 1}):`,
 err instanceof Error ? err.message : err,
 );
 if (transient && attempt < retriesPerModel) {
 await sleep(400 * (attempt + 1)); // 400ms, 800ms backoff
 continue; // retry same model
 }
 break; // non-transient, or retries exhausted → next model
 }
 }
 }

 throw lastErr instanceof Error ? lastErr : new Error("All AI models failed");
}

/**
 * Try generating a completion with automatic model fallback (general chain).
 * If the primary model fails/times out, retries then tries the next one.
 */
export async function createWithFallback(
 params: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, "model">,
 opts?: { timeoutMs?: number },
): Promise<{ completion: OpenAI.Chat.Completions.ChatCompletion; model: string }> {
 return runChat(FORGE_MODELS, params, opts);
}

/**
 * Same resilience, but down THE PROFESSOR's heavier model chain. This is what
 * every mentor call (viva questions, grading, releases, proactive outreach)
 * runs on so it "always delivers": a flaky heavy model degrades to a lighter
 * one rather than failing the student.
 */
export async function createWithMentorFallback(
 params: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, "model">,
 opts?: { timeoutMs?: number; retriesPerModel?: number },
): Promise<{ completion: OpenAI.Chat.Completions.ChatCompletion; model: string }> {
 return runChat(FORGE_MENTOR_MODELS, params, { timeoutMs: 60000, retriesPerModel: 1, ...opts });
}
