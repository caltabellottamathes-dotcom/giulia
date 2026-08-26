import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { emitEvent } from '../../shared/eventEngine.ts';

/**
 * calendarCancellationPropagation — §19 (Calendar Cancellation
 * Propagation). Wanneer een CalendarEvent geannuleerd wordt, cancelt de
 * bestaande propagate()-regel (eventEngine.ts) de gekoppelde SocialPlan en
 * geeft het PersonalTimeBlock vrij.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { event_id } = await req.json();
    if (!event_id) return Response.json({ ok: false, error: "event_id required" }, { status: 400 });
    const result = await emitEvent(base44, {
      event_type: "EVENT_CANCELLED", object_type: "CalendarEvent", object_id: event_id, domain: "life",
      description: "Calendar event cancelled", source: "calendarCancellationPropagation",
    });
    await base44.functions.invoke("personalTimeRecalculation", {}).catch(() => null);
    return Response.json({ ok: true, activity_id: result?.id || null });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}