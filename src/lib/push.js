import { base44 } from "@/api/base44Client";

const SW_PATH = "/sw.js";

// VAPID public key — embedded per spec; pairs with VAPID_PRIVATE_KEY (secret)
// used by the sendPush backend function to sign push messages.
export const VAPID_PUBLIC_KEY =
  "BDCdfbYfMNevtsXxoRQOAOa9esUu7aw350rCS6NrESRddmxQDpjcpvscwH9t_3fUaeS7QaFVnLARyQ784dEj0DU";

/** Register the push service worker (idempotent). */
export async function registerPushSW() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Full subscription flow: register SW → request permission → subscribe with the
 * VAPID key → persist to the PushSubscription entity (deduped by endpoint).
 */
export async function subscribePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push wordt niet ondersteund op dit apparaat.");
  }
  const reg = await registerPushSW();
  if (!reg) throw new Error("Service worker kon niet registreren.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notificaties niet toegestaan.");

  let subscription = await reg.pushManager.getSubscription();
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const sub = subscription.toJSON();
  // Dedupe by endpoint to avoid duplicate records per device
  try {
    const existing = await base44.entities.PushSubscription.filter({ endpoint: sub.endpoint });
    if (!existing || !existing.length) {
      await base44.entities.PushSubscription.create({
        endpoint: sub.endpoint,
        keys_p256dh: sub.keys?.p256dh,
        keys_auth: sub.keys?.auth,
        user_agent: navigator.userAgent,
      });
    }
  } catch {
    /* best effort */
  }
  return subscription;
}

export async function pushPermissionState() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}