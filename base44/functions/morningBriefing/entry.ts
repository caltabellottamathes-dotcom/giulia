import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { giuliaCompose } from "../../shared/giulia.ts";

/**
 * morningBriefing — compiles today's agenda, priority tasks and important
 * unread emails into a short morning briefing from Giulia (InvokeLLM =
 * integration credits). Stores an in-app Message and pushes a notification.
 * Scheduled daily at 08:00 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [events, tasks, emails] = await Promise.all([
      sr.entities.Event.list().catch(() => []),
      sr.entities.Task.list().catch(() => []),
      sr.entities.Email.filter({ status: "unread" }).catch(() => []),
    ]);

    const todayStr = new Date().toLocaleDateString("sv-SE");
    const todayEvents = events
      .filter((e) => (e.start || "").slice(0, 10) === todayStr)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
    const todayTasks = tasks.filter((t) => t.status === "today" || t.status === "overdue");
    const important = emails.slice(0, 5);

    const context = [
      `Agenda vandaag: ${todayEvents.map((e) => e.title + " " + new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })).join(" | ") || "niets"}`,
      `Taken: ${todayTasks.map((t) => t.title).join(", ") || "geen"}`,
      `Ongelezen email: ${important.map((m) => m.subject + " (" + (m.sender || "?") + ")").join(", ") || "geen"}`,
    ].join("\n");

    let message = await giuliaCompose(
      base44,
      "Schrijf een ochtendbriefing voor Salvo: wat staat er vandaag, wat heeft prioriteit, waar moet hij op letten.",
      context
    );
    if (!message) {
      message = `Goedemorgen Salvo. ${todayEvents.length ? `Agenda: ${todayEvents.map((e) => e.title).join(", ")}. ` : ""}${todayTasks.length ? `${todayTasks.length} taak/en vandaag. ` : ""}Ik houd je vandaag op de hoogte.`;
    }

    // Achtergrond blijft onzichtbaar in de chat — log naar Activity, push blijft.
    await sr.entities.Activity.create({
      action: "morning_briefing",
      description: String(message).slice(0, 280),
      source: "morningBriefing",
      timestamp: new Date().toISOString(),
    }).catch(() => null);

    try { await base44.functions.invoke("sendPush", { title: "Giulia · Ochtendbriefing", message }); } catch (e) { /* ignore */ }

    return Response.json({ ok: true, message });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}