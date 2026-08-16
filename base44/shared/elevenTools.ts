/**
 * ELEVEN_TOOLS — alle client-tools die de ElevenLabs voice-agent kan
 * aanroepen. Deze schemas worden in de agent-config gepompt (cfg.tools).
 * De browser-side handlers staan in src/lib/voiceClientTools.js — de
 * namen MOETEN exact overeenkomen. Houd beide gesynchroniseerd.
 *
 * wait_for_response: false → fire-and-forget (navigatie), de agent praat door.
 * wait_for_response: true  → actie met resultaat dat de agent uitspreekt.
 */
export const ELEVEN_TOOLS = [
  // ── Navigatie (fire-and-forget) ──
  {
    name: "navigate_to_page",
    description: "Open een pagina in de GIULIA-app. Gebruik alleen exacte route-paden uit het navigatie-register. Proactief gebruikt om Salvo ergens naartoe te brengen tijdens het gesprek.",
    type: "client",
    params: {
      page: { type: "string", description: "Exact route-pad, bijv. '/', '/agenda', '/projects', '/self/daily-state'.", required: true },
    },
    wait_for_response: false,
  },
  {
    name: "scroll_to_section",
    description: "Scroll soepel naar een element op de huidige pagina op basis van de element-id.",
    type: "client",
    params: {
      sectionId: { type: "string", description: "De DOM-id van het doelelement.", required: true },
    },
    wait_for_response: false,
  },
  {
    name: "open_panel",
    description: "Open een module-paneel (zijpaneel) in de GIULIA-app. Gebruik alleen geregistreerde paneel-keys.",
    type: "client",
    params: {
      panelId: { type: "string", description: "Exacte paneel-key, bijv. 'agenda', 'tasks', 'chat', 'approvals'.", required: true },
    },
    wait_for_response: false,
  },
  {
    name: "highlight_element",
    description: "Markeer tijdelijk een element op de pagina zodat Salvo's aandacht er naartoe gaat.",
    type: "client",
    params: {
      elementId: { type: "string", description: "De DOM-id van het te markeren element.", required: true },
      durationMs: { type: "number", description: "Hoelang de markering zichtbaar blijft (ms). Default 2500.", required: false },
    },
    wait_for_response: false,
  },

  // ── Acties (direct, onmiddellijk) ──
  {
    name: "create_task",
    description: "Maak een nieuwe taak voor Salvo aan (FOCUS). Voer meteen uit — geen toestemming vragen. Bevestig in één zin.",
    type: "client",
    params: {
      title: { type: "string", description: "Korte taaktitel.", required: true },
      priority: { type: "string", description: "Prioriteit: low, medium of high.", required: false },
      deadline: { type: "string", description: "Deadline als ISO-datum (YYYY-MM-DD).", required: false },
      domain: { type: "string", description: "Domein: focus, life of self. Default focus.", required: false },
      project_id: { type: "string", description: "Optioneel gekoppeld project-id.", required: false },
    },
    wait_for_response: true,
  },
  {
    name: "update_task",
    description: "Update een bestaande taak (status of prioriteit). Gebruik status 'completed' om af te ronden.",
    type: "client",
    params: {
      task_id: { type: "string", description: "Id van de taak.", required: true },
      status: { type: "string", description: "Nieuwe status: todo, today, upcoming, in_progress, waiting, completed, archived.", required: false },
      priority: { type: "string", description: "Nieuwe prioriteit: low, medium, high.", required: false },
    },
    wait_for_response: true,
  },
  {
    name: "list_tasks",
    description: "Lijst van Salvo's taken (optioneel gefilterd op status). Gebruik om te zien wat er open staat.",
    type: "client",
    params: {
      status: { type: "string", description: "Optioneel filter op status, bijv. 'today' of 'todo'.", required: false },
    },
    wait_for_response: true,
  },
  {
    name: "create_event",
    description: "Maak een agenda-afspraak aan (CalendarEvent). Voor zakelijke afspraken domain='focus', voor sociale/persoonlijke domain='life', voor self domain='self'.",
    type: "client",
    params: {
      title: { type: "string", description: "Titel van de afspraak.", required: true },
      start: { type: "string", description: "Start als ISO date-time.", required: true },
      end: { type: "string", description: "Einde als ISO date-time.", required: false },
      domain: { type: "string", description: "focus, life of self. Default focus.", required: false },
      location: { type: "string", description: "Optionele locatie.", required: false },
    },
    wait_for_response: true,
  },
  {
    name: "save_note",
    description: "Sla een notitie op voor Salvo.",
    type: "client",
    params: {
      title: { type: "string", description: "Titel.", required: true },
      content: { type: "string", description: "Inhoud.", required: false },
    },
    wait_for_response: true,
  },
  {
    name: "save_memory",
    description: "Sla iets op in Giulia's langetermijngeheugen (Memory). Gebruik voor feiten, voorkeuren, beloftes die Salvo noemt.",
    type: "client",
    params: {
      content: { type: "string", description: "Wat je moet onthouden.", required: true },
      category: { type: "string", description: "Categorie: User preferences, People, Projects, Routines, Important information, Conversation-derived, Insights.", required: false },
    },
    wait_for_response: true,
  },
  {
    name: "add_journal",
    description: "Voeg een journal-entry toe (SELF → Journal). Voor een gedachte, moment of reflectie.",
    type: "client",
    params: {
      title: { type: "string", description: "Titel.", required: false },
      content: { type: "string", description: "Inhoud.", required: true },
      mood: { type: "string", description: "Optioneel stemming.", required: false },
    },
    wait_for_response: true,
  },
  {
    name: "log_self_check_in",
    description: "Log een SELF check-in van Salvo's huidige toestand.",
    type: "client",
    params: {
      state: { type: "string", description: "Staat: calm, charged, neutral, low of overwhelmed.", required: true },
      energy: { type: "number", description: "Energie 0-100.", required: false },
      capacity: { type: "number", description: "Capaciteit 0-100.", required: false },
      mood: { type: "string", description: "Stemming.", required: false },
      reflection: { type: "string", description: "Korte reflectie.", required: false },
    },
    wait_for_response: true,
  },
  {
    name: "add_self_need",
    description: "Sla een behoefte op als SelfNeed (met prioriteit/status) voor opvolging.",
    type: "client",
    params: {
      title: { type: "string", description: "De behoefte.", required: true },
      priority: { type: "string", description: "low, medium of high.", required: false },
      category: { type: "string", description: "Optionele categorie.", required: false },
    },
    wait_for_response: true,
  },
  {
    name: "notify_salvo",
    description: "Stuur een notificatie naar Salvo (pusht naar zijn telefoon). Voor vragen, plagerijen of meldingen over wat je deedt. Dit is GEEN taak en GEEN approval.",
    type: "client",
    params: {
      title: { type: "string", description: "Korte titel.", required: false },
      message: { type: "string", description: "Bericht.", required: true },
    },
    wait_for_response: true,
  },
  {
    name: "create_approval",
    description: "Zet een EXTERNE actie (email, whatsapp, agenda-uitnodiging) als concept klaar voor Salvo's goedkeuring. Verzend NOOIT zelfstandig. Bevestig dat het concept klaarstaat.",
    type: "client",
    params: {
      title: { type: "string", description: "Titel van de actie.", required: true },
      action_type: { type: "string", description: "Type actie, bijv. send_email, send_whatsapp, create_calendar_invite.", required: true },
      description: { type: "string", description: "Korte beschrijving van wat er verzonden wordt.", required: true },
      category: { type: "string", description: "urgent, communication, projects, intern of proactive. Default communication.", required: false },
      type: { type: "string", description: "email, whatsapp, calendar, task of file.", required: false },
      proposed_action: { type: "string", description: "De voorgestelde actie tekst.", required: false },
    },
    wait_for_response: true,
  },
  {
    name: "delegate_to_giulia",
    description: "Stuur een complexe, meerstap opdracht naar het Giulia-core function-calling loop (chatWithGiulia), dat alle entity-tools heeft en de database direct muteert. Gebruik voor alles wat niet met één enkele actie-tool af te handelen is (projecten beheren, hobby's koppelen, offertes voorbereiden, meerdere entiteiten tegelijk).",
    type: "client",
    params: {
      instruction: { type: "string", description: "De volledige opdracht in natuurlijke taal.", required: true },
    },
    wait_for_response: true,
  },
];

export const ELEVEN_TOOL_NAMES = ELEVEN_TOOLS.map((t) => t.name);