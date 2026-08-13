import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

/**
 * syncEmails — haalt de laatste emails op via de IMAP-bridge (NIET Gmail) en
 * persisteert ze in de Email-entity, gedupliceerd op uid (opgeslagen in
 * gmail_message_id). Nieuwe ongelezen emails krijgen status "unread" zodat de
 * ingestion-pipeline (manageCommunication / interpretInput) ze oppikt.
 *
 * Bestaande emails worden ook gesynchroniseerd: als Salvo een mail in zijn
 * mailbox heeft gelezen, wordt de status hier bijgewerkt naar "read" (tenzij
 * Giulia het bericht al had getriaged) — zodat "emails worden nooit op
 * gelezen gezet" verleden tijd is.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const ent = user ? base44.entities : base44.asServiceRole.entities;

    const base = (secrets.get('BRIDGE_URL') || '').replace(/\/$/, '');
    if (!base) return Response.json({ error: 'BRIDGE_URL not set' }, { status: 500 });

    const res = await fetch(base + '/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (secrets.get('BRIDGE_TOKEN') || ''),
      },
      body: JSON.stringify({ limit: 50 }),
    });
    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.error || 'bridge error' }, { status: res.status });

    const fetched = Array.isArray(data.emails) ? data.emails : [];
    const existing = await ent.Email.list("-created_date", 200).catch(() => []);
    const byUid = new Map();
    existing.forEach((e) => { if (e.gmail_message_id) byUid.set(String(e.gmail_message_id), e); });

    let added = 0;
    let updated = 0;
    for (const m of fetched) {
      const uid = String(m.uid || '');
      if (!uid) continue;
      const wantStatus = m.unread ? 'unread' : 'read';
      const ex = byUid.get(uid);
      if (ex) {
        // Synchroniseer gelezen-status met de mailbox (behalve als Giulia al triaged).
        if (ex.status !== wantStatus && !ex.triaged) {
          await ent.Email.update(ex.id, { status: wantStatus }).catch(() => null);
          updated++;
        }
        continue;
      }
      await ent.Email.create({
        sender: m.sender || '',
        sender_email: m.sender_email || '',
        subject: m.subject || '(geen onderwerp)',
        body: '',
        timestamp: m.timestamp || new Date().toISOString(),
        status: wantStatus,
        folder: 'inbox',
        gmail_message_id: uid,
        agent_source: 'bridge',
      }).catch(() => null);
      added++;
    }

    return Response.json({ ok: true, added, updated, total: fetched.length, mode: user ? 'user' : 'service' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}