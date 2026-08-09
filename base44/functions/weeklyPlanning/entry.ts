import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent, mondayStr } from "../../shared/codeAgent.ts";

/**
 * weeklyPlanning (Agent 11 — Weekly Planning Agent). Real code agent.
 * Trigger: every Sunday 18:00 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const ws = mondayStr();

    const tools = {
      list_tasks: tool({ description: "Openstaande taken.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Task.list().catch(() => []).then(l => l.filter(t => t.status !== "completed" && t.status !== "done").map(x => ({ id: x.id, title: x.title, status: x.status, deadline: x.deadline, energy_level: x.energy_level, estimated_duration: x.estimated_duration }))) }),
      list_events: tool({ description: "Afspraken deze week.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Event.list().catch(() => []).then(l => l.map(e => ({ title: e.title, start: e.start, end: e.end }))) }),
      list_projects: tool({ description: "Projecten.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Project.list().catch(() => []).then(l => l.map(p => ({ id: p.id, title: p.title, status: p.status, deadline: p.deadline }))) }),
      list_approvals: tool({ description: "Open commitments (aantal).", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Approval.filter({ status: "pending" }).catch(() => []).then(l => l.length) }),
      save_weekly_plan: tool({ description: "Sla de weekplanning op (upsert op week_start).", inputSchema: { type: "object", properties: { week_start: { type: "string" }, plan: { type: "array", items: { type: "object", properties: { day: { type: "string" }, focus: { type: "string" }, items: { type: "array", items: { type: "string" } } } } }, summary: { type: "string" } }, required: ["week_start", "plan"] }, execute: async ({ week_start, plan, summary }) => { const existing = await sr.entities.WeeklyPlan.filter({ week_start }).catch(() => []); const plan_data = { plan, summary }; const now = new Date().toISOString(); if (existing.length) return sr.entities.WeeklyPlan.update(existing[0].id, { plan_data, status: "active", last_updated: now, agent_source: "weeklyPlanning" }).catch(() => null); return sr.entities.WeeklyPlan.create({ week_start, plan_data, status: "active", last_updated: now, agent_source: "weeklyPlanning" }).catch(() => null); } }),
    };

    const task = `Maak een realistische weekplanning voor week startend ${ws}. Verdeel taken over dagen rekening houdend met: beschikbare tijd, energie, deadlines, context, locatie, afspraken, benodigde focus, taakgrootte. 15-min taak hoort niet in een 3-uur blok; 3-uur focus-taak hoort niet tussen 5 afspraken. Prioriteiten op belangrijkheid/urgentie/afhankelijkheden/wat levert op/wat moet eerst — niet alleen deadline. Sla op via save_weekly_plan. Rapporteer aan Salvo.`;

    await runGiuliaAgent(base44, "weeklyPlanning", task, tools, 8);
    return Response.json({ ok: true, week_start: ws });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}