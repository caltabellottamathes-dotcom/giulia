import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { computeRelationshipHealth, computeRelationshipState } from '../../shared/socialEngine.ts';
import { emitEvent } from '../../shared/eventEngine.ts';

/**
 * relationshipUpdate — §4.4 / §19 (Relationship Update). Herlaadt relevante
 * context voor één contact en werkt relationship_state + relationship_health
 * bij. Eén eigenaar per datum (§12): Relationships bezit deze velden.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { contact_id } = await req.json();
    if (!contact_id) return Response.json({ ok: false, error: "contact_id required" }, { status: 400 });
    const sr = base44.asServiceRole;
    const contact = await sr.entities.Contact.get(contact_id).catch(() => null);
    if (!contact) return Response.json({ ok: false, error: "not_found" }, { status: 404 });

    const cutoff = Date.now() - 30 * 86400000;
    const [whatsapps, emails, events, plans] = await Promise.all([
      sr.entities.WhatsAppMessage.filter({ contact_id }).catch(() => []),
      sr.entities.Email.filter({ contact_id }).catch(() => []),
      sr.entities.CalendarEvent.list("-start", 200).catch(() => []),
      sr.entities.SocialPlan.filter({ contact_ids: contact_id }).catch(() => []),
    ]);
    const sentWa = whatsapps.filter((m) => m.direction === "sent" && new Date(m.timestamp).getTime() >= cutoff);
    const receivedWa = whatsapps.filter((m) => m.direction === "received" && new Date(m.timestamp).getTime() >= cutoff);
    const sentEmails = emails.filter((e) => (e.folder === "sent" || e.status === "sent") && new Date(e.timestamp).getTime() >= cutoff);
    const receivedEmails = emails.filter((e) => e.folder !== "sent" && e.status !== "sent" && new Date(e.timestamp).getTime() >= cutoff);
    const contactEvents = events.filter((e) => e.domain === "life" && (e.participants || "").includes(contact.name) && new Date(e.start).getTime() >= cutoff);
    const meaningfulCount30d = sentWa.length + sentEmails.length + contactEvents.length;
    const upcomingPlan = plans.some((p) => ["proposed", "planned", "confirmed"].includes(p.status));

    const latestMeaningful = [...sentWa, ...sentEmails, ...contactEvents]
      .map((x) => x.timestamp || x.start)
      .sort((a, b) => new Date(b) - new Date(a))[0];

    const health = computeRelationshipHealth(contact, {
      meaningfulCount30d, sentCount: sentWa.length + sentEmails.length,
      receivedCount: receivedWa.length + receivedEmails.length, upcomingPlan,
    });
    const state = computeRelationshipState(contact, { meaningfulCount30d });

    const patch = { relationship_health: health, relationship_state: state };
    if (latestMeaningful) patch.last_meaningful_contact_date = latestMeaningful;
    await sr.entities.Contact.update(contact.id, patch);

    if (state !== contact.relationship_state) {
      await emitEvent(base44, {
        event_type: "RELATIONSHIP_STATE_CHANGED", object_type: "Contact", object_id: contact.id, domain: "life",
        description: `${contact.name}: ${contact.relationship_state || "UNKNOWN"} \u2192 ${state}`, source: "relationshipUpdate",
      });
    }
    return Response.json({ ok: true, state, health });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}