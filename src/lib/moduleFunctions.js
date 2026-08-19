/**
 * Per-module function summaries. Each entry is a clear text label that links
 * to the corresponding page/section. Shown under the large panel name when a
 * module panel is open. Every `to` is a real route — clicking closes the panel.
 */
export const MODULE_FUNCTIONS = {
  agenda: [
    { label: "Agenda", to: "/agenda" },
    { label: "Weekplanning", to: "/planning" },
    { label: "Tijdtracker", to: "/timetracker" },
  ],
  projects: [
    { label: "Projecten", to: "/projects" },
    { label: "Taken", to: "/tasks" },
    { label: "Mensen", to: "/people" },
  ],
  tasks: [
    { label: "Taken", to: "/tasks" },
    { label: "Projecten", to: "/projects" },
    { label: "Goedkeuringen", to: "/approvals" },
    { label: "Tijdtracker", to: "/timetracker" },
  ],
  email: [{ label: "Postvak", to: "/email" }],
  whatsapp: [{ label: "Gesprekken", to: "/whatsapp" }],
  knowledge: [{ label: "Kennisbank", to: "/knowledge" }],
  documents: [{ label: "Documenten", to: "/documents" }],
  people: [{ label: "Mensen", to: "/people" }],
  approvals: [{ label: "Goedkeuringen", to: "/approvals" }],
  activity: [{ label: "Activiteit", to: "/activity" }],
  memory: [{ label: "Geheugen", to: "/memory" }],
  insights: [{ label: "Inzichten", to: "/insights" }],
  timetracker: [{ label: "Tijdtracker", to: "/timetracker" }],
  agents: [{ label: "Agenten", to: "/agents" }],
  chat: [{ label: "Gesprek met Giulia", to: "/chat" }],
  voice: [{ label: "Voice", to: "/voice" }],
  settings: [{ label: "Instellingen", to: "/settings" }],
  profile: [{ label: "Profiel", to: "/profile" }],
  integrations: [{ label: "Integraties", to: "/integrations" }],
  updates: [{ label: "Wat er nieuw is", to: "/updates" }],
  goodmorning: [{ label: "Wake Mode", to: "/wake" }],
  social: [
    { label: "Pulse", to: "/life/social?view=pulse" },
    { label: "Planner", to: "/life/social?view=planner" },
    { label: "Persoonlijke Tijd", to: "/life/social?view=personal-time" },
  ],
  household: [
    { label: "Overview", to: "/life/household?tab=overview" },
    { label: "Routines", to: "/life/household?tab=routines" },
    { label: "Boodschappen", to: "/life/household?tab=shopping" },
    { label: "Onderhoud", to: "/life/household?tab=maintenance" },
    { label: "Huishouden", to: "/life/household?tab=household" },
  ],
  personaladmin: [
    { label: "Overview", to: "/life/personal-admin?tab=overview" },
    { label: "Geld", to: "/life/personal-admin?tab=money" },
    { label: "Documenten", to: "/life/personal-admin?tab=documents" },
    { label: "Verlengingen", to: "/life/personal-admin?tab=renewals" },
    { label: "Verplichtingen", to: "/life/personal-admin?tab=obligations" },
    { label: "Open", to: "/life/personal-admin?tab=open" },
  ],
  hobbies: [{ label: "Hobby's", to: "/life/hobbies" }],
  wantstoknow: [
    { label: "Wants to know", to: "/wants-to-know" },
    { label: "Geheugen", to: "/memory" },
    { label: "Inzichten", to: "/insights" },
  ],
  jedag: [
    { label: "Je dag", to: "/agenda" },
    { label: "Briefing", to: "/briefing" },
  ],
  dailystate: [
    { label: "Daily State", to: "/life/daily-state" },
  ],
  development: [
    { label: "Development", to: "/life/development" },
    { label: "Therapy", to: "/life/development?tab=therapy" },
  ],
};