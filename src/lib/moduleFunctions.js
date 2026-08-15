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
  socialpulse: [
    { label: "Overview", to: "/life/social-pulse?tab=overview" },
    { label: "Relaties", to: "/life/social-pulse?tab=relationships" },
    { label: "Activiteit", to: "/life/social-pulse?tab=activity" },
    { label: "Momenten", to: "/life/social-pulse?tab=moments" },
    { label: "Patronen", to: "/life/social-pulse?tab=patterns" },
  ],
  socialplanner: [{ label: "Plannen", to: "/life/social-planner" }],
  household: [{ label: "Huishouden", to: "/life/household" }],
  personaladmin: [{ label: "Admin", to: "/life/personal-admin" }],
  hobbies: [{ label: "Hobby's", to: "/life/hobbies" }],
};