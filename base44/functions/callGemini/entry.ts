import { geminiChat, geminiDecide } from '../../shared/gemini.ts';
import { GIULIA_TONE } from '../../shared/agentContext.ts';

/**
 * callGemini — core Gemini wrapper for any AI call. BYOK (GEMINI_API_KEY),
 * no Base44 integration credits.
 *
 * Accepts: { prompt, context, responseSchema, temperature }
 * - If responseSchema is provided → structured JSON decision (geminiDecide).
 * - Otherwise → free-form text reply (geminiChat).
 * Giulia's tone is injected as system_instruction.
 */
export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body.prompt || "";
    if (!prompt) return Response.json({ ok: false, error: "No prompt provided" }, { status: 400 });

    const context = body.context;
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.6;
    const schema = body.responseSchema || body.schema || null;
    const systemText = body.systemText || GIULIA_TONE;

    const fullPrompt = context
      ? `${prompt}\n\nContext:\n${typeof context === "string" ? context : JSON.stringify(context)}`
      : prompt;

    if (schema) {
      const out = await geminiDecide({ prompt: fullPrompt, schema, temperature, systemText });
      return Response.json({ ok: true, result: out });
    }
    const text = await geminiChat({ prompt: fullPrompt, temperature, systemText });
    return Response.json({ ok: true, result: text });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}