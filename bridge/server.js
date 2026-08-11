// Giulia email-bridge — a tiny Node server that does the IMAP/SMTP work the
// Base44 backend runtime can't (raw TCP), and exposes three HTTPS endpoints
// the Base44 functions call with a bearer token.
//
// Endpoints (all POST, JSON body, require Authorization: Bearer <BRIDGE_TOKEN>):
//   /emails       { limit }            -> { emails: [{ uid, sender, sender_email, subject, timestamp, unread }] }
//   /email-body   { uid }              -> { uid, subject, text, html, from, date }
//   /send         { to, subject, message?, html?, replyTo? } -> { sent, messageId }
//
// Deploy on any Node host (Render, Railway, Fly, a VPS). Set the env vars
// below (same IMAP/SMTP values you already have), point a Base44 secret
// BRIDGE_URL at this server's public HTTPS URL, and BRIDGE_TOKEN to the same
// token you set here.

const express = require('express');
const { ImapFlow } = require('imapflow');
const nodemailer = require('nodemailer');

const TOKEN = process.env.BRIDGE_TOKEN;
const IMAP_HOST = process.env.IMAP_HOST;
const IMAP_PORT = Number(process.env.IMAP_PORT) || 993;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;

const app = express();
app.use(express.json({ limit: '10mb' }));

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!TOKEN || token !== TOKEN) return res.status(401).json({ error: 'unauthorized' });
  next();
}

function makeImap() {
  return new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    logger: false,
  });
}

app.post('/emails', auth, async (req, res) => {
  let client;
  try {
    const limit = Math.min(Number(req.body && req.body.limit) || 30, 100);
    client = makeImap();
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const uids = await client.search({ all: true }, { uid: true });
      const total = client.mailbox ? client.mailbox.exists : null;
      const last = uids.slice(-limit);
      const fetched = [];
      for await (const msg of client.fetch(last, { envelope: true, flags: true, internalDate: true, uid: true }, { uid: true })) {
        const from = (msg.envelope && msg.envelope.from && msg.envelope.from[0]) || {};
        const seen = msg.flags && msg.flags.has ? msg.flags.has('\\Seen') : false;
        fetched.push({
          uid: String(msg.uid),
          sender: from.name || from.address || '',
          sender_email: from.address || '',
          subject: (msg.envelope && msg.envelope.subject) || '(geen onderwerp)',
          timestamp: msg.internalDate
            ? msg.internalDate.toISOString()
            : (msg.envelope && msg.envelope.date ? new Date(msg.envelope.date).toISOString() : new Date().toISOString()),
          unread: !seen,
        });
      }
      fetched.sort((a, b) => (a.uid < b.uid ? 1 : -1));
      res.json({ emails: fetched, debug: { mailbox: 'INBOX', total, uidsCount: uids.length } });
    } finally {
      lock.release();
      await client.logout().catch(() => {});
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/email-body', auth, async (req, res) => {
  let client;
  try {
    const uid = String((req.body && req.body.uid) || '');
    if (!uid) return res.status(400).json({ error: 'uid required' });
    const { simpleParser } = require('mailparser');
    client = makeImap();
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const msg = await client.fetchOne(uid, { source: true }, { uid: true });
      if (!msg || !msg.source) return res.status(404).json({ error: 'not found' });
      const parsed = await simpleParser(msg.source);
      res.json({
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
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/send', auth, async (req, res) => {
  try {
    const { to, subject, message, html, replyTo } = req.body || {};
    if (!to || !subject) return res.status(400).json({ error: 'to and subject required' });
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
    const info = await transporter.sendMail({
      from: EMAIL_USER,
      to,
      replyTo: replyTo || undefined,
      subject,
      text: message || '',
      html: html || undefined,
    });
    res.json({ sent: true, messageId: info.messageId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('giulia-email-bridge listening on ' + port));