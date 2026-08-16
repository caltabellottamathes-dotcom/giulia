import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, GIULIA_PERSONA } from '../../shared/gemini.ts';
import { emitEvent } from '../../shared/eventEngine.ts';
import { notify } from '../../shared/notify.ts';
import { isCheckInDue } from '../../shared/selfEngine.ts';

/**
 * runSelfCheckIns — proactieve SELF check-in runner (~3x/dag).
 * Stroomt door de unified event-laag (emitEvent) + notify-helper.
 * Trigger: scheduled cron 10:00, 14:00, 18:00 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const now = new Date();

    const recent = await sr.entities.SelfCheckIn.list("-timestamp", 1).catch(() => []);
    const last = recent && recent[0];
    if (!isCheckInDue(last, 3)) {
      return Response.json({ ok: true, skipped: "recent_check_in_exists" });
    }

    const [events, routines] = await Promise.all([
      sr.entities.CalendarEvent.filter({ status: "confirmed" }, "-start", 20).catch(() => []),
      sr.entities.SelfRoutine.filter({ status: "active" }, "-created_date", 20).catch(() => []),
    ]);
    const todaysEvents = (events || []).filter((e) => e.start && new Date(e.start).toDateString() === now.toDateString());
    const openRoutines = (routines || []).filter((r) => r.status === "active");

    const contextSummary = [
      `Tijd: ${now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`,
      `Laatste state: ${last?.state || "onbekend"}${last?.energy != null ? `, energie ${last.energy}%` : ""}${last?.capacity != null ? `, capaciteit ${last.capacity}%` : ""}`,
      `Agenda vandaag: ${todaysEvents.length} afspraak${todaysEvents.length !== 1 ? "en" : ""}${todaysEvents[0] ? ` (volgende: ${todaysEvents[0].title})` : ""}`,
      `Open routines: ${openRoutines.length}`,
    ].join("\n");

    const res = await geminiDecide({
      model: "gemini-3.5-flash-lite",
      prompt: `Je bent Giulia, de persoonlijke AI van Salvo. Het is ${now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}. Stel EÉN korte, context-bewuste check-invraag (max 15 woorden) om zijn huidige staat te meten. Reageer op wat hier speelt — niet standaard. Context:\n${contextSummary}\n\nAntwoord UITSLUITEND als JSON: {"question": "...", "tone": "zacht|direct|plagerig"}`,
      schema: { type: "object", properties: { question: { type: "string" }, tone: { type: "string" } }, required: ["question"] },
      systemText: GIULIA_PERSONA,
      temperature: 0.7,
      keyName: "BACKDESK_GEMINI_API_KEY",
    });

    const question = res?.question || "Hoe sta je er nu voor?";

    const checkIn = await sr.entities.SelfCheckIn.create({
      state: "neutral",
      source: "proactive",
      check_in_type: "proactive",
      context: question,
      timestamp: now.toISOString(),
      agent_source: "runSelfCheckIns",
    }).catch(() => null);

    await notify(base44, {
      title: "Giulia check-in", message: question, kind: "question",
      requires_response: true, related_route: "/self/daily-state",
      agent_source: "runSelfCheckIns", push: true,
    });
    await emitEvent(base44, {
      event_type: "SELF_CHECKIN_INITIATED", object_type: "SelfCheckIn",
      object_id: checkIn?.id || null, domain: "self", description: question, source: "runSelfCheckIns",
    });

    return Response.json({ ok: true, check_in_id: checkIn?.id || null, question, tone: res?.tone || "zacht" });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}