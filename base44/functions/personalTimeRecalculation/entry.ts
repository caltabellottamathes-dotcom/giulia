import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { computePersonalTimeAvailability, findProtectedConflict } from '../../shared/socialEngine.ts';
import { createInsight, listInsights } from '../../shared/insightHelper.ts';

/**
 * personalTimeRecalculation — §4.10 / §19. Herberekent beschikbare ruimte
 * uit Calendar + PersonalTimeBlocks, en signaleert (niet: lost automatisch
 * op) botsingen met beschermde/herstel-tijd (§8.2).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const [blocks, events, existingInsights] = await Promise.all([
      sr.entities.PersonalTimeBlock.list("-start", 60).catch(() => []),
      sr.entities.CalendarEvent.filter({ domain: "life" }, "start", 60).catch(() => []),
      listInsights(base44, { domain: "life", limit: 60 }),
    ]);
    const avail = computePersonalTimeAvailability(blocks, events);
    let conflicts = 0;
    for (const ev of events) {
      if (!ev.start || ev.status === "cancelled") continue;
      for (const b of blocks) {
        if (findProtectedConflict(b, ev.start, ev.end || ev.start)) {
          if (!b.conflict_flag) await sr.entities.PersonalTimeBlock.update(b.id, { conflict_flag: true }).catch(() => null);
          conflicts++;
        }
      }
    }
    if (conflicts) {
      await createInsight(base44, {
        domain: "life", title: "Protected time under pressure", type: "pattern", category: "Risk",
        description: `${conflicts} calendar commitment(s) overlap protected/recovery time blocks.`,
        confidence: 0.7, source: "personalTimeRecalculation", existingInsights,
      });
    }
    return Response.json({ ok: true, availableMin: avail.availableMin, conflicts });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}