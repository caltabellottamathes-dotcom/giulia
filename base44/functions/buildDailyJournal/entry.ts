import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, GIULIA_PERSONA } from '../../shared/gemini.ts';

/**
 * buildDailyJournal — avondlijke dag-samenvatting.
 *
 * Verzamelt de dagelijke context (check-ins, agenda, threads, highlights,
 * voltooide routines, personal-time) en laat Gemini een korte reflectieve
 * journal-entry schrijven in Salvo's stijl. Slaat deze op als JournalEntry
 * (type='reflection', source=giulia) en stuurt een Notification dat de
 * dag-samenvatting klaar staat voor review. Overschrijft geen bestaande
 * Giulia-journal van dezelfde dag (dedup op titel + datum).
 *
 * Trust model: niets extern. Interne data-opslag + in-app notificatie.
 * Trigger: scheduled daily 22:00 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const now = new Date();
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(now); dayEnd.setHours(23, 59, 59, 999);
    const dayStr = now.toISOString().split("T")[0];
    const title = `Dagbeeld ${now.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}`;

    // Dedup: bestaat er al een Giulia-journal vandaag met deze titel?
    const existing = await sr.entities.JournalEntry.filter({}, "-date", 50).catch(() => []);
    const dup = (existing || []).find((e) => e.title === title && e.agent_source === "buildDailyJournal");
    if (dup) return Response.json({ ok: true, skipped: "already_built_today", journal_id: dup.id });

    // Verzamel context
    const [checkIns, events, threads, routines, timeBlocks] = await Promise.all([
      sr.entities.SelfCheckIn.filter({}, "-timestamp", 30).catch(() => []),
      sr.entities.CalendarEvent.filter({ status: "confirmed" }, "-start", 30).catch(() => []),
      sr.entities.Thread.filter({ status: "open" }, "-created_date", 20).catch(() => []),
      sr.entities.SelfRoutine.list("-created_date", 50).catch(() => []),
      sr.entities.PersonalTimeBlock.filter({}, "-start", 50).catch(() => []),
    ]);

    const todays = <T extends { timestamp?: string; start?: string; date?: string; created_date?: string }>(arr: T[] = []) =>
      (arr || []).filter((x) => {
        const t = x.timestamp || x.start || x.date || x.created_date;
        if (!t) return false;
        const d = new Date(t);
        return d >= dayStart && d <= dayEnd;
      });

    const dayCheckIns = todays(checkIns);
    const dayEvents = todays(events);
    const dayRoutines = (routines || []).filter((r) => r.status === "completed" && r.last_done && new Date(r.last_done) >= dayStart && new Date(r.last_done) <= dayEnd);
    const dayTime = (timeBlocks || []).filter((b) => b.start && new Date(b.start) >= dayStart && new Date(b.start) <= dayEnd && b.status !== "cancelled");
    const openThreads = (threads || []).slice(0, 5);

    const ctx = [
      `Check-ins vandaag: ${dayCheckIns.length} (laatste state: ${dayCheckIns[0]?.state || "—"}, energie ${dayCheckIns[0]?.energy ?? "—"}%, capaciteit ${dayCheckIns[0]?.capacity ?? "—"}%)`,
      `Agenda: ${dayEvents.length} afspraak${dayEvents.length !== 1 ? "en" : ""}${dayEvents.map((e) => `\n  - ${e.title} (${new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })})`).join("")}`,
      `Voltooide routines: ${dayRoutines.length} — ${dayRoutines.map((r) => r.title).join(", ") || "geen"}`,
      `Persoonlijke tijd: ${dayTime.reduce((s, b) => s + (b.duration_min || 0), 0)} min (${dayTime.filter((b) => b.is_protected).length} beschermd)`,
      `Openstaande threads: ${openThreads.length} — ${openThreads.map((t) => t.title).join(", ") || "geen"}`,
      `Belangrijkste behoefte vandaag: ${dayCheckIns.find((c) => c.needs?.length)?.needs?.[0] || "—"}`,
    ].join("\n");

    // Gemini schrijft de reflectie
    const res = await geminiDecide({
      model: "gemini-3.1-flash-lite",
      prompt: `Je bent Giulia. Schrijf een korte, eerlijke reflectieve samenvatting van Salvo's dag (max 120 woorden, 2-3 alinea's). Droog, direct, geen performatief enthousiasme. Noem wat speelde en één observatie of open draad. Context:\n${ctx}\n\nAntwoord UITSLUITEND als JSON: {"summary": "...", "open_thread": "..."}`,
      schema: { type: "object", properties: { summary: { type: "string" }, open_thread: { type: "string" } }, required: ["summary"] },
      systemText: GIULIA_PERSONA,
      temperature: 0.6,
      keyName: "BACKDESK_GEMINI_API_KEY",
    });

    const summary = res?.summary || `Vandaag: ${dayEvents.length} afspraken, ${dayRoutines.length} routines voltooid.`;

    // Sla op als reflection-entry (niet als highlight — die kiest Salvo zelf)
    const entry = await sr.entities.JournalEntry.create({
      title,
      type: "reflection",
      content: summary,
      date: now.toISOString(),
      tags: ["giulia", "dagbeeld", dayStr],
      is_highlight: false,
      agent_source: "buildDailyJournal",
    }).catch(() => null);

    // Notification ter review
    await sr.entities.Notification.create({
      title: "Je dagbeeld staat klaar",
      message: `Ik heb een samenvatting van je dag geschreven. ${res?.open_thread ? "Eén open draad: " + res.open_thread : "Lees hem in je Journal."}`,
      kind: "info",
      requires_response: false,
      related_route: "/self/journal",
      agent_source: "buildDailyJournal",
    }).catch(() => null);

    try { await base44.functions.invoke("sendPushNotifications", { title: "Je dagbeeld staat klaar", message: "Giulia schreef een samenvatting van je dag." }); } catch { /* ignore */ }

    return Response.json({
      ok: true,
      journal_id: entry?.id || null,
      check_ins: dayCheckIns.length,
      events: dayEvents.length,
      routines: dayRoutines.length,
      personal_time_min: dayTime.reduce((s, b) => s + (b.duration_min || 0), 0),
      open_thread: res?.open_thread || null,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}