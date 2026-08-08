import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { secrets } from "base44:runtime";
import webpush from "npm:web-push@3.6.7";

/**
 * sendPush — sends a web push notification to every registered device.
 * Payload: { title, body, url, icon?, api_key? }
 * The private VAPID key is read from the VAPID_PRIVATE_KEY secret; the public
 * key is embedded here (it is not secret). Authorized by an internal caller
 * passing api_key === GIULIA_API_KEY, or an authenticated admin user.
 */
const VAPID_PUBLIC_KEY =
  "BDCdfbYfMNevtsXxoRQOAOa9esUu7aw350rCS6NrESRddmxQDpjcpvscwH9t_3fUaeS7QaFVnLARyQ784dEj0DU";
const VAPID_SUBJECT = "mailto:mail@salvatorecaltabellotta.com";
const DEFAULT_ICON =
  "https://media.base44.com/images/public/6a6cc0011ab9e3b32cfc1057/a408b643e_Gemini_Generated_Image_2gi5oq2gi5oq2gi51.png";

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, body: notifBody, url, icon, api_key } = body || {};

    const base44 = createClientFromRequest(req);
    let authorized = false;
    if (api_key && api_key === secrets.get("GIULIA_API_KEY")) authorized = true;
    if (!authorized) {
      const user = await base44.auth.me().catch(() => null);
      if (user && user.role === "admin") authorized = true;
    }
    if (!authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!title) return Response.json({ error: "title required" }, { status: 400 });

    const privateKey = secrets.get("VAPID_PRIVATE_KEY");
    if (!privateKey) {
      return Response.json({ error: "VAPID_PRIVATE_KEY not configured" }, { status: 500 });
    }

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, privateKey);

    const subs = await base44.asServiceRole.entities.PushSubscription.list();
    const payload = JSON.stringify({
      title,
      body: notifBody || "",
      icon: icon || DEFAULT_ICON,
      url: url || "/",
    });

    let sent = 0;
    let failed = 0;
    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.keys_p256dh, auth: s.keys_auth } },
          payload
        );
        sent++;
      } catch (err) {
        failed++;
        // 404/410 → subscription expired or invalid; remove it
        if (err.statusCode === 404 || err.statusCode === 410) {
          try {
            await base44.asServiceRole.entities.PushSubscription.delete(s.id);
          } catch {
            /* ignore */
          }
        }
      }
    }

    return Response.json({ sent, failed, total: subs.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}