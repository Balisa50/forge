import OpenAI from "openai";

/**
 * THE FORGE — AI Client
 *
 * Uses OpenRouter with automatic fallback models.
 * Primary: Qwen 3 (235B) — best for deep technical questions
 * Fallbacks: DeepSeek V3, Llama 4 Maverick — reliable alternatives
 */

const globalForAI = globalThis as unknown as { openai: OpenAI };

// Model priority list — tries each in order if previous fails
// Current as of April 2026 — uses fast non-thinking models for reliability
export const FORGE_MODELS = [
  process.env.FORGE_AI_MODEL || "qwen/qwen3-max",
  "deepseek/deepseek-v3.2",
  "mistralai/mistral-large-2512",
  "openai/gpt-oss-120b:free",
];

export const FORGE_MODEL = FORGE_MODELS[0];

export const openai =
  globalForAI.openai ??
  new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "THE FORGE",
    },
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

      if (i === FORGE_MODELS.length - 1) throw err; // Last model — rethrow
    }
  }

  throw new Error("All AI models failed");
}
