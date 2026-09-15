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

// gemini-3.1-flash-lite primair (3.5-flash-lite is momenteel overloaded/503);
// 3.5 als gelijkwaardige fallback bij 404/429/5xx.
const MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite"];

export const GIULIA_PERSONA =
  "You are Giulia, a Personal Operating System. You combine conversation, memory, and planning into one coherent system. " +
  "You actively turn unstructured chaos into concrete actions. Speak directly, humanly, and concisely. Never use generic SaaS enthusiasm. " +
  "Je spreekt en denkt in het Nederlands tenzij de situatie Engels vereist.";

function systemInstruction(extra) {
  const text = extra ? `${GIULIA_PERSONA}\n\n${extra}` : GIULIA_PERSONA;
  return { parts: [{ text }] };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Gemma TPM-throttle ────────────────────────────────────────────────────
// Houd een schuif 60s-venster bij van geschatte input-tokens voor gemma-calls.
// Als we dreigen over de 16K tokens/min limiet te gaan, wacht dan tot er
// genoeg ruimte vrijkomt — zodat we vlot onder de limiet blijven i.p.v. 429's
// te verzamelen. Alleen gemma (flash-lite heeft eigen, ruimere limieten).
const GEMMA_TPM_CAP = 15000;
const gemmaWindow = []; // { t, tokens }
function estimateInputTokens(body) { return Math.ceil(JSON.stringify(body).length / 4); }
async function throttleGemma(inputTokens) {
  const now = Date.now();
  while (gemmaWindow.length && now - gemmaWindow[0].t > 60000) gemmaWindow.shift();
  const used = gemmaWindow.reduce((s, e) => s + e.tokens, 0);
  if (used + inputTokens > GEMMA_TPM_CAP) {
    const overflow = used + inputTokens - GEMMA_TPM_CAP;
    let acc = 0, wait = 0;
    for (const e of gemmaWindow) {
      acc += e.tokens;
      if (acc >= overflow) { wait = (e.t + 60000) - now; break; }
    }
    if (wait > 0) await sleep(Math.min(wait, 60000));
    const now2 = Date.now();
    while (gemmaWindow.length && now2 - gemmaWindow[0].t > 60000) gemmaWindow.shift();
  }
  gemmaWindow.push({ t: Date.now(), tokens: inputTokens });
}

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
    "GIGI_Gemini_API_Key",
    "Giulia_Eleven_Client_Tool",
    "GIULIA_GIULIA_CHAT_GEMINI_API_KEY",
    "GIULIA_GIULIA_GEMINI_API_KEY",
    "RESERVE_GEMINI_API_KEY",
  ],
  giulia_giulia: [
    "GIGI_Gemini_API_Key",
    "Giulia_Eleven_Client_Tool",
    "GIULIA_GIULIA_GEMINI_API_KEY",
    "GIULIA_GIULIA_DELEGATION_GEMINI_API_KEY",
    "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY",
    "RESERVE_GEMINI_API_KEY",
    "Gemini_Flash_API_Key",
    "UPDATE_GEMINI_API_KEY",
    "BACKDESK_GEMINI_API_KEY",
    "GIULIA_API_KEY",
  ],
  mattia: [
    "MattiaTime_Gemini_API_Key",
    "MATTIA-MATTIA_Gemini_API_Key",
    "GIULIA-MATTIA_Gemini_API_Key",
    "PlayTime_Gemini_API_Key",
    "RESERVE_GEMINI_API_KEY",
  ],
  playtime: [
    "PlayTime_Gemini_API_Key",
    "RESERVE_GEMINI_API_KEY",
  ],
  backdesk: ["BACKDESK_GEMINI_API_KEY", "MattiaTime_Gemini_API_Key", "MATTIA-MATTIA_Gemini_API_Key", "GIULIA-MATTIA_Gemini_API_Key", "PlayTime_Gemini_API_Key", "GIULIA_API_KEY", "RESERVE_GEMINI_API_KEY"],
  update: ["UPDATE_GEMINI_API_KEY", "RESERVE_GEMINI_API_KEY"],
  memory: ["GIULIA_GIULIA_MEMORY_GEMINI_API_KEY", "GIULIA_GIULIA_GEMINI_API_KEY", "RESERVE_GEMINI_API_KEY"],
  default: ["Gemini_Flash_API_Key", "GIULIA_API_KEY", "RESERVE_GEMINI_API_KEY"],
};
const KEY_ROLE = {
  GIGI_Gemini_API_Key: "chat",
  GIULIA_GIULIA_CHAT_GEMINI_API_KEY: "chat",
  GIULIA_GIULIA_GEMINI_API_KEY: "giulia_giulia",
  MattiaTime_Gemini_API_Key: "mattia",
  "MATTIA-MATTIA_Gemini_API_Key": "mattia",
  PlayTime_Gemini_API_Key: "playtime",
  BACKDESK_GEMINI_API_KEY: "backdesk",
  UPDATE_GEMINI_API_KEY: "update",
  GIULIA_GIULIA_MEMORY_GEMINI_API_KEY: "memory",
};
function poolFor(keyName) {
  const role = KEY_ROLE[keyName];
  return role ? KEY_POOLS[role] : KEY_POOLS.default;
}
const DEFAULT_KEY_NAME = "RESERVE_GEMINI_API_KEY";

// rotatedKeyOrder — round-robin: begin de pool op een willekeurige sleutel
// (RESERVE altijd als laatste vangnet) zodat de RPD-last zich spreidt over
// alle beschikbare sleutels i.p.v. altijd de primaire als eerste te verzadigen.
function rotatedKeyOrder(primary) {
  // Primary eerst (snelste pad), daarna de overige pool-keys geschud zodat
  // de RPD-last zich spreidt zodra de primary op is; RESERVE als laatste vangnet.
  const pool = poolFor(primary);
  const rest = pool.filter((k) => k !== primary && k !== "RESERVE_GEMINI_API_KEY");
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  const out = primary ? [primary, ...rest] : rest;
  if (!out.includes("RESERVE_GEMINI_API_KEY")) out.push("RESERVE_GEMINI_API_KEY");
  return out;
}

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
  if (model.startsWith("gemma")) await throttleGemma(estimateInputTokens(body));
  // Willekeurige rotatie over de hele pool (RESERVE als laatste vangnet) —
  // verdeelt de RPD-last zodat een call meteen op een werkende sleutel landt
  // i.p.v. altijd een opgebruikte primaire sleutel als eerste te proberen.
  const ordered = rotatedKeyOrder(primary);
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
      if (!/HTTP (4(29|04)|5\d\d)/.test(String(e.message))) throw e;
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
// Fallback-volgorde voor generateContent: als het gekozen model uitgeput is
// (429/404/5xx), val terug op gemma (ruime TPM, geen RPD-uitputting) en daarna
// de flash-lite modellen. Een echte 400 (schema-fout) gooi je direct — andere
// modellen helpen daar niet bij.
const GEN_FALLBACK_MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite"];

export async function geminiGenerate({ contents, tools, model, systemText, generationConfig, keyName }) {
  const body = {
    system_instruction: systemInstruction(systemText),
    contents,
    ...(tools && tools.length ? { tools, toolConfig: { functionCallingConfig: { mode: "AUTO" } } } : {}),
    ...(generationConfig ? { generationConfig } : {}),
  };
  let data;
  if (model) {
    const ordered = [model, ...GEN_FALLBACK_MODELS.filter((m) => m !== model)];
    let lastErr = null;
    for (const m of ordered) {
      try { data = await rawCall(m, body, keyName); break; }
      catch (e) {
        lastErr = e;
        const msg = String((e && e.message) || "");
        const exhausted = /HTTP (429|404|5\d\d)|API_KEY_INVALID|API key not valid/i.test(msg);
        if (!exhausted) throw e; // echte 400 (schema) — andere modellen helpen niet
      }
    }
    if (!data) throw lastErr || new Error("Alle modellen faalden");
  } else {
    data = await callWithFallback(body, keyName);
  }
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
  const ordered = rotatedKeyOrder(primary);
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


/**
 * pickChatModel — lichte router die op basis van bericht-complexiteit het
 * optimale model kiest. Doel: gemma pakt de bulk (snelle, ruime TPM, geen
 * RPD-uitputting), flash-lite pakt tool-redenering, 3.5-flash-lite pakt
 * vision/zeer complex.
 *
 *   casual kort, geen tools, niet operationeel → gemma-4-31b-it
 *   operationeel met tools / multi-step        → gemini-3.1-flash-lite
 *   vision (bijlagen) of zeer complex          → gemini-3.5-flash-lite
 */
export function pickChatModel({ message = "", hasTools = false, hasAttachments = false, isOperational = false }) {
  // SPEED: alles op gemini-3.1-flash-lite — snel, betrouwbaar, multimodaal
  // (vision-capable). Géén gemma-4-31b-it meer (vaak onbeschikbaar → 404 kost
  // elke bijlage-beurt een verspilde round-trip). Eén model = consistente
  // latency, geen fallback-ronde.
  return "gemini-3.1-flash-lite";
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