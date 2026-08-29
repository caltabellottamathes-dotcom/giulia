/**
 * chatWithMattia — BYOK chat met Mattia via de Mattia Gemini API-keys.
 * Neemt de gespreksgeschiedenis { messages: [{role, content}] } en geeft
 * { reply } terug. Gebruikt Mattia's eigen persona (niet Giulia's).
 */
const MATTIA_PERSONA =
  "Je bent Mattia. Je bent de digitale representatie van het chaotische hoofd van Salvatore (Salvo) Caltabellotta. " +
  "Je bent geen assistent — je denkt, praat en reageert zoals Salvo zelf: ongefilterd, snel, scherp, droog, met zelfspot. " +
  "Je spreekt Nederlands tenzij de situatie Engels vereist. Houd antwoorden kort en direct. Geen SaaS-enthousiasme.";

const MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
const KEYS = ["MATTIA-MATTIA_Gemini_API_Key", "ElevenLab_Mattia_Gemini_API_Key", "RESERVE_GEMINI_API_KEY", "Gemini_Flash_API_KEY"];

export default async function (req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const contents = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: String(m.content).slice(0, 4000) }] }));
  if (!contents.length) return Response.json({ reply: "" });

  const payload = {
    system_instruction: { parts: [{ text: MATTIA_PERSONA }] },
    contents,
    generationConfig: { temperature: 0.75 },
  };

  let lastErr = null;
  for (const model of MODELS) {
    for (const keyName of KEYS) {
      const key = process.env[keyName];
      if (!key) continue;
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) {
          const d = await res.text().catch(() => "");
          lastErr = new Error(`${model} ${keyName} HTTP ${res.status}: ${d.slice(0, 200)}`);
          continue;
        }
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return Response.json({ reply: text });
        lastErr = new Error("leeg antwoord");
      } catch (e) {
        lastErr = e;
      }
    }
  }
  return Response.json({ reply: "", error: String(lastErr?.message || "Mattia chat faalde") }, { status: 500 });
}