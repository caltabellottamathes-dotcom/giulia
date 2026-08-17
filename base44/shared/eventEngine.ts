/**
 * eventEngine.ts — typed Event-laag + Propagation-engine van GIULIA OS.
 *
 * emitEvent schrijft een gestructureerd event (Activity met event_type /
 * object_type / object_id / domain) en triggert daarna propagate(): de
 * cross-object afhankelijkheden die maken dat "één verandering → hele
 * systeem bijgewerkt" echt werkt. De UI abonneert zich op Activity (via
 * useLearningSync) én op de betreffende entiteiten (via realtime subscribe)
 * en reageert automatisch.
 *
 * Regels die nu leven (voeg hier nieuwe propagation-regels toe):
 *  - EVENT_CANCELLED        → gekoppelde SocialPlans (calendar_event_id) → cancelled
 *  - TASK_COMPLETED          → afhankelijke kind-taken (parent_task_id, status waiting/delegated) → todo
 *  - SOCIAL_PLAN_CONFIRMED   → gelinkte CalendarEvent → confirmed
 *  - HOUSEHOLD/SHOPPING_ITEM_COMPLETED (routine met frequency_days) → next_due herzien
 */
export async function emitEvent(base44, { event_type, object_type, object_id, domain, description, source }) {
  try {
    const a = await base44.asServiceRole.entities.Activity.create({
      action: event_type,
      description: description || event_type,
      source: source || "GIULIA-CORE",
      timestamp: new Date().toISOString(),
      event_type,
      object_type,
      object_id,
      domain,
    });
    // Propagate cross-object dependencies (fire-and-forget — breekt nooit de flow)
    propagate(base44, { event_type, object_type, object_id, domain, description }).catch(() => {});
    return a;
  } catch { return null; }
}

/**
 * propagate — de afhankelijkheids-engine. Gegeven een event, past hij alle
 * objecten aan die ervan afhangen. Houd dit deterministisch en bij-effect-arm;
 * GIULIA-GIULIA beslist wáárom, CORE bepaalt hóe.
 */
export async function propagate(base44, event) {
  const sr = base44.asServiceRole;
  const { event_type, object_type, object_id } = event;
  if (!event_type || !object_type || !object_id) return null;

  // EVENT_CANCELLED → gekoppelde sociale plannen annuleren
  if (event_type === "EVENT_CANCELLED" && object_type === "CalendarEvent") {
    const plans = await sr.entities.SocialPlan.filter({ calendar_event_id: object_id }).catch(() => []);
    let n = 0;
    for (const sp of plans) {
      if (sp.status === "planned" || sp.status === "confirmed") {
        await sr.entities.SocialPlan.update(sp.id, { status: "cancelled" }).catch(() => null);
        n++;
      }
    }
    return { cancelled_social_plans: n };
  }

  // TASK_COMPLETED → afhankelijke kind-taken deblokkeren
  if (event_type === "TASK_COMPLETED" && object_type === "Task") {
    const children = await sr.entities.Task.filter({ parent_task_id: object_id, status: { $in: ["waiting", "delegated"] } }).catch(() => []);
    let n = 0;
    for (const c of children) {
      await sr.entities.Task.update(c.id, { status: "todo" }).catch(() => null);
      n++;
    }
    return { unblocked_tasks: n };
  }

  // SOCIAL_PLAN_CONFIRMED → gelinkte agenda-afspraak bevestigen
  if (event_type === "SOCIAL_PLAN_CONFIRMED" && object_type === "SocialPlan") {
    const sp = await sr.entities.SocialPlan.get(object_id).catch(() => null);
    if (sp && sp.calendar_event_id) {
      await sr.entities.CalendarEvent.update(sp.calendar_event_id, { status: "confirmed" }).catch(() => null);
      return { confirmed_event: sp.calendar_event_id };
    }
    return null;
  }

  // CalendarEvent met therapy_trajectory_id → bidirectionele koppeling zelf
  // herstellen (TherapyTrajectory.event_ids) + next_appointment bijwerken.
  // Werkt ongeacht hoe de link werd gezet (agent, skill of handmatig).
  if (object_type === "CalendarEvent" && (event_type === "EVENT_CREATED" || event_type === "EVENT_UPDATED" || event_type === "THERAPY_EVENT_LINKED")) {
    const ev = await sr.entities.CalendarEvent.get(object_id).catch(() => null);
    if (ev && ev.therapy_trajectory_id) {
      const t = await sr.entities.TherapyTrajectory.get(ev.therapy_trajectory_id).catch(() => null);
      if (t) {
        const event_ids = [...(t.event_ids || []), object_id].filter((v, i, a) => a.indexOf(v) === i);
        const patch = { event_ids };
        if (ev.start && (!t.next_appointment || new Date(ev.start) < new Date(t.next_appointment))) {
          patch.next_appointment = ev.start;
        }
        await sr.entities.TherapyTrajectory.update(ev.therapy_trajectory_id, patch).catch(() => null);
        return { linked_trajectory: ev.therapy_trajectory_id, event_ids };
      }
    }
    return null;
  }

  // HOUSEHOLD/SHOPPING_ITEM_COMPLETED (routine) → next_due herzien op basis van frequency_days
  if ((event_type === "HOUSEHOLD_ITEM_COMPLETED" || event_type === "SHOPPING_ITEM_COMPLETED") && object_type === "HouseholdItem") {
    const h = await sr.entities.HouseholdItem.get(object_id).catch(() => null);
    if (h && h.kind === "routine" && h.frequency_days) {
      const next = new Date(Date.now() + h.frequency_days * 86400000).toISOString().slice(0, 10);
      await sr.entities.HouseholdItem.update(object_id, { status: "needs_attention", next_due: next, last_done: new Date().toISOString() }).catch(() => null);
      return { next_due: next };
    }
    return null;
  }

  return null;
}