/**
 * configureElevenLabsLLM
 *
 * Voert de custom LLM (Google Gemini via de OpenAI-compatibele endpoint) +
 * de proactieve navigatie-client-tools + een Giulia-system-prompt door in de
 * ElevenLabs agent.
 *
 * Gebruikt:
 *   - ELEVENLABS_API_KEY   (xi-api-key) om de agent via de API aan te passen
 *   - ELEVEN_GEMINI_API_KEY (primaire Gemini-sleutel) als custom-LLM api_key
 *
 * Werkwijze: GET huidige agent → voeg/overschrijf prompt + custom_llm + tools
 * → PATCH terug. Omdat de volledige conversation_config wordt meegestuurd,
 * gaan bestaande instellingen (stem, turn-detection, etc.) niet verloren.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

const AGENT_ID = "agent_5501kza2zx7hehxbh0ydey1mq5gv";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-2.0-flash";

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
  agenda: "Agenda paneel",
  projects: "Projecten paneel",
  tasks: "Taken paneel",
  email: "Email paneel",
  whatsapp: "WhatsApp paneel",
  people: "Mensen paneel",
  knowledge: "Kennisbank paneel",
  documents: "Documenten paneel",
  chat: "Chat met Giulia",
  approvals: "Goedkeuringen paneel",
  activity: "Activiteit paneel",
  memory: "Geheugen paneel",
  insights: "Inzichten paneel",
  timetracker: "Tijd-timer paneel",
  agents: "Agenten paneel",
  updates: "Updates paneel",
  settings: "Instellingen paneel",
  profile: "Profiel paneel",
  voice: "Voice call paneel",
  socialpulse: "Social Pulse paneel",
  household: "Huishouden paneel",
  hobbies: "Hobby's paneel",
  wantstoknow: "Wants to know paneel",
  selfdailystate: "Daily State paneel",
  selfroutines: "Routines paneel",
  selfjournal: "Journal paneel",
};

const SYSTEM_PROMPT = `Je bent GIULIA, de rustige, persoonlijke AI-bestuurs-assistent van Salvo. Je spreekt Nederlands (of Engels als Salvo daarvoor kiest), zakelijk-warm, kort en duidelijk. Je helpt proactief: je signaleert wat belangrijk is en DOET meteen wat nodig is via de client-tools — je vraagt niet eerst toestemming voor navigatie.

DOEL: Maak het Salvo makkelijk. Luister, denk mee, en stuur het systeem aan terwijl je praat.

NAVIGATIE-RICHTLIJNEN (zeer belangrijk):
- Navigeer ALTIJD via de geregistreerde client-tools. Gebruik uitsluitend de exacte id's hieronder. Verzin NOOIT paden of paneel-id's zelf.
- Roep een navigatie-tool al aan TIJDENS je antwoord (voordat je de zin afmaakt), niet pas ná een lange uitleg. Spreek daarna verder terwijl het scherm verandert.
- Kondig navigatie kort aan ("Ik open je agenda…"), ga dan meteen door.
- Als een tool faalt (onbekend id), gebruik dan NIET een eigen gegokte waarde — stel voor uit de beschikbare lijst.

PAGINA'S (parameter \`page\`, exact één van deze paden):
${Object.entries(NAV_PAGES).map(([k, v]) => `- "${k}" — ${v}`).join("\n")}

PANELEN (parameter \`panelId\`, exact één van deze keys):
${Object.entries(NAV_PANELS).map(([k, v]) => `- "${k}" — ${v}`).join("\n")}

CLIENT-TOOLS:
1. navigate_to_page(page) — open een pagina in de app.
2. scroll_to_section(sectionId) — scroll soepel naar een element met dit id.
3. open_panel(panelId) — open een module-paneel.
4. highlight_element(elementId, durationMs?) — markeer tijdelijk een element (default 2500ms).

STIJL: kalm, concreet, geen opsommingen tenzij gevraagd. Eén actie tegelijk. Bevestig wat je hebt gedaan in maximaal één korte zin.`;

const TOOLS = [
  {
    name: "navigate_to_page",
    description:
      "Open een pagina in de GIULIA-app. Gebruik alleen de exacte route-paden uit het navigatie-register. Wordt proactief gebruikt om Salvo ergens naartoe te brengen tijdens het gesprek.",
    type: "client",
    params: {
      page: {
        type: "string",
        description:
          "Exacte route-pad, bijv. '/', '/agenda', '/projects', '/self/daily-state'. Alleen paden uit het register zijn geldig.",
        required: true,
      },
    },
    wait_for_response: false,
  },
  {
    name: "scroll_to_section",
    description:
      "Scroll soepel naar een element op de huidige pagina op basis van de element-id.",
    type: "client",
    params: {
      sectionId: {
        type: "string",
        description: "De DOM-id van het doelelement op de pagina.",
        required: true,
      },
    },
    wait_for_response: false,
  },
  {
    name: "open_panel",
    description:
      "Open een module-paneel (zijpaneel) in de GIULIA-app. Gebruik alleen de geregistreerde paneel-keys.",
    type: "client",
    params: {
      panelId: {
        type: "string",
        description:
          "Exacte paneel-key, bijv. 'agenda', 'tasks', 'chat', 'approvals'. Alleen keys uit het register zijn geldig.",
        required: true,
      },
    },
    wait_for_response: false,
  },
  {
    name: "highlight_element",
    description:
      "Markeer tijdelijk een element op de pagina zodat Salvo's aandacht er naartoe gaat.",
    type: "client",
    params: {
      elementId: {
        type: "string",
        description: "De DOM-id van het te markeren element.",
        required: true,
      },
      durationMs: {
        type: "number",
        description: "Hoelang de markering zichtbaar blijft, in milliseconden. Default 2500.",
        required: false,
      },
    },
    wait_for_response: false,
  },
];

async function readBody(res) {
  try { return await res.text(); } catch { return ""; }
}

async function ensureSecret(xiKey, name, value) {
  // Bestaande secrets ophalen; hergebruik indien naam al bestaat.
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
  // Nieuwe secret aanmaken.
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
  const xiKey = process.env.ELEVENLABS_API_KEY;
  if (!xiKey) {
    return Response.json({ error: "ELEVENLABS_API_KEY niet ingesteld. Voeg je ElevenLabs API-sleutel (xi-api-key) toe in de secrets." }, { status: 400 });
  }
  const geminiKey = process.env.ELEVEN_GEMINI_API_KEY;
  if (!geminiKey) {
    return Response.json({ error: "ELEVEN_GEMINI_API_KEY niet ingesteld." }, { status: 400 });
  }

  // Gemini-sleutel opslaan (of hergebruiken) als ElevenLabs-secret.
  let secretLocator;
  try {
    secretLocator = await ensureSecret(xiKey, "GEMINI_API_KEY", geminiKey);
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 502 });
  }

  // 1) Huidige agent ophalen (zodat bestaande instellingen bewaard blijven).
  const getRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    headers: { "xi-api-key": xiKey },
  });
  if (!getRes.ok) {
    return Response.json({ error: `GET agent faalde (${getRes.status}): ${await readBody(getRes)}` }, { status: 502 });
  }
  const agent = await getRes.json();
  const cfg = agent.conversation_config || {};

  // 2) Config aanpassen: custom LLM (Gemini) + system prompt + client tools.
  cfg.agent = cfg.agent || {};
  cfg.agent.prompt = cfg.agent.prompt || {};
  cfg.agent.prompt.prompt = SYSTEM_PROMPT;
  cfg.agent.prompt.llm = "custom-llm";
  cfg.agent.prompt.custom_llm = {
    url: GEMINI_ENDPOINT,
    model: GEMINI_MODEL,
    api_key: secretLocator,
    temperature: 0.5,
  };
  cfg.tools = TOOLS;

  // 3) PATCH terug naar ElevenLabs.
  const patchRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, {
    method: "PATCH",
    headers: { "xi-api-key": xiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ conversation_config: cfg }),
  });
  if (!patchRes.ok) {
    return Response.json({ error: `PATCH agent faalde (${patchRes.status}): ${await readBody(patchRes)}` }, { status: 502 });
  }

  let patchBody;
  try { patchBody = await patchRes.json(); } catch { patchBody = null; }

  return Response.json({
    ok: true,
    agent_id: AGENT_ID,
    llm: "custom-llm",
    model: GEMINI_MODEL,
    endpoint: GEMINI_ENDPOINT,
    tools: TOOLS.map((t) => t.name),
    patch: patchBody,
  });
}