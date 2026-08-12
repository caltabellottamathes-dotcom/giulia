/**
 * widgetGalleryData — mock data for every OS widget type, used only by the
 * private /widget-gallery comparison page. Not wired to real entities.
 */
export const WIDGETS = [
  { key: "tasks", label: "Taken", kind: "stat", accent: "olive", value: 5, unit: "vandaag", sub: "3 hoge prioriteit" },
  { key: "approvals", label: "Ter goedkeuring", kind: "stat", accent: "sand", value: 3, unit: "wachtend", sub: "1 email-concept" },
  { key: "email", label: "Email", kind: "stat", accent: "ridge", value: 12, unit: "ongelezen", sub: "Sarah — Contractvoorstel" },
  { key: "whatsapp", label: "WhatsApp", kind: "chat", accent: "olive", name: "Marco", message: "Kunnen we morgen bellen over het project?", unread: 2 },
  { key: "agenda", label: "Agenda", kind: "timeline", accent: "ridge", items: [{ time: "10:00", label: "Call met Sarah" }, { time: "13:30", label: "Projectreview" }, { time: "16:00", label: "Tandarts" }] },
  { key: "projects", label: "Projecten", kind: "ring", accent: "sand", value: 68, sub: "4 actief" },
  { key: "people", label: "Mensen", kind: "avatars", accent: "charcoal", initials: ["SC", "MJ", "AK", "+8"], sub: "Laatst gesproken: Sarah" },
  { key: "knowledge", label: "Kennisbank", kind: "preview", accent: "olive", count: 24, sub: "Marktresearch Q3" },
  { key: "documents", label: "Documenten", kind: "preview", accent: "charcoal", count: 8, sub: "Contract_v3.pdf" },
  { key: "memory", label: "Geheugen", kind: "stat", accent: "ridge", value: 47, unit: "herinneringen", sub: "Jasper regelt financiering" },
  { key: "insights", label: "Inzichten", kind: "stat", accent: "sand", value: 2, unit: "nieuw", sub: "Kans: nieuwe partner" },
  { key: "activity", label: "Activiteit", kind: "timeline", accent: "olive", items: [{ time: "09:12", label: "Taak voltooid" }, { time: "08:40", label: "Mail getriaged" }, { time: "08:05", label: "Agenda gesynct" }] },
  { key: "timetracker", label: "Tijdregistratie", kind: "ring", accent: "charcoal", value: 74, sub: "5u 45m vandaag" },
  { key: "giulia", label: "Giulia", kind: "chat", accent: "olive", name: "Giulia", message: "Goedemorgen — je agenda is vandaag rustig.", unread: 0 },
  { key: "updates", label: "Achter de schermen", kind: "timeline", accent: "ridge", items: [{ time: "Nu", label: "Email-triage voltooid" }, { time: "1u", label: "Nieuw inzicht gevonden" }] },
  { key: "agentactivity", label: "Agent-activiteit", kind: "route", accent: "ridge", bars: [3, 5, 2, 6, 4, 7, 3], sub: "7 acties vandaag" },
  { key: "briefing", label: "Dagbriefing", kind: "stat", accent: "sand", value: 82, unit: "% klaar", sub: "Goede voortgang deze week" },
];