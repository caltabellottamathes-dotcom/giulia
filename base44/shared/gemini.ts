/**
 * gemini.ts — BYOK Gemini helper. ALL Giulia AI calls go through here.
 *
 * Direct REST POST to the Google Gemini API using GEMINI_API_KEY from runtime
 * secrets (backend only — never exposed to the Vite frontend). Giulia's persona
 * is injected at the root level via `system_instruction`. Supports structured
 * JSON output (response_schema) and raw tool-calling turns for the agent loop.
 *
 * gemini-3.5-flash-lite primair, gemini-3.1-flash-lite als gelijkwaardige
 * fallback bij 404/429. Fouten worden doorgeslikt naar null bij geminiDecide/Chat
 * (single-shot), maar gegooid bij geminiGenerate (agent-loop) zodat ze
 * zichtbaar zijn in de testlogs / Activity-feed.
 */
import { secrets } from "base44:runtime";

// gemini-3.5-flash-lite primair (meeste credits + hoogste rate-limits);
// gemini-3.1-flash-lite als gelijkwaardige fallback bij 404/429.
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

export const GIULIA_PERSONA =
  "You are Giulia, a Personal Operating System. You combine conversation, memory, and planning into one coherent system. " +
  "You actively turn unstructured chaos into concrete actions. Speak directly, humanly, and concisely. Never use generic SaaS enthusiasm. " +
  "Je spreekt en denkt in het Nederlands tenzij de situatie Engels vereist.";

function systemInstruction(extra) {
  const text = extra ? `${GIULIA_PERSONA}\n\n${extra}` : GIULIA_PERSONA;
  return { parts: [{ text }] };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Rol-gebaseerde sleutelpools — elke rol heeft zijn eigen Gemini-sleutel;
// bij quota/429/403/5xx schakelt hij automatisch door naar de werkende legacy-
// sleutel en daarna naar RESERVE_GEMINI_API_KEY (de universele reserve met
// alle toestemmingen). Zo blijft alles vlekkeloos werken, ook als een
// specifieke sleutel op is of ongeldig blijkt.
//   giulia_giulia → de chat met Salvo (interpretInput classifyChat, giuliaLeader chat)
//   backdesk     → alle achtergrond-agents (manage*, proactivity, leader, planning)
//   update       → dashboard/widget/paneel- en visuele updates (briefing-content)
//   default      → legacy-sleutels + RESERVE (alles wat geen eigen rol heeft)
// GIULIA-GIULIA is de kritieke, gebruiker-zichtbare chatlijn — die krijgt 4
// exclusieve sleutels (vrij inwisselbaar, gewoon gelabeld per functie om
// gestructureerd te blijven) vóór de gedeelde sleutels, zodat een quota-hit
// op één sleutel nooit de chat blokkeert.
// GEMINI_API_KEY is exclusief voor ElevenLabs — komt in geen enkele pool voor
// behalve waar ElevenLabs zelf het als keyName doorgeeft.
// De chat (GIULIA-GIULIA met Salvo) krijgt een eigen hoofd-sleutel + 2 reserves.
const KEY_POOLS = {
  chat: [
    "GIULIA_GIULIA_CHAT_GEMINI_API_KEY",
    "GIULIA_GIULIA_GEMINI_API_KEY",
    "RESERVE_GEMINI_API_KEY",
  ],
  giulia_giulia: [
    "GIULIA_GIULIA_GEMINI_API_KEY",
    "GIULIA_GIULIA_DELEGATION_GEMINI_API_KEY",
    "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY",
    "RESERVE_GEMINI_API_KEY",
    "Gemini_Flash_API_Key",
    "UPDATE_GEMINI_API_KEY",
    "BACKDESK_GEMINI_API_KEY",
    "GIULIA_API_KEY",
  ],
  backdesk: ["BACKDESK_GEMINI_API_KEY", "GIULIA_API_KEY", "RESERVE_GEMINI_API_KEY"],
  update: ["UPDATE_GEMINI_API_KEY", "RESERVE_GEMINI_API_KEY"],
  memory: ["GIULIA_GIULIA_MEMORY_GEMINI_API_KEY", "GIULIA_GIULIA_GEMINI_API_KEY", "RESERVE_GEMINI_API_KEY"],
  default: ["Gemini_Flash_API_Key", "GIULIA_API_KEY", "RESERVE_GEMINI_API_KEY"],
};
const KEY_ROLE = {
  GIULIA_GIULIA_CHAT_GEMINI_API_KEY: "chat",
  GIULIA_GIULIA_GEMINI_API_KEY: "giulia_giulia",
  BACKDESK_GEMINI_API_KEY: "backdesk",
  UPDATE_GEMINI_API_KEY: "update",
  GIULIA_GIULIA_MEMORY_GEMINI_API_KEY: "memory",
};
function poolFor(keyName) {
  const role = KEY_ROLE[keyName];
  return role ? KEY_POOLS[role] : KEY_POOLS.default;
}
const DEFAULT_KEY_NAME = "RESERVE_GEMINI_API_KEY";

async function rawCallOne(model, body, keyName) {
  const key = secrets.get(keyName);
  if (!key) throw Object.assign(new Error(`${keyName} niet ingesteld`), { status: 0 });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw Object.assign(new Error(`Gemini ${model} HTTP ${res.status}: ${detail.slice(0, 300)}`), { status: res.status });
  }
  return res.json();
}

async function rawCall(model, body, keyName) {
  const primary = keyName || DEFAULT_KEY_NAME;
  // Probeer eerst de eigen sleutel, daarna de rest van de pool (legacy +
  // RESERVE altijd als laatste vangnet), bij 429/403/5xx automatisch doorsturend.
  const pool = poolFor(primary);
  const ordered = [primary, ...pool.filter((k) => k !== primary)];
  if (!ordered.includes("RESERVE_GEMINI_API_KEY")) ordered.push("RESERVE_GEMINI_API_KEY");
  let lastErr = null;
  for (const k of ordered) {
    try {
      return await rawCallOne(model, body, k);
    } catch (e) {
      lastErr = e;
      const status = (e && e.status) || 0;
      const msg = String((e && e.message) || "");
      // Een ongeldige sleutel komt soms terug als 400 (API_KEY_INVALID) i.p.v.
      // 403 — zonder deze check roteert de pool nooit en falen alle backdesk-
      // agents permanent op één dode sleutel. Alleen key-specifieke fouten
      // roteren; een echte schema-400 valt niet door dit filter.
      const invalidKey = /API_KEY_INVALID|API key not valid|API_KEY_EXPIRED|UNAUTHORIZED|invalid_api_key|PERMISSION_DENIED/i.test(msg);
      if (status === 429 || status === 403 || status === 401 || status >= 500 || invalidKey) continue;
      throw e; // echte 400 (bad request/schema) — andere sleutels helpen niet
    }
  }
  // Alle sleutels op quota/verboden → korte pauze en nog één keer de eigen sleutel.
  await sleep(3500);
  try { return await rawCallOne(model, body, primary); }
  catch (e) { throw lastErr || e; }
}

/** Probeekt elk model tot er één slaagt; gooit anders de laatste fout. */
async function callWithFallback(body, keyName) {
  let lastErr = null;
  for (const model of MODELS) {
    try {
      return await rawCall(model, body, keyName);
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
export async function geminiDecide({ prompt, schema, model, systemText, temperature = 0.4, keyName }) {
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
      ? await rawCall(model, body, keyName)
      : await callWithFallback(body, keyName);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) return null;
    try { return JSON.parse(text); } catch { return null; }
  } catch { return null; }
}

/** geminiChat — free-form text reply (no schema). Returns text or null. */
export async function geminiChat({ prompt, contents, model, systemText, temperature = 0.6, keyName }) {
  const body = {
    system_instruction: systemInstruction(systemText),
    contents: contents || [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature },
  };
  try {
    const data = model
      ? await rawCall(model, body, keyName)
      : await callWithFallback(body, keyName);
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch { return null; }
}

/**
 * geminiGenerate — raw generateContent turn for the tool-calling agent loop.
 * Returns the model's `parts` (text and/or functionCall). GOOIT bij falen
 * (geen stil null meer) zodat runGiuliaAgent en de aanroepende functie de fout
 * zichtbaar teruggeven.
 */
export async function geminiGenerate({ contents, tools, model, systemText, generationConfig, keyName }) {
  const body = {
    system_instruction: systemInstruction(systemText),
    contents,
    ...(tools ? { tools } : {}),
    toolConfig: { functionCallingConfig: { mode: "AUTO" } },
    ...(generationConfig ? { generationConfig } : {}),
  };
  const data = model
    ? await rawCall(model, body, keyName)
    : await callWithFallback(body, keyName);
  return data?.candidates?.[0]?.content?.parts || null;
}

/** Probeert een opgegeven lijst modellen (voor tools die niet elk model ondersteunt). */
async function callWithModelList(models, body, keyName) {
  let lastErr = null;
  for (const model of models) {
    try { return await rawCall(model, body, keyName); }
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
export async function geminiResearch({ prompt, systemText, temperature = 0.5, keyName }) {
  const body = {
    system_instruction: systemInstruction(systemText),
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature },
  };
  try {
    const data = await callWithFallback(body, keyName);
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim();
    if (!text) return null;
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch { return null; }
}

// ── Geheugen-embeddings ────────────────────────────────────────────────────
// text-embedding-004 zet geheugentekst om in een vector, zodat we bij het
// laden van context kunnen zoeken op BETEKENIS ("wanneer heeft Salvo iets
// over zijn moeder gezegd?") in plaats van enkel op de laatste 20 records.
const EMBED_MODEL = "gemini-embedding-001";

async function rawEmbedOne(text, keyName) {
  const key = secrets.get(keyName);
  if (!key) throw Object.assign(new Error(`${keyName} niet ingesteld`), { status: 0 });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: { parts: [{ text }] } }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw Object.assign(new Error(`Gemini embed HTTP ${res.status}: ${detail.slice(0, 300)}`), { status: res.status });
  }
  return res.json();
}

async function rawEmbed(text, keyName) {
  const primary = keyName || "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY";
  const pool = poolFor(primary);
  const ordered = [primary, ...pool.filter((k) => k !== primary)];
  if (!ordered.includes("RESERVE_GEMINI_API_KEY")) ordered.push("RESERVE_GEMINI_API_KEY");
  let lastErr = null;
  for (const k of ordered) {
    try { return await rawEmbedOne(text, k); }
    catch (e) {
      lastErr = e;
      const status = (e && e.status) || 0;
      if (status === 429 || status === 403 || status >= 500) continue;
      throw e;
    }
  }
  throw lastErr || new Error("Alle embed-sleutels faalden");
}

/** geminiEmbed — geeft een vector (number[]) terug voor een stuk tekst, of null bij falen. */
export async function geminiEmbed({ text, keyName }) {
  if (!text || !String(text).trim()) return null;
  try {
    const data = await rawEmbed(String(text).slice(0, 2000), keyName);
    return data?.embedding?.values || null;
  } catch { return null; }
}


/** cosineSimilarity — vergelijkt twee vectoren (0 = ongerelateerd, 1 = identiek). */
export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || !a.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * geminiTranscribe — transcriptie van een audio-opname (inline base64) via de
 * multimodale Gemini API. Vervangt Core.TranscribeAudio (integration credits).
 * Geeft platte tekst terug.
 */
export async function geminiTranscribe({ audioBase64, mimeType, prompt, keyName }) {
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
    const data = await callWithFallback(body, keyName);
    return (data?.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim();
  } catch { return ""; }
}