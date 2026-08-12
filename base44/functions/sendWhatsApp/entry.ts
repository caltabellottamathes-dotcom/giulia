import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

/**
 * sendWhatsApp — stuurt een echt WhatsApp-bericht via de WhatsApp Cloud API
 * (WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID) en legt het lokaal vast als
 * een uitgaand WhatsAppMessage. Ontvanger via contact_id (→ Contact.phone) of
 * een direct `to` telefoonnummer (E.164).
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
    let to = normalizePhone(body.to);
    const contactId = body.contact_id || "";
    if (!message) return Response.json({ error: "message required" }, { status: 400 });

    if (!to && contactId) {
      const c = await sr.entities.Contact.get(contactId).catch(() => null);
      to = normalizePhone(c?.phone || "");
    }
    if (!to) return Response.json({ error: "no recipient phone" }, { status: 400 });

    const token = secrets.get("WHATSAPP_ACCESS_TOKEN");
    const phoneId = secrets.get("WHATSAPP_PHONE_NUMBER_ID");
    if (!token || !phoneId) return Response.json({ error: "WhatsApp not configured" }, { status: 500 });

    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: message } }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.messages?.[0]?.id) {
      return Response.json({ ok: false, error: (data?.error && data.error.message) || "send failed", detail: JSON.stringify(data).slice(0, 300) });
    }

    await sr.entities.WhatsAppMessage.create({
      contact_id: contactId || undefined,
      message,
      direction: "sent",
      timestamp: new Date().toISOString(),
      status: "delivered",
    }).catch(() => {});

    return Response.json({ ok: true, sent: true, message_id: data.messages[0].id, to });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}