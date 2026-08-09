import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { agentDecide, reportToSalvo, notifySalvo, todayStr } from "../../shared/agent.ts";

/**
 * runProactivity — aggregates the state of all agents, generates proactive
 * messages, signals forgotten things and stuck processes, filters noise,
 * decides what deserves attention NOW, and pushes.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const t = todayStr();

    const [tasks, events, approvals, threads, projects, emails] = await Promise.all([
      sr.entities.Task.list().catch(() => []),
      sr.entities.Event.list().catch(() => []),
      sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
      sr.entities.Thread.filter({ status: "open" }).catch(() => []),
      sr.entities.Project.list().catch(() => []),
      sr.entities.Email.filter({ status: "unread" }).catch(() => []),
    ]);

    const overdue = tasks.filter((x) => x.status === "overdue");
    const todayTasks = tasks.filter((x) => x.status === "today");
    const todayEvents = events.filter((e) => (e.start || "").slice(0, 10) === t).sort((a, b) => new Date(a.start) - new Date(b.start));
    const stalled = projects.filter((p) => p.health === "critical" || p.status === "waiting");

    const context = [
      `Te laat: ${overdue.map((x) => x.title).join(", ") || "geen"}`,
      `Vandaag: ${todayTasks.map((x) => x.title).join(", ") || "geen"}`,
      `Agenda: ${todayEvents.map((e) => e.title + " " + new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })).join(", ") || "geen"}`,
      `Goedkeuringen: ${approvals.length}`,
      `Threads wachtend: ${threads.filter((x) => x.needs_info).length}`,
      `Stilgevallen projecten: ${stalled.map((p) => p.title).join(", ") || "geen"}`,
      `Ongelezen email: ${emails.length}`,
    ].join("\n");

    const needs = overdue.length || todayTasks.length || approvals.length || stalled.length || emails.length;
    if (!needs) return Response.json({ ok: true, message: null, reason: "nothing urgent" });

    const schema = { type: "object", properties: { message: { type: "string" }, push: { type: "boolean" } }, required: ["message"] };
    const decision = await agentDecide(
      base44, "runProactivity",
      "Bepaal wat NU aandacht verdient. Filter onnodige info. Geef één kort, concreet proactief bericht aan Salvo.",
      context, schema
    );

    const message = decision?.message || "Er staat een paar dingen op je te wachten — open de app voor het overzicht.";
    await reportToSalvo(base44, "runProactivity", message);
    if (decision?.push !== false) await notifySalvo(base44, "Giulia", message);

    return Response.json({ ok: true, message, needs });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}