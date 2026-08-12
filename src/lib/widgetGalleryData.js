import { IMAGES } from "@/lib/images";

/**
 * widgetGalleryData — mock data for every OS widget type, used only by the
 * private /widget-gallery comparison page. Not wired to real entities.
 * Each entry carries a photo (real brand imagery), a second "page" of
 * content (for the pager interaction) and 2-3 action labels (for the
 * multi-button interaction) — see WIDGET_DESIGN_BRIEF.md.
 */
export const WIDGETS = [
  { key: "tasks", label: "Taken", kind: "stat", accent: "olive", value: 5, unit: "vandaag", sub: "3 hoge prioriteit", photo: IMAGES.feetChairs,
    page2: { title: "Te laat", text: "2 taken liggen achter — 'Contract herzien' en 'Belastingaangifte'." }, actions: ["Voltooi", "Wacht", "Voor Giulia"] },
  { key: "approvals", label: "Ter goedkeuring", kind: "stat", accent: "sand", value: 3, unit: "wachtend", sub: "1 email-concept", photo: IMAGES.leanChair,
    page2: { title: "Laatste", text: "WhatsApp-concept aan Marco wacht al 4 uur op goedkeuring." }, actions: ["Goedkeuren", "Bewerk", "Verwerp"] },
  { key: "email", label: "Email", kind: "stat", accent: "ridge", value: 12, unit: "ongelezen", sub: "Sarah — Contractvoorstel", photo: IMAGES.portraitBoot,
    page2: { title: "Urgent", text: "3 berichten wachten al langer dan 24 uur op antwoord." }, actions: ["Open inbox", "Concept van Giulia"] },
  { key: "whatsapp", label: "WhatsApp", kind: "chat", accent: "olive", name: "Marco", message: "Kunnen we morgen bellen over het project?", unread: 2, photo: IMAGES.stilettoHead,
    page2: { title: "Draad", text: "5 berichten deze week — laatste 20 min geleden." }, actions: ["Beantwoord", "Concept", "Later"] },
  { key: "agenda", label: "Agenda", kind: "timeline", accent: "ridge", items: [{ time: "10:00", label: "Call met Sarah" }, { time: "13:30", label: "Projectreview" }, { time: "16:00", label: "Tandarts" }], photo: IMAGES.walkChairsBeach,
    page2: { title: "Morgen", text: "Vrije ochtend — 2 afspraken in de middag." }, actions: ["Vandaag", "Morgen", "Volledige agenda"] },
  { key: "projects", label: "Projecten", kind: "ring", accent: "sand", value: 68, sub: "4 actief", photo: IMAGES.walkChairsHigh,
    page2: { title: "Aandacht nodig", text: "'Lancering NL' loopt achter op planning — 2 taken open." }, actions: ["Alle projecten", "Nieuw project"] },
  { key: "people", label: "Mensen", kind: "avatars", accent: "charcoal", initials: ["SC", "MJ", "AK", "+8"], sub: "Laatst gesproken: Sarah", photo: IMAGES.womanFolder,
    page2: { title: "Opvolgen", text: "3 contacten niet meer gesproken in 30+ dagen." }, actions: ["Alle mensen", "Nieuw contact"] },
  { key: "knowledge", label: "Kennisbank", kind: "preview", accent: "olive", count: 24, sub: "Marktresearch Q3", photo: IMAGES.notebookChair,
    page2: { title: "Recent", text: "2 nieuwe items deze week toegevoegd door Giulia." }, actions: ["Bekijk", "Nieuw item"] },
  { key: "documents", label: "Documenten", kind: "preview", accent: "charcoal", count: 8, sub: "Contract_v3.pdf", photo: IMAGES.notebookStacked,
    page2: { title: "Gedeeld", text: "1 document gedeeld met Sarah, wacht op reactie." }, actions: ["Open", "Upload"] },
  { key: "memory", label: "Geheugen", kind: "stat", accent: "ridge", value: 47, unit: "herinneringen", sub: "Jasper regelt financiering", photo: IMAGES.hourglassJacket,
    page2: { title: "Toegevoegd", text: "3 nieuwe herinneringen deze week uit gesprekken." }, actions: ["Bekijk geheugen", "Voeg toe"] },
  { key: "insights", label: "Inzichten", kind: "stat", accent: "sand", value: 2, unit: "nieuw", sub: "Kans: nieuwe partner", photo: IMAGES.capOnTablet,
    page2: { title: "Risico", text: "Concurrent lanceert vergelijkbaar product in Q4." }, actions: ["Bekijk", "Archiveer"] },
  { key: "activity", label: "Activiteit", kind: "timeline", accent: "olive", items: [{ time: "09:12", label: "Taak voltooid" }, { time: "08:40", label: "Mail getriaged" }, { time: "08:05", label: "Agenda gesynct" }], photo: IMAGES.topDownWalk,
    page2: { title: "Vandaag", text: "14 acties door Giulia uitgevoerd sinds 07:00." }, actions: ["Volledig logboek"] },
  { key: "timetracker", label: "Tijdregistratie", kind: "ring", accent: "charcoal", value: 74, sub: "5u 45m vandaag", photo: IMAGES.capBoot,
    page2: { title: "Deze week", text: "28u 10m geregistreerd — op schema voor 32u doel." }, actions: ["Start timer", "Bekijk week"] },
  { key: "giulia", label: "Giulia", kind: "chat", accent: "olive", name: "Giulia", message: "Goedemorgen — je agenda is vandaag rustig.", unread: 0, photo: IMAGES.portraitBootFace,
    page2: { title: "Focus vandaag", text: "01 Afronden — Contract  02 Voorbereiden — Call Sarah  03 Reageren — 2 mails" }, actions: ["Praat met Giulia", "Bel Giulia"] },
  { key: "updates", label: "Achter de schermen", kind: "timeline", accent: "ridge", items: [{ time: "Nu", label: "Email-triage voltooid" }, { time: "1u", label: "Nieuw inzicht gevonden" }], photo: IMAGES.chairWater,
    page2: { title: "Vandaag", text: "6 achtergrondacties door Giulia, 0 fouten." }, actions: ["Volledig overzicht"] },
  { key: "agentactivity", label: "Agent-activiteit", kind: "route", accent: "ridge", bars: [3, 5, 2, 6, 4, 7, 3], sub: "7 acties vandaag", photo: IMAGES.walkTowardChair,
    page2: { title: "Actiefste agent", text: "triageEmails — 4 acties, 0 fouten, laatste 5 min geleden." }, actions: ["Bekijk agents"] },
  { key: "briefing", label: "Dagbriefing", kind: "stat", accent: "sand", value: 82, unit: "% klaar", sub: "Goede voortgang deze week", photo: IMAGES.twoChairsSand,
    page2: { title: "Deze week", text: "12 taken afgerond, 3 goedkeuringen, 1 nieuw project." }, actions: ["Volledige briefing"] },
];