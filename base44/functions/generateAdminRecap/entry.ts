import { geminiDecide } from '../../shared/gemini.ts';

/**
 * generateAdminRecap — genereert de editorial Finance-recap via de eigen
 * Calculator-Gemini-sleutel (BYOK, geen integration credits). Ontvangt
 * { prompt, schema } en geeft { ok, data } terug. Frontend cachet + throttlet
 * (een paar keer per dag of wanneer de financiële data verandert).
 */
export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body.prompt;
    const schema = body.schema;
    if (!prompt || !schema) return Response.json({ ok: false, error: "prompt + schema required" }, { status: 400 });
    const data = await geminiDecide({ prompt, schema, keyName: "Calculator_Gemini_API_Key", temperature: 0.5 });
    if (!data) return Response.json({ ok: false, error: "generation failed" }, { status: 502 });
    return Response.json({ ok: true, data });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}