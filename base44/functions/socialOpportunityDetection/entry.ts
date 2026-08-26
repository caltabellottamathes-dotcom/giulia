import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { detectOpportunity } from '../../shared/socialEngine.ts';
import { daysSince } from '../../shared/domainEngine.ts';

/**
 * socialOpportunityDetection — §7.1 / §19.5. Zoekt combinaties van
 * belangrijke relatie + relevante verandering + beschikbare tijd +
 * voldoende capaciteit + geen conflict. Een Opportunity is een
 * mogelijkheid, geen taak (§16.5).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const [contacts, blocks, checkins, existingOpps] = await Promise.all([
      sr.entities.Contact.filter({ relationship_domain: "life" }, "-created_date", 300).catch(() => []),
      sr.entities.PersonalTimeBlock.filter({ type: "free", status: "scheduled" }, "start", 20).catch(() => []),
      sr.entities.SelfCheckIn.list("-timestamp", 3).catch(() => []),
      sr.entities.SocialOpportunity.filter({ status: "open" }).catch(() => []),
    ]);
    const latestCheckin = checkins[0];
    const capacityOk = latestCheckin ? (latestCheckin.capacity == null || latestCheckin.capacity >= 40) : true;
    const nextFreeBlock = blocks.find((b) => new Date(b.start).getTime() > Date.now());
    const availableSlot = nextFreeBlock ? { label: new Date(nextFreeBlock.start).toLocaleDateString() } : null;

    let created = 0;
    for (const c of contacts) {
      if (!["QUIETER_THAN_USUAL", "QUIET"].includes(c.relationship_state)) continue;
      if (existingOpps.some((o) => o.contact_id === c.id)) continue;
      const opp = detectOpportunity({
        contact: c,
        daysSinceMeaningful: daysSince(c.last_meaningful_contact_date || c.last_contact_date),
        availableSlot, capacityOk, hasConflict: false,
      });
      if (!opp) continue;
      await sr.entities.SocialOpportunity.create({
        title: opp.title, reasoning: opp.reasoning, contact_id: c.id, kind: opp.kind,
        status: "open", confidence: opp.confidence,
        suggested_window_start: nextFreeBlock?.start, suggested_window_end: nextFreeBlock?.end,
        source_pattern: "rhythm_deviation", agent_source: "socialOpportunityDetection",
      });
      created++;
    }
    return Response.json({ ok: true, created });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}