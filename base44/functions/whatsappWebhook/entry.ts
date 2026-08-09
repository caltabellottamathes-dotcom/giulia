import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { secrets } from "base44:runtime";

/**
 * whatsappWebhook — Meta WhatsApp Business Cloud API webhook endpoint.
 * GET  → verify token challenge (hub.verify_token must match WHATSAPP_VERIFY_TOKEN).
 * POST → store incoming text messages as WhatsAppMessage (direction: received,
 *        status: unread), which triggers the "WhatsApp Auto-Draft" workflow so
 *        Giulia prepares a reply. Unknown numbers create a Contact.
 * Register this endpoint URL + the WHATSAPP_VERIFY_TOKEN in the Meta App Dashboard.
 */
function normalizePhone(p) {
  return String(p || "").replace(/[^\d]/g, "");
}

export default async function (req) {
  try {
    const url = new URL(req.url);

    // --- Verification (GET) ---
    if (req.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      if (mode === "subscribe" && token === secrets.get("WHATSAPP_VERIFY_TOKEN") && challenge) {
        return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
      }
      return new Response("Forbidden", { status: 403 });
    }

    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const payload = await req.json().catch(() => ({}));
    const base44 = createClientFromRequest(req);

    const entries = payload?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        if (change?.field !== "messages") continue;
        const value = change?.value || {};
        const contacts = value.contacts || [];
        const messages = value.messages || [];
        for (const msg of messages) {
          if (msg.type !== "text") continue;
          const from = msg.from;
          const text = msg.text?.body || "";
          if (!from || !text) continue;
          const ts = msg.timestamp ? new Date(Number(msg.timestamp) * 1000).toISOString() : new Date().toISOString();
          const waName = contacts.find((c) => c.wa_id === from)?.profile?.name || "";

          const phone = normalizePhone(from);
          const allContacts = await base44.asServiceRole.entities.Contact.list().catch(() => []);
          let contact = allContacts.find((c) => normalizePhone(c.phone) === phone && phone);
          if (!contact) {
            contact = await base44.asServiceRole.entities.Contact.create({ name: waName || from, phone: from });
          }

          await base44.asServiceRole.entities.WhatsAppMessage.create({
            contact_id: contact.id,
            message: text,
            direction: "received",
            status: "unread",
            timestamp: ts,
          });
        }
      }
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}