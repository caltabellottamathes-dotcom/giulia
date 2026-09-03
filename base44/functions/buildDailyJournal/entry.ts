import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, GIULIA_PERSONA } from '../../shared/gemini.ts';
import { emitEvent } from '../../shared/eventEngine.ts';
import { notify } from '../../shared/notify.ts';

/**
 * buildDailyJournal — avondlijke dag-samenvatting.
 * Stroomt door de unified event-laag + notify-helper.
 * Trigger: scheduled daily 22:00 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const now = new Date();
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(now); dayEnd.setHours(23, 59, 59, 999);
    const title = `Dagbeeld ${now.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}`;

    const existing = await sr.entities.JournalEntry.filter({}, "-date", 50).catch(() => []);
    const dup = (existing || []).find((e) => e.title === title && e.agent_source === "buildDailyJournal");
    if (dup) return Response.json({ ok: true, skipped: "already_built_today", journal_id: dup.id });

    const [checkIns, events, threads, routines, timeBlocks] = await Promise.all([
      sr.entities.SelfCheckIn.filter({}, "-timestamp", 30).catch(() => []),
      sr.entities.CalendarEvent.filter({ status: "confirmed" }, "-start", 30).catch(() => []),
      sr.entities.Thread.filter({ status: "open" }, "-created_date", 20).catch(() => []),
      sr.entities.SelfRoutine.list("-created_date", 50).catch(() => []),
      sr.entities.PersonalTimeBlock.filter({}, "-start", 50).catch(() => []),
    ]);

    const todays = (arr = []) => (arr || []).filter((x) => {
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

    // ── CHAT-MOMENTEN (Mattia + Giulia) → logboek ───────────────────
    const [mattiaMsgs, giuliaMsgs] = await Promise.all([
      sr.entities.Message.filter({ channel: "in-app", thread_id: "mattia" }, "-created_date", 120).catch(() => []),
      sr.entities.Message.filter({ channel: "in-app", thread_id: "giulia" }, "-created_date", 120).catch(() => []),
    ]);
    const dayMattia = todays(mattiaMsgs).filter((m) => m.role === "user" || m.role === "mattia");
    const dayGiulia = todays(giuliaMsgs).filter((m) => m.role === "user" || m.role === "giulia");
    let chatMoments = [];
    if (dayMattia.length + dayGiulia.length > 0) {
      const transcript = [...dayGiulia, ...dayMattia]
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
        .slice(-40)
        .map((m) => `${m.role === "user" ? "Salvo" : m.role === "mattia" ? "Mattia" : "Giulia"}: ${String(m.content).slice(0, 300)}`)
        .join("\n");
      const chatRes = await geminiDecide({
        model: "gemini-3.1-flash-lite",
        prompt:
          `Uit deze chatfragmenten van vandaag (Giulia = de butler, Mattia = Salvo's alter-ego) haal je de 3-6 BELANGRIJKSTE momenten: ` +
          `beslissingen, gemaakte plannen of afspraken, inzichten, en emotioneel belangrijke momenten. Per moment max 15 woorden, neutraal geformuleerd, geen expliciete inhoud. ` +
          `Fragmenten:\n"""\n${transcript}\n"""\n\n` +
          `Antwoord UITSLUITEND als JSON: {"moments": ["...", "...']} — of {"moments": []} als er niets noemenswaardigs is.`,
        schema: { type: "object", properties: { moments: { type: "array", items: { type: "string" } } }, required: ["moments"] },
        keyName: "BACKDESK_GEMINI_API_KEY",
      }).catch(() => null);
      chatMoments = (chatRes?.moments || []).slice(0, 6);
    }

    const ctx = [
      `Check-ins vandaag: ${dayCheckIns.length} (laatste state: ${dayCheckIns[0]?.state || "—"}, energie ${dayCheckIns[0]?.energy ?? "—"}%, capaciteit ${dayCheckIns[0]?.capacity ?? "—"}%)`,
      `Agenda: ${dayEvents.length} afspraak${dayEvents.length !== 1 ? "en" : ""}${dayEvents.map((e) => `\n  - ${e.title} (${new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })})`).join("")}`,
      `Voltooide routines: ${dayRoutines.length} — ${dayRoutines.map((r) => r.title).join(", ") || "geen"}`,
      `Persoonlijke tijd: ${dayTime.reduce((s, b) => s + (b.duration_min || 0), 0)} min (${dayTime.filter((b) => b.is_protected).length} beschermd)`,
      `Openstaande threads: ${openThreads.length} — ${openThreads.map((t) => t.title).join(", ") || "geen"}`,
      `Belangrijkste behoefte vandaag: ${dayCheckIns.find((c) => c.needs?.length)?.needs?.[0] || "—"}`,
      `Chats vandaag: ${dayGiulia.length} Giulia-berichten, ${dayMattia.length} Mattia-berichten${chatMoments.length ? `\n  Belangrijkste chat-momenten:\n  - ${chatMoments.join("\n  - ")}` : ""}`,
    ].join("\n");

    const res = await geminiDecide({
      model: "gemini-3.5-flash-lite",
      prompt: `Je bent Giulia. Schrijf een korte, eerlijke reflectieve samenvatting van Salvo's dag (max 120 woorden, 2-3 alinea's). Droog, direct, geen performatief enthousiasme. Noem wat speelde en één observatie of open draad. Context:\n${ctx}\n\nAntwoord UITSLUITEND als JSON: {"summary": "...", "open_thread": "..."}`,
      schema: { type: "object", properties: { summary: { type: "string" }, open_thread: { type: "string" } }, required: ["summary"] },
      systemText: GIULIA_PERSONA,
      temperature: 0.6,
      keyName: "BACKDESK_GEMINI_API_KEY",
    });

    const summary = res?.summary || `Vandaag: ${dayEvents.length} afspraken, ${dayRoutines.length} routines voltooid.`;
    const contentBody = chatMoments.length
      ? `${summary}\n\nBelangrijkste momenten uit je chats van vandaag:\n${chatMoments.map((m) => `- ${m}`).join("\n")}`
      : summary;

    const entry = await sr.entities.JournalEntry.create({
      title, type: "reflection", content: contentBody, date: now.toISOString(),
      tags: ["giulia", "dagbeeld", now.toISOString().split("T")[0]], is_highlight: chatMoments.length > 0, agent_source: "buildDailyJournal",
    }).catch(() => null);

    await notify(base44, {
      title: "Je dagbeeld staat klaar",
      message: `Ik heb een samenvatting van je dag geschreven. ${res?.open_thread ? "Eén open draad: " + res.open_thread : "Lees hem in je Journal."}`,
      kind: "info", requires_response: false, related_route: "/self/journal", agent_source: "buildDailyJournal", push: true,
    });
    await emitEvent(base44, {
      event_type: "JOURNAL_ENTRY_CREATED", object_type: "JournalEntry", object_id: entry?.id || null,
      domain: "life", description: title, source: "buildDailyJournal",
    });

    return Response.json({
      ok: true, journal_id: entry?.id || null,
      check_ins: dayCheckIns.length, events: dayEvents.length, routines: dayRoutines.length,
      personal_time_min: dayTime.reduce((s, b) => s + (b.duration_min || 0), 0),
      open_thread: res?.open_thread || null,
      mattia_messages: dayMattia.length, giulia_messages: dayGiulia.length, chat_moments: chatMoments.length,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}