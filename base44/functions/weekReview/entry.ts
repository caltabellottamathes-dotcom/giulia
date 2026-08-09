import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent } from "../../shared/codeAgent.ts";

/**
 * weekReview (Agent 12 — Week Review Agent). Real code agent.
 * Trigger: every Friday 17:00 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const tools = {
      list_tasks: tool({ description: "Taken deze week.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Task.list().catch(() => []).then(l => l.map(t => ({ id: t.id, title: t.title, status: t.status }))) }),
      list_projects: tool({ description: "Projecten.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Project.list().catch(() => []).then(l => l.map(p => ({ id: p.id, title: p.title, health: p.health, status: p.status }))) }),
      list_events: tool({ description: "Afspraken (aantal).", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Event.list().catch(() => []).then(l => l.length) }),
      list_weekly_plans: tool({ description: "Weekplannen.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.WeeklyPlan.list().catch(() => []).then(l => l.map(w => ({ id: w.id, week_start: w.week_start, status: w.status }))) }),
      list_approvals: tool({ description: "Open commitments (aantal).", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Approval.filter({ status: "pending" }).catch(() => []).then(l => l.length) }),
    };

    const task = `Analyseer de afgelopen week met list_* tools. Wat is afgerond, niet afgerond, verschoven? Welke projecten hebben aandacht? Welke taken komen terug? Afspraken gemaakt? Open commitments? Waar liep planning vast? Wat moet volgende week? Rapporteer de analyse aan Salvo (report_to_salvo). Roep daarna call_agent('weeklyPlanning') aan om de nieuwe weekplanning te maken.`;

    await runGiuliaAgent(base44, "weekReview", task, tools, 6);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}