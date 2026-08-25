import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { loadContacts } from "../../shared/contactResolver.ts";

/**
 * evoWebhook — ontvangt WhatsApp-berichten van Evolution API v2 en slaat ze op.
 *
 * Wat binnenkomt:
 *  - 1:1 berichten (ontvangen én eigen verzonden) → gekoppeld aan bestaand
 *    Contact op telefoonnummer.
 *  - Groepsgesprekken (@g.us) → gekoppeld aan één groeps-Contact (name = groeps-
 *    onderwerp uit pushName, phone = volledige group-jid). Bij ontvangen
 *    groepsberichten wordt de afzender (participant) als prefix getoond, zodat
 *    je ziet wie wat zei — net als op je telefoon.
 *
 * Eigen verzonden berichten (fromMe === true) worden OOK opgeslagen
 * (direction: "sent"), zodat je je eigen kant van het gesprek hier ziet.
 *
 * Beveiliging: apikey wordt gelogd bij mismatch maar niet gerejecteerd (de
 * webhook-URL is het auth-mechanisme). Ontdubbeling via whatsapp_message_id.
 */
function normalizePhone(raw) {
  if (!raw) return "";
  let d = String(raw).replace(/[^\d]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0") && d.length === 10) d = "31" + d.slice(1);
  return d;
}
function jidPhone(jid) {
  return normalizePhone(String(jid || "").replace(/@.*$/, ""));
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
    if (req.method === "GET") return Response.json({ ok: true, service: "evo-webhook", v: "2026-08-25" });

    const body = await req.json().catch(() => ({}));
    const event = body?.event;
    const data = body?.data || {};

    const expectedKey = (secrets.get("EVO_API_KEY") || "").split("](")[0].trim();
    const sentKey = req.headers?.get?.("apikey") || body?.apikey || "";
    if (expectedKey && sentKey && sentKey !== expectedKey) {
      console.log("[evo] apikey mismatch (ignored) — expected len=", expectedKey.length, "got len=", sentKey.length);
    }

    // Evolution v2 kent twee payload-vormen: één bericht-object of { messages: [...] }.
    const msgList = Array.isArray(data?.messages) ? data.messages
      : Array.isArray(data) ? data
      : (data?.key || data?.message) ? [data]
      : [];
    console.log("[evo] event=", event, "msgCount=", msgList.length, "topKeys=", Object.keys(data || {}));

    if (String(event).toLowerCase() !== "messages.upsert") return Response.json({ ok: true, ignored: event });
    if (msgList.length === 0) return Response.json({ ok: true, ignored: "no-messages" });

    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    let stored = 0, skipped = 0;
    let contacts = await loadContacts(sr.entities);

    const nameByPhone = (ph) => {
      if (!ph) return "";
      const m = contacts.find((c) => normalizePhone(c.phone || "") === ph);
      return m?.name || "";
    };

    for (const msg of msgList) {
      const remoteJid = msg?.key?.remoteJid || "";
      const isGroup = remoteJid.endsWith("@g.us");
      const evoMsgId = msg?.key?.id || "";
      const fromMe = msg?.key?.fromMe === true;
      const text = extractText(msg?.message);
      const pushName = msg?.pushName || "";
      const participant = msg?.key?.participant || "";
      const ts = msg?.messageTimestamp
        ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
        : new Date().toISOString();

      console.log("[evo-msg] fromMe=", fromMe, "group=", isGroup, "jid=", remoteJid, "pushName=", pushName, "participant=", participant, "text=", text ? "yes" : "no", "id=", evoMsgId);

      // Ontdubbel.
      if (evoMsgId) {
        const existing = await sr.entities.WhatsAppMessage.filter({ whatsapp_message_id: evoMsgId }).catch(() => []);
        if (existing && existing.length > 0) { skipped++; continue; }
      }
      // Media zonder caption (geen tekst) slaan we niet op.
      if (!text) { skipped++; continue; }

      let contactId = "";
      let displayText = text;

      if (isGroup) {
        // Groep → koppel aan één groeps-Contact op de volledige group-jid.
        let grp = contacts.find((c) => (c.phone || "") === remoteJid && c.relationship_type === "groep");
        if (!grp) {
          grp = await sr.entities.Contact.create({
            name: pushName || ("Groep " + remoteJid.replace(/@.*$/, "").slice(-6)),
            phone: remoteJid,
            relationship_type: "groep",
            relationship_domain: "life",
            agent_source: "evoWebhook",
            status: "confirmed",
          }).catch(() => null);
          if (grp) contacts.push(grp);
        }
        contactId = grp?.id || "";
        // Toon in de groep wie sprak bij ontvangen berichten (participant).
        if (!fromMe && participant) {
          const pphone = jidPhone(participant);
          const pname = nameByPhone(pphone) || participant.replace(/@.*$/, "");
          if (pname) displayText = `${pname}: ${text}`;
        }
      } else {
        // 1:1 → koppel aan bestaand Contact op telefoon (met bestaande merge).
        const phone = jidPhone(remoteJid);
        if (phone) {
          const matching = contacts.filter((c) => normalizePhone(c.phone || "") === phone);
          if (matching.length > 0) {
            matching.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
            const main = matching[0];
            contactId = main.id;
            if (matching.length > 1) {
              for (const d of matching.slice(1)) {
                await sr.entities.WhatsAppMessage.updateMany({ contact_id: d.id }, { $set: { contact_id: main.id } }).catch(() => {});
                await sr.entities.Contact.delete(d.id).catch(() => {});
              }
            }
          }
        }
      }

      await sr.entities.WhatsAppMessage.create({
        contact_id: contactId || undefined,
        conversation_id: remoteJid || undefined,
        message: displayText,
        direction: fromMe ? "sent" : "received",
        status: fromMe ? "delivered" : "unread",
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