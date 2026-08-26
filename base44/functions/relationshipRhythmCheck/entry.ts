import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { computeRhythmBaseline } from '../../shared/socialEngine.ts';

/**
 * relationshipRhythmCheck — §19.2. Vergelijkt, per contact, het huidige
 * contact-interval met de persoonlijke historische baseline (géén
 * universele norm, §16.1). Werkt contact_rhythm_days bij.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const contacts = await sr.entities.Contact.filter({ relationship_domain: "life" }, "-created_date", 300).catch(() => []);
    const cutoff = Date.now() - 90 * 86400000;
    let updated = 0;
    for (const c of contacts) {
      const [whatsapps, emails] = await Promise.all([
        sr.entities.WhatsAppMessage.filter({ contact_id: c.id, direction: "sent" }).catch(() => []),
        sr.entities.Email.filter({ contact_id: c.id }).catch(() => []),
      ]);
      const timestamps = [
        ...whatsapps.filter((m) => new Date(m.timestamp).getTime() >= cutoff).map((m) => m.timestamp),
        ...emails.filter((e) => (e.folder === "sent" || e.status === "sent") && new Date(e.timestamp).getTime() >= cutoff).map((e) => e.timestamp),
      ];
      const baseline = computeRhythmBaseline(timestamps);
      if (baseline && baseline !== c.contact_rhythm_days) {
        await sr.entities.Contact.update(c.id, { contact_rhythm_days: baseline }).catch(() => null);
        updated++;
      }
    }
    return Response.json({ ok: true, updated, scanned: contacts.length });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}