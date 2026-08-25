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
// Panel-key → pagina-route (volledige dekking, gesynchroniseerd met
// src/lib/voiceNavigation.js NAV_PANEL_ROUTES).
const PANEL_ROUTES = {
  chat: "/chat", voice: "/voice", goodmorning: "/wake", jedag: "/",
  wantstoknow: "/wants-to-know",
  approvals: "/approvals", notifications: "/notifications", activity: "/activity",
  memory: "/memory", insights: "/insights", agents: "/agents", updates: "/updates",
  agenda: "/agenda", projects: "/projects", tasks: "/tasks", email: "/email",
  whatsapp: "/whatsapp", knowledge: "/knowledge", documents: "/documents",
  people: "/people", timetracker: "/timetracker",
  social: "/life/social", household: "/life/household", personaladmin: "/life/personal-admin",
  hobbies: "/life/hobbies", food: "/life/food", dailystate: "/life/daily-state",
  development: "/life/development",
  integrations: "/integrations", settings: "/settings", profile: "/profile",
  imageviewer: "/", videoplayer: "/", musicplayer: "/", docviewer: "/",
};

/**
 * buildLiveSnapshot — haalt een compacte, actuele OS-state op (projecten,
 * taken, agenda, contacten, approvals, ongelezen mail/whatsapp, geheugen) en
 * retourneert deze als tekst. Wordt door de proxy als eerste system-message
 * in de Gemini-request geïnjecteerd, zodat de stem-agent elke beurt op de
 * hoogte is van de nieuwste data — "elke seconde up to date".
 */
async function buildLiveSnapshot(req) {
  let base44;
  try { base44 = createClientFromRequest(req); } catch { return null; }
  const sr = base44.asServiceRole;
  const [projects, tasks, events, contacts, approvals, emails, wa, memory] = await Promise.all([
    sr.entities.Project.list("-updated_date", 12).catch(() => []),
    sr.entities.Task.filter({ status: { $in: ["todo", "today", "in_progress", "waiting", "upcoming", "overdue"] } }, "-created_date", 12).catch(() => []),
    sr.entities.CalendarEvent.filter({ start: { $gte: new Date(Date.now() - 3600000).toISOString() } }, "start", 8).catch(() => []),
    sr.entities.Contact.list("-updated_date", 12).catch(() => []),
    sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
    sr.entities.Email.filter({ folder: "inbox", status: "unread" }).catch(() => []),
    sr.entities.WhatsAppMessage.filter({ status: "unread" }).catch(() => []),
    sr.entities.Memory.list("-created_date", 6).catch(() => []),
  ]);
  const lines = [
    "== LIVE OS-STATE (actueel, zojuist opgehaald) ==",
    `Tijdstip: ${new Date().toLocaleString("nl-NL")}`,
    `Projecten (${projects.length}): ${projects.map((p) => `${p.title}(${p.status},${p.progress || 0}%)`).join(", ") || "geen"}`,
    `Open taken (${tasks.length}): ${tasks.map((t) => `${t.title}[${t.status}]`).join(", ") || "geen"}`,
    `Agenda (${events.length}): ${events.map((e) => `${e.title} @ ${(e.start || "").slice(0, 16)}`).join(", ") || "geen"}`,
    `Contacten (${contacts.length}): ${contacts.map((c) => c.name).join(", ") || "geen"}`,
    `Wachtende approvals: ${approvals.length}`,
    `Ongelezen email: ${emails.length} · ongelezen WhatsApp: ${wa.length}`,
    `Geheugen: ${memory.map((m) => String(m.content).slice(0, 80)).join(" | ") || "leeg"}`,
    "Gebruik deze live data om Salvo direct en accuraat te informeren. Voor navigatie gebruik navigate_to_page / open_panel met de exacte id's uit je prompt.",
  ];
  return lines.join("\n");
}

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

    // Brede key-pool — de ElevenLabs-sleutels verlopen regelmatig. We proberen
    // ze in volgorde; bij 401/403/429/5xx valt de proxy door naar de volgende.
    // Eén werkende sleutel volstaat om het gesprek in stand te houden.
    const keys = [
      process.env.ELEVEN_GEMINI_API_KEY,
      process.env.ELEVEN_2_GEMINI_API_KEY,
      process.env.RESERVE_GEMINI_API_KEY,
      process.env.GEMINI_API_KEY,
      process.env.GIULIA_GIULIA_GEMINI_API_KEY,
    ].filter((k) => !!k);
    if (!keys.length) {
      return Response.json({ error: "geen Gemini API-sleutels geconfigureerd" }, { status: 500 });
    }

    // ── Body inlezen, stream forceren (ElevenLabs verwacht SSE) ──
    const raw = await readText(req);
    let payload;
    try { payload = raw ? JSON.parse(raw) : null; } catch { payload = null; }
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      payload.stream = true;
      // Forceer het werkende Gemini-model. Elf van de oude modelnamen
      // (gemini-1.5-flash, gemini-2.5-flash, …) retourneren 404 op deze
      // sleutels — dat brak elke LLM-turn en liet het gesprek na één
      // antwoord stilvallen. gemini-flash-latest is de enige die werkt.
      payload.model = "gemini-flash-latest";
      // Injecteer de live OS-snapshot als eerste system-message zodat de
      // stem-agent elke beurt op de hoogte is van de nieuwste data.
      try {
        const snapshot = await buildLiveSnapshot(req);
        if (snapshot && Array.isArray(payload.messages)) {
          payload.messages = [{ role: "system", content: snapshot }, ...payload.messages];
        }
      } catch { /* snapshot mag de stream nooit breken */ }
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
        // Stream de Gemini-SSE 1:1 en real-time door naar ElevenLabs — niet
        // bufferen. ElevenLabs verwacht een echte streaming response; als we
        // de hele body pas aan het eind in één keer teruggeven, breekt de
        // turn-timing en valt het gesprek na het eerste antwoord af.
        // Tegelijk vangen we de SSE-toolcalls op (navigatie-workaround bug
        // #603) in de flush — non-blocking, de stream gaat altijd door.
        const decoder = new TextDecoder();
        let sseBuffer = "";
        const transform = new TransformStream({
          transform(chunk, controller) {
            controller.enqueue(chunk);
            try { sseBuffer += decoder.decode(chunk, { stream: true }); } catch {}
          },
          flush() {
            try {
              sseBuffer += decoder.decode();
              const toolCalls = extractToolCalls(sseBuffer);
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
                base44.asServiceRole.entities.AgentNavigation.bulkCreate(navRecords).catch(() => {});
              }
            } catch { /* navigatie-mogging mag de stream nooit breken */ }
          },
        });
        return new Response(gRes.body.pipeThrough(transform), {
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