import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { ImapFlow } from 'npm:imapflow@1.0.182';
import { secrets } from 'base44:runtime';

/**
 * fetchPrivateEmails — reads the inbox via IMAP and returns the last N emails
 * with sender, subject, date and read/unread status. IMAP secrets are in the app.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Number(body?.limit) || 30, 100);

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
      const uids = await client.search({ all: true });
      const last = uids.slice(-limit).reverse();
      const emails = [];
      for (const uid of last) {
        const msg = await client.fetchOne(uid, { envelope: true, flags: true, internalDate: true }, { uid: true });
        if (!msg) continue;
        const from = (msg.envelope && msg.envelope.from && msg.envelope.from[0]) || {};
        const flags = msg.flags || [];
        const seen = flags.has ? flags.has('\\Seen') : Array.from(flags).includes('\\Seen');
        const ts = msg.internalDate
          ? msg.internalDate.toISOString()
          : (msg.envelope && msg.envelope.date ? new Date(msg.envelope.date).toISOString() : new Date().toISOString());
        emails.push({
          uid: String(uid),
          sender: from.name || from.address || '',
          sender_email: from.address || '',
          subject: (msg.envelope && msg.envelope.subject) || '(geen onderwerp)',
          timestamp: ts,
          unread: !seen,
        });
      }
      return Response.json({ emails });
    } finally {
      lock.release();
      await client.logout().catch(() => {});
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}