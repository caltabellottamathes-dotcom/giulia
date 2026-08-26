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

// Close circle — data-driven, no hardcoded name list. A contact counts as
// "important" when the system has actual evidence of a real 1:1 relationship:
// a WhatsApp conversation, a SocialPlan they're part of, or an explicit
// life-domain tag with a recorded contact date. WhatsApp *group* threads
// (phone ends in @g.us) represent multiple people, not one relationship, so
// they never populate the individual close circle.
const isGroupContact = (c) => (c?.phone || "").includes("@g.us");

export function closeCircle(contacts = [], { whatsapps = [], planContactIds = [] } = {}) {
  const withActivity = new Set((whatsapps || []).filter((m) => m.contact_id).map((m) => m.contact_id));
  const planIds = new Set(planContactIds || []);
  return (contacts || []).filter((c) => {
    if (!c.name || isGroupContact(c)) return false;
    if ((c.name || "").toLowerCase().includes("salvatore")) return false;
    if (planIds.has(c.id)) return true;
    if (withActivity.has(c.id)) return true;
    if (c.relationship_domain === "life" && c.last_contact_date) return true;
    return false;
  });
}

// Per-contact real signals derived from actual WhatsApp history — no scores,
// no fabricated health. connection = volume, recency = how fresh, rhythm =
// how many distinct days active in the last month, reciprocity = how
// balanced sent vs received is. Each is 0-5 dots.
export function contactSignals(contact, whatsapps = []) {
  const msgs = (whatsapps || []).filter((m) => m.contact_id === contact.id);
  const sent = msgs.filter((m) => m.direction === "sent").length;
  const received = msgs.filter((m) => m.direction === "received").length;
  const total = sent + received;
  const lastTs = msgs.reduce((max, m) => (!max || new Date(m.timestamp) > new Date(max) ? m.timestamp : max), null) || contact.last_contact_date;
  const since = daysSince(lastTs);
  const recency = since === Infinity ? 0 : Math.max(0, 5 - Math.floor(since / 6));
  const connection = Math.min(5, Math.round(total / 3));
  const reciprocity = total ? Math.round((Math.min(sent, received) / Math.max(sent, received, 1)) * 5) : 0;
  const days30 = new Set(msgs.filter((m) => daysSince(m.timestamp) <= 30).map((m) => new Date(m.timestamp).toDateString()));
  const rhythm = Math.min(5, days30.size);
  return { connection, recency, rhythm, reciprocity, since, total, sent, received };
}

// Simple recent-vs-prior trend for a contact's message volume — real delta,
// not an interpretation. "up" | "down" | "steady".
export function contactRecentTrend(contactId, whatsapps = [], windowDays = 14) {
  const now = Date.now();
  const cut1 = now - windowDays * 86400000;
  const cut2 = now - 2 * windowDays * 86400000;
  let recent = 0, prior = 0;
  (whatsapps || []).forEach((m) => {
    if (m.contact_id !== contactId) return;
    const t = new Date(m.timestamp).getTime();
    if (t >= cut1) recent++; else if (t >= cut2) prior++;
  });
  if (recent === prior) return "steady";
  return recent > prior ? "up" : "down";
}

const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Real Mon–Sun activity bars for the current week — sent/received WhatsApp,
// sent email and life-domain calendar events, bucketed by day.
export function weeklyActivityBars({ whatsapps = [], emails = [], events = [] } = {}) {
  const now = new Date();
  const dow = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const start = new Date(now); start.setDate(now.getDate() - dow); start.setHours(0, 0, 0, 0);
  const buckets = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return { date: d, count: 0 }; });
  const bump = (ts) => {
    if (!ts) return;
    const d = new Date(ts);
    const idx = Math.floor((d - start) / 86400000);
    if (idx >= 0 && idx < 7) buckets[idx].count++;
  };
  (whatsapps || []).forEach((m) => bump(m.timestamp));
  (emails || []).filter((e) => e.folder === "sent" || e.status === "sent").forEach((e) => bump(e.timestamp));
  (events || []).filter((e) => e.domain === "life").forEach((e) => bump(e.start));
  return buckets.map((b) => ({ label: DOW_LABELS[b.date.getDay() === 0 ? 6 : b.date.getDay() - 1], count: b.count, isToday: b.date.toDateString() === now.toDateString() }));
}

// This week's meaningful count vs the personal baseline (average of the
// prior weeks) — compared against Salvo's own history, not a universal norm.
export function personalBaseline({ whatsapps = [], emails = [], events = [], weeks = 6 } = {}) {
  const timestamps = [
    ...(whatsapps || []).filter((m) => m.direction === "sent").map((m) => m.timestamp),
    ...(emails || []).filter((e) => e.folder === "sent" || e.status === "sent").map((e) => e.timestamp),
    ...(events || []).filter((e) => e.domain === "life").map((e) => e.start),
  ];
  const series = intensitySeries(timestamps, weeks);
  const current = series[series.length - 1] || 0;
  const prior = series.slice(0, -1);
  const baseline = prior.length ? prior.reduce((a, b) => a + b, 0) / prior.length : 0;
  return { current, baseline: Math.round(baseline * 10) / 10 };
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

// Orbit recency-zones — 9 concentrische ringen.
// Binnenste = vandaag. Buitenste = 2 maanden geleden. De ring vóór de buitenste
// is 1 maand; steeds verder naar binnen wordt dichter bij vandaag.
export const ORBIT_TIERS = [
  { max: 0,  r: 7,  color: "hsl(var(--d-life-light))" },   // vandaag
  { max: 1,  r: 10, color: "hsl(var(--d-life-light))" },   // gisteren
  { max: 3,  r: 13, color: "hsl(var(--d-life-light))" },   // paar dagen
  { max: 7,  r: 17, color: "hsl(var(--d-life-mid))" },     // deze week
  { max: 10, r: 20, color: "hsl(var(--d-life-mid))" },
  { max: 14, r: 23, color: "hsl(var(--d-life-mid))" },     // 2 weken
  { max: 21, r: 28, color: "hsl(var(--d-life-deep))" },   // 3 weken
  { max: 30, r: 35, color: "hsl(var(--d-life-deep))" },   // 1 maand (ring vóór buitenste)
  { max: 60, r: 44, color: "hsl(var(--smoke))" },         // 2 maanden (buitenste)
];
export function orbitTier(days) {
  return ORBIT_TIERS.find((t) => days <= t.max) || ORBIT_TIERS[ORBIT_TIERS.length - 1];
}

// Social Pulse state (live, client-side mirror of base44/shared/socialEngine.ts
// computeSocialPulseState — §6.3). Beschrijvend t.o.v. persoonlijke baseline,
// geen kwaliteitsmaatstaf. Gebruikt door de unified "What Social Life?" widget/panel.
export function pulseState({ meaningfulCount = 0, activePlans = 0, openInvitations = 0, availableMin = 9999, baselineWeekly = null }) {
  if (baselineWeekly == null && meaningfulCount === 0 && activePlans === 0) return "UNKNOWN";
  if (activePlans >= 5 && availableMin < 240) return "OVERLOADED";
  if (activePlans >= 4) return "A_LOT_HAPPENING";
  if (openInvitations >= 1 && meaningfulCount <= 2) return "OPEN";
  if (baselineWeekly != null) {
    if (meaningfulCount >= baselineWeekly * 1.4) return "A_LOT_HAPPENING";
    if (meaningfulCount <= baselineWeekly * 0.5) return "QUIETER_THAN_USUAL";
  }
  if (meaningfulCount >= 5) return "CONNECTED";
  if (meaningfulCount >= 2 && activePlans >= 1) return "BALANCED";
  if (meaningfulCount >= 1) return "ACTIVE";
  return "QUIETER_THAN_USUAL";
}

export const PULSE_LABEL = {
  CONNECTED: "CONNECTED", ACTIVE: "ACTIVE", QUIETER_THAN_USUAL: "QUIETER THAN USUAL",
  A_LOT_HAPPENING: "A LOT HAPPENING", OPEN: "OPEN", BALANCED: "BALANCED",
  OVERLOADED: "OVERLOADED", UNKNOWN: "UNKNOWN",
};

export const RELATIONSHIP_LABEL = {
  ACTIVE: "Active", CLOSE: "Close", QUIET: "Quiet", QUIETER_THAN_USUAL: "Quieter than usual",
  EMERGING: "Emerging", RECONNECTING: "Reconnecting", CHANGING: "Changing", UNKNOWN: "Unknown",
};

// Client-side mirror of socialEngine.ts computeIntensitySeries (§6.2) — sociale
// activiteit als tijdreeks (weken terug), voor de Pulse-tab intensity chart.
export function intensitySeries(timestamps = [], weeks = 8) {
  const arr = Array.from({ length: weeks }, () => 0);
  const now = Date.now();
  for (const t of timestamps) {
    if (!t) continue;
    const w = Math.floor((now - new Date(t).getTime()) / (7 * 86400000));
    if (w >= 0 && w < weeks) arr[weeks - 1 - w]++;
  }
  return arr;
}