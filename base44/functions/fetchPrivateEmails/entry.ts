import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

/**
 * fetchPrivateEmails — proxy to the external email bridge (which reads the
 * inbox via IMAP). Returns the last N emails with sender, subject, date and
 * read/unread status. IMAP/SMTP run on the bridge host; this function only
 * speaks HTTPS to it.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const base = (secrets.get('BRIDGE_URL') || '').replace(/\/$/, '');
    if (!base) return Response.json({ error: 'BRIDGE_URL not set' }, { status: 500 });

    const res = await fetch(base + '/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (secrets.get('BRIDGE_TOKEN') || ''),
      },
      body: JSON.stringify({ limit: body?.limit || 30 }),
    });
    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.error || 'bridge error' }, { status: res.status });
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}