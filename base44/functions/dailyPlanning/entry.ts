import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { agentDecide, reportToSalvo, notifySalvo, todayStr } from "../../shared/agent.ts";

/**
 * dailyPlanning — each morning compiles agenda, tasks, deadlines, communication
 * and projects into a concrete DailyPlan. States what must happen today, what
 * is important, what changed, what waits on Salvo, what he forgets. Adjusts
 * during the day.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const t = todayStr();

    const [tasks, events, projects, emails, approvals] = await Promise.all([
      sr.entities.Task.list().catch(() => []),
      sr.entities.Event.list().catch(() => []),
      sr.entities.Project.list().catch(() => []),
      sr.entities.Email.filter({ status: "unread" }).catch(() => []),
      sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
    ]);

    const todayEvents = events.filter((e) => (e.start || "").slice(0, 10) === t).sort((a, b) => new Date(a.start) - new Date(b.start));
    const todayTasks = tasks.filter((x) => x.status === "today" || x.status === "overdue");

    const context = [
      `Datum: ${t}`,
      `Agenda vandaag: ${todayEvents.map((e) => e.title + " " + new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })).join(", ") || "geen"}`,
      `Taken vandaag/te laat: ${todayTasks.map((x) => x.title).join(", ") || "geen"}`,
      `Actieve projecten: ${projects.filter((p) => p.status === "in_progress").map((p) => p.title).join(", ") || "geen"}`,
      `Ongelezen email: ${emails.length}`,
      `Wacht op goedkeuring: ${approvals.length}`,
    ].join("\n");

    const schema = {
      type: "object",
      properties: {
        message: { type: "string" },
        priorities: { type: "array", items: { type: "string" } },
        plan: { type: "array", items: { type: "object", properties: { time: { type: "string" }, item: { type: "string" } } } },
        summary: { type: "string" },
      },
      required: ["message", "priorities"],
    };

    const decision = await agentDecide(
      base44, "dailyPlanning",
      "Compileer een concrete dagplanning. Wat moet vandaag, wat is belangrijk, wat is veranderd, wat wacht op Salvo, wat vergeet hij. Pas aan gedurende dag.",
      context, schema
    );

    const plan_data = { plan: decision?.plan || [], summary: decision?.summary || "" };
    const now = new Date().toISOString();

    const existing = await sr.entities.DailyPlan.filter({ date: t }).catch(() => []);
    if (existing.length) {
      await sr.entities.DailyPlan.update(existing[0].id, { plan_data, priorities: decision?.priorities || [], status: "active", last_updated: now, agent_source: "dailyPlanning" }).catch(() => {});
    } else {
      await sr.entities.DailyPlan.create({ date: t, plan_data, priorities: decision?.priorities || [], status: "active", last_updated: now, agent_source: "dailyPlanning" }).catch(() => {});
    }

    await reportToSalvo(base44, "dailyPlanning", decision?.message || "");
    await notifySalvo(base44, "Je dag", decision?.message || "");

    return Response.json({ ok: true, priorities: decision?.priorities || [], plan_data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}