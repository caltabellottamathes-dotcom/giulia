/**
 * Per-module function summaries. Each entry is a clear text label that links
 * to the corresponding page/section. Shown under the large panel name when a
 * module panel is open.
 */
export const MODULE_FUNCTIONS = {
  agenda: [
    { label: "Agenda overzicht", to: "/agenda" },
    { label: "Vandaag", to: "/agenda" },
    { label: "Weekplanning", to: "/planning" },
    { label: "Afspraak toevoegen", to: "/agenda" },
  ],
  projects: [
    { label: "Projecten", to: "/projects" },
    { label: "Nieuw project", to: "/projects" },
    { label: "Takenbord", to: "/tasks" },
    { label: "Mijlpalen", to: "/projects" },
  ],
  tasks: [
    { label: "Taken", to: "/tasks" },
    { label: "Projecten", to: "/projects" },
    { label: "Goedkeuringen", to: "/approvals" },
  ],
  email: [
    { label: "Postvak", to: "/email" },
    { label: "Concepten", to: "/email" },
    { label: "Giulia concepten", to: "/email" },
  ],
  whatsapp: [
    { label: "Gesprekken", to: "/whatsapp" },
    { label: "Concepten", to: "/whatsapp" },
  ],
  knowledge: [
    { label: "Kennisbank", to: "/knowledge" },
    { label: "Notities", to: "/knowledge" },
  ],
  documents: [
    { label: "Documenten", to: "/documents" },
    { label: "Uploads", to: "/documents" },
  ],
  people: [
    { label: "Mensen", to: "/people" },
    { label: "Relaties", to: "/people" },
  ],
  approvals: [
    { label: "Goedkeuringen", to: "/approvals" },
    { label: "Activering", to: "/approvals" },
  ],
  activity: [
    { label: "Activiteit", to: "/activity" },
    { label: "Tijdlijn", to: "/activity" },
  ],
  memory: [
    { label: "Geheugen", to: "/memory" },
    { label: "Context", to: "/memory" },
  ],
  insights: [
    { label: "Inzichten", to: "/insights" },
    { label: "Kansen", to: "/insights" },
  ],
  chat: [{ label: "Gesprek met Giulia", to: "/chat" }],
  voice: [{ label: "Voice", to: "/voice" }],
  settings: [{ label: "Instellingen", to: "/settings" }],
  profile: [{ label: "Profiel", to: "/profile" }],
  integrations: [{ label: "Integraties", to: "/integrations" }],
};