// LIFE domain layer — client-side tagging heuristic + balance computation.
// Giulia's auto-tagging runs server-side via the manage* skills (when LLM
// credits are available); this provides an immediate, always-working fallback
// so the domain chips and balance snapshot stay meaningful.

export const DOMAINS = ["focus", "life"];

export const DOMAIN_HEX = {
  focus: "hsl(var(--d-focus-deep))",
  life: "hsl(var(--d-life-deep))",
  self: "hsl(var(--d-life-deep))",
};

export const DOMAIN_LABEL = { focus: "FOCUS", life: "LIFE", self: "LIFE" };

const LIFE_KW = ["lunch", "diner", "koffie", "borrel", "bel", "bellen", "mama", "papa", "familie", "vriend", "vriendin", "verjaardag", "feest", "vakantie", "weekend", "sociaal", "date", "cafe", "café", "eten", "sport", "gym", "lopen", "hardlopen", "muziek", "gitaar", "oefenen", "repetitie", "schoonmaak", "boodschappen", "wassen", "was", "huis", "tuin", "klussen", "dokter", "tandarts", "kapper", "hobby", "verjaardag"];
const SELF_KW = ["meditatie", "journal", "journaling", "therapie", "therapeut", "rust", "slaap", "zelfzorg", "lezen", "reflectie", "reflecteren", "adem", "yoga", "wandelen", "stilte", "afsluiten", "dagboek"];
const FOCUS_KW = ["offerte", "factuur", "klant", "project", "deadline", "meeting", "vergadering", "call", "client", "sales", "design", "code", "debrief", "contract", "leverancier", "briefing", "rapport", "strategie", "marketing", "budget"];

export function tagDomain(text = "") {
  const t = (text || "").toLowerCase();
  if (!t) return null;
  const hit = (arr) => arr.some((k) => t.includes(k));
  if (hit(SELF_KW)) return "life";
  if (hit(LIFE_KW)) return "life";
  if (hit(FOCUS_KW)) return "focus";
  return null;
}

// desired contact frequency in days — explicit value wins, else heuristic by type.
export function desiredFreq(contact) {
  const f = contact?.desired_frequency_days;
  if (f && f > 0) return f;
  const rt = (contact?.relationship_type || "").toLowerCase();
  if (rt.includes("famil") || rt.includes("vriend")) return 14;
  if (rt.includes("klant") || rt.includes("client")) return 21;
  if (rt.includes("team")) return 7;
  return 30;
}

export function daysSince(date) {
  if (!date) return Infinity;
  const d = new Date(date).getTime();
  if (Number.isNaN(d)) return Infinity;
  return Math.max(0, Math.round((Date.now() - d) / 86400000));
}

// Contacts needing attention — sorted by overdue ratio (since / desired freq).
export function socialPulse(contacts = []) {
  return contacts
    .filter((c) => c.name)
    .map((c) => {
      const freq = desiredFreq(c);
      const since = daysSince(c.last_contact_date);
      return { contact: c, freq, since, ratio: since / freq, overdue: since > freq };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

// Domain balance across tasks + calendar events (and optionally projects).
export function domainBalance({ tasks = [], events = [], projects = [] } = {}) {
  const counts = { focus: 0, life: 0, self: 0, none: 0 };
  const tally = (d) => { if (d === "self") { counts.life++; return; } counts[d in counts ? d : "none"]++; };
  tasks.forEach((t) => tally(t.domain));
  events.forEach((e) => tally(e.domain));
  const total = (tasks.length + events.length) || 1;
  const pct = (k) => Math.round((counts[k] / total) * 100);
  return {
    counts,
    focus: pct("focus"),
    life: pct("life"),
    self: 0,
    none: pct("none"),
    total: tasks.length + events.length,
  };
}

export const LIFE_BLUE = "hsl(var(--d-life-deep))";
export const LIFE_SAND = "hsl(var(--d-life-light))";

// Close circle — the relationships that actually matter to Salvo. Everything
// else is noise in the Social Pulse "what matters now" view.
const CLOSE_CIRCLE_KEYS = ["mama", "debora", "sara", "juan", "pawel", "paul", "oma", "wouter"];
export function closeCircle(contacts = []) {
  return (contacts || []).filter((c) => {
    const n = (c.name || "").toLowerCase();
    return !n.includes("salvatore") && CLOSE_CIRCLE_KEYS.some((k) => n.includes(k));
  });
}

// Meaningful interaction = een UITGAAND WhatsApp-bericht, een VERZONDEN email,
// of een life-agendagebeurtenis (afspraak) binnen de window. Binnenkomende
// (ontvangen) emails tellen NIET mee — ontvangen post is geen interactie.
export function meaningfulInteractions({ emails = [], whatsapps = [], events = [], days = 7 } = {}) {
  const cut = Date.now() - days * 86400000;
  const inWindow = (t) => !!t && new Date(t).getTime() >= cut;
  const sentWa = (whatsapps || []).filter((m) => m.direction === "sent" && inWindow(m.timestamp)).length;
  const sentEmail = (emails || []).filter((e) => (e.folder === "sent" || e.status === "sent") && inWindow(e.timestamp)).length;
  const meetings = (events || []).filter((e) => e.domain === "life" && inWindow(e.start)).length;
  return { sentWa, sentEmail, meetings, total: sentWa + sentEmail + meetings };
}

// WhatsApp-gesprekken gegroepeerd per contact (nieuwste eerst).
export function whatsappThreads(whatsapps = [], contacts = [], limit = 6) {
  const byContact = new Map();
  (whatsapps || []).forEach((m) => {
    const key = m.contact_id;
    if (!key) return;
    if (!byContact.has(key)) byContact.set(key, []);
    byContact.get(key).push(m);
  });
  const nameOf = (id) => contacts.find((c) => c.id === id)?.name || "Onbekend";
  return Array.from(byContact.entries())
    .map(([id, msgs]) => {
      const sorted = [...msgs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return { contact_id: id, name: nameOf(id), count: sorted.length, last: sorted[0], messages: sorted };
    })
    .sort((a, b) => new Date(b.last.timestamp) - new Date(a.last.timestamp))
    .slice(0, limit);
}

// Orbit recency-zones — 7 concentrische ringen, géén 1 ring per dag.
// Binnenste = net contact, buitenste = sluimerend / nooit.
export const ORBIT_TIERS = [
  { max: 2, r: 16, color: "#d8dab3" },        // vandaag
  { max: 7, r: 22, color: "#d8dab3" },        // deze week
  { max: 14, r: 28, color: "#b1bec6" },       // twee weken
  { max: 30, r: 34, color: "#94925d" },        // deze maand
  { max: 60, r: 40, color: "#94925d" },        // vorige maand
  { max: 90, r: 45, color: "#8a8f7a" },        // afgelopen kwartaal
  { max: Infinity, r: 48, color: "hsl(var(--smoke))" }, // sluimer / nooit
];
export function orbitTier(days) {
  return ORBIT_TIERS.find((t) => days <= t.max) || ORBIT_TIERS[ORBIT_TIERS.length - 1];
}