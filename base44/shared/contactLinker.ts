/**
 * contactLinker — deterministische contact-koppeling uit vrije tekst (chat).
 *
 * Scant Salvo's bericht op naameningen van BESTAANDE contacten en project-titels,
 * koppelt ze aan elkaar (contact.project_ids), zet last_contact_date op nu,
 * en schrijft een sociale Activity. Er worden GEEN nieuwe contacten aangemaakt.
 *
 * Bij een ambigue voornaam (meerdere contacten delen die voornaam, bv. 4× Wouter)
 * wordt de keuze via de volledige kennisgrafiek van het OS opgelost
 * (disambiguate.resolveContact): gedeelde projecten, therapie-trajecten, recente
 * communicatie, agenda-co-occurrence, domain. Blijft het onduidelijk, dan wordt
 * een GiuliaQuestion aangemaakt ("Met welke Wouter had je contact?") in plaats
 * van te gokken — precies het gedrag dat Salvo wil.
 */
import { loadContacts } from "./contactResolver.ts";
import { resolveContact } from "./disambiguate.ts";

function norm(s: string): string {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function wordIn(text: string, name: string): boolean {
  const n = norm(name);
  if (n.length < 3) return false;
  return new RegExp(`(^|[^a-z0-9])${escapeRe(n)}([^a-z0-9]|$)`, "i").test(norm(text));
}
function firstToken(name: string): string {
  return norm(name).split(/\s+/)[0] || "";
}
function titleKey(title: string): string {
  const t = norm(title);
  const words = t.split(/[^a-z0-9]+/).filter((w) => w.length >= 4);
  return words.length ? words[0] : "";
}

// Alleen vuren bij PAST-tense contact­signalen — "bel mama" (toekomst) of
// "ik wil Ardan spreken" (voornemen) mogen géén last_contact_date zetten.
const PAST_SIGNALS = [
  "gesproken", "gebeld", "gezien", "ontmoet", "gemaild", "geappt", "afgesproken",
  "geluncht", "gedineerd", "gehad met", "had contact", "contact gehad",
  "belde", "spraak", "appte", "mailde", "zag", "ontmoette", "was bij",
  "ben geweest bij", "koffie gedronken", "gesproken met", "ontvangen van",
];
function hasPastSignal(message: string): boolean {
  const t = norm(message);
  return PAST_SIGNALS.some((s) => t.includes(norm(s)));
}

export async function linkMentionedContacts(sr, message: string) {
  if (!message || message.length < 3 || !hasPastSignal(message))
    return { linked: [], activities: [], questions: [] };

  const [contacts, projects] = await Promise.all([
    loadContacts(sr.entities),
    sr.entities.Project.list("-updated_date", 200).catch(() => []),
  ]);

  const mentionedProjects = (projects || []).filter((p) => p.title && wordIn(message, titleKey(p.title)));
  const ctx = {
    message,
    domain: mentionedProjects.length ? "focus" : "life",
    project_id: mentionedProjects[0]?.id,
  };

  const now = new Date().toISOString();
  const linked: any[] = [];
  const activities: any[] = [];
  const questions: any[] = [];

  // first-token groepen — om ambiguïteit (meerdere contacten zelfde voornaam) te
  // detecteren. Een bare voornaam-token die op >1 contact past wordt NIET meer
  // blind allemaal gelinkt; resolveContact kiest er één (of stelt een vraag).
  const tokenGroups = new Map<string, any[]>();
  for (const c of (contacts || [])) {
    if (!c.name) continue;
    const cn = norm(c.name);
    if (cn === "salvo" || cn.includes("salvatore")) continue;
    const t = firstToken(c.name);
    if (t.length < 4) continue;
    if (!tokenGroups.has(t)) tokenGroups.set(t, []);
    tokenGroups.get(t)!.push(c);
  }

  const toLink = new Map<string, any>();
  const ambiguousTokens = new Set<string>();
  for (const c of (contacts || [])) {
    if (!c.name) continue;
    const cn = norm(c.name);
    if (cn === "salvo" || cn.includes("salvatore")) continue;

    // Exacte volledige naam in bericht → altijd linken (onambigu).
    if (wordIn(message, c.name)) {
      toLink.set(c.id, c);
      continue;
    }
    // First-token match → alleen linken als die voornaam uniek is;
    // anders → via kennisgrafiek oplossen (zie hieronder).
    const first = firstToken(c.name);
    if (first.length >= 4 && wordIn(message, first)) {
      const grp = tokenGroups.get(first) || [];
      if (grp.length === 1) toLink.set(c.id, c);
      else ambiguousTokens.add(first);
    }
  }

  // Ambigue voornamen oplossen via de volledige kennisgrafiek.
  for (const tok of ambiguousTokens) {
    const res = await resolveContact(sr, tok, ctx, contacts);
    if (res.questionId) questions.push(res.questionId);
    if (res.contact) toLink.set(res.contact.id, res.contact);
  }

  for (const c of toLink.values()) {
    const patch: any = { last_contact_date: now };
    if (mentionedProjects.length) {
      const ids = Array.isArray(c.project_ids) ? [...c.project_ids] : [];
      let changed = false;
      for (const p of mentionedProjects) {
        if (!ids.includes(p.id)) { ids.push(p.id); changed = true; }
      }
      if (changed) patch.project_ids = ids;
      if (!c.relationship_domain) patch.relationship_domain = "focus";
    } else if (!c.relationship_domain) {
      patch.relationship_domain = "life";
    }

    await sr.entities.Contact.update(c.id, patch).catch(() => null);
    linked.push({ id: c.id, name: c.name, projects: mentionedProjects.map((p) => p.title) });

    const act = await sr.entities.Activity.create({
      action: "contact_mention",
      description: `Contact gehad met ${c.name}${mentionedProjects.length ? ` (${mentionedProjects.map((p) => p.title).join(", ")})` : ""}.`,
      source: "chat",
      event_type: "social_contact",
      object_type: "Contact",
      object_id: c.id,
      domain: "life",
      timestamp: now,
    }).catch(() => null);
    if (act) activities.push(act.id);
  }

  return { linked, activities, questions };
}