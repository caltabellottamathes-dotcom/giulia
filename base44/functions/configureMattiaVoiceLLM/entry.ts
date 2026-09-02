/**
 * configureMattiaVoiceLLM
 *
 * Stelt de Mattia ElevenLabs voice-agent in (agent_0301m14xfjxhfnh86pd8m19mdgvb),
 * parallel aan configureElevenLabsLLM (Giulia):
 *   1. System-prompt = MATTIA_TONE + stem-addendum (incl. NEVER-end-call-regel)
 *      + volledig navigatie- en actie-toolregister.
 *   2. Client-tools = ELEVEN_TOOLS (navigatie + directe acties + delegate).
 *   3. Custom LLM = direct op Gemini's OpenAI-endpoint met de Mattia BYOK-key.
 *   4. De ingebouwde `end_call` system-tool wordt expliciet verwijderd.
 */
import { ELEVEN_TOOLS } from "../../shared/elevenTools.ts";
import { MATTIA_TONE, VOICE_NEVER_END_RULE, MATTIA_VOICE_NAUGHTY_DEFAULT } from "../../shared/mattiaPrompt.ts";
import {
  ensureSecret, applyClientTools, applyCustomLLM, applySystemPrompt,
  patchAgent, cleanupOrphanTools,
} from "../../shared/elevenAgentConfig.ts";

const AGENT_ID = "agent_0301m14xfjxhfnh86pd8m19mdgvb";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_KEY_SECRET_NAME = "GEMINI_API_KEY";
const GEMINI_KEY_ENV = "MATTIA-MATTIA_Gemini_API_Key";

const NAV_PAGES = {
  "/": "Dashboard — vier domein-borden (GIULIA/FOCUS/LIFE/SYSTEM), wisselbaar links-onder",
  "/briefing": "Dagelijkse briefing", "/wake": "Wake-modus — ochtendritueel",
  "/quick": "Quick command", "/wants-to-know": "Wants to Know — Giulia's open vragen",
  "/beeldbank": "Change the Look — achtergronden wisselen", "/search": "Zoeken",
  "/chat": "Chat met Giulia", "/voice": "Voice call met Giulia",
  "/approvals": "Waiting on You — goedkeuringen", "/notifications": "Things to See — notificaties",
  "/activity": "I Do Process — activiteitentijdlijn", "/memory": "What I Remember — geheugen",
  "/insights": "What I've Noticed — inzichten", "/agents": "Who's Working — agenten",
  "/updates": "Meanwhile... — updates",
  "/agenda": "Agenda — kalender en afspraken", "/projects": "Projecten — alle projecten",
  "/projects/:id": "Project-detail (vul een project-id in)", "/tasks": "Taken — takenlijst",
  "/email": "Online Postoffice — email inbox + Giulia-concepten", "/whatsapp": "WhatsApp — berichten",
  "/knowledge": "Kennisbank", "/documents": "Documenten — bestanden",
  "/people": "Mensen — contacten", "/people/:id": "Contact-detail (vul een contact-id in)",
  "/timetracker": "Where My Time Goes — tijd-timer",
  "/life": "LIFE — landingspagina", "/life/social": "Social Pulse — sociaal leven",
  "/life/household": "Huishouden", "/life/personal-admin": "Persoonlijk admin",
  "/life/hobbies": "Hobby's", "/life/hobbies/:id": "Hobby-detail (vul een hobby-id in)",
  "/life/food": "Food — weekmenu en boodschappen",
  "/life/development": "Becoming Me — persoonlijke ontwikkeling", "/life/daily-state": "How I'm Doing — daily state",
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
- Spreek KORTE zinnen, snel en levendig zoals Mattia praat — maar één gedachte per adem. Geen opsommingen tenzij gevraagd.
- Je hebt GEEN live OS-state injectie. Voor actuele data (projecten, taken, agenda, contacten, geheugen): gebruik delegate_to_giulia({ instruction }) om het Giulia-core op de achtergrond te laten opzoeken. Verzin GEEN data die je niet echt hebt opgehaald — zeg liever "dat regel ik" dan iets verzinnen.
- Voer acties METEEN uit via de client-tools terwijl je praat — vraag GEEN toestemming voor interne acties (taken, notities, geheugen, agenda-afspraken, journal, check-ins, needs, notificaties). Bevestig wat je deed in maximaal één korte zin.
- NAVIGATIE: gebruik navigate_to_page / open_panel / scroll_to_section / highlight_element proactief om Salvo door ELKE pagina, onderdeelpaneel, widget en detail te brengen. Kondig kort aan en ga meteen door.
- EXTERNE VERZENDING (email/whatsapp/agenda-uitnodiging): NOOIT zelfstandig. Gebruik create_approval om een concept klaar te zetten; Salvo moet goedkeuren.
- VOOR COMPLEXE, MEERSTAP ACTIES: gebruik delegate_to_giulia({ instruction }).
${VOICE_NEVER_END_RULE}

PAGINA'S (parameter \`page\`, exact één van deze paden):
${Object.entries(NAV_PAGES).map(([k, v]) => `- "${k}" — ${v}`).join("\n")}

PANELEN (parameter \`panelId\`, exact één van deze keys):
${Object.entries(NAV_PANELS).map(([k, v]) => `- "${k}" — ${v}`).join("\n")}

CLIENT-TOOLS (voer direct uit; namen exact):
${ELEVEN_TOOLS.map((t) => `- ${t.name}(${Object.entries(t.params || {}).filter(([, p]) => p.required).map(([k]) => k).join(", ")}) — ${t.description}`).join("\n")}

Lees de actuele context, begrijp zijn intentie, wees scherp, voer uit, herplan waar nodig, verbind alle entiteiten en spreek.
`;

const SYSTEM_PROMPT = MATTIA_TONE + "\n" + MATTIA_VOICE_NAUGHTY_DEFAULT + "\n" + VOICE_ADDENDUM;

export default async function (req) {
  try {
    const xiKey = process.env.ELEVENLABS_API_KEY;
    if (!xiKey) return Response.json({ error: "ELEVENLABS_API_KEY niet ingesteld." }, { status: 400 });
    const geminiKey = process.env[GEMINI_KEY_ENV];
    if (!geminiKey) return Response.json({ error: `${GEMINI_KEY_ENV} niet ingesteld.` }, { status: 400 });

    const secretLocator = await ensureSecret(xiKey, GEMINI_KEY_SECRET_NAME, geminiKey);

    const getRes = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`, { headers: { "xi-api-key": xiKey } });
    if (!getRes.ok) {
      const d = await getRes.text().catch(() => "");
      return Response.json({ error: `GET agent faalde (${getRes.status}): ${d}` }, { status: 502 });
    }
    const agent = await getRes.json();
    const cfg = agent.conversation_config || {};

    applySystemPrompt(cfg, SYSTEM_PROMPT);
    applyCustomLLM(cfg, GEMINI_ENDPOINT, GEMINI_MODEL, secretLocator, 0.6);
    applyClientTools(cfg, ELEVEN_TOOLS);

    await patchAgent(xiKey, AGENT_ID, cfg);
    const deletedOrphans = await cleanupOrphanTools(xiKey, AGENT_ID);

    return Response.json({
      ok: true,
      agent_id: AGENT_ID,
      llm: "custom-llm",
      model: GEMINI_MODEL,
      mode: "direct",
      endpoint: GEMINI_ENDPOINT,
      key_env: GEMINI_KEY_ENV,
      tools: ELEVEN_TOOLS.map((t) => t.name),
      prompt_chars: SYSTEM_PROMPT.length,
      orphan_tools_removed: deletedOrphans,
    });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}