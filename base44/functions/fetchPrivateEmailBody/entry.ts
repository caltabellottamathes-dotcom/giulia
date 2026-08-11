import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { ImapFlow } from 'npm:imapflow@1.0.182';
import { simpleParser } from 'npm:mailparser@3.7.1';
import { secrets } from 'base44:runtime';

/**
 * fetchPrivateEmailBody — fetches the full content of one email directly via
 * IMAP by uid, returning the plain-text and HTML body. IMAP secrets live in
 * the app.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const uid = String(body?.uid || '');
    if (!uid) return Response.json({ error: 'uid required' }, { status: 400 });

    const client = new ImapFlow({
      host: secrets.get('IMAP_HOST'),
      port: Number(secrets.get('IMAP_PORT')) || 993,
      secure: true,
      auth: { user: secrets.get('EMAIL_USER'), pass: secrets.get('EMAIL_PASS') },
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const msg = await client.fetchOne(uid, { source: true }, { uid: true });
      if (!msg || !msg.source) return Response.json({ error: 'not found' }, { status: 404 });
      const parsed = await simpleParser(msg.source);
      return Response.json({
        uid,
        subject: parsed.subject || '',
        text: parsed.text || '',
        html: parsed.html || '',
        from: parsed.from && parsed.from.text ? parsed.from.text : '',
        date: parsed.date ? parsed.date.toISOString() : '',
      });
    } finally {
      lock.release();
      await client.logout().catch(() => {});
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}