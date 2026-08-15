/**
 * eventEngine.ts — de typed Event-laag van GIULIA OS.
 *
 * Iedere CORE-actie emit hier een gestructureerd event (een Activity-record met
 * event_type / object_type / object_id / domain). De UI abonneert zich op
 * Activity (via useLearningSync) en reageert automatisch — dat is de
 * "widgets/panels/pages luisteren naar centrale state"-regel.
 *
 * Dit is de ruggengraat van "één verandering → hele systeem bijgewerkt". De
 * propagation-engine (cross-object afhankelijkheden, bv. EVENT_CANCELLED →
 * gelinkte SocialPlans annuleren + planning herrekenen) bouwt hierop verder
 * op en wordt als volgende stap toegevoegd.
 */

/**
 * emitEvent — schrijft een gestructureerd event in de Activity-feed.
 * `action` wordt gelijkgesteld aan event_type voor backwards-compatibele
 * consumenten die op action filteren; de aparte velden geven structuur.
 */
export async function emitEvent(base44, { event_type, object_type, object_id, domain, description, source }) {
  try {
    return await base44.asServiceRole.entities.Activity.create({
      action: event_type,
      description: description || event_type,
      source: source || "GIULIA-CORE",
      timestamp: new Date().toISOString(),
      event_type,
      object_type,
      object_id,
      domain,
    });
  } catch { return null; }
}