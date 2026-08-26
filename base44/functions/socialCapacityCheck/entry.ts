import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { computePersonalTimeAvailability, computeSocialCapacity } from '../../shared/socialEngine.ts';
import { createInsight, listInsights } from '../../shared/insightHelper.ts';

/**
 * socialCapacityCheck — §8.3 / §19. Combineert beschikbare tijd + actuele
 * capaciteit (How I'm Doing) + commitments + herstelbehoefte. Lage
 * capaciteit ≠ geen sociaal leven (§16.9) — alleen minder druk.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const [checkins, blocks, plans, existingInsights] = await Promise.all([
      sr.entities.SelfCheckIn.list("-timestamp", 3).catch(() => []),
      sr.entities.PersonalTimeBlock.list("-start", 40).catch(() => []),
      sr.entities.SocialPlan.filter({ status: { $in: ["proposed", "planned", "confirmed"] } }).catch(() => []),
      listInsights(base44, { domain: "life", limit: 60 }),
    ]);
    const latest = checkins[0];
    const { availableMin } = computePersonalTimeAvailability(blocks, []);
    const recoveryNeeded = latest ? (latest.state === "overwhelmed" || latest.state === "low") : false;
    const capacity = computeSocialCapacity({ availableMin, capacityScore: latest?.capacity ?? null, commitmentCount: plans.length, recoveryNeeded });
    if (capacity.level === "LOW") {
      await createInsight(base44, {
        domain: "life", title: "Social capacity is low right now", type: "capacity", category: "Suggestion",
        description: `Reason: ${capacity.reason.replace(/_/g, " ")}. Not a reason to remove connection \u2014 just to reduce pressure.`,
        confidence: 0.6, source: "socialCapacityCheck", existingInsights,
      });
    }
    return Response.json({ ok: true, capacity });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}