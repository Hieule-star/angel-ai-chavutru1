// Shared AI chat completion helper.
// Tries Google Gemini API directly (uses user's GEMINI_API_KEY → no Lovable credit cost).
// Falls back to Lovable AI Gateway automatically when Gemini key missing / errors / rate-limited.
//
// Both providers expose OpenAI-compatible /chat/completions endpoints, so the request body
// is passed through almost unchanged. We only normalize the model id.

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const LOVABLE_BASE = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type ProviderName = "gemini-direct" | "lovable";

export interface ProviderResult {
  response: Response;
  provider: ProviderName;
  modelUsed: string; // the exact model string sent to the provider
}

/**
 * Normalize model id between providers.
 * - Lovable expects "google/gemini-2.5-flash"
 * - Google direct expects "gemini-2.5-flash"
 */
function modelForGemini(model: string): string {
  return model.replace(/^google\//, "");
}
function modelForLovable(model: string): string {
  if (model.startsWith("google/") || model.startsWith("openai/")) return model;
  if (model.startsWith("gemini-")) return `google/${model}`;
  return model;
}

/**
 * Call chat completion with automatic provider routing.
 * - body: OpenAI-shaped request (messages, stream, temperature, max_completion_tokens, ...)
 * - body.model: any of "gemini-2.5-flash" | "google/gemini-2.5-flash" | "openai/..." etc.
 *
 * Routing:
 *   1. If model is gemini-family AND GEMINI_API_KEY set → try Gemini direct first
 *   2. On failure (network / 4xx except 400-validation / 5xx / 429) → fallback Lovable
 *   3. If model is NOT gemini-family (e.g. openai/*) → go straight to Lovable
 */
export async function callChatCompletion(
  body: Record<string, unknown> & { model: string; stream?: boolean },
): Promise<ProviderResult> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  const isGeminiFamily =
    body.model.startsWith("gemini-") || body.model.startsWith("google/gemini-");

  // ---- Try Gemini direct first ----
  if (isGeminiFamily && GEMINI_API_KEY) {
    const geminiModel = modelForGemini(body.model);
    try {
      const geminiBody = { ...body, model: geminiModel };
      const resp = await fetch(GEMINI_BASE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(geminiBody),
      });

      if (resp.ok) {
        console.log(`[aiProvider] ✅ gemini-direct OK model=${geminiModel}`);
        return { response: resp, provider: "gemini-direct", modelUsed: geminiModel };
      }

      // Non-OK: log and fallback
      const errText = await resp.text().catch(() => "");
      console.warn(
        `[aiProvider] ⚠️ gemini-direct failed status=${resp.status} model=${geminiModel} body=${errText.slice(0, 300)} → fallback Lovable`,
      );
      // fall through to Lovable
    } catch (err) {
      console.warn(`[aiProvider] ⚠️ gemini-direct threw: ${(err as Error).message} → fallback Lovable`);
      // fall through to Lovable
    }
  }

  // ---- Lovable Gateway (primary if no Gemini key, or fallback) ----
  if (!LOVABLE_API_KEY) {
    throw new Error("Neither GEMINI_API_KEY nor LOVABLE_API_KEY available");
  }

  const lovableModel = modelForLovable(body.model);
  const lovableBody = { ...body, model: lovableModel };
  const resp = await fetch(LOVABLE_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lovableBody),
  });

  console.log(`[aiProvider] ${resp.ok ? "✅" : "❌"} lovable status=${resp.status} model=${lovableModel}`);
  return { response: resp, provider: "lovable", modelUsed: lovableModel };
}
