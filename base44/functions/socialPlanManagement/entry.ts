import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { emitEvent } from '../../shared/eventEngine.ts';
import { findProtectedConflict } from '../../shared/socialEngine.ts';
import { createInsight } from '../../shared/insightHelper.ts';

/**
 * socialPlanManagement — §19 (Social Plan Management). Reconcilieert een
 * SocialPlan na create/update: koppelt confirmed-plans naar Calendar,
 * sluit bijbehorende Opportunity, en signaleert (niet: lost automatisch
 * op) een botsing met beschermde tijd (§8.2).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { plan_id } = await req.json();
    if (!plan_id) return Response.json({ ok: false, error: "plan_id required" }, { status: 400 });
    const sr = base44.asServiceRole;
    const plan = await sr.entities.SocialPlan.get(plan_id).catch(() => null);
    if (!plan) return Response.json({ ok: true, skipped: "not_found" });

    if (plan.status === "cancelled") {
      await emitEvent(base44, { event_type: "SOCIAL_PLAN_CANCELLED", object_type: "SocialPlan", object_id: plan.id, domain: "life", description: `${plan.activity} cancelled`, source: "socialPlanManagement" });
      return Response.json({ ok: true, action: "cancelled" });
    }

    if (plan.status === "confirmed" && !plan.calendar_event_id) {
      await base44.functions.invoke("calendarPropagation", { plan_id: plan.id }).catch(() => null);
    }

    // §7.3/§20 — Trust-model: een voorgesteld plan mag nooit zomaar een bericht
    // versturen. Het maakt hier alleen een Approval met een concept-bericht;
    // pas na goedkeuring (executeApproval) gaat het echt via sendWhatsApp uit.
    if (plan.status === "proposed") {
      const existingApprovals = await sr.entities.Approval.filter({ thread_id: plan.id, status: "pending" }).catch(() => []);
      if (!existingApprovals.length) {
        const contact = (plan.contact_ids || [])[0] ? await sr.entities.Contact.get(plan.contact_ids[0]).catch(() => null) : null;
        const name = contact?.name || "je";
        const when = plan.suggested_date ? new Date(plan.suggested_date).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" }) : "binnenkort";
        const draft = `Hey ${name}! Zin om ${when} iets af te spreken voor "${plan.activity}"?`;
        await sr.entities.Approval.create({
          title: `Stel voor: ${plan.activity}`,
          action_type: "social_plan_propose",
          type: "whatsapp",
          category: "communication",
          target: contact?.id || "",
          thread_id: plan.id,
          description: `Voorstel voor ${name} \u2014 "${plan.activity}"`,
          content: draft,
          proposed_action: JSON.stringify({ to: contact?.phone || "", contact_id: contact?.id || "", body: draft }),
          agent_source: "socialPlanManagement",
        }).catch(() => null);
      }
    }

    if (plan.source_opportunity_id) {
      await sr.entities.SocialOpportunity.update(plan.source_opportunity_id, { status: "accepted", resulting_social_plan_id: plan.id }).catch(() => null);
    }

    if (plan.suggested_date) {
      const blocks = await sr.entities.PersonalTimeBlock.filter({ is_protected: true }, "-start", 50).catch(() => []);
      const end = new Date(new Date(plan.suggested_date).getTime() + 2 * 3600000).toISOString();
      const conflict = blocks.find((b) => findProtectedConflict(b, plan.suggested_date, end));
      if (conflict) {
        await sr.entities.PersonalTimeBlock.update(conflict.id, { conflict_flag: true, linked_social_plan_id: plan.id }).catch(() => null);
        await createInsight(base44, {
          domain: "life", title: "Social plan conflicts with protected time", type: "pattern", category: "Risk",
          description: `"${plan.activity}" overlaps with protected block "${conflict.title}".`, confidence: 0.9, source: "socialPlanManagement",
        });
      }
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}