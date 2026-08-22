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
    if (req.method === "GET") return Response.json({ ok: true, service: "evo-webhook", v: "2026-08-22-v2" });

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
    // Evolution v2 kan de payload op twee manieren sturen:
    //   1) data = één bericht-object { key, message, pushName, ... }
    //   2) data = { messages: [ { key, message, ... }, ... ] }
    const msgList = Array.isArray(data?.messages) ? data.messages
      : Array.isArray(data) ? data
      : (data?.key || data?.message) ? [data]
      : [];
    console.log("[evo] event=", event, "msgCount=", msgList.length, "topKeys=", Object.keys(data || {}));

    if (String(event).toLowerCase() !== "messages.upsert") return Response.json({ ok: true, ignored: event, lower: String(event).toLowerCase() });
    if (msgList.length === 0) return Response.json({ ok: true, ignored: "no-messages", keys: Object.keys(data || {}) });

    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    let stored = 0, skipped = 0;

    for (const msg of msgList) {
      const remoteJid = msg?.key?.remoteJid || "";
      const phone = normalizePhone(remoteJid.replace(/@.*$/, ""));
      const evoMsgId = msg?.key?.id || "";
      const fromMe = msg?.key?.fromMe === true;
      const msgKeys = msg?.message ? Object.keys(msg.message) : [];
      const text = extractText(msg?.message);
      const pushName = msg?.pushName || "";
      const ts = msg?.messageTimestamp
        ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
        : new Date().toISOString();

      console.log("[evo-msg] fromMe=", fromMe, "jid=", remoteJid, "pushName=", pushName, "msgKeys=", msgKeys, "text=", text ? "yes" : "no", "id=", evoMsgId);

      // Ontdubbel.
      if (evoMsgId) {
        const existing = await sr.entities.WhatsAppMessage.filter({ whatsapp_message_id: evoMsgId }).catch(() => []);
        if (existing && existing.length > 0) { skipped++; continue; }
      }

      // Sla alleen inkomende tekstberichten op (fromMe === false).
      if (fromMe) { skipped++; continue; }
      if (!text) { skipped++; continue; }

      // Koppel aan een Contact op genormaliseerd telefoonnummer, indien aanwezig.
      // Geen match én wel een pushName/phone? Dan auto-creeer een Contact zodat
      // de afzender zichtbaar wordt in People + WhatsApp.
      let contactId = "";
      if (phone) {
        const matches = await sr.entities.Contact.filter({ phone }).catch(() => []);
        const found = (matches || []).find((c) => normalizePhone(c.phone) === phone);
        if (found) {
          contactId = found.id;
        } else if (pushName || phone) {
          const created = await sr.entities.Contact.create({
            name: pushName || phone,
            phone: phone,
            status: "unconfirmed",
            agent_source: "evoWebhook",
          }).catch((e) => { console.log("[evo-contact] create failed:", e.message); return null; });
          if (created) { contactId = created.id; console.log("[evo-contact] created:", created.id, pushName || phone); }
        }
      }

      await sr.entities.WhatsAppMessage.create({
        contact_id: contactId || undefined,
        message: text,
        direction: "received",
        status: "unread",
        timestamp: ts,
        whatsapp_message_id: evoMsgId || undefined,
      });
      stored++;
    }

    return Response.json({ ok: true, stored, skipped, count: msgList.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}