import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

/**
 * sendWhatsApp — stuurt een echt WhatsApp-bericht via de Evolution API
 * (EVO_INSTANCE + EVO_API_KEY) en legt het lokaal vast als uitgaand
 * WhatsAppMessage. Ontvanger via contact_id (→ Contact.phone) of een direct
 * `to`. Groeps-jids (@g.us) en andere jids worden raw doorgegeven; telefoon-
 * nummers worden genormaliseerd naar E.164.
 */
function normalizePhone(raw) {
  if (!raw) return "";
  let d = String(raw).replace(/[^\d]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0") && d.length === 10) d = "31" + d.slice(1);
  return d;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const message = (body.message || "").trim();
    let to = body.to ? String(body.to) : "";
    const contactId = body.contact_id || "";
    if (!message) return Response.json({ error: "message required" }, { status: 400 });

    // Als 'to' geen geldig nummer/jid is (bv. een contactnaam uit een approval),
    // haal het echte nummer/jid op via het gekoppelde contact.
    const looksValid = !!to && (to.includes("@") || normalizePhone(to));
    if (!looksValid && contactId) {
      const c = await sr.entities.Contact.get(contactId).catch(() => null);
      to = c?.phone || to;
    }
    if (!to) return Response.json({ error: "no recipient phone" }, { status: 400 });

    // Groeps-jid (@g.us) of ander jid → raw; anders telefoon normaliseren.
    const recipient = to.includes("@") ? to : normalizePhone(to);
    if (!recipient) return Response.json({ error: "no recipient phone" }, { status: 400 });

    const apiUrl = (secrets.get("EVO_API_URL") || "").split("](")[0].trim().replace(/\/+$/, "");
    const instance = secrets.get("EVO_INSTANCE") || "";
    const apiKey = secrets.get("EVO_API_KEY") || "";
    if (!apiUrl || !instance || !apiKey) return Response.json({ error: "Evolution API not configured" }, { status: 500 });

    const res = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: apiKey },
      body: JSON.stringify({ number: recipient, text: message, options: { delay: 0, presence: "composing" } }),
    });
    const data = await res.json().catch(() => ({}));
    const evoMsgId = data?.key?.id || data?.messageId || "";
    if (!res.ok || (!evoMsgId && !data?.ok)) {
      return Response.json({ ok: false, error: (data?.error && (data.error.message || data.error)) || "send failed", detail: JSON.stringify(data).slice(0, 300) });
    }

    await sr.entities.WhatsAppMessage.create({
      contact_id: contactId || undefined,
      message,
      direction: "sent",
      timestamp: new Date().toISOString(),
      status: "delivered",
      whatsapp_message_id: evoMsgId || undefined,
    }).catch(() => {});

    return Response.json({ ok: true, sent: true, message_id: evoMsgId, to: recipient });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}