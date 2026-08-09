import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent, todayStr } from "../../shared/codeAgent.ts";

/**
 * dailyPlanning (Agent 10 — Daily Planning Agent). Real code agent.
 * Trigger: daily 07:00 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const t = todayStr();

    const tools = {
      list_tasks: tool({ description: "Taken.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Task.list().catch(() => []).then(l => l.map(x => ({ id: x.id, title: x.title, status: x.status, deadline: x.deadline, priority: x.priority }))) }),
      list_events: tool({ description: "Agenda vandaag.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Event.list().catch(() => []).then(l => l.filter(e => (e.start || "").slice(0, 10) === t).map(e => ({ title: e.title, start: e.start, location: e.location }))) }),
      list_projects: tool({ description: "Actieve projecten.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Project.list().catch(() => []).then(l => l.filter(p => p.status === "in_progress").map(p => ({ id: p.id, title: p.title, next_milestone: p.next_milestone }))) }),
      list_emails: tool({ description: "Ongelezen email (aantal).", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Email.filter({ status: "unread" }).catch(() => []).then(l => l.length) }),
      list_approvals: tool({ description: "Pending approvals (aantal).", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Approval.filter({ status: "pending" }).catch(() => []).then(l => l.length) }),
      save_daily_plan: tool({ description: "Sla de dagplanning op (upsert op datum).", inputSchema: { type: "object", properties: { date: { type: "string" }, priorities: { type: "array", items: { type: "string" } }, plan: { type: "array", items: { type: "object", properties: { time: { type: "string" }, item: { type: "string" } } } }, summary: { type: "string" } }, required: ["date", "priorities", "plan"] }, execute: async ({ date, priorities, plan, summary }) => { const existing = await sr.entities.DailyPlan.filter({ date }).catch(() => []); const plan_data = { plan, summary }; const now = new Date().toISOString(); if (existing.length) return sr.entities.DailyPlan.update(existing[0].id, { plan_data, priorities, status: "active", last_updated: now, agent_source: "dailyPlanning" }).catch(() => null); return sr.entities.DailyPlan.create({ date, plan_data, priorities, status: "active", last_updated: now, agent_source: "dailyPlanning" }).catch(() => null); } }),
    };

    const task = `Compileer een concrete dagplanning voor ${t}. Gebruik list_* voor de actuele situatie.

Beantwoord expliciet:
- Wat moet vandaag?
- Wat is belangrijk?
- Wat is veranderd sinds gisteren?
- Wat wacht op mij?
- Wat heb ik mogelijk vergeten?

Bepaal de 3 dingen die vandaag het meest ertoe doen — niet alleen urgent, maar op belangrijkheid, afhankelijkheden en wat daadwerkelijk oplevert. Dat zijn de priorities.

Maak een tijdblok-planning (plan = [{time, item}]) die deze prioriteiten in de beste momenten plaatst: deep work 's ochtends, admin/shallow werk in laag-energie momenten, rekening houdend met vaste afspraken uit list_events. Plaats een 15-min taak niet in een diep-focus blok.

Sla op via save_daily_plan (priorities = top 3, plan = tijdblokken, summary = korte boodschap). Rapporteer aan Salvo (report_to_salvo + notify_salvo) in de stijl: "Goedemorgen. Ik heb je dag heringericht op wat veranderd is. 3 dingen doen er vandaag toe: 01 … 02 … 03 …" met daarna wat er verder omheen is geplaatst.`;

    await runGiuliaAgent(base44, "dailyPlanning", task, tools, 8);
    return Response.json({ ok: true, date: t });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}