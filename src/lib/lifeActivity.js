import { base44 } from "@/api/base44Client";

/**
 * logLifeActivity — frontend koppelingsworkflow voor LIFE.
 *
 * Schrijft een gestructureerd Activity-record dat OVEREENKOMT met de shape
 * die de backend eventEngine.emitEvent gebruikt (domain + event_type +
 * object_type), zodat LIFE-acties door dezelfde unified event-laag stromen
 * als SELF/FOCUS. De gedeelde LifeActivityFeed leest de source-prefix
 * "LIFE · <Module>"; de Activity realtime-subscription op de UI werkt voor
 * alle domeinen gelijk.
 */
export async function logLifeActivity(module, action, description, opts = {}) {
  try {
    await base44.entities.Activity.create({
      action: action || "activity",
      description: description || action || "",
      source: `LIFE · ${module}`,
      timestamp: new Date().toISOString(),
      event_type: opts.event_type || "LIFE_ACTIVITY",
      object_type: opts.object_type || null,
      object_id: opts.object_id || null,
      domain: "life",
    });
  } catch { /* ignore — logging mag nooit de actie breken */ }
}