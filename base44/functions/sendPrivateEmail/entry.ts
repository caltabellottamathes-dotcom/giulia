import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

/**
 * sendPrivateEmail — proxy to the external email bridge (which sends via
 * SMTP). Never called automatically — only after explicit approval in the
 * app. SMTP runs on the bridge host; this function only speaks HTTPS to it.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { to, subject, message, html, replyTo } = body;
    if (!to || !subject) return Response.json({ error: 'to and subject required' }, { status: 400 });

    const base = (secrets.get('BRIDGE_URL') || '').replace(/\/$/, '');
    if (!base) return Response.json({ error: 'BRIDGE_URL not set' }, { status: 500 });

    const res = await fetch(base + '/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (secrets.get('BRIDGE_TOKEN') || ''),
      },
      body: JSON.stringify({ to, subject, message, html, replyTo }),
    });
    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.error || 'bridge error' }, { status: res.status });
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}