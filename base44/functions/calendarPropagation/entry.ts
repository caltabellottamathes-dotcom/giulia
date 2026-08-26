import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { emitEvent } from '../../shared/eventEngine.ts';

/**
 * calendarPropagation — §9.1 / §19 (Calendar Propagation). Wanneer een
 * SocialPlan bevestigd wordt, maakt/koppelt dit proces een CalendarEvent
 * (domain=life). Pas hier — niet eerder — ontstaat een agenda-afspraak.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { plan_id } = await req.json();
    if (!plan_id) return Response.json({ ok: false, error: "plan_id required" }, { status: 400 });
    const sr = base44.asServiceRole;
    const plan = await sr.entities.SocialPlan.get(plan_id).catch(() => null);
    if (!plan) return Response.json({ ok: false, error: "not_found" }, { status: 404 });

    let eventId = plan.calendar_event_id;
    if (!eventId) {
      const start = plan.suggested_date || new Date().toISOString();
      const end = new Date(new Date(start).getTime() + 2 * 3600000).toISOString();
      const contacts = await Promise.all((plan.contact_ids || []).map((id) => sr.entities.Contact.get(id).catch(() => null)));
      const names = contacts.filter(Boolean).map((c) => c.name).join(", ");
      const ev = await sr.entities.CalendarEvent.create({ title: plan.activity, start, end, domain: "life", status: "confirmed", participants: names });
      eventId = ev.id;
      await sr.entities.SocialPlan.update(plan.id, { calendar_event_id: eventId, confirmed_at: new Date().toISOString() });
    }
    await emitEvent(base44, { event_type: "SOCIAL_PLAN_CONFIRMED", object_type: "SocialPlan", object_id: plan.id, domain: "life", description: `${plan.activity} confirmed`, source: "calendarPropagation" });
    await base44.functions.invoke("personalTimeRecalculation", {}).catch(() => null);
    return Response.json({ ok: true, calendar_event_id: eventId });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}