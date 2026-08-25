/**
 * contactResolver — algemene, deterministische contact-koppeling voor het
 * hele OS (e-mail, WhatsApp, agenda, projecten, taken). Koppelt ALWAYS aan
 * een BESTAAND contact op email → telefoon → exacte naam. Maakt nooit een
 * nieuw contact aan — Google Contacts (syncGoogleContacts) is de master-database.
 */

export function normalizeEmail(s: string): string {
  return String(s || "").toLowerCase().trim();
}

export function normalizePhone(raw: string): string {
  let d = String(raw || "").replace(/[^\d]/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0") && d.length === 10) d = "31" + d.slice(1);
  return d;
}

function norm(s: string): string {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Laad alle contacten één keer (voor efficiënte matching in loops). */
export async function loadContacts(entNs: any): Promise<any[]> {
  try {
    // Pagineer álle contacten — anders ontstaan dubbels doordat de sync
    // contacten buiten de eerste pagina niet vindt en opnieuw aanmaakt.
    const all: any[] = [];
    const seen = new Set<string>();
    let skip = 0;
    while (skip < 10000) {
      const batch: any[] = await entNs.Contact.list("-created_date", 500, skip).catch(() => []);
      if (!batch || !batch.length) break;
      let added = 0;
      for (const c of batch) {
        if (c?.id && !seen.has(c.id)) { seen.add(c.id); all.push(c); added++; }
      }
      // skip niet ondersteund (zelfde batch) of einde bereikt → stop.
      if (added === 0 || batch.length < 500) break;
      skip += 500;
    }
    return all;
  } catch {
    return [];
  }
}

/**
 * Vindt het beste bestaande contact op email → telefoon → exacte naam.
 * Geen match → null. Maakt nooit aan.
 */
export function matchContact(
  contacts: any[],
  q: { email?: string; phone?: string; name?: string }
): any | null {
  const list = contacts || [];

  const email = normalizeEmail(q.email || "");
  if (email) {
    const m = list.find((c) => normalizeEmail(c.email || "") === email);
    if (m) return m;
  }

  const phone = normalizePhone(q.phone || "");
  if (phone) {
    const m = list.find((c) => normalizePhone(c.phone || "") === phone);
    if (m) return m;
  }

  const name = norm(q.name || "");
  if (name && name.length >= 3) {
    const exact = list.find((c) => norm(c.name || "") === name);
    if (exact) return exact;
  }

  return null;
}