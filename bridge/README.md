# Giulia email-bridge

De Base44-backend-runtime kan geen raw TCP-verbindingen (IMAP/SMTP) maken.
Deze kleine Node-server doet dat wél, en stelt drie HTTPS-endpoints bloot die
de Base44-functies (`fetchPrivateEmails`, `fetchPrivateEmailBody`,
`sendPrivateEmail`) aanroepen.

## Endpoints
Alle POST, JSON-body, header `Authorization: Bearer <BRIDGE_TOKEN>`.

| Endpoint     | Body                                   | Response |
|--------------|----------------------------------------|----------|
| `/emails`    | `{ limit }`                            | `{ emails: [...] }` |
| `/email-body`| `{ uid }`                              | `{ uid, subject, text, html, from, date }` |
| `/send`      | `{ to, subject, message?, html?, replyTo? }` | `{ sent, messageId }` |

## Environment variables (op de bridge-host)
```
BRIDGE_TOKEN=een-lang-willekeurig-token
IMAP_HOST=imap.jouwdomein.nl
IMAP_PORT=993
EMAIL_USER=mail@jouwdomein.nl
EMAIL_PASS=jouwwachtwoord
SMTP_HOST=smtp.jouwdomein.nl
SMTP_PORT=465
```
Gebruik dezelfde IMAP/SMTP-waarden als in de app-secrets; `BRIDGE_TOKEN` moet
ook als gelijknamige secret in Base44 staan, en `BRIDGE_URL` wijst naar de
publieke HTTPS-URL van deze server.

## Deploy
- **Render / Railway / Fly.io:** nieuwe web-service, build `npm install`,
  start `npm start`, zet de env vars hierboven. Kopieer de publieke URL.
- **VPS:** `npm install && npm start`, of achter een reverse proxy (HTTPS)
  met een certificaat (Let's Encrypt). De Base44-functies vereisen HTTPS.

## Daarna in Base44
1. Zet secrets `BRIDGE_URL` (de URL hiervan) en `BRIDGE_TOKEN` (zelfde token).
2. De drie functies (`fetchPrivateEmails`, `fetchPrivateEmailBody`,
   `sendPrivateEmail`) staan al klaar om deze bridge aan te roepen.
3. Zodra de bridge draait, kan de email-app worden omgeschakeld van Gmail naar
   deze functies.

## Lokaal testen
```bash
npm install
BRIDGE_TOKEN=test IMAP_HOST=... EMAIL_USER=... EMAIL_PASS=... SMTP_HOST=... npm start
curl -X POST http://localhost:8080/emails -H "Authorization: Bearer test" -H "Content-Type: application/json" -d '{"limit":5}'
``