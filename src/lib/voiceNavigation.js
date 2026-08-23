/**
 * Navigatie-register voor de ElevenLabs voice agent.
 * - ELEVEN_AGENT_ID: de agent zoals geconfigureerd in ElevenLabs.
 * - NAV_PAGES: route-paths die de `navigate_to_page` client-tool accepteert.
 * - NAV_PANELS: module-keys die `open_panel` accepteert (komen overeen met moduleRegistry).
 * - NAV_PANEL_ROUTES: panel-key → pagina-route (gebruikt door de proxy + browser).
 *
 * Volledige dekking: elke pagina, onderdeelpaneel, widget en viewer in de
 * hele app — GIULIA, FOCUS, LIFE, SELF en SYSTEM.
 */
export const ELEVEN_AGENT_ID = "agent_5501kza2zx7hehxbh0ydey1mq5gv";

export const NAV_PAGES = {
  // ── Dashboard & kern ──
  "/": "Dashboard — overzicht van de dag (vijf domein-borden)",
  "/briefing": "Dagelijkse briefing",
  "/wake": "Wake-modus — ochtendritueel",
  "/quick": "Quick command",
  "/wants-to-know": "Wants to Know — Giulia's open vragen",
  "/beeldbank": "Change the Look — achtergronden wisselen",
  "/search": "Zoeken",
  // ── GIULIA ──
  "/chat": "Chat met Giulia",
  "/voice": "Voice call met Giulia",
  "/approvals": "Waiting on You — goedkeuringen",
  "/notifications": "Things to See — notificaties",
  "/activity": "I Do Process — activiteitentijdlijn",
  "/memory": "What I Remember — geheugen",
  "/insights": "What I've Noticed — inzichten",
  "/agents": "Who's Working — agenten",
  "/updates": "Meanwhile... — updates",
  // ── FOCUS ──
  "/agenda": "What's Happening? — kalender en afspraken",
  "/projects": "What I'm Building. — alle projecten",
  "/tasks": "To Do! — takenlijst",
  "/email": "Online Postoffice — inbox",
  "/whatsapp": "Who's Texting? — berichten",
  "/knowledge": "What I Know. — kennisbank",
  "/documents": "Files to Share. — documenten",
  "/people": "People Around Me. — contacten",
  "/timetracker": "Where My Time Goes. — tijd-timer",
  // ── LIFE ──
  "/life": "LIFE — landingspagina",
  "/life/social": "What Social Life? — sociaal leven",
  "/life/household": "Reminders For Home — huishouden",
  "/life/personal-admin": "Things to Handle! — persoonlijk admin",
  "/life/hobbies": "Things I Love. — hobby's",
  "/life/food": "What's for Dinner? — food & weekmenu",
  "/life/development": "Becoming Me. — persoonlijke ontwikkeling",
  "/life/daily-state": "How I'm Doing. — daily state",
  // ── SYSTEM ──
  "/integrations": "Connectors — integraties",
  "/settings": "Instellingen",
  "/profile": "Profiel",
  // ── Galleries & collecties ──
  "/widget-gallery": "Widget galerij",
  "/widget-gallery-2": "Widget galerij 2",
  "/widget-gallery-3": "Widget galerij 3",
  "/widget-gallery-4": "Widget galerij 4",
  "/graph-gallery": "Grafiek galerij",
  "/graph-gallery-2": "Grafiek galerij 2",
  "/UI-items": "UI items",
  "/widgets-giulia": "GIULIA widgets",
  "/widgets-focus": "FOCUS widgets",
  "/shell-collection": "Shell collectie",
  // ── GlassAgenda suite ──
  "/glass": "GlassAgenda — home",
  "/glass/archief": "GlassAgenda — archief",
  "/glass/notitieblok": "GlassAgenda — notitieblok",
  "/glass/prioriteiten": "GlassAgenda — prioriteitenmatrix",
  "/glass/inspiratie": "GlassAgenda — inspiratiebord",
  "/glass/doelen": "GlassAgenda — doelendashboard",
  "/glass/briefing": "GlassAgenda — dagelijkse briefing",
  "/glass/dagplanning": "GlassAgenda — dagplanning",
  "/glass/focus": "GlassAgenda — focusmodus",
  "/glass/instellingen": "GlassAgenda — instellingen",
  "/glass/taak-details": "GlassAgenda — taakdetails",
  "/glass/vergader": "GlassAgenda — vergadernotities",
  "/glass/contacten": "GlassAgenda — contacten",
  "/glass/agenda": "GlassAgenda — agendaoverzicht",
  "/glass/taken": "GlassAgenda — takenoverzicht",
  "/glass/tijd": "GlassAgenda — tijdsregistratie",
  "/glass/week": "GlassAgenda — weekplanning",
  "/glass/projecten": "GlassAgenda — projecten",
  "/glass/statistieken": "GlassAgenda — statistieken",
  // ── GlassAgenda SELF ──
  "/glass/self": "GlassAgenda — SELF overzicht",
  "/glass/self/daily-state": "GlassAgenda — daily state",
  "/glass/self/routines": "GlassAgenda — routines",
  "/glass/self/wake": "GlassAgenda — wake",
  "/glass/self/therapy": "GlassAgenda — therapie",
  "/glass/self/journal": "GlassAgenda — journal",
  "/glass/self/development": "GlassAgenda — ontwikkeling",
  "/glass/self/personal-time": "GlassAgenda — persoonlijke tijd",
  "/glass/self/insights": "GlassAgenda — inzichten",
  "/glass/self/food": "GlassAgenda — food",
  // ── GlassAgenda modules ──
  "/glass/modules/taken": "GlassAgenda — taken module",
  "/glass/modules/email": "GlassAgenda — email module",
  "/glass/modules/notifications": "GlassAgenda — notificaties module",
  "/glass/modules/approvals": "GlassAgenda — approvals module",
  "/glass/modules/documents": "GlassAgenda — documents module",
  "/glass/modules/knowledge": "GlassAgenda — knowledge module",
  "/glass/modules/people": "GlassAgenda — people module",
  "/glass/modules/project-add": "GlassAgenda — project toevoegen",
  "/glass/modules/task-archive": "GlassAgenda — taakarchief",
  "/glass/modules/task-detail": "GlassAgenda — taakdetail",
  "/glass/modules/time-tracker": "GlassAgenda — time tracker",
  "/glass/modules/week": "GlassAgenda — weekweergave",
  "/glass/modules/whatsapp": "GlassAgenda — whatsapp module",
};

export const NAV_PANELS = {
  // ── Kern ──
  chat: "Chat met Giulia",
  voice: "Voice call paneel",
  goodmorning: "Good Morning! paneel",
  jedag: "What Matters? paneel (Je Dag)",
  wantstoknow: "Wants to Know! paneel",
  // ── Giulia ──
  approvals: "Waiting on You. paneel",
  notifications: "Things to See. paneel",
  activity: "I Do Process! paneel",
  memory: "What I Remember. paneel",
  insights: "What I've Noticed. paneel",
  agents: "Who's Working? paneel",
  updates: "Meanwhile... paneel",
  // ── Focus ──
  agenda: "What's Happening? paneel",
  projects: "What I'm Building. paneel",
  tasks: "To Do! paneel",
  email: "Online Postoffice. paneel",
  whatsapp: "Who's Texting? paneel",
  knowledge: "What I Know. paneel",
  documents: "Files to Share. paneel",
  people: "People Around Me. paneel",
  timetracker: "Where My Time Goes. paneel",
  // ── Life ──
  social: "What Social Life? paneel",
  household: "Reminders For Home. paneel",
  personaladmin: "Things to Handle! paneel",
  hobbies: "Things I Love. paneel",
  food: "What's for Dinner? paneel",
  dailystate: "How I'm Doing. paneel",
  development: "Becoming Me. paneel",
  // ── System ──
  integrations: "Integrations paneel",
  settings: "Settings paneel",
  profile: "Profile paneel",
  // ── Viewers ──
  imageviewer: "Afbeeldingen-viewer",
  videoplayer: "Video-player",
  musicplayer: "Muziek-player",
  docviewer: "Document-viewer",
};

/** Panel-key → pagina-route (gebruikt door de proxy + browser-navigatie). */
export const NAV_PANEL_ROUTES = {
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

/** Korte, door komma's gescheiden lijst voor de system-prompt van de agent. */
export const NAV_PROMPT_SUMMARY = `
Navigeer ALTIJD via de geregistreerde client-tools en gebruik uitsluitend deze exacte id's.

PAGINA'S (geef de ` + "`page`" + ` parameter exact één van deze paden):
${Object.entries(NAV_PAGES).map(([k, v]) => `- "${k}" — ${v}`).join("\n")}

PANELEN (geef de ` + "`panelId`" + ` parameter exact één van deze keys):
${Object.entries(NAV_PANELS).map(([k, v]) => `- "${k}" — ${v}`).join("\n")}
`;