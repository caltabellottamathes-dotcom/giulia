/**
 * disambiguate.ts — kennisgrafiek-resolver voor ambigue persoonsvermeldingen.
 *
 * Als een voornaam (bv. "Wouter") op MEERDERE contacten past, lost deze module
 * de keuze op via de volledige kennis van het OS: gedeelde projecten,
 * therapie-/begeleidingstrajecten, recente communicatie (WhatsApp/email),
 * agenda-co-occurrence, domain en contact-hint (email/telefoon). Blijft het
 * onduidelijk, dan wordt een GiuliaQuestion aangemaakt ("Met welke Wouter
 * had je contact?") in plaats van te gokken.
 *
 * Maakt nooit zelf contacten aan — Google Contacts is de master.
 */
import { loadContacts, normalizeEmail, normalizePhone } from "./contactResolver.ts";

export interface DisambigContext {
  project_id?: string;
  message?: string;
  domain?: string;     // "focus" | "life"
  contact_hint?: string; // email of telefoon als bekend
}

function norm(s: string): string {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function firstToken(name: string): string {
  return norm(name).split(/\s+/)[0] || "";
}
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function wordIn(text: string, name: string): boolean {
  const n = norm(name);
  if (n.length < 3) return false;
  return new RegExp(`(^|[^a-z0-9])${escapeRe(n)}([^a-z0-9]|$)`, "i").test(norm(text));
}

/** Vind kandidaat-contacten voor een naam: exact → first-token (≥4 tekens). */
export function findCandidates(contacts: any[], name: string): any[] {
  const n = norm(name);
  if (!n) return [];
  const exact = contacts.filter((c) => norm(c.name) === n);
  if (exact.length) return exact;
  const first = firstToken(name);
  if (first.length < 4) return [];
  return contacts.filter(
    (c) =>
      firstToken(c.name) === first &&
      norm(c.name) !== "salvo" &&
      !(c.name || "").toLowerCase().includes("salvatore")
  );
}

/** Laad de kennisgrafiek (eenmaal, alleen wanneer ambigu). */
async function loadGraph(sr: any): Promise<{
  trajectories: any[];
  recentComms: Record<string, number>;
  recentParticipants: Set<string>;
}> {
  const [trajectories, wa, em, events] = await Promise.all([
    sr.entities.TherapyTrajectory.list("-created_date", 200).catch(() => []),
    sr.entities.WhatsAppMessage.list("-timestamp", 200).catch(() => []),
    sr.entities.Email.list("-timestamp", 200).catch(() => []),
    sr.entities.CalendarEvent.list("-start", 200).catch(() => []),
  ]);
  const recentComms: Record<string, number> = {};
  const cut = Date.now() - 30 * 86400000;
  const tally = (list: any[], idField: string, tsField: string) =>
    list.forEach((m: any) => {
      const id = m[idField];
      if (!id) return;
      if (m[tsField] && new Date(m[tsField]).getTime() >= cut)
        recentComms[id] = (recentComms[id] || 0) + 1;
    });
  tally(wa, "contact_id", "timestamp");
  tally(em, "contact_id", "timestamp");
  const recentParticipants = new Set<string>();
  (events || []).forEach((e: any) => {
    if (!e.participants) return;
    norm(e.participants)
      .split(/[,&+/]| en | met /)
      .forEach((p) => {
        const pp = p.trim();
        if (pp.length >= 3) recentParticipants.add(pp);
      });
  });
  return { trajectories, recentComms, recentParticipants };
}

/** Scoor één kandidaat tegen de kennisgrafiek + context. Hoger = beter. */
function scoreContact(contact: any, ctx: DisambigContext, graph: any): number {
  let score = 0;
  // 1. Gedeeld project met de context
  if (ctx.project_id && Array.isArray(contact.project_ids) && contact.project_ids.includes(ctx.project_id))
    score += 6;
  // 2. Therapie-/begeleidingstraject (lid of therapeut)
  const inTherapy = (graph.trajectories || []).some(
    (t: any) => (t.contact_ids || []).includes(contact.id) || t.therapist_contact_id === contact.id
  );
  if (inTherapy) {
    const hint = norm(ctx.message || "");
    if (hint.includes("therap") || hint.includes("behandel") || hint.includes("mondriaan") || ctx.domain === "life")
      score += 5;
    else score += 1;
  }
  // 3. Recente communicatie (whatsapp/email, laatste 30d)
  score += Math.min(graph.recentComms[contact.id] || 0, 3);
  // 4. Agenda-co-occurrence: naam in participants van recente events
  if (graph.recentParticipants.has(norm(contact.name))) score += 2;
  // 5. Recency van laatste contact
  if (contact.last_contact_date) {
    const days = (Date.now() - new Date(contact.last_contact_date).getTime()) / 86400000;
    if (days < 30) score += 1;
  }
  // 6. Domain-match
  if (ctx.domain && contact.relationship_domain === ctx.domain) score += 1;
  // 7. Email/telefoon-hint (sterk signaal)
  if (ctx.contact_hint) {
    if (contact.email && normalizeEmail(contact.email) === normalizeEmail(ctx.contact_hint)) score += 10;
    if (contact.phone && normalizePhone(contact.phone) === normalizePhone(ctx.contact_hint)) score += 10;
  }
  return score;
}

/** Maak een GiuliaQuestion bij onoplosbare ambiguïteit. */
async function createDisambigQuestion(
  sr: any,
  name: string,
  candidates: any[],
  ctx: DisambigContext
): Promise<string | undefined> {
  const q = await sr.entities.GiuliaQuestion.create({
    title: `Met welke ${name} had je contact?`,
    body: `Ik zie meerdere contacten met de naam "${name}" in je netwerk. Met welke bedoelde je dit contact?`,
    kind: "connect_the_dots",
    domain: "people",
    priority: "soon",
    options: candidates.map((c) =>
      `${c.name}${c.company ? ` (${c.company})` : ""}${c.phone ? ` · ${c.phone}` : ""}`
    ),
    target_type: "Contact",
    target_ref: candidates.map((c) => c.id).join(","),
    context: ctx.message || "",
    status: "open",
    agent_source: "disambiguation",
  }).catch(() => null);
  return q?.id;
}

/**
 * resolveContact — lost een naam op naar één contact via de kennisgrafiek.
 * Returns: { contact?, ambiguous, candidates, questionId? }.
 * `preloaded` voorkomt dubbel laden als de caller de contacten al heeft.
 */
export async function resolveContact(
  sr: any,
  name: string,
  ctx: DisambigContext = {},
  preloaded?: any[]
): Promise<{ contact?: any; ambiguous: boolean; candidates: any[]; questionId?: string }> {
  const contacts = preloaded && preloaded.length ? preloaded : await loadContacts(sr.entities);
  const candidates = findCandidates(contacts, name);
  if (candidates.length === 0) return { ambiguous: false, candidates: [] };
  if (candidates.length === 1) return { contact: candidates[0], ambiguous: false, candidates };

  // Ambigu → scoor via de volledige kennisgrafiek.
  const graph = await loadGraph(sr);
  const scored = candidates
    .map((c) => ({ contact: c, score: scoreContact(c, ctx, graph) }))
    .sort((a, b) => b.score - a.score);
  const top = scored[0];
  const second = scored[1] || { score: 0 };
  // Duidelijke winnaar: score > 0 én marge ≥ 3.
  if (top.score > 0 && top.score - second.score >= 3) {
    return { contact: top.contact, ambiguous: false, candidates };
  }
  // Blijft onduidelijk → GiuliaQuestion in plaats van gokken.
  const questionId = await createDisambigQuestion(sr, name, candidates, ctx);
  return { ambiguous: true, candidates, questionId };
}