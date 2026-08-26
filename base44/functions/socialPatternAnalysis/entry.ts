import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { createInsight, listInsights } from '../../shared/insightHelper.ts';

/**
 * socialPatternAnalysis — §19 (Social Pattern Analysis). Langetermijn,
 * social-level patroon (anders dan relationshipPatternAnalysis, dat per
 * contact kijkt) — bv. concentratie van sociale plannen in het weekend.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const cutoff = Date.now() - 60 * 86400000;
    const [plans, existingInsights] = await Promise.all([
      sr.entities.SocialPlan.filter({ status: { $ne: "cancelled" } }, "-suggested_date", 200).catch(() => []),
      listInsights(base44, { domain: "life", limit: 60 }),
    ]);
    const recent = plans.filter((p) => p.suggested_date && new Date(p.suggested_date).getTime() >= cutoff);
    if (recent.length >= 4) {
      const weekend = recent.filter((p) => [0, 6].includes(new Date(p.suggested_date).getDay())).length;
      const ratio = weekend / recent.length;
      if (ratio >= 0.7) {
        await createInsight(base44, {
          domain: "life", title: "Social calendar is concentrated around weekends", type: "pattern", category: "Trend",
          description: `${weekend} of ${recent.length} social plans over 60 days fall on weekends.`,
          confidence: 0.55, source: "socialPatternAnalysis", existingInsights,
        });
      }
    }
    return Response.json({ ok: true, scanned: recent.length });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}