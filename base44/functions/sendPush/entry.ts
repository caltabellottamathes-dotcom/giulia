import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { secrets } from "base44:runtime";
import webpush from "npm:web-push@3.6.7";

/**
 * sendPush — sends a web push notification to every registered device.
 * Payload: { title, body, url, api_key? }
 * Authorized by: an internal caller passing api_key === GIULIA_API_KEY
 * (workflows / other functions), or an authenticated admin user.
 */
export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, body: notifBody, url, api_key } = body || {};

    const base44 = createClientFromRequest(req);
    let authorized = false;
    if (api_key && api_key === secrets.get("GIULIA_API_KEY")) authorized = true;
    if (!authorized) {
      const user = await base44.auth.me().catch(() => null);
      if (user && user.role === "admin") authorized = true;
    }
    if (!authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });

    if (!title) return Response.json({ error: "title required" }, { status: 400 });

    const publicKey = secrets.get("VAPID_PUBLIC_KEY");
    const privateKey = secrets.get("VAPID_PRIVATE_KEY");
    if (!publicKey || !privateKey) {
      return Response.json({ error: "VAPID keys not configured" }, { status: 500 });
    }

    webpush.setVapidDetails(
      "mailto:mail@salvatorecaltabellotta.com",
      publicKey,
      privateKey
    );

    const subs = await base44.asServiceRole.entities.PushSubscription.list();
    const payload = JSON.stringify({ title, body: notifBody || "", url: url || "/" });

    let sent = 0;
    let failed = 0;
    for (const s of subs) {
      try {
        const subscription = {
          endpoint: s.endpoint,
          keys: { p256dh: s.keys_p256dh, auth: s.keys_auth },
        };
        await webpush.sendNotification(subscription, payload);
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