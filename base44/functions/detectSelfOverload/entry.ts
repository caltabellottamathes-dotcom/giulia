import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  capacityTrend, energyTrend, detectPersonalTimeConflicts, totalProtectedToday,
  dedupeInsightByTitle,
} from '../../shared/selfEngine.ts';

/**
 * detectSelfOverload — proactieve SELF-bewaking (capacity/overload +
 * personal-time bescherming). Loopt op het runProactivity-ritme (12:00 & 16:00).
 *
 * 1. Laatste check-in capacity/energy < drempel + zware agenda → SelfInsight
 *    (overload) + Notification met advies.
 * 2. Protected PersonalTimeBlock overlapt een bevestigde CalendarEvent →
 *    SelfInsight (imbalance) + Notification (beschermde tijd in gevaar).
 *
 * Volledig deterministisch. Geen LLM, geen integration credits.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const now = new Date();
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(now); dayEnd.setHours(23, 59, 59, 999);

    const [checkIns, events, blocks, existingInsights] = await Promise.all([
      sr.entities.SelfCheckIn.list("-timestamp", 10).catch(() => []),
      sr.entities.CalendarEvent.filter({ status: "confirmed" }, "-start", 40).catch(() => []),
      sr.entities.PersonalTimeBlock.filter({}, "-start", 60).catch(() => []),
      sr.entities.SelfInsight.list("-created_date", 50).catch(() => []),
    ]);

    const todaysEvents = (events || []).filter((e) => e.start && new Date(e.start) >= dayStart && new Date(e.start) <= dayEnd);
    const latest = checkIns?.[0];
    let signals = 0;

    // ── 1. Capacity / overload ──────────────────────────────────
    const cap = capacityTrend(checkIns);
    const en = energyTrend(checkIns);
    const heavySchedule = todaysEvents.length >= 4;
    const lowCapacity = latest?.capacity != null && latest.capacity < 30;
    const lowEnergy = latest?.energy != null && latest.energy < 25;

    if ((lowCapacity || lowEnergy) && heavySchedule) {
      const title = "Overbelasting dreigt vandaag";
      if (!dedupeInsightByTitle(existingInsights, title)) {
        await sr.entities.SelfInsight.create({
          title,
          type: "overload",
          category: lowCapacity ? "capacity" : "energy",
          description: `Capaciteit ${latest?.capacity ?? "—"}%, energie ${latest?.energy ?? "—"}%, en ${todaysEvents.length} afspraken vandaag. Ik raad aan één afspraak te verzetten of protected time in te lassen.`,
          status: "active",
          confidence: 0.8,
          agent_source: "detectSelfOverload",
        }).catch(() => null);
        signals++;
      }
      await sr.entities.Notification.create({
        title: "Zware dag, lage batterij",
        message: `Je ${lowCapacity ? "capaciteit" : "energie"} is ${lowCapacity ? latest.capacity : latest.energy}% met ${todaysEvents.length} afspraken. Wil je dat ik iets verzet?`,
        kind: "remark",
        requires_response: true,
        related_route: "/self/daily-state",
        agent_source: "detectSelfOverload",
      }).catch(() => null);
      try { await base44.functions.invoke("sendPushNotifications", { title: "Zware dag, lage batterij", message: "Je capaciteit is laag met een volle agenda vandaag." }); } catch { /* ignore */ }
    }

    // ── 2. Personal-time bescherming ────────────────────────────
    const conflicts = detectPersonalTimeConflicts(blocks, todaysEvents);
    if (conflicts.length) {
      const title = "Beschermde tijd staat onder druk";
      if (!dedupeInsightByTitle(existingInsights, title)) {
        await sr.entities.SelfInsight.create({
          title,
          type: "imbalance",
          category: "personal_time",
          description: `${conflicts.length} van je beschermde tijdblok${conflicts.length !== 1 ? "ken" : "k"} overlapt vandaag met een agenda-afspraak: ${conflicts.slice(0, 3).map((c) => `"${c.block.title}" ↔ "${c.event.title}"`).join(", ")}.`,
          status: "active",
          confidence: 0.85,
          agent_source: "detectSelfOverload",
        }).catch(() => null);
        signals++;
      }
      await sr.entities.Notification.create({
        title: "Beschermde tijd in gevaar",
        message: `${conflicts.length} beschermde blok${conflicts.length !== 1 ? "ken" : "k"} botst met agenda. Wil je de afspraak verzetten of de tijd loslaten?`,
        kind: "question",
        requires_response: true,
        related_route: "/self/personal-time",
        agent_source: "detectSelfOverload",
      }).catch(() => null);
    }

    // ── 3. Onvoldoende personal time ─────────────────────────────
    const protectedMin = totalProtectedToday(blocks);
    if (protectedMin < 30 && todaysEvents.length >= 3) {
      const title = "Vrijwel geen beschermde tijd vandaag";
      if (!dedupeInsightByTitle(existingInsights, title)) {
        await sr.entities.SelfInsight.create({
          title,
          type: "under_recovery",
          category: "personal_time",
          description: `Slechts ${protectedMin} min beschermd bij ${todaysEvents.length} afspraken. Plan alsnog een rustblok.`,
          status: "active",
          confidence: 0.7,
          agent_source: "detectSelfOverload",
        }).catch(() => null);
        signals++;
      }
    }

    return Response.json({
      ok: true,
      signals,
      capacity: { latest: cap.latest, trend: cap.trend },
      energy: { latest: en.latest, trend: en.trend },
      protected_min: protectedMin,
      conflicts: conflicts.length,
      heavy_schedule: heavySchedule,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}