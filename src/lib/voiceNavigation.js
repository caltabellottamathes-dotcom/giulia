/**
 * Navigatie-register voor de ElevenLabs voice agent.
 * - ELEVEN_AGENT_ID: de agent zoals geconfigureerd in ElevenLabs.
 * - NAV_PAGES: route-paths die de `navigate_to_page` client-tool accepteert.
 * - NAV_PANELS: module-keys die `open_panel` accepteert (komen overeen met moduleRegistry).
 */
export const ELEVEN_AGENT_ID = "agent_5501kza2zx7hehxbh0ydey1mq5gv";

export const NAV_PAGES = {
  "/": "Dashboard — overzicht van de dag",
  "/agenda": "What's Happening? — kalender en afspraken",
  "/projects": "What I'm Building. — alle projecten",
  "/tasks": "To Do! — takenlijst",
  "/email": "Online Postoffice. — inbox",
  "/whatsapp": "Who's Texting? — berichten",
  "/people": "People Around Me. — contacten",
  "/knowledge": "What I Know.",
  "/documents": "Files to Share.",
  "/activity": "I Do Process! — tijdlijn",
  "/memory": "What I Remember.",
  "/insights": "What I've Noticed.",
  "/approvals": "Waiting on You.",
  "/briefing": "Briefing",
  "/updates": "Meanwhile...",
  "/life": "LIFE — landingspagina",
  "/life/social": "What Social Life?",
  "/life/household": "Reminders For Home.",
  "/life/personal-admin": "Things to Handle!",
  "/life/hobbies": "Things I Love.",
  "/life/development": "Becoming Me.",
  "/life/daily-state": "How I'm Doing.",
  "/beeldbank": "Change the Look!",
  "/timetracker": "Where My Time Goes.",
  "/settings": "Instellingen",
  "/profile": "Profiel",
};

export const NAV_PANELS = {
  agenda: "What's Happening? paneel",
  projects: "What I'm Building. paneel",
  tasks: "To Do! paneel",
  email: "Online Postoffice. paneel",
  whatsapp: "Who's Texting? paneel",
  people: "People Around Me. paneel",
  knowledge: "What I Know. paneel",
  documents: "Files to Share. paneel",
  chat: "Chat met Giulia",
  approvals: "Waiting on You. paneel",
  activity: "I Do Process! paneel",
  memory: "What I Remember. paneel",
  insights: "What I've Noticed. paneel",
  timetracker: "Where My Time Goes. paneel",
  agents: "Who's Working? paneel",
  updates: "Meanwhile... paneel",
  settings: "Instellingen paneel",
  profile: "Profiel paneel",
  voice: "Voice call paneel",
  socialpulse: "What Social Life? paneel",
  household: "Reminders For Home. paneel",
  hobbies: "Things I Love. paneel",
  wantstoknow: "Wants to Know! paneel",
  selfdailystate: "How I'm Doing. paneel",
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