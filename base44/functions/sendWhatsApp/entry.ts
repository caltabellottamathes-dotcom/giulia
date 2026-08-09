import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { secrets } from "base44:runtime";

/**
 * sendWhatsApp — sends a WhatsApp Business Cloud API text message for real.
 * Payload: { to, message, api_key? }
 * `to` = destination phone number (intl digits; '+' and spaces stripped).
 * The stored WHATSAPP_PHONE_NUMBER_ID may be the Phone Number ID (used
 * directly) OR the WhatsApp Business Account (WABA) ID — in the latter case we
 * resolve the first phone_number_id from the WABA and retry. The resolved id is
 * cached per worker instance. Authorized by GIULIA_API_KEY or an admin user.
 */
let cachedPhoneId = null;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { to, message, api_key } = body || {};
    if (!to || !message) return Response.json({ error: "to and message required" }, { status: 400 });

    let authorized = false;
    if (api_key && api_key === secrets.get("GIULIA_API_KEY")) authorized = true;
    if (!authorized) {
      const user = await base44.auth.me().catch(() => null);
      if (user && user.role === "admin") authorized = true;
    }
    if (!authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const storedId = secrets.get("WHATSAPP_PHONE_NUMBER_ID");
    const accessToken = secrets.get("WHATSAPP_ACCESS_TOKEN");
    if (!storedId || !accessToken) {
      return Response.json({ error: "WhatsApp credentials not configured" }, { status: 500 });
    }

    const phone = String(to).replace(/[^\d]/g, "");
    const doSend = (pid) =>
      fetch(`https://graph.facebook.com/v21.0/${pid}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: phone, type: "text", text: { body: String(message) } }),
      });

    let res = await doSend(cachedPhoneId || storedId);
    let data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data?.error?.message || "";
      const retriable = /does not exist|does not support|permission|not allowed|unsupported/i.test(msg);
      if (retriable) {
        // stored id is likely the WABA id — resolve a phone_number_id from it
        const r = await fetch(`https://graph.facebook.com/v21.0/${storedId}/phone_numbers`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const d = await r.json().catch(() => ({}));
        const resolved = d?.data?.[0]?.id;
        if (resolved && resolved !== storedId) {
          cachedPhoneId = resolved;
          res = await doSend(resolved);
          data = await res.json().catch(() => ({}));
        }
      }
    }

    if (!res.ok) {
      return Response.json({ error: data?.error?.message || "WhatsApp send failed" }, { status: 502 });
    }
    return Response.json({ ok: true, message_id: data?.messages?.[0]?.id || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}