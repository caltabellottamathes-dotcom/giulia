import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * syncGmail — pulls recent inbox messages from the connected Gmail account
 * into the Email entity (deduped by gmail_message_id). Giulia reads the real inbox.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const h = { Authorization: `Bearer ${accessToken}` };

    const listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25',
      { headers: h }
    );
    if (!listRes.ok) {
      return Response.json({ error: 'gmail list failed', detail: await listRes.text() }, { status: 502 });
    }
    const list = await listRes.json();
    const ids = (list.messages || []).map((m) => m.id);

    const existing = await base44.entities.Email.filter({ folder: 'inbox' });
    const seen = new Set(existing.map((e) => e.gmail_message_id).filter(Boolean));

    let added = 0;
    for (const id of ids) {
      if (seen.has(id)) continue;
      const mRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
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

      await base44.entities.Email.create({
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

    return Response.json({ added, total: ids.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}