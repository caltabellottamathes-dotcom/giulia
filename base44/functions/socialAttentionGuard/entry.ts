import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { notify } from '../../shared/notify.ts';
import { daysSince } from '../../shared/domainEngine.ts';

/**
 * socialAttentionGuard — §19.6. Anders dan Opportunity Detection: vraagt
 * "is er nu iets sociaal dat Salvo daadwerkelijk zou moeten zien?" —
 * wachtende uitnodiging, hoge-confidence opportunity, onbevestigd plan,
 * beschermde-tijd-conflict. Data zelf (bv. "18 dagen niet gesproken") is
 * géén notificatie (§9.8).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const [invitations, opportunities, proposedPlans, conflictBlocks] = await Promise.all([
      sr.entities.SocialIntention.filter({ status: "open", kind: "respond_invitation" }).catch(() => []),
      sr.entities.SocialOpportunity.filter({ status: "open" }).catch(() => []),
      sr.entities.SocialPlan.filter({ status: "proposed" }).catch(() => []),
      sr.entities.PersonalTimeBlock.filter({ conflict_flag: true }).catch(() => []),
    ]);
    let signals = 0;

    if (invitations.length) {
      signals++;
      await notify(base44, {
        title: "An invitation is waiting", message: invitations[0].description, kind: "question",
        requires_response: true, related_route: "/life/social?view=planner", agent_source: "socialAttentionGuard", push: true,
      });
    }
    const highConfOpp = opportunities.find((o) => o.confidence >= 0.6);
    if (highConfOpp) {
      signals++;
      await notify(base44, {
        title: highConfOpp.title, message: highConfOpp.reasoning, kind: "remark",
        related_route: "/life/social?view=planner", agent_source: "socialAttentionGuard",
      });
    }
    const stale = proposedPlans.find((p) => daysSince(p.created_date) >= 2);
    if (stale) {
      signals++;
      await notify(base44, {
        title: "A social plan still needs confirmation",
        message: `"${stale.activity}" has been proposed for ${daysSince(stale.created_date)} days.`,
        kind: "question", requires_response: true, related_route: "/life/social?view=planner", agent_source: "socialAttentionGuard",
      });
    }
    if (conflictBlocks.length) {
      signals++;
      await notify(base44, {
        title: "Protected time may be at risk",
        message: `${conflictBlocks.length} protected/recovery block(s) overlap social or calendar commitments.`,
        kind: "remark", related_route: "/life/social?view=personaltime", agent_source: "socialAttentionGuard",
      });
    }
    return Response.json({ ok: true, signals });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}