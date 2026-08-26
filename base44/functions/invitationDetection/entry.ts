import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const INVITE_KW = ["zin om", "kom je", "uitnodiging", "afspreken", "eten bij", "langskomen", "zullen we", "wil je"];

/**
 * invitationDetection — §19.6 / §4.2. Herkent uitnodigingen in binnenkomende
 * WhatsApp/Email-tekst → Social Intention (respond_invitation), géén
 * bevestigde afspraak.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { contact_id, text } = await req.json();
    if (!contact_id || !text) return Response.json({ ok: true, detected: false });
    const sr = base44.asServiceRole;
    const lower = text.toLowerCase();
    if (!INVITE_KW.some((k) => lower.includes(k))) return Response.json({ ok: true, detected: false });
    const contact = await sr.entities.Contact.get(contact_id).catch(() => null);
    if (!contact) return Response.json({ ok: true, skipped: "no_contact" });
    const existing = await sr.entities.SocialIntention.filter({ contact_id, status: "open", kind: "respond_invitation" }).catch(() => []);
    if (existing.length) return Response.json({ ok: true, detected: true, deduped: true });
    await sr.entities.SocialIntention.create({
      description: `Possible invitation from ${contact.name}: "${text.slice(0, 140)}"`,
      contact_id, kind: "respond_invitation", status: "open", priority: "soon",
      created_via: "invitation_detection", agent_source: "invitationDetection",
    });
    return Response.json({ ok: true, detected: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}