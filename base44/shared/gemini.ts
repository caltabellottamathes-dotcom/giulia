/**
 * gemini.ts — BYOK Gemini helper. ALL Giulia AI calls go through here.
 *
 * Direct REST POST to the Google Gemini API using GEMINI_API_KEY from runtime
 * secrets (backend only — never exposed to the Vite frontend). Giulia's persona
 * is injected at the root level via `system_instruction`. Supports structured
 * JSON output (response_schema) and raw tool-calling turns for the agent loop.
 *
 * ENKEL gemini-3.1-flash-lite wordt gebruikt — géén automatische fallback naar
 * andere modellen. Fouten worden doorgeslikt naar null bij geminiDecide/Chat
 * (single-shot), maar gegooid bij geminiGenerate (agent-loop) zodat ze
 * zichtbaar zijn in de testlogs / Activity-feed.
 */
import { secrets } from "base44:runtime";

// Het enige gebruikte model — géén fallback-chain.
const MODELS = ["gemini-3.1-flash-lite"];

export const GIULIA_PERSONA =
  "You are Giulia, a Personal Operating System. You combine conversation, memory, and planning into one coherent system. " +
  "You actively turn unstructured chaos into concrete actions. Speak directly, humanly, and concisely. Never use generic SaaS enthusiasm. " +
  "Je spreekt en denkt in het Nederlands tenzij de situatie Engels vereist.";

function systemInstruction(extra) {
  const text = extra ? `${GIULIA_PERSONA}\n\n${extra}` : GIULIA_PERSONA;
  return { parts: [{ text }] };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rawCall(model, body, retried) {
  const key = secrets.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY niet ingesteld — check app secrets.");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // Eén keer terugvallen op een korte pauze bij 429 (rate limit) — een live
    // chatvraag mag niet mislukken puur omdat er net een achtergrondtaak liep.
    if (res.status === 429 && !retried) {
      await sleep(3500);
      return rawCall(model, body, true);
    }
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

/** Probeert een opgegeven lijst modellen (voor tools die niet elk model ondersteunt). */
async function callWithModelList(models, body) {
  let lastErr = null;
  for (const model of models) {
    try { return await rawCall(model, body); }
    catch (e) {
      lastErr = e;
      if (!/HTTP 4(29|04|00)|HTTP 400/.test(String(e.message))) throw e;
    }
  }
  throw lastErr || new Error("Alle modellen faalden");
}

/**
 * geminiResearch — eenmalig onderzoek met Google Search-grounding (actuele
 * webcontext) via de eigen Gemini-sleutel. Geen integration credits. Vraagt
 * strict JSON terug en parseert het eerste {...} blok. Robuust over modellen.
 */
export async function geminiResearch({ prompt, systemText, temperature = 0.5 }) {
  const body = {
    system_instruction: systemInstruction(systemText),
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature },
  };
  try {
    const data = await callWithFallback(body);
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim();
    if (!text) return null;
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch { return null; }
}

/**
 * geminiTranscribe — transcriptie van een audio-opname (inline base64) via de
 * multimodale Gemini API. Vervangt Core.TranscribeAudio (integration credits).
 * Geeft platte tekst terug.
 */
export async function geminiTranscribe({ audioBase64, mimeType, prompt }) {
  const body = {
    contents: [{
      role: "user",
      parts: [
        { inlineData: { mimeType: mimeType || "audio/webm", data: audioBase64 } },
        { text: prompt || "Transcribeer deze audio nauwkeurig in de oorspronkelijke taal. Geef alleen de letterlijke transcriptie, zonder aanhalingstekens, labels of commentaar." },
      ],
    }],
  };
  try {
    const data = await callWithFallback(body);
    return (data?.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim();
  } catch { return ""; }
}