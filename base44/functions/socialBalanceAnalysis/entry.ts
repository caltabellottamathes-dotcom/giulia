import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { domainBalance } from '../../shared/domainEngine.ts';
import { createInsight, listInsights } from '../../shared/insightHelper.ts';

/**
 * socialBalanceAnalysis — §9.3–9.4 / §19. Vergelijkt sociale belasting met
 * FOCUS-belasting over de laatste 14 dagen — signaleert onbalans zonder
 * automatisch te concluderen dat werk moet wijken.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const cutoff = Date.now() - 14 * 86400000;
    const [events, existingInsights] = await Promise.all([
      sr.entities.CalendarEvent.list("-start", 300).catch(() => []),
      listInsights(base44, { domain: "life", limit: 60 }),
    ]);
    const recent = events.filter((e) => e.start && new Date(e.start).getTime() >= cutoff);
    const lifeEvents = recent.filter((e) => e.domain === "life");
    const focusEvents = recent.filter((e) => e.domain === "focus");
    const balance = domainBalance(focusEvents.length, lifeEvents.length, 0);
    if (balance.lifeNeglected && lifeEvents.length <= 1) {
      await createInsight(base44, {
        domain: "life", title: "Social/life time is thin against work", type: "balance", category: "Risk",
        description: `${lifeEvents.length} life-domain commitments vs ${focusEvents.length} focus commitments over 14 days.`,
        confidence: 0.6, source: "socialBalanceAnalysis", existingInsights,
      });
    }
    return Response.json({ ok: true, balance });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}