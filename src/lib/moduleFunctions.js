/**
 * Per-module function summaries. Each entry is a clear text label that links
 * to the corresponding page/section. Shown under the large panel name when a
 * module panel is open. Every `to` is a real route — clicking closes the panel.
 */
export const MODULE_FUNCTIONS = {
  agenda: [
    { label: "What's Happening?", to: "/agenda" },
    { label: "Weekplanning", to: "/planning" },
    { label: "Where My Time Goes.", to: "/timetracker" },
  ],
  projects: [
    { label: "What I'm Building.", to: "/projects" },
    { label: "To Do!", to: "/tasks" },
    { label: "People Around Me.", to: "/people" },
  ],
  tasks: [
    { label: "To Do!", to: "/tasks" },
    { label: "What I'm Building.", to: "/projects" },
    { label: "Waiting on You.", to: "/approvals" },
    { label: "Where My Time Goes.", to: "/timetracker" },
  ],
  email: [{ label: "Postvak", to: "/email" }],
  whatsapp: [{ label: "Gesprekken", to: "/whatsapp" }],
  knowledge: [{ label: "What I Know.", to: "/knowledge" }],
  documents: [{ label: "Documents", to: "/documents" }],
  people: [{ label: "People Around Me.", to: "/people" }],
  approvals: [{ label: "Waiting on You.", to: "/approvals" }],
  activity: [{ label: "I Do Process!", to: "/activity" }],
  memory: [{ label: "What I Remember.", to: "/memory" }],
  insights: [{ label: "What I've Noticed.", to: "/insights" }],
  timetracker: [{ label: "Where My Time Goes.", to: "/timetracker" }],
  agents: [{ label: "Who's Working?", to: "/agents" }],
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
    { label: "Reminders For Home.", to: "/life/household?tab=household" },
  ],
  personaladmin: [
    { label: "Overview", to: "/life/personal-admin?tab=overview" },
    { label: "Geld", to: "/life/personal-admin?tab=money" },
    { label: "Documenten", to: "/life/personal-admin?tab=documents" },
    { label: "Verlengingen", to: "/life/personal-admin?tab=renewals" },
    { label: "Verplichtingen", to: "/life/personal-admin?tab=obligations" },
    { label: "Open", to: "/life/personal-admin?tab=open" },
  ],
  hobbies: [{ label: "Things I Love.", to: "/life/hobbies" }],
  wantstoknow: [
    { label: "Wants to Know!", to: "/wants-to-know" },
    { label: "What I Remember.", to: "/memory" },
    { label: "What I've Noticed.", to: "/insights" },
  ],
  jedag: [
    { label: "What Matters?", to: "/agenda" },
    { label: "Briefing", to: "/briefing" },
  ],
  dailystate: [
    { label: "How I'm Doing.", to: "/life/daily-state" },
  ],
  development: [
    { label: "Becoming Me.", to: "/life/development" },
    { label: "Therapy", to: "/life/development?tab=therapy" },
  ],
};