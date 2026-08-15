/**
 * notify.ts — unified notification + push helper voor alle domeinen.
 * Eén aanroep-patroon voor FOCUS/LIFE/SELF/GIULIA achtergrond-functies.
 */
export async function notify(base44, opts) {
  const { title, message, kind = "remark", requires_response = false, related_route, agent_source, urgent = false, push = false } = opts;
  const sr = base44.asServiceRole;
  let n = null;
  try {
    n = await sr.entities.Notification.create({
      title: title || "Giulia",
      message: message || "",
      kind: ["question", "remark", "info"].includes(kind) ? kind : "remark",
      requires_response,
      related_route,
      urgent,
      agent_source: agent_source || "GIULIA-CORE",
    });
  } catch { /* ignore */ }
  if (push) {
    try { await base44.functions.invoke("sendPushNotifications", { title: title || "Giulia", message: message || "" }); } catch { /* ignore */ }
  }
  return n;
}