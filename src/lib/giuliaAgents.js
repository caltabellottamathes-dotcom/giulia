/**
 * Giulia agenten — centrale catalogus gebruikt door het Agenten-widget en het
 * Agenten-onderdeelpaneel (Niveau 02). `key` is de Activity.source die de agent
 * zelf logt via runGiuliaAgent.
 */
export const GIULIA_AGENTS = [
  { key: "interpretInput",      label: "Interpretatie",       role: "Bericht → taak/event" },
  { key: "manageCommunication", label: "Communicatie",        role: "Email & WhatsApp" },
  { key: "manageTasks",         label: "Taken",               role: "Prioriteit & opdeling" },
  { key: "manageProjects",      label: "Projecten",           role: "Status & voortgang" },
  { key: "managePeople",        label: "Mensen",              role: "Contacten & relaties" },
  { key: "manageIdeas",         label: "Ideeën",              role: "Ideeën & notities" },
  { key: "manageFiles",         label: "Bestanden",           role: "Bestandscategorisatie" },
  { key: "dailyPlanning",       label: "Dagplanning",         role: "Dagplanning" },
  { key: "weeklyPlanning",      label: "Weekplanning",        role: "Weekplanning" },
  { key: "weekReview",          label: "Weekreview",          role: "Weekevaluatie" },
  { key: "morningBriefing",     label: "Ochtendbriefing",     role: "Ochtendbriefing" },
  { key: "eveningFollowUp",     label: "Avond-nakoming",       role: "Dag afsluiten" },
  { key: "runProactivity",      label: "Proactiviteit",       role: "Proactieve voorstellen" },
  { key: "checkProactivity",    label: "Procheck",            role: "Actie nodig?" },
  { key: "chatGatekeeper",      label: "Chat-poortwachter",   role: "Filter naar chat" },
  { key: "autoDraftWhatsApp",   label: "WhatsApp-concepten",  role: "Auto-concepten" },
  { key: "syncGmail",           label: "Email-sync",          role: "Gmail-sync" },
  { key: "syncCalendar",        label: "Agenda-sync",         role: "Calendar-sync" },
  { key: "syncDrive",           label: "Drive-sync",          role: "Drive-sync" },
];