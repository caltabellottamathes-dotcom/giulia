/**
 * configureElevenLabsLLM
 *
 * Stelt de ElevenLabs voice-agent in:
 *   1. System-prompt = volledige GIULIA-kennis (base44/shared/elevenPrompt.ts)
 *      + stem-addendum met volledig navigatie- en actie-toolregister.
 *   2. Client-tools = ELEVEN_TOOLS (navigatie + directe acties + delegate).
 *   3. Custom LLM = direct op Gemini's OpenAI-endpoint met één key.
 *      Navigatie en acties lopen via de client-tools (ELEVEN_TOOLS) in de
 *      browser — geen proxy, geen key-fallback, geen live-injectie.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { GIULIA_CORE_INSTRUCTIONS } from "../../shared/elevenPrompt.ts";
import { ELEVEN_TOOLS } from "../../shared/elevenTools.ts";
import { ensureSecret, readBody, toJsonSchema } from "../../shared/elevenConfig.ts";

const AGENT_ID = "agent_5501kza2zx7hehxbh0ydey1mq5gv";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-3.5-flash-lite";

// Volledige navigatie-dekking — exact de routes die in src/App.jsx
// geregistreerd staan (GIULIA, FOCUS, LIFE, SYSTEM + galleries/viewers).
// SELF is geen apart domein meer; zelfzorg leeft binnen LIFE.
// Dynamische detail-routes (/:id) staan als patroon — vul een echt id in.
const NAV_PAGES = {
  // GIULIA-kern
  "/": "Dashboard — vier domein-borden (GIULIA/FOCUS/LIFE/SYSTEM), wisselbaar links-onder",
  "/briefing": "Dagelijkse briefing", "/wake": "Wake-modus — ochtendritueel",
  "/quick": "Quick command", "/wants-to-know": "Wants to Know — Giulia's open vragen",
  "/beeldbank": "Change the Look — achtergronden wisselen", "/search": "Zoeken",
  "/chat": "Chat met Giulia", "/voice": "Voice call met Giulia",
  "/approvals": "Waiting on You — goedkeuringen", "/notifications": "Things to See — notificaties",
  "/activity": "I Do Process — activiteitentijdlijn", "/memory": "What I Remember — geheugen",
  "/insights": "What I've Noticed — inzichten", "/agents": "Who's Working — agenten",
  "/updates": "Meanwhile... — updates",
  // FOCUS
  "/agenda": "Agenda — kalender en afspraken", "/projects": "Projecten — alle projecten",
  "/projects/:id": "Project-detail (vul een project-id in)", "/tasks": "Taken — takenlijst",
  "/email": "Online Postoffice — email inbox + Giulia-concepten", "/whatsapp": "WhatsApp — berichten",
  "/knowledge": "Kennisbank", "/documents": "Documenten — bestanden",
  "/people": "Mensen — contacten", "/people/:id": "Contact-detail (vul een contact-id in)",
  "/timetracker": "Where My Time Goes — tijd-timer",
  // LIFE (inclusief zelfzorg)
  "/life": "LIFE — landingspagina", "/life/social": "Social Pulse — sociaal leven",
  "/life/household": "Huishouden", "/life/personal-admin": "Persoonlijk admin",
  "/life/hobbies": "Hobby's", "/life/hobbies/:id": "Hobby-detail (vul een hobby-id in)",
  "/life/food": "Food — weekmenu en boodschappen",
  "/life/development": "Becoming Me — persoonlijke ontwikkeling", "/life/daily-state": "How I'm Doing — daily state",
  // SYSTEM + galleries
  "/integrations": "Connectors — integraties", "/settings": "Instellingen", "/profile": "Profiel",
  "/widget-gallery": "Widget galerij", "/widget-gallery-2": "Widget galerij 2",
  "/widget-gallery-3": "Widget galerij 3", "/widget-gallery-4": "Widget galerij 4",
  "/graph-gallery": "Grafiek galerij", "/graph-gallery-2": "Grafiek galerij 2",
  "/UI-items": "UI items", "/widgets-giulia": "GIULIA widgets", "/widgets-focus": "FOCUS widgets",
  "/widgets-life": "LIFE widgets", "/shell-collection": "Shell collectie",
  "/panel-design": "Paneel-design", "/questions-panel": "Questions-paneel",
  "/life-gallery": "LIFE galerij", "/self-gallery": "Zelfzorg-galerij (legacy)",
};

const NAV_PANELS = {
  chat: "Chat met Giulia", voice: "Voice call paneel", goodmorning: "Good Morning! paneel",
  jedag: "What Matters? paneel (Je Dag)", wantstoknow: "Wants to Know! paneel",
  approvals: "Waiting on You. paneel", notifications: "Things to See. paneel",
  activity: "I Do Process! paneel", memory: "What I Remember. paneel",
  insights: "What I've Noticed. paneel", agents: "Who's Working? paneel", updates: "Meanwhile... paneel",
  agenda: "What's Happening? paneel", projects: "What I'm Building. paneel", tasks: "To Do! paneel",
  email: "Online Postoffice. paneel", whatsapp: "Who's Texting? paneel", knowledge: "What I Know. paneel",
  documents: "Files to Share. paneel", people: "People Around Me. paneel", timetracker: "Where My Time Goes. paneel",
  social: "What Social Life? paneel", household: "Reminders For Home. paneel", personaladmin: "Things to Handle! paneel",
  hobbies: "Things I Love. paneel", food: "What's for Dinner? paneel", dailystate: "How I'm Doing. paneel",
  development: "Becoming Me. paneel", integrations: "Integrations paneel", settings: "Settings paneel",
  profile: "Profile paneel", imageviewer: "Afbeeldingen-viewer", videoplayer: "Video-player",
  musicplayer: "Muziek-player", docviewer: "Document-viewer",
};

const VOICE_ADDENDUM = `
== STEM-MODUS (ElevenLabs voice agent) ==
Je bent nu actief als STEM-AGENT via ElevenLabs. Je praat met Salvo, je typt niet. Aanvullende regels:
- Spreek KORTE zinnen. Eén gedachte per adem. Geen opsommingen tenzij gevraagd.
- Je hebt GEEN live OS-state injectie. Voor actuele data (projecten, taken, agenda, contacten, geheugen): gebruik delegate_to_giulia({ instruction }) om het Giulia-core op de achtergrond te laten opzoeken. Verzin GEEN data die je niet echt hebt opgehaald — zeg liever "dat regel ik" dan iets verzinnen.
- Voer acties METEEN uit via de client-tools terwijl je praat — vraag GEEN toestemming voor interne acties (taken, notities, geheugen, agenda-afspraken, journal, check-ins, needs, notificaties). Bevestig wat je deed in maximaal één korte zin.
- NAVIGATIE: gebruik navigate_to_page / open_panel / scroll_to_section / highlight_element proactief om Salvo door ELKE pagina, onderdeelpaneel, widget en detail te brengen. Kondig het kort aan ("Ik open je agenda…") en ga meteen door. Je kent het volledige route-register hieronder.
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

    // Directe verbinding op Gemini's OpenAI-endpoint met één key. Geen proxy;
    // navigatie en acties lopen via de client-tools (ELEVEN_TOOLS) in de browser.
    // 1) Api-key secret: de enkele Gemini key.
    const secretLocator = await ensureSecret(xiKey, "GEMINI_API_KEY", geminiKey);

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
    cfg.agent.prompt.prompt = SYSTEM_PROMPT;
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
    cfg.agent.prompt.tools = ELEVEN_TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      type: t.type || "client",
      parameters: toJsonSchema(t.params),
      expects_response: !!t.wait_for_response,
    }));

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
      mode: "direct",
      endpoint: GEMINI_ENDPOINT,
      tools: ELEVEN_TOOLS.map((t) => t.name),
      prompt_chars: SYSTEM_PROMPT.length,
      nav_pages: Object.keys(NAV_PAGES).length,
      nav_panels: Object.keys(NAV_PANELS).length,
      orphan_tools_removed: deletedOrphans,
    });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}