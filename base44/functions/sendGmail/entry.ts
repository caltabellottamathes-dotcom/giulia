import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * sendGmail — sends an approved email through the connected Gmail account.
 * Builds an RFC 2822 message (RFC 2047 subject + base64 body) and sends via Gmail API.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { to, subject, message } = body;
    if (!to || !subject) {
      return Response.json({ error: 'to and subject required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const enc = (s) => btoa(unescape(encodeURIComponent(s)));
    const b64url = (s) =>
      btoa(unescape(encodeURIComponent(s)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const raw = [
      `From: ${user.email || 'me'}`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      enc(message || ''),
    ].join('\r\n');

    const res = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: b64url(raw) }),
      }
    );
    if (!res.ok) {
      return Response.json({ error: 'send failed', detail: await res.text() }, { status: 502 });
    }
    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}