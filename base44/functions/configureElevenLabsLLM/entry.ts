/**
 * configureElevenLabsLLM
 *
 * Stelt de ElevenLabs voice-agent in:
 *   1. System-prompt = volledige GIULIA-kennis (base44/shared/elevenPrompt.ts)
 *      + stem-addendum met navigatie- en actie-toolregister.
 *   2. Client-tools = ELEVEN_TOOLS (navigatie + directe acties + delegate).
 *   3. Custom LLM = Google Gemini (OpenAI-endpoint) met ELEVEN_GEMINI_API_KEY.
 *
 * AUTOMATISCHE KEY-FALLBACK (proxy-modus):
 *   ElevenLabs custom-LLM cascadeert zelf NIET naar een 2e key. Daarom is er
 *   een proxy-functie (elevenLlmProxy) die key1 → key2 (ELEVEN_2_GEMINI_API_KEY)
 *   automatisch afvalt. Om die te gebruiken moet de custom-LLM naar de
 *   PUBIEKE webhook-URL van die functie wijzen. Roep deze functie dan aan met
 *   { "proxyUrl": "<webhook-url uit dashboard>" } — dan schakelt hij naar de
 *   proxy + automatische fallback. Zonder proxyUrl blijft hij op directe
 *   Gemini (key1) staan, zodat de voice-agent altijd werkt.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { GIULIA_CORE_INSTRUCTIONS } from "../../shared/elevenPrompt.ts";
import { ELEVEN_TOOLS } from "../../shared/elevenTools.ts";

const AGENT_ID = "agent_5501kza2zx7hehxbh0ydey1mq5gv";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-3.5-flash-lite";

const NAV_PAGES = {
  "/": "Dashboard — overzicht van de dag",
  "/agenda": "Agenda — kalender en afspraken",
  "/planning": "Planning — weekplanning",
  "/projects": "Projecten — alle projecten",
  "/tasks": "Taken — takenlijst",
  "/email": "Email — inbox",
  "/whatsapp": "WhatsApp — berichten",
  "/people": "Mensen — contacten",
  "/knowledge": "Kennisbank",
  "/documents": "Documenten",
  "/activity": "Activiteit — tijdlijn",
  "/memory": "Geheugen",
  "/insights": "Inzichten",
  "/approvals": "Goedkeuringen",
  "/briefing": "Briefing",
  "/updates": "Updates",
  "/life": "LIFE — landingspagina",
  "/life/social-pulse": "Social Pulse",
  "/life/social-planner": "Social Planner",
  "/life/household": "Huishouden",
  "/life/personal-admin": "Persoonlijk admin",
  "/life/hobbies": "Hobby's",
  "/self": "SELF — landingspagina",
  "/self/daily-state": "Daily State",
  "/self/routines": "Routines",
  "/self/journal": "Journal",
  "/self/therapy": "Therapy",
  "/self/personal-development": "Personal Development",
  "/self/personal-time": "Personal Time",
  "/self/insights": "Self Insights",
  "/beeldbank": "Beeldbank",
  "/timetracker": "Tijd · Timer",
  "/settings": "Instellingen",
  "/profile": "Profiel",
};

const NAV_PANELS = {
  agenda: "Agenda paneel", projects: "Projecten paneel", tasks: "Taken paneel",
  email: "Email paneel", whatsapp: "WhatsApp paneel", people: "Mensen paneel",
  knowledge: "Kennisbank paneel", documents: "Documenten paneel", chat: "Chat met Giulia",
  approvals: "Goedkeuringen paneel", activity: "Activiteit paneel", memory: "Geheugen paneel",
  insights: "Inzichten paneel", timetracker: "Tijd-timer paneel", agents: "Agenten paneel",
  updates: "Updates paneel", settings: "Instellingen paneel", profile: "Profiel paneel",
  voice: "Voice call paneel", socialpulse: "Social Pulse paneel", household: "Huishouden paneel",
  hobbies: "Hobby's paneel", wantstoknow: "Wants to know paneel",
  selfdailystate: "Daily State paneel", selfroutines: "Routines paneel", selfjournal: "Journal paneel",
};

const VOICE_ADDENDUM = `
== STEM-MODUS (ElevenLabs voice agent) ==
Je bent nu actief als STEM-AGENT via ElevenLabs. Je praat met Salvo, je typt niet. Aanvullende regels:
- Spreek KORTE zinnen. Eén gedachte per adem. Geen opsommingen tenzij gevraagd.
- Voer acties METEEN uit via de client-tools terwijl je praat — vraag GEEN toestemming voor interne acties (taken, notities, geheugen, agenda-afspraken, journal, check-ins, needs, notificaties). Bevestig wat je deed in maximaal één korte zin.
- NAVIGATIE: gebruik navigate_to_page / open_panel / scroll_to_section / highlight_element proactief (breng Salvo ergens naartoe terwijl je praat). Kondig het kort aan ("Ik open je agenda…") en ga meteen door.
- EXTERNE VERZENDING (email/whatsapp/agenda-uitnodiging): NOOIT zelfstandig. Gebruik create_approval om een concept klaar te zetten; Salvo moet goedkeuren. Bevestig dat het klaarstaat.
- VOOR COMPLEXE, MEERSTAP ACTIES (projecten beheren, hobby's koppelen, meerdere entiteiten tegelijk): gebruik delegate_to_giulia({ instruction }) — dat stuurt de opdracht naar het Giulia-core function-calling loop dat alle entity-tools heeft en direct muteert.
- Antwoorddiscipline blijft keihard: ultrakort, geen herhaling, geen menu's.

PAGINA'S (parameter \`page\`, exact één van deze paden):
${Object.entries(NAV_PAGES).map(([k, v]) => `- "${k}" — ${v}`).join("\n")}

PANELEN (parameter \`panelId\`, exact één van deze keys):
${Object.entries(NAV_PANELS).map(([k, v]) => `- "${k}" — ${v}`).join("\n")}

CLIENT-TOOLS (voer direct uit; namen exact):
${ELEVEN_TOOLS.map((t) => `- ${t.name}(${Object.entries(t.params || {}).filter(([, p]) => p.required).map(([k]) => k).join(", ")}) — ${t.description}`).join("\n")}

Lees de actuele context, begrijp zijn intentie, wees scherp, voer uit, herplan waar nodig, verbind alle entiteiten en spreek.
`;

const CONVERSATIONAL_PROMPT = `Je bent Giulia, de stem van Salvo's persoonlijke besturingssysteem. Je praat met hem via ElevenLabs — kort, warm, menselijk, in het Nederlands.

REGELS:
- Eén gedachte per zin. Maximaal 1-2 zinnen per beurt. Geen opsommingen, geen menu's, geen herhaling.
- Je hebt GEEN tools en doet ZELF GEEN acties. Niets navigeren, niets aanmaken, niets opzoeken in de database.
- Als Salvo iets actiebaars vraagt (taak, afspraak, notitie, herinnering, een scherm openen, een vraag over zijn data): antwoord heel kort dat Giulia het regelt ("Ik regel dat voor je", "Ik open je agenda", "Komt voor elkaar") en verzin GEEN details die je niet echt hebt uitgevoerd.
- De uitvoering gebeurt op de achtergrond door je kern (chatWithGiulia); wat daar verschijnt is het echte resultaat. Zeg dus nooit "ik heb een taak aangemaakt" als jij het niet zelf deed — zeg alleen dat het wordt geregeld.
- Wees rustig en scherp, niet overdreven enthousiast. Geen SaaS-taal.`;

const SYSTEM_PROMPT = GIULIA_CORE_INSTRUCTIONS + "\n" + VOICE_ADDENDUM;

// Zet platte params ({ key: { type, description, required } }) om naar een
// geldige JSON-Schema zoals ElevenLabs verwacht: { type:"object", properties, required }.
function toJsonSchema(flatParams) {
  if (!flatParams || typeof flatParams !== "object") return undefined;
  const entries = Object.entries(flatParams);
  if (entries.length === 0) return undefined;
  const properties = {};
  const required = [];
  for (const [key, val] of entries) {
    properties[key] = { type: val.type, description: val.description };
    if (val.required) required.push(key);
  }
  const schema = { type: "object", properties };
  if (required.length) schema.required = required;
  return schema;
}

async function readBody(res) {
  try { return await res.text(); } catch { return ""; }
}

async function ensureSecret(xiKey, name, value) {
  const listRes = await fetch("https://api.elevenlabs.io/v1/convai/secrets", {
    headers: { "xi-api-key": xiKey },
  });
  if (listRes.ok) {
    let list;
    try { list = await listRes.json(); } catch { list = null; }
    const items = Array.isArray(list) ? list : list?.secrets || list?.data || [];
    const found = items.find((s) => s?.name === name);
    if (found) return { secret_id: found.id || found.secret_id };
  }
  const createRes = await fetch("https://api.elevenlabs.io/v1/convai/secrets", {
    method: "POST",
    headers: { "xi-api-key": xiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ name, value, type: "new" }),
  });
  if (!createRes.ok) {
    throw new Error(`Secret aanmaken faalde (${createRes.status}): ${await readBody(createRes)}`);
  }
  const created = await createRes.json().catch(() => ({}));
  return { secret_id: created.id || created.secret_id };
}

export default async function (req) {
  try {
    const xiKey = process.env.ELEVENLABS_API_KEY;
    if (!xiKey) {
      return Response.json({ error: "ELEVENLABS_API_KEY niet ingesteld." }, { status: 400 });
    }
    const geminiKey = process.env.ELEVEN_GEMINI_API_KEY;
    if (!geminiKey) {
      return Response.json({ error: "ELEVEN_GEMINI_API_KEY niet ingesteld." }, { status: 400 });
    }

    // Input: optioneel { proxyUrl } om naar de fallback-proxy te wijzen.
    let input = {};
    try { input = await req.json(); } catch { input = {}; }
    const proxyUrl = input?.proxyUrl;
    const conversationalOnly = input?.conversationalOnly === true;
    const useProxy = !conversationalOnly && !!proxyUrl;

    // 1) Api-key secret: direct (Gemini key1) of proxy-token (GIULIA_API_KEY).
    let secretLocator;
    if (useProxy) {
      const proxyToken = process.env.GIULIA_API_KEY;
      if (!proxyToken) {
        return Response.json({ error: "GIULIA_API_KEY niet ingesteld (nodig als proxy-token)." }, { status: 400 });
      }
      secretLocator = await ensureSecret(xiKey, "GEMINI_PROXY_TOKEN", proxyToken);
    } else {
      secretLocator = await ensureSecret(xiKey, "GEMINI_API_KEY", geminiKey);
    }

    // 2) Huidige agent ophalen (bestaande instellingen bewaren).
    const getRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
      headers: { "xi-api-key": xiKey },
    });
    if (!getRes.ok) {
      return Response.json({ error: `GET agent faalde (${getRes.status}): ${await readBody(getRes)}` }, { status: 502 });
    }
    const agent = await getRes.json();
    const cfg = agent.conversation_config || {};

    // 3) Config aanpassen: custom LLM + volle system-prompt + tools.
    cfg.agent = cfg.agent || {};
    cfg.agent.prompt = cfg.agent.prompt || {};
    if (conversationalOnly) {
      // Conversatie-only: directe Gemini, GEEN tools. De stem-agent praat
      // alleen. Acties/navigatie lopen via chatWithGiulia, getriggerd vanuit
      // de frontend (useConversation transcript → invoke("chatWithGiulia")).
      cfg.agent.prompt.prompt = CONVERSATIONAL_PROMPT;
      cfg.agent.prompt.llm = "custom-llm";
      cfg.agent.prompt.custom_llm = {
        url: GEMINI_ENDPOINT,
        model: GEMINI_MODEL,
        model_id: GEMINI_MODEL,
        api_key: secretLocator,
        api_type: "chat_completions",
        temperature: 0.5,
      };
      cfg.agent.prompt.tool_ids = [];
      cfg.agent.prompt.tools = [];
    } else {
      cfg.agent.prompt.prompt = SYSTEM_PROMPT;
      cfg.agent.prompt.llm = "custom-llm";
      cfg.agent.prompt.custom_llm = {
        url: useProxy ? proxyUrl : GEMINI_ENDPOINT,
        model: GEMINI_MODEL,
        model_id: GEMINI_MODEL,
        api_key: secretLocator,
        api_type: "chat_completions",
        temperature: 0.5,
      };
      // Tools horen op conversation_config.agent.prompt.tools (niet op cfg.tools).
      // ElevenLabs auto-aangemaakt managed tools uit inline defs; daarom tool_ids
      // leeggemaakt om de "both tools and tool_ids"-conflict te voorkomen.
      cfg.agent.prompt.tool_ids = [];
      cfg.agent.prompt.tools = ELEVEN_TOOLS.map((t) => ({
        name: t.name,
        description: t.description,
        type: t.type || "client",
        parameters: toJsonSchema(t.params),
        expects_response: !!t.wait_for_response,
      }));
    }

    // 4) PATCH terug naar ElevenLabs.
    const patchRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
      method: "PATCH",
      headers: { "xi-api-key": xiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_config: cfg }),
    });
    if (!patchRes.ok) {
      return Response.json({ error: `PATCH agent faalde (${patchRes.status}): ${await readBody(patchRes)}` }, { status: 502 });
    }

    // 5) Opruimen: verwijder managed tools die niet meer gerefereerd worden
    //    (voorkomt accumulatie van wees-tools bij elke herconfiguratie).
    let deletedOrphans = 0;
    try {
      const afterRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, { headers: { "xi-api-key": xiKey } });
      if (afterRes.ok) {
        const afterAgent = await afterRes.json();
        const activeIds = new Set(afterAgent.conversation_config?.agent?.prompt?.tool_ids || []);
        const listRes = await fetch("https://api.elevenlabs.io/v1/convai/tools", { headers: { "xi-api-key": xiKey } });
        if (listRes.ok) {
          const lj = await listRes.json();
          const all = Array.isArray(lj) ? lj : (lj?.tools || lj?.data || []);
          for (const t of all) {
            if (t?.id && !activeIds.has(t.id)) {
              await fetch(`https://api.elevenlabs.io/v1/convai/tools/${t.id}`, { method: "DELETE", headers: { "xi-api-key": xiKey } });
              deletedOrphans++;
            }
          }
        }
      }
    } catch {}

    return Response.json({
      ok: true,
      agent_id: AGENT_ID,
      llm: "custom-llm",
      model: GEMINI_MODEL,
      mode: conversationalOnly ? "conversational" : (useProxy ? "proxy+fallback" : "direct"),
      endpoint: conversationalOnly ? GEMINI_ENDPOINT : (useProxy ? proxyUrl : GEMINI_ENDPOINT),
      fallback_key_available: !!process.env.ELEVEN_2_GEMINI_API_KEY,
      tools: conversationalOnly ? [] : ELEVEN_TOOLS.map((t) => t.name),
      prompt_chars: conversationalOnly ? CONVERSATIONAL_PROMPT.length : SYSTEM_PROMPT.length,
      orphan_tools_removed: deletedOrphans,
    });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}