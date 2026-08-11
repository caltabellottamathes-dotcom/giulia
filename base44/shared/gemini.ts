/**
 * gemini.ts — BYOK Gemini helper. ALL Giulia AI calls go through here.
 *
 * Direct REST POST to the Google Gemini API using GEMINI_API_KEY from runtime
 * secrets (backend only — never exposed to the Vite frontend). Giulia's persona
 * is injected at the root level via `system_instruction`. Supports structured
 * JSON output (response_schema) and raw tool-calling turns for the agent loop.
 */
import { secrets } from "base44:runtime";

// Giulia needs deep reasoning + context management + complex JSON structuring
// across the whole OS. Pro-tier models (gemini-2.5-pro, gemini-3.1-pro-preview,
// gemini-pro-latest) return 429 on this key (free tier, limit 0). gemini-3.5-flash
// works but its free tier is capped at 20 RPD, too tight for 24/7 build/test.
// gemini-3.1-flash-lite raises the free quota to 500 RPD / 15 RPM — enough headroom
// for agentic loops without hitting 429s. Still supports response_schema + tools.
const GEMINI_MODEL = "gemini-3.1-flash-lite";

export const GIULIA_PERSONA =
  "You are Giulia, a Personal Operating System. You combine conversation, memory, and planning into one coherent system. " +
  "You actively turn unstructured chaos into concrete actions. Speak directly, humanly, and concisely. Never use generic SaaS enthusiasm.";

function endpoint(model) {
  const key = secrets.get("GEMINI_API_KEY");
  return `https://generativelanguage.googleapis.com/v1beta/models/${model || GEMINI_MODEL}:generateContent?key=${key}`;
}

function systemInstruction(extra) {
  const text = extra ? `${GIULIA_PERSONA}\n\n${extra}` : GIULIA_PERSONA;
  return { parts: [{ text }] };
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
    const res = await fetch(endpoint(model), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();
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
    const res = await fetch(endpoint(model), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch { return null; }
}

/**
 * geminiGenerate — raw generateContent turn for the tool-calling agent loop.
 * Returns the model's `parts` (text and/or functionCall) or null.
 */
export async function geminiGenerate({ contents, tools, model, systemText, generationConfig }) {
  const body = {
    system_instruction: systemInstruction(systemText),
    contents,
    ...(tools ? { tools } : {}),
    toolConfig: { functionCallingConfig: { mode: "AUTO" } },
    ...(generationConfig ? { generationConfig } : {}),
  };
  try {
    const res = await fetch(endpoint(model), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts || null;
  } catch { return null; }
}