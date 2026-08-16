/**
 * elevenLlmProxy — OpenAI-compatible Chat Completions proxy voor de
 * ElevenLabs voice-agent. Doet AUTOMATISCHE key-fallback:
 *   1. Forward naar Google Gemini (OpenAI-endpoint) met ELEVEN_GEMINI_API_KEY.
 *   2. Bij falen (401/403/429/5xx) opnieuw met ELEVEN_2_GEMINI_API_KEY.
 *   3. Geeft de SSE-stream 1:1 terug (text/event-stream).
 *
 * WORKAROUND voor ElevenLabs bug #603 (client-tools gedropt bij voice-turns):
 *   De proxy parst de SSE-toolcalls uit het antwoord. Als de stem-agent een
 *   navigatie-tool wil aanroepen (navigate_to_page / open_panel /
 *   scroll_to_section / highlight_element), schrijft hij een AgentNavigation-
 *   record naar de database. De useAgentNavigation-hook in de browser
 *   abonneert hierop en voert de actie real-time uit — buiten de gebroken
 *   client-tool pipeline om.
 *
 * Authenticatie: ElevenLabs stuurt de custom-llm api_key als
 *   `Authorization: Bearer <GIULIA_API_KEY>`; hier vergeleken.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Panel-key → pagina-route (voor open_panel navigatie).
const PANEL_ROUTES = {
  agenda: "/agenda", projects: "/projects", tasks: "/tasks",
  email: "/email", whatsapp: "/whatsapp", people: "/people",
  knowledge: "/knowledge", documents: "/documents", chat: "/",
  approvals: "/approvals", activity: "/activity", memory: "/memory",
  insights: "/insights", timetracker: "/timetracker", agents: "/agents",
  updates: "/updates", settings: "/settings", profile: "/profile",
  voice: "/voice", socialpulse: "/life/social-pulse", household: "/life/household",
  hobbies: "/life/hobbies", wantstoknow: "/wants-to-know",
  selfdailystate: "/self/daily-state", selfroutines: "/self/routines",
  selfjournal: "/self/journal",
};

const NAV_TOOLS = new Set(["navigate_to_page", "open_panel", "scroll_to_section", "highlight_element"]);

async function readText(res) {
  try { return await res.text(); } catch { return ""; }
}

/** Parst SSE-chunks en hert assembleert tool_calls (by index). */
function extractToolCalls(sseText) {
  const calls = {};
  for (const line of sseText.split("\n")) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") continue;
    try {
      const json = JSON.parse(data);
      const delta = json?.choices?.[0]?.delta;
      if (!delta?.tool_calls) continue;
      for (const tc of delta.tool_calls) {
        const idx = tc.index ?? 0;
        if (!calls[idx]) calls[idx] = { name: "", arguments: "" };
        if (tc.function?.name) calls[idx].name = tc.function.name;
        if (tc.function?.arguments) calls[idx].arguments += tc.function.arguments;
      }
    } catch { /* skip */ }
  }
  return Object.values(calls).filter((c) => c.name);
}

/** Vertaalt een navigatie-toolcall naar een AgentNavigation-record. */
function navRecordFromCall(name, args) {
  switch (name) {
    case "navigate_to_page":
      if (!args.page) return null;
      return { route: args.page, label: "Giulia opent pagina", source: "voice" };
    case "open_panel": {
      const panel = args.panelId || args.panel;
      if (!panel) return null;
      return {
        route: PANEL_ROUTES[panel] || "/",
        params: { panel },
        label: "Giulia opent paneel",
        source: "voice",
      };
    }
    case "scroll_to_section":
      if (!args.sectionId) return null;
      return { route: "/", params: { section: args.sectionId }, label: "Giulia scrollt", source: "voice" };
    case "highlight_element":
      if (!args.elementId) return null;
      return { route: "/", params: { element: args.elementId }, label: "Giulia wijst aan", source: "voice" };
    default:
      return null;
  }
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

    // ── Probeer keys in volgorde; bij 200 de SSE teruggeven ──
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

        // ── Navigatie-toolcalls uit de SSE halen → AgentNavigation ──
        // Workaround voor ElevenLabs bug #603: client-tools gedropt bij
        // voice-turns. We schrijven de intentie naar de DB; de browser
        // abonneert en voert uit. Non-blocking — stream gaat altijd terug.
        try {
          const toolCalls = extractToolCalls(text);
          const navRecords = [];
          for (const tc of toolCalls) {
            if (!NAV_TOOLS.has(tc.name)) continue;
            let args = {};
            try { args = JSON.parse(tc.arguments || "{}"); } catch {}
            const rec = navRecordFromCall(tc.name, args);
            if (rec) navRecords.push(rec);
          }
          if (navRecords.length) {
            const base44 = createClientFromRequest(req);
            await base44.asServiceRole.entities.AgentNavigation.bulkCreate(navRecords);
          }
        } catch { /* navigatie-mogging mag de stream nooit breken */ }

        return new Response(text, {
          status: 200,
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
        });
      }
      lastStatus = gRes.status;
      lastErr = await readText(gRes).catch(() => "");
      if (gRes.status >= 400 && gRes.status < 500 && gRes.status !== 401 && gRes.status !== 403 && gRes.status !== 429) {
        break;
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