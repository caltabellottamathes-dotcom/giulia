import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

/**
 * evoWebhook — ontvangt inkomende WhatsApp-berichten van Evolution API v2.
 *
 * Evolution stuurt voor elk event een POST naar deze functie (messages.upsert,
 * connection.update, qrcode.updated, ...). Wij filteren op inkomende
 * tekstberichten (fromMe === false), koppelen de afzender aan een Contact op
 * telefoonnummer, en slaan het op als WhatsAppMessage (direction: received,
 * status: unread). De bestaande "WhatsApp Ingestion" + "WhatsApp Auto-Draft"
 * workflows reageren daarop → interpretInput + autoDraftWhatsApp.
 *
 * Beveiliging: de apikey in de payload wordt gecheckt tegen EVO_API_KEY.
 * Ontdubbeling: via whatsapp_message_id (Evolution/Baileys key.id).
 */
function normalizePhone(raw) {
  if (!raw) return "";
  let d = String(raw).replace(/[^\d]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0") && d.length === 10) d = "31" + d.slice(1);
  return d;
}

function extractText(message) {
  if (!message || typeof message !== "object") return "";
  if (typeof message.conversation === "string") return message.conversation;
  if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
  if (message.imageMessage?.caption) return message.imageMessage.caption;
  if (message.videoMessage?.caption) return message.videoMessage.caption;
  return "";
}

export default async function (req) {
  try {
    // Evolution stuurt geen verification-GET; wel event-POSTs. Laat een
    // eenvoudige GET toe voor handmatige health-checks.
    if (req.method === "GET") return Response.json({ ok: true, service: "evo-webhook" });

    const body = await req.json().catch(() => ({}));
    const event = body?.event;
    const data = body?.data || {};

    // Beveiliging: controleer de apikey die Evolution meestuurt.
    // Evolution v2 stuurt de apikey in de `apikey` header; sommige flows
    // sturen hem ook in de body — accepteer beide.
    const expectedKey = secrets.get("EVO_API_KEY");
    const sentKey = req.headers?.get?.("apikey") || body?.apikey || "";
    if (expectedKey && sentKey && sentKey !== expectedKey) {
      return Response.json({ ok: false, error: "invalid apikey" }, { status: 401 });
    }

    // Alleen inkomende berichten interesseren ons.
    console.log("[evo] event=", event, "fromMe=", data?.key?.fromMe, "remoteJid=", data?.key?.remoteJid, "msgType=", data?.message ? Object.keys(data.message)[0] : null);
    if (event !== "messages.upsert") return Response.json({ ok: true, ignored: event });
    if (data?.key?.fromMe === true) return Response.json({ ok: true, ignored: "outgoing" });

    const text = extractText(data?.message);
    if (!text) return Response.json({ ok: true, ignored: "non-text", msgType: data?.message ? Object.keys(data.message)[0] : null });

    const remoteJid = data?.key?.remoteJid || "";
    const phone = normalizePhone(remoteJid.replace(/@.*$/, ""));
    const pushName = data?.pushName || "";
    const evoMsgId = data?.key?.id || "";
    const ts = data?.messageTimestamp
      ? new Date(Number(data.messageTimestamp) * 1000).toISOString()
      : new Date().toISOString();

    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // Ontdubbel: als dit bericht al is opgeslagen, sla dan niet opnieuw op.
    if (evoMsgId) {
      const existing = await sr.entities.WhatsAppMessage.filter({ whatsapp_message_id: evoMsgId }).catch(() => []);
      if (existing && existing.length > 0) return Response.json({ ok: true, duplicate: true });
    }

    // Koppel aan een Contact op genormaliseerd telefoonnummer, indien aanwezig.
    let contactId = "";
    if (phone) {
      const matches = await sr.entities.Contact.filter({ phone }).catch(() => []);
      const found = (matches || []).find((c) => normalizePhone(c.phone) === phone);
      contactId = found?.id || "";
    }

    await sr.entities.WhatsAppMessage.create({
      contact_id: contactId || undefined,
      message: text,
      direction: "received",
      status: "unread",
      timestamp: ts,
      whatsapp_message_id: evoMsgId || undefined,
    });

    return Response.json({ ok: true, stored: true, phone, pushName, contactId: !!contactId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}