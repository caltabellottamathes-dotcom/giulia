import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, GIULIA_PERSONA } from '../../shared/gemini.ts';
import { isCheckInDue } from '../../shared/selfEngine.ts';

/**
 * runSelfCheckIns — proactieve SELF check-in runner (~3x/dag).
 *
 * Controleert of de laatste SelfCheckIn langer dan 3 uur geleden is. Zo ja,
 * dan verzamelt de functie context (laatste state, agenda vandaag, openstaande
 * routines) en vraagt Gemini om EEN context-bewuste check-invraag in
 * Salvo's stijl. Er wordt een proactive SelfCheckIn-record aangemaakt
 * (source='proactive', state leeg — wacht op antwoord) en een Notification
 * gepusht met de vraag.
 *
 * Trust model: verzendt niets extern. De Notification is in-app.
 * Trigger: scheduled cron 10:00, 14:00, 18:00 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const now = new Date();
    const todayString = now.toISOString().split("T")[0];

    // Laatste check-in
    const recent = await sr.entities.SelfCheckIn.list("-timestamp", 1).catch(() => []);
    const last = recent && recent[0];
    if (!isCheckInDue(last, 3)) {
      return Response.json({ ok: true, skipped: "recent_check_in_exists" });
    }

    // Context verzamelen
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

    // Eén context-bewuste vraag via Gemini
    const res = await geminiDecide({
      model: "gemini-3.1-flash-lite",
      prompt: `Je bent Giulia, de persoonlijke AI van Salvo. Het is ${now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}. Stel EÉN korte, context-bewuste check-invraag (max 15 woorden) om zijn huidige staat te meten. Reageer op wat hier speelt — niet standaard. Context:\n${contextSummary}\n\nAntwoord UITSLUITEND als JSON: {"question": "...", "tone": "zacht|direct|plagerig"}`,
      schema: { type: "object", properties: { question: { type: "string" }, tone: { type: "string" } }, required: ["question"] },
      systemText: GIULIA_PERSONA,
      temperature: 0.7,
      keyName: "BACKDESK_GEMINI_API_KEY",
    });

    const question = res?.question || "Hoe sta je er nu voor?";
    const tone = res?.tone || "zacht";

    // Proactive check-in record (state open — wacht op antwoord)
    const checkIn = await sr.entities.SelfCheckIn.create({
      state: "neutral",
      source: "proactive",
      check_in_type: "proactive",
      context: question,
      timestamp: now.toISOString(),
      agent_source: "runSelfCheckIns",
    }).catch(() => null);

    // Notification naar Salvo
    await sr.entities.Notification.create({
      title: "Giulia check-in",
      message: question,
      kind: "question",
      requires_response: true,
      related_route: "/self/daily-state",
      agent_source: "runSelfCheckIns",
    }).catch(() => null);

    // Push
    try { await base44.functions.invoke("sendPushNotifications", { title: "Giulia check-in", message: question }); } catch { /* ignore */ }

    return Response.json({
      ok: true,
      check_in_id: checkIn?.id || null,
      question,
      tone,
      context_points: contextSummary.split("\n").length,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}