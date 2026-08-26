import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { trend } from '../../shared/domainEngine.ts';
import { computeIntensitySeries } from '../../shared/socialEngine.ts';
import { createInsight, listInsights } from '../../shared/insightHelper.ts';

/**
 * socialIntensityAnalysis — §19 / §6.2. Sociale activiteit als tijdreeks,
 * vergeleken met de persoonlijke baseline — intensiteit is geen
 * kwaliteitsmaatstaf, alleen een trendsignaal.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const [whatsapps, emails, existingInsights] = await Promise.all([
      sr.entities.WhatsAppMessage.filter({ direction: "sent" }, "-timestamp", 400).catch(() => []),
      sr.entities.Email.filter({}, "-timestamp", 400).catch(() => []),
      listInsights(base44, { domain: "life", limit: 60 }),
    ]);
    const timestamps = [
      ...whatsapps.map((m) => m.timestamp),
      ...emails.filter((e) => e.folder === "sent" || e.status === "sent").map((e) => e.timestamp),
    ];
    const series = computeIntensitySeries(timestamps, 8);
    const t = trend([...series].reverse(), { window: 8, threshold: 2, lowMark: 1 });
    if (t.trend === "declining" || t.trend === "improving") {
      const title = t.trend === "declining" ? "Social activity has been declining" : "Social activity has been increasing";
      await createInsight(base44, {
        domain: "life", title, type: "pattern", category: "Trend",
        description: `Weekly meaningful interactions over 8 weeks: ${series.join(", ")}.`,
        confidence: 0.6, source: "socialIntensityAnalysis", existingInsights,
      });
    }
    return Response.json({ ok: true, series, trend: t.trend });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}