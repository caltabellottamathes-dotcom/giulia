/**
 * aiRouter.ts — centrale AI-provider-router voor GIULIA OS.
 *
 * Stuurt AI-verzoeken dynamisch naar een lokale Ollama-server (OpenAI-
 * compatible /v1/chat/completions) of naar de Gemini cloud-API, afhankelijk
 * van AI_MODE en de bereikbaarheid van het lokale endpoint. Genormaliseerd
 * response-formaat, ongeacht provider: { content, provider, model, taskType }.
 *
 * Config via secrets (dashboard) met sane defaults; AI_MODE en
 * local_tunnel_endpoint kunnen ook runtime overschreven worden via de
 * AISettings-entity (Instellingen-scherm) wanneer een `base44` client is
 * doorgegeven (heeft entity-toegang nodig — alleen mogelijk binnen functies
 * die een request hebben).
 */
import { secrets } from "base44:runtime";

// Model-mapping per taaktype — makkelijk uitbreidbaar zonder de routerlogica
// aan te passen.
export const MODEL_MAP = {
  chat: { local_model: "llama3.2", cloud_model: "gemini-3.1-flash-lite" },
  chaos_to_action: { local_model: "llama3.2", cloud_model: "gemini-3.1-flash-lite" },
  memory_summarize: { local_model: "llama3.2", cloud_model: "gemini-3.1-flash-lite" },
  daily_plan_generate: { local_model: "llama3.2", cloud_model: "gemini-3.1-flash-lite" },
  whatsapp_reply_draft: { local_model: "llama3.2", cloud_model: "gemini-3.1-flash-lite" },
  default: { local_model: "llama3.2", cloud_model: "gemini-3.1-flash-lite" },
};

let healthCache = { checkedAt: 0, healthy: false, endpoint: "" };

function num(name, fallback) {
  const v = Number(secrets.get(name));
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

function trimSlash(url) {
  return (url || "").replace(/\/$/, "");
}

export function resolveLocalEndpoint(tunnelOverride) {
  const tunnel = tunnelOverride || secrets.get("LOCAL_AI_TUNNEL_ENDPOINT");
  if (tunnel) return trimSlash(tunnel);
  return trimSlash(secrets.get("LOCAL_AI_ENDPOINT") || "http://localhost:11434/v1");
}

function resolveAiMode(override) {
  const v = override || secrets.get("AI_MODE") || "auto";
  return ["auto", "force_local", "force_cloud"].includes(v) ? v : "auto";
}

async function getSettings(base44) {
  if (!base44) return {};
  try {
    const rows = await base44.asServiceRole.entities.AISettings.list();
    return rows?.[0] || {};
  } catch {
    return {};
  }
}

async function logFallback(base44, description) {
  if (!base44) {
    console.log(`[aiRouter] ${description}`);
    return;
  }
  try {
    await base44.asServiceRole.entities.Activity.create({
      action: "ai_router_fallback",
      description,
      source: "aiRouter",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.log(`[aiRouter] logging mislukt: ${e.message}`);
  }
}

/** Lichte health-check op {endpoint}/models, resultaat kort gecached. */
export async function checkLocalHealth(endpoint, token, timeoutMs) {
  const interval = num("HEALTHCHECK_INTERVAL_MS", 60000);
  const now = Date.now();
  if (healthCache.endpoint === endpoint && now - healthCache.checkedAt < interval) {
    return healthCache.healthy;
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const headers = token ? { "X-Tunnel-Token": token } : {};
    const res = await fetch(`${endpoint}/models`, { method: "GET", headers, signal: controller.signal });
    clearTimeout(timer);
    healthCache = { checkedAt: now, healthy: res.ok, endpoint };
    return res.ok;
  } catch {
    healthCache = { checkedAt: now, healthy: false, endpoint };
    return false;
  }
}

function withSystem(messages, systemText) {
  if (!systemText) return messages || [];
  return [{ role: "system", content: systemText }, ...(messages || [])];
}

async function callOllama(endpoint, token, model, messages) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["X-Tunnel-Token"] = token;
  const res = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, messages, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "";
  return { content, provider: "local", model };
}

function splitForGemini(messages) {
  let sys = "";
  const contents = [];
  for (const m of messages || []) {
    if (m.role === "system") { sys += (sys ? "\n" : "") + m.content; continue; }
    contents.push({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content || "" }] });
  }
  return { sys, contents };
}

async function callGemini(model, messages, schema) {
  const key = secrets.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY niet ingesteld — check app secrets.");
  const endpoint = trimSlash(secrets.get("GEMINI_ENDPOINT") || "https://generativelanguage.googleapis.com/v1beta/");
  const { sys, contents } = splitForGemini(messages);
  const body = {
    ...(sys ? { system_instruction: { parts: [{ text: sys }] } } : {}),
    contents: contents.length ? contents : [{ role: "user", parts: [{ text: "" }] }],
    generationConfig: {
      temperature: 0.6,
      ...(schema ? { response_mime_type: "application/json", response_schema: schema } : {}),
    },
  };
  const res = await fetch(`${endpoint}/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini ${model} HTTP ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return { content, provider: "cloud", model };
}

/**
 * aiRouter.chat — unified interface. Retourneert altijd hetzelfde formaat,
 * ongeacht provider: { content, provider, model, taskType }.
 */
export async function chat({ messages, taskType = "default", systemText, schema, base44, tunnelOverride, modeOverride }) {
  const cfg = MODEL_MAP[taskType] || MODEL_MAP.default;
  const settings = await getSettings(base44);
  const aiMode = resolveAiMode(modeOverride || settings.ai_mode);
  const endpoint = resolveLocalEndpoint(tunnelOverride || settings.local_tunnel_endpoint);
  const token = secrets.get("LOCAL_AI_TUNNEL_TOKEN");
  const timeoutMs = num("HEALTHCHECK_TIMEOUT_MS", 1500);
  const localMessages = withSystem(messages, systemText);

  if (aiMode === "force_local") {
    const healthy = await checkLocalHealth(endpoint, token, timeoutMs);
    if (!healthy) throw new Error(`Lokale AI (${endpoint}) niet bereikbaar — AI_MODE staat op 'force_local'.`);
    const result = await callOllama(endpoint, token, cfg.local_model, localMessages);
    return { ...result, taskType };
  }

  if (aiMode === "force_cloud") {
    const result = await callGemini(cfg.cloud_model, withSystem(messages, systemText), schema);
    return { ...result, taskType };
  }

  // auto — probeer lokaal, val transparant en zonder crash terug op Gemini.
  const healthy = await checkLocalHealth(endpoint, token, timeoutMs);
  if (healthy) {
    try {
      const result = await callOllama(endpoint, token, cfg.local_model, localMessages);
      return { ...result, taskType };
    } catch (e) {
      await logFallback(base44, `Lokale AI faalde tijdens de call (${e.message}) — overgeschakeld naar Gemini. [${taskType}]`);
      const result = await callGemini(cfg.cloud_model, withSystem(messages, systemText), schema);
      return { ...result, taskType };
    }
  }
  await logFallback(base44, `Lokale AI (${endpoint}) niet bereikbaar — overgeschakeld naar Gemini. [${taskType}]`);
  const result = await callGemini(cfg.cloud_model, withSystem(messages, systemText), schema);
  return { ...result, taskType };
}

/** Status voor het instellingenscherm — huidige actieve provider + health. */
export async function getStatus(base44) {
  const settings = await getSettings(base44);
  const aiMode = resolveAiMode(settings.ai_mode);
  const endpoint = resolveLocalEndpoint(settings.local_tunnel_endpoint);
  const token = secrets.get("LOCAL_AI_TUNNEL_TOKEN");
  const timeoutMs = num("HEALTHCHECK_TIMEOUT_MS", 1500);
  const healthy = await checkLocalHealth(endpoint, token, timeoutMs);
  let active = "cloud";
  if (aiMode === "force_local") active = "local";
  else if (aiMode === "force_cloud") active = "cloud";
  else active = healthy ? "local" : "cloud";
  return {
    ai_mode: aiMode,
    local_healthy: healthy,
    active_provider: active,
    local_endpoint: endpoint,
    cloud_configured: !!secrets.get("GEMINI_API_KEY"),
    checked_at: new Date().toISOString(),
  };
}