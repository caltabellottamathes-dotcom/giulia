/**
 * Navigatie-register voor de ElevenLabs voice agent.
 * - ELEVEN_AGENT_ID: de agent zoals geconfigureerd in ElevenLabs.
 * - NAV_PAGES: route-paths die de `navigate_to_page` client-tool accepteert.
 * - NAV_PANELS: module-keys die `open_panel` accepteert (komen overeen met moduleRegistry).
 */
export const ELEVEN_AGENT_ID = "agent_5501kza2zx7hehxbh0ydey1mq5gv";

export const NAV_PAGES = {
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
  "/life/social": "Social",
  "/life/household": "Huishouden",
  "/life/personal-admin": "Persoonlijk admin",
  "/life/hobbies": "Hobby's",
  "/life/development": "Development",
  "/life/daily-state": "Daily State",
  "/beeldbank": "Beeldbank",
  "/timetracker": "Tijd · Timer",
  "/settings": "Instellingen",
  "/profile": "Profiel",
};

export const NAV_PANELS = {
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

/** Korte, door komma's gescheiden lijst voor de system-prompt van de agent. */
export const NAV_PROMPT_SUMMARY = `
Navigeer ALTIJD via de geregistreerde client-tools en gebruik uitsluitend deze exacte id's.

PAGINA'S (geef de ` + "`page`" + ` parameter exact één van deze paden):
${Object.entries(NAV_PAGES).map(([k, v]) => `- "${k}" — ${v}`).join("\n")}

PANELEN (geef de ` + "`panelId`" + ` parameter exact één van deze keys):
${Object.entries(NAV_PANELS).map(([k, v]) => `- "${k}" — ${v}`).join("\n")}
`;