import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { emitEvent } from '../../shared/eventEngine.ts';
import { computeMomentSignificance } from '../../shared/socialEngine.ts';

/**
 * socialActivityIngestion — §4.1–4.3 / §19.1. Normaliseert een binnenkomend
 * WhatsApp/Email-event tot een Activity via de centrale event-engine, en
 * detecteert (licht) een Social Moment-candidate. Maakt NOOIT automatisch
 * een CalendarEvent (een uitnodiging ≠ bevestigde afspraak).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { source, contact_id, message_id, text, timestamp } = await req.json();
    if (!contact_id) return Response.json({ ok: true, skipped: "no_contact" });
    const sr = base44.asServiceRole;
    const contact = await sr.entities.Contact.get(contact_id).catch(() => null);
    if (!contact) return Response.json({ ok: true, skipped: "contact_not_found" });

    await emitEvent(base44, {
      event_type: "SOCIAL_ACTIVITY_DETECTED",
      object_type: "Contact",
      object_id: contact.id,
      domain: "life",
      description: `${source || "activity"} with ${contact.name}`,
      source: "socialActivityIngestion",
    });

    if ((text || "").length > 280) {
      const significance = computeMomentSignificance((text || "").length, contact);
      const moment = await sr.entities.SocialMoment.create({
        title: `Conversation with ${contact.name}`,
        contact_ids: [contact.id],
        moment_type: "conversation",
        significance,
        occurred_at: timestamp || new Date().toISOString(),
        source_activity_id: message_id || null,
        agent_source: "socialActivityIngestion",
      }).catch(() => null);
      // §9.7/§19 — laat de memory-promotie-beslissing direct evalueren; alleen
      // high-significance moments worden daar echt een Memory-record.
      if (moment) await base44.functions.invoke("socialMemoryCandidate", { moment_id: moment.id }).catch(() => null);
    }

    await base44.functions.invoke("relationshipUpdate", { contact_id: contact.id }).catch(() => null);
    return Response.json({ ok: true, contact_id: contact.id });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}