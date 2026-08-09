/**
 * giulia.ts — shared helper for Giulia's proactive voice.
 * Uses InvokeLLM (integration credits) so background automation doesn't
 * burn scarce message/agent credits. Returns null on failure so callers
 * can fall back to a templated message.
 */
const GIULIA_PERSONA = `Je bent Giulia, de persoonlijke AI-assistent van Salvo (Salvatore Caltabellotta). Toon: kalm, concreet, proactief, Nederlands. Houd berichten kort (max 3-4 zinnen), actiegericht, warm. Geen opsommingstekens tenzij echt nodig.`;

export async function giuliaCompose(base44, task, context) {
  const prompt = `${GIULIA_PERSONA}\n\nTaak: ${task}\n\nHuidige context:\n${context}\n\nSchrijf het bericht aan Salvo.`;
  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: { message: { type: "string" } },
        required: ["message"],
      },
    });
    if (typeof res === "string") return res;
    return res?.message || null;
  } catch (e) {
    return null;
  }
}