import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * syncGmail — pulls recent inbox messages from the connected Gmail account
 * into the Email entity (deduped by gmail_message_id). Works both with a
 * logged-in user and without (scheduled/service-role).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const ent = user ? base44.entities : base44.asServiceRole.entities;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const h = { Authorization: `Bearer ${accessToken}` };

    // Query Gmail directly for the custom domain so we only ever pull mail
    // involving mail@salvatorecaltabellotta.com (ignores the Gmail mailbox).
    const listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=' +
        encodeURIComponent('in:inbox'),
      { headers: h }
    );
    if (!listRes.ok) {
      return Response.json({ error: 'gmail list failed', detail: await listRes.text() }, { status: 502 });
    }
    const list = await listRes.json();
    const ids = (list.messages || []).map((m) => m.id);

    const existing = await ent.Email.filter({ folder: 'inbox' });
    const seen = new Set(existing.map((e) => e.gmail_message_id).filter(Boolean));

    let added = 0;
    for (const id of ids) {
      if (seen.has(id)) continue;
      const mRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Delivered-To&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: h }
      );
      if (!mRes.ok) continue;
      const m = await mRes.json();
      const headers = m.payload?.headers || [];
      const get = (n) =>
        headers.find((x) => x.name.toLowerCase() === n.toLowerCase())?.value || '';
      const from = get('from');
      const subject = get('subject') || '(geen onderwerp)';
      const senderName = from.replace(/<.*>/, '').trim().replace(/"/g, '') || from;
      const senderEmail = (from.match(/<([^>]+)>/) || [, from])[1];
      const toHdr = get('to');
      const deliveredTo = get('delivered-to');
      // Only sync mail for the custom address (mail@salvatorecaltabellotta.com) — ignore the Gmail mailbox.
      const isOurs = [from, toHdr, deliveredTo].some((v) => /salvatorecaltabellotta\.com/i.test(v || ''));
      if (!isOurs) continue;

      await ent.Email.create({
        sender: senderName,
        sender_email: senderEmail,
        subject,
        body: m.snippet || '',
        timestamp: new Date(Number(m.internalDate)).toISOString(),
        status: m.labelIds?.includes('UNREAD') ? 'unread' : 'read',
        folder: 'inbox',
        gmail_message_id: id,
        gmail_thread_id: m.threadId,
      });
      added++;
    }

    return Response.json({ ok: true, added, total: ids.length, mode: user ? 'user' : 'service' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}