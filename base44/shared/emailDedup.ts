/**
 * emailDedup — gedeelde helper voor de email-sync-functies. Voorkomt
 * duplicaten in de inbox: de "seen"-set wordt over ALLE emails gebouwd
 * (ongeacht folder), zodat een naar "archived" getriaged mail nooit meer
 * door een sync opnieuw als inbox-email wordt aangemaakt.
 *
 * dedupEmails() ruimt bestaande duplicaten (zelfde gmail_message_id) op:
 * houdt de nieuwste, verwijdert de rest.
 */

/** Bouwt een Set met alle bekende gmail_message_id's (over alle folders). */
export async function loadSeenUids(ent, limit = 400) {
  const list = await ent.Email.list("-created_date", limit).catch(() => []);
  return new Set((list || []).map((e) => e.gmail_message_id).filter(Boolean).map(String));
}

/** Verwijdert duplicaten op gmail_message_id — houdt de nieuwste. */
export async function dedupEmails(ent) {
  const all = await ent.Email.list("-created_date", 1000).catch(() => []);
  const byUid = new Map();
  for (const e of all || []) {
    const uid = e.gmail_message_id;
    if (!uid) continue;
    if (!byUid.has(uid)) byUid.set(uid, []);
    byUid.get(uid).push(e);
  }
  const toDelete = [];
  for (const group of byUid.values()) {
    if (group.length > 1) {
      // lijst is gesorteerd op -created_date → group[0] is nieuwst, behoud die
      for (const e of group.slice(1)) toDelete.push(e.id);
    }
  }
  if (toDelete.length) {
    await ent.Email.deleteMany({ id: { $in: toDelete } }).catch(() => null);
  }
  return toDelete.length;
}