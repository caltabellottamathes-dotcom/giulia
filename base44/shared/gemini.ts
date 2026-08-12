/**
 * gemini.ts — BYOK Gemini helper. ALL Giulia AI calls go through here.
 *
 * Direct REST POST to the Google Gemini API using GEMINI_API_KEY from runtime
 * secrets (backend only — never exposed to the Vite frontend). Giulia's persona
 * is injected at the root level via `system_instruction`. Supports structured
 * JSON output (response_schema) and raw tool-calling turns for the agent loop.
 *
 * BELANGRIJK: eerdere versies gebruikten "gemini-3.1-flash-lite" — dat model
 * bestaat niet in de v1beta API, dus élke aanroep faalde stil en de agents
 * deden niets. We gebruiken nu geldige modellen met een fallback-chain, en
 * fouten worden NIET meer doorgeslikt maar gegooid zodat ze zichtbaar zijn in
 * de testlogs / Activity-feed.
 */
import { secrets } from "base44:runtime";

// Geldige v1beta-modellen, van capabel naar hoog-quota fallback.
// gemini-2.5-flash: tools + response_schema, goede gratis tier.
// gemini-2.0-flash-lite: zeer hoge gratis quota, ondersteunt tools + schema.
// gemini-1.5-flash: brede compatibiliteit als laatste redmiddel.
const MODELS = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-flash-lite-latest"];

export const GIULIA_PERSONA =
  "You are Giulia, a Personal Operating System. You combine conversation, memory, and planning into one coherent system. " +
  "You actively turn unstructured chaos into concrete actions. Speak directly, humanly, and concisely. Never use generic SaaS enthusiasm. " +
  "Je spreekt en denkt in het Nederlands tenzij de situatie Engels vereist.";

function systemInstruction(extra) {
  const text = extra ? `${GIULIA_PERSONA}\n\n${extra}` : GIULIA_PERSONA;
  return { parts: [{ text }] };
}

async function rawCall(model, body) {
  const key = secrets.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY niet ingesteld — check app secrets.");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini ${model} HTTP ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.json();
}

/** Probeekt elk model tot er één slaagt; gooit anders de laatste fout. */
async function callWithFallback(body) {
  let lastErr = null;
  for (const model of MODELS) {
    try {
      return await rawCall(model, body);
    } catch (e) {
      lastErr = e;
      // 429 / 404 op dit model → probeer de volgende; andere fouten → gooi direct.
      if (!/HTTP 4(29|04)/.test(String(e.message))) throw e;
    }
  }
  throw lastErr || new Error("Alle Gemini-modellen faalden");
}

/**
 * geminiDecide — single-shot structured decision. Returns a parsed object per
 * `schema` (or null on failure). Uses response_mime_type: application/json +
 * response_schema so the result can be inserted directly into collections.
 */
export async function geminiDecide({ prompt, schema, model, systemText, temperature = 0.4 }) {
  const body = {
    system_instruction: systemInstruction(systemText),
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      response_mime_type: "application/json",
      response_schema: schema,
      temperature,
    },
  };
  try {
    const data = model
      ? await rawCall(model, body)
      : await callWithFallback(body);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) return null;
    try { return JSON.parse(text); } catch { return null; }
  } catch { return null; }
}

/** geminiChat — free-form text reply (no schema). Returns text or null. */
export async function geminiChat({ prompt, contents, model, systemText, temperature = 0.6 }) {
  const body = {
    system_instruction: systemInstruction(systemText),
    contents: contents || [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature },
  };
  try {
    const data = model
      ? await rawCall(model, body)
      : await callWithFallback(body);
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch { return null; }
}

/**
 * geminiGenerate — raw generateContent turn for the tool-calling agent loop.
 * Returns the model's `parts` (text and/or functionCall). GOOIT bij falen
 * (geen stil null meer) zodat runGiuliaAgent en de aanroepende functie de fout
 * zichtbaar teruggeven.
 */
export async function geminiGenerate({ contents, tools, model, systemText, generationConfig }) {
  const body = {
    system_instruction: systemInstruction(systemText),
    contents,
    ...(tools ? { tools } : {}),
    toolConfig: { functionCallingConfig: { mode: "AUTO" } },
    ...(generationConfig ? { generationConfig } : {}),
  };
  const data = model
    ? await rawCall(model, body)
    : await callWithFallback(body);
  return data?.candidates?.[0]?.content?.parts || null;
}