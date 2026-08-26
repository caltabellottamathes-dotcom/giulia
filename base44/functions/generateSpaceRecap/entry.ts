import { geminiDecide } from '../../shared/gemini.ts';

/**
 * generateSpaceRecap — genereert de editorial recap (SpaceRecap) via de eigen
 * BYOK Gemini-sleutel (Calculator_Gemini_API_Key, "admin in general"). Geen
 * integration credits, geen platform-LLM-hang. Accepteert { prompt, schema,
 * temperature } en geeft { ok, result } terug (result = parsed JSON of null).
 */
export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, schema, temperature } = body;
    if (!prompt) return Response.json({ ok: false, error: "prompt required", result: null }, { status: 200 });
    const result = await geminiDecide({
      prompt,
      schema: schema || undefined,
      temperature: typeof temperature === "number" ? temperature : 0.5,
      keyName: "Calculator_Gemini_API_Key",
    });
    return Response.json({ ok: true, result });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message), result: null }, { status: 200 });
  }
}