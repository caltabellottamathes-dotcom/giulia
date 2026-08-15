import { base44 } from "@/api/base44Client";

/**
 * logLifeActivity — de koppelingsworkflow voor LIFE.
 * Elke actie in een LIFE-module (huishouden voltooid, plan bevestigd,
 * obligatie afgerekend, hobby toegevoegd) schrijft een Activity-record met
 * source = "LIFE · <Module>". De gedeelde LifeActivityFeed leest diezelfde
 * source-prefix en toont alles samen — zodat de modules gelinkt zijn.
 *
 * Directe entity-create via de SDK (geen backend/integratie-credits nodig).
 */
export async function logLifeActivity(module, action, description) {
  try {
    await base44.entities.Activity.create({
      action: action || "activity",
      description: description || action || "",
      source: `LIFE · ${module}`,
      timestamp: new Date().toISOString(),
    });
  } catch { /* ignore — logging mag nooit de actie breken */ }
}