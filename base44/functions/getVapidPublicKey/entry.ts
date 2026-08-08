import { secrets } from "base44:runtime";

/**
 * getVapidPublicKey — returns the app's VAPID public key so the browser can
 * create a push subscription. The public key is not secret, so no auth gate.
 */
export default async function (req) {
  try {
    const publicKey = secrets.get("VAPID_PUBLIC_KEY");
    if (!publicKey) {
      return Response.json({ error: "VAPID public key not configured" }, { status: 500 });
    }
    return Response.json({ publicKey });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}