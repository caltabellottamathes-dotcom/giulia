/**
 * contactLinker — deterministische contact-koppeling uit vrije tekst (chat).
 *
 * Scant Salvo's bericht op naameningen van BESTAANDE contacten en project-titels,
 * koppelt ze aan elkaar (contact.project_ids), zet last_contact_date op nu,
 * en schrijft een sociale Activity. Er worden GEEN nieuwe contacten aangemaakt
 * — Salvo beheert zijn contacten via de contacten-pagina; hier worden ze
 * alleen gelinkt.
 */

function stripDiac(s: string): string {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
function norm(s: string): string {
  return stripDiac(String(s || "").toLowerCase().trim());
}
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** Hele-token, diakritiek-onafhankelijke match (≥3 tekens). */
function wordIn(text: string, name: string): boolean {
  const n = norm(name);
  if (n.length < 3) return false;
  const t = norm(text);
  const re = new RegExp(`(^|[^a-z0-9])${escapeRe(n)}([^a-z0-9]|$)`, "i");
  return re.test(t);
}
/** Distinctieve sleutel van een project-titel (eerste woord ≥4 tekens). */
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
  if (!message || message.length < 3 || !hasPastSignal(message)) return { linked: [], activities: [] };

  const [contacts, projects] = await Promise.all([
    sr.entities.Contact.list("-created_date", 400).catch(() => []),
    sr.entities.Project.list("-updated_date", 200).catch(() => []),
  ]);

  const mentionedProjects = (projects || []).filter((p) => p.title && wordIn(message, titleKey(p.title)));

  const now = new Date().toISOString();
  const linked: any[] = [];
  const activities: any[] = [];

  for (const c of (contacts || [])) {
    if (!c.name) continue;
    const cn = norm(c.name);
    if (cn === "salvo" || cn.includes("salvatore")) continue; // negeer zichzelf

    const first = String(c.name).split(/\s+/)[0];
    const fullMatch = wordIn(message, c.name);
    const firstMatch = first.length >= 4 && wordIn(message, first);
    if (!fullMatch && !firstMatch) continue;

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

    // Sociale Activity — "contact gehad met …" hoort in LIFE/social.
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

  return { linked, activities };
}