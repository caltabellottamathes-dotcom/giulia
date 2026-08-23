import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { loadSeenUids, dedupEmails } from "../../shared/emailDedup.ts";

/**
 * syncGmail — trekt recente inbox-berichten binnen via de IMAP-bridge
 * (BRIDGE_URL) in de Email-entity, gedupliceerd op IMAP-uid
 * (opgeslagen in gmail_message_id). Werkt zowel met een ingelogde user als
 * zonder (scheduled/service-role).
 *
 * De Gmail OAuth-connector is niet geautoriseerd voor deze workspace, daarom
 * loopt alles via de bridge — dezelfde IMAP-pijplijn die fetchPrivateEmails
 * al gebruikt. Als de connector later wél actief wordt kan dit weer terug naar
 * de OAuth-API, maar de bridge is nu de betrouwbare weg.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const ent = user ? base44.entities : base44.asServiceRole.entities;

    const base = (secrets.get('BRIDGE_URL') || '').replace(/\/$/, '');
    if (!base) return Response.json({ error: 'BRIDGE_URL not set' }, { status: 500 });
    const token = secrets.get('BRIDGE_TOKEN') || '';

    const res = await fetch(base + '/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ limit: 50 }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return Response.json({ error: 'bridge /emails failed', detail }, { status: 502 });
    }
    const data = await res.json();
    const emails = Array.isArray(data.emails) ? data.emails : [];

    const seen = await loadSeenUids(ent);

    let added = 0;
    for (const m of emails) {
      const uid = String(m.uid || '');
      if (!uid || seen.has(uid)) continue;
      await ent.Email.create({
        sender: m.sender || '',
        sender_email: m.sender_email || '',
        subject: m.subject || '(geen onderwerp)',
        body: '',
        timestamp: m.timestamp || new Date().toISOString(),
        status: m.unread ? 'unread' : 'read',
        folder: 'inbox',
        gmail_message_id: uid,
      }).catch(() => {});
      added++;
    }

    await dedupEmails(ent).catch(() => null);

    return Response.json({ ok: true, added, total: emails.length, mode: user ? 'user' : 'service' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}