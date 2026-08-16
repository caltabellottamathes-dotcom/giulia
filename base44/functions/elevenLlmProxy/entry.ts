/**
 * elevenLlmProxy — OpenAI-compatible Chat Completions proxy voor de
 * ElevenLabs voice-agent. Doet AUTOMATISCHE key-fallback:
 *   1. Forward naar Google Gemini (OpenAI-endpoint) met ELEVEN_GEMINI_API_KEY.
 *   2. Bij falen (401/403/429/5xx) opnieuw met ELEVEN_2_GEMINI_API_KEY.
 *   3. Geeft de SSE-stream 1:1 terug (text/event-stream).
 *
 * Authenticatie: ElevenLabs stuurt de custom-llm api_key als
 *   `Authorization: Bearer <GIULIA_API_KEY>`; hier vergeleken.
 *
 * Endpoint (publiek): https://base44.app/apps/<APP_ID>/functions/elevenLlmProxy
 */
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

async function readText(res) {
  try { return await res.text(); } catch { return ""; }
}

export default async function (req) {
  try {
    // ── Authenticatie ──
    const expected = process.env.GIULIA_API_KEY;
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    if (!expected || auth !== `Bearer ${expected}`) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const key1 = process.env.ELEVEN_GEMINI_API_KEY;
    const key2 = process.env.ELEVEN_2_GEMINI_API_KEY;
    if (!key1) {
      return Response.json({ error: "ELEVEN_GEMINI_API_KEY niet ingesteld" }, { status: 500 });
    }
    const keys = key2 ? [key1, key2] : [key1];

    // ── Body inlezen, stream forceren (ElevenLabs verwacht SSE) ──
    const raw = await readText(req);
    let payload;
    try { payload = raw ? JSON.parse(raw) : null; } catch { payload = null; }
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      payload.stream = true;
    }
    const sendBody = payload ? JSON.stringify(payload) : raw;

    // ── Probeer keys in volgorde; bij 200 direct de SSE teruggeven ──
    let lastStatus = 0;
    let lastErr = "";
    for (const key of keys) {
      const gRes = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: sendBody,
      });
      if (gRes.status === 200) {
        const text = await readText(gRes);
        return new Response(text, {
          status: 200,
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
        });
      }
      lastStatus = gRes.status;
      lastErr = await readText(gRes).catch(() => "");
      // 401/403/429/5xx → probeer volgende key. 4xx (bad request) → ook door, key2 helpt niet maar kost weinig.
      if (gRes.status >= 400 && gRes.status < 500 && gRes.status !== 401 && gRes.status !== 403 && gRes.status !== 429) {
        break; // echt een malformed request — key2 helpt niet
      }
    }

    return new Response(lastErr || `gemini error (${lastStatus})`, {
      status: lastStatus || 502,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}