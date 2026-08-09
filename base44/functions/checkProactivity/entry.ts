import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { giuliaCompose } from "../../shared/giulia.ts";

/**
 * checkProactivity — scans open tasks, today's agenda, pending approvals and
 * stale threads, then composes a short proactive nudge from Giulia (via
 * InvokeLLM = integration credits) and stores it as an in-app Message.
 * Triggers a push notification. Runs on a schedule AND on app open.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [tasks, events, approvals, threads] = await Promise.all([
      sr.entities.Task.list().catch(() => []),
      sr.entities.Event.list().catch(() => []),
      sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
      sr.entities.Thread.filter({ status: "open" }).catch(() => []),
    ]);

    const todayStr = new Date().toLocaleDateString("sv-SE");
    const overdue = tasks.filter((t) => t.status === "overdue");
    const todayTasks = tasks.filter((t) => t.status === "today");
    const todayEvents = events
      .filter((e) => (e.start || "").slice(0, 10) === todayStr)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
    const stale = threads.filter((t) => t.needs_info);

    const context = [
      `Te laat: ${overdue.map((t) => t.title).join(", ") || "geen"}`,
      `Vandaag: ${todayTasks.map((t) => t.title).join(", ") || "geen"}`,
      `Agenda: ${todayEvents.map((e) => e.title + " " + new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })).join(", ") || "geen"}`,
      `Wacht op info: ${stale.map((t) => t.title).join(", ") || "geen"}`,
      `Goedkeuringen: ${approvals.length}`,
    ].join("\n");

    const needs = overdue.length || todayTasks.length || approvals.length || stale.length;

    let message = null;
    if (needs) {
      message = await giuliaCompose(
        base44,
        "Schrijf een korte proactieve check-in: wat heeft Salvo nu het hardst nodig?",
        context
      );
    }
    if (!message) {
      if (!needs) return Response.json({ ok: true, message: null, reason: "nothing urgent" });
      message = "Er staat een paar dingen op je te wachten — open de app voor het overzicht.";
    }

    await sr.entities.Message.create({
      role: "giulia",
      content: message,
      channel: "in-app",
      status: "sent",
    });

    try { await base44.functions.invoke("sendPush", { title: "Giulia", message }); } catch (e) { /* ignore */ }

    return Response.json({ ok: true, message, needs });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}