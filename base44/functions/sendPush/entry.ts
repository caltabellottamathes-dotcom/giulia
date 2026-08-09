import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import webpush from 'npm:web-push@3.6.7';
import { secrets } from "base44:runtime";

/**
 * sendPush — sends a web push notification to every registered PushSubscription
 * for this app. Uses VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY secrets.
 * Best-effort: failures per subscription are counted, not fatal.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const title = body.title || "Giulia";
    const message = body.message || "";

    const vapidPublic = secrets.get("VAPID_PUBLIC_KEY");
    const vapidPrivate = secrets.get("VAPID_PRIVATE_KEY");
    if (!vapidPublic || !vapidPrivate) {
      return Response.json({ error: "VAPID keys not configured" }, { status: 500 });
    }

    webpush.setVapidDetails("mailto:giulia@salvatorecaltabellotta.com", vapidPublic, vapidPrivate);

    const subs = await base44.asServiceRole.entities.PushSubscription.list().catch(() => []);
    const payload = JSON.stringify({ title, body: message });

    let sent = 0;
    let failed = 0;
    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.keys_p256dh, auth: s.keys_auth } },
          payload
        );
        sent++;
      } catch (e) {
        failed++;
      }
    }

    return Response.json({ ok: true, sent, failed, total: subs.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}