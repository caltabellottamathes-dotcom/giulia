import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { emitEvent } from '../../shared/eventEngine.ts';
import { createInsight, listInsights } from '../../shared/insightHelper.ts';
import { notify } from '../../shared/notify.ts';
import {
  capacityTrend, energyTrend, detectPersonalTimeConflicts, totalProtectedToday,
} from '../../shared/selfEngine.ts';

/**
 * detectSelfOverload — proactieve SELF-bewaking.
 * Gebruikt unified insightHelper + notify + emitEvent.
 * Trigger: scheduled 12:00 & 16:00 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const now = new Date();
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(now); dayEnd.setHours(23, 59, 59, 999);

    const [checkIns, events, blocks] = await Promise.all([
      sr.entities.SelfCheckIn.list("-timestamp", 10).catch(() => []),
      sr.entities.CalendarEvent.filter({ status: "confirmed" }, "-start", 40).catch(() => []),
      sr.entities.PersonalTimeBlock.filter({}, "-start", 60).catch(() => []),
    ]);
    const existingInsights = await listInsights(base44, { domain: "self", limit: 50 });

    const todaysEvents = (events || []).filter((e) => e.start && new Date(e.start) >= dayStart && new Date(e.start) <= dayEnd);
    const latest = checkIns?.[0];
    let signals = 0;

    const cap = capacityTrend(checkIns);
    const en = energyTrend(checkIns);
    const heavySchedule = todaysEvents.length >= 4;
    const lowCapacity = latest?.capacity != null && latest.capacity < 30;
    const lowEnergy = latest?.energy != null && latest.energy < 25;

    if ((lowCapacity || lowEnergy) && heavySchedule) {
      const title = "Overbelasting dreigt vandaag";
      const ins = await createInsight(base44, {
        domain: "self", title, type: "overload", category: lowCapacity ? "capacity" : "energy",
        description: `Capaciteit ${latest?.capacity ?? "—"}%, energie ${latest?.energy ?? "—"}%, en ${todaysEvents.length} afspraken vandaag. Ik raad aan één afspraak te verzetten of protected time in te lassen.`,
        confidence: 0.8, source: "detectSelfOverload", existingInsights,
      });
      if (ins && !ins.skipped) {
        signals++;
        await emitEvent(base44, { event_type: "SELF_OVERLOAD_DETECTED", object_type: "SelfCheckIn", object_id: latest?.id || null, domain: "life", description: title, source: "detectSelfOverload" });
      }
      await notify(base44, {
        title: "Zware dag, lage batterij",
        message: `Je ${lowCapacity ? "capaciteit" : "energie"} is ${lowCapacity ? latest.capacity : latest.energy}% met ${todaysEvents.length} afspraken. Wil je dat ik iets verzet?`,
        kind: "remark", requires_response: true, related_route: "/self/daily-state", agent_source: "detectSelfOverload", push: true,
      });
    }

    const conflicts = detectPersonalTimeConflicts(blocks, todaysEvents);
    if (conflicts.length) {
      const title = "Beschermde tijd staat onder druk";
      const ins = await createInsight(base44, {
        domain: "self", title, type: "imbalance", category: "personal_time",
        description: `${conflicts.length} van je beschermde tijdblok${conflicts.length !== 1 ? "ken" : "k"} overlapt vandaag met een agenda-afspraak: ${conflicts.slice(0, 3).map((c) => `"${c.block.title}" ↔ "${c.event.title}"`).join(", ")}.`,
        confidence: 0.85, source: "detectSelfOverload", existingInsights,
      });
      if (ins && !ins.skipped) {
        signals++;
        await emitEvent(base44, { event_type: "PERSONAL_TIME_CONFLICT", object_type: "PersonalTimeBlock", object_id: conflicts[0].block.id, domain: "life", description: title, source: "detectSelfOverload" });
      }
      await notify(base44, {
        title: "Beschermde tijd in gevaar",
        message: `${conflicts.length} beschermde blok${conflicts.length !== 1 ? "ken" : "k"} botst met agenda. Wil je de afspraak verzetten of de tijd loslaten?`,
        kind: "question", requires_response: true, related_route: "/self/personal-time", agent_source: "detectSelfOverload",
      });
    }

    const protectedMin = totalProtectedToday(blocks);
    if (protectedMin < 30 && todaysEvents.length >= 3) {
      const title = "Vrijwel geen beschermde tijd vandaag";
      const ins = await createInsight(base44, {
        domain: "self", title, type: "under_recovery", category: "personal_time",
        description: `Slechts ${protectedMin} min beschermd bij ${todaysEvents.length} afspraken. Plan alsnog een rustblok.`,
        confidence: 0.7, source: "detectSelfOverload", existingInsights,
      });
      if (ins && !ins.skipped) signals++;
    }

    return Response.json({
      ok: true, signals,
      capacity: { latest: cap.latest, trend: cap.trend },
      energy: { latest: en.latest, trend: en.trend },
      protected_min: protectedMin, conflicts: conflicts.length, heavy_schedule: heavySchedule,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}