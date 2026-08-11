import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import nodemailer from 'npm:nodemailer@6.9.14';
import { secrets } from 'base44:runtime';

/**
 * sendPrivateEmail — sends an email directly via SMTP. Never called
 * automatically; only after explicit approval from the app. SMTP secrets live
 * in the app.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { to, subject, message, html, replyTo } = body;
    if (!to || !subject) return Response.json({ error: 'to and subject required' }, { status: 400 });

    const port = Number(secrets.get('SMTP_PORT')) || 465;
    const transporter = nodemailer.createTransport({
      host: secrets.get('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: { user: secrets.get('EMAIL_USER'), pass: secrets.get('EMAIL_PASS') },
    });

    const info = await transporter.sendMail({
      from: secrets.get('EMAIL_USER'),
      to,
      replyTo: replyTo || undefined,
      subject,
      text: message || '',
      html: html || undefined,
    });

    return Response.json({ sent: true, messageId: info.messageId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}