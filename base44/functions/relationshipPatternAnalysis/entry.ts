import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { daysSince } from '../../shared/domainEngine.ts';
import { createInsight, listInsights } from '../../shared/insightHelper.ts';

/**
 * relationshipPatternAnalysis — §19.3. Kijkt naar historische relatie-data
 * (rhythm-baseline vs huidig interval) en signaleert een Pattern Shift —
 * niet automatisch "unhealthy" (§4.6).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const [contacts, existingInsights] = await Promise.all([
      sr.entities.Contact.filter({ relationship_domain: "life" }, "-created_date", 300).catch(() => []),
      listInsights(base44, { domain: "life", limit: 60 }),
    ]);
    let created = 0;
    for (const c of contacts) {
      if (!c.contact_rhythm_days || !c.last_meaningful_contact_date) continue;
      const since = daysSince(c.last_meaningful_contact_date);
      const ratio = since / c.contact_rhythm_days;
      if (ratio >= 2) {
        const title = `Pattern shift: ${c.name}`;
        const ins = await createInsight(base44, {
          domain: "life", title, type: "pattern", category: "Suggestion",
          description: `${c.name}'s contact rhythm is normally ~${c.contact_rhythm_days}d; it's now ${since}d \u2014 a noticeable deviation, not a diagnosis.`,
          confidence: 0.65, source: "relationshipPatternAnalysis", existingInsights,
        });
        if (ins && !ins.skipped) {
          created++;
          await sr.entities.Contact.update(c.id, { relationship_pattern_note: `Deviation: ${since}d vs baseline ${c.contact_rhythm_days}d` }).catch(() => null);
        }
      }
    }
    return Response.json({ ok: true, created, scanned: contacts.length });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}