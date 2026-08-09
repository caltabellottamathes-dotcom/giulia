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

    const task = `Maak een realistische weekplanning voor week startend ${ws}.

STAP 1 — Verzamel context met list_* tools: openstaande taken, afspraken deze week, projecten, open approvals.

STAP 2 — Bepaal INTELLIGENTE prioriteiten, NIET alleen op deadline. Beoordeel per taak:
- belangrijkheid (welke impact levert het op? wat deblokkeert het?)
- urgentie (wat gebeurt er als het niet gebeurt?)
- afhankelijkheden (wat moet eerst gebeuren voordat iets anders kan?)
- wat levert het daadwerkelijk op (omzet, voortgang, risicovermindering)?
- wat kan wachten?
Een offerte met een deadline kan belangrijker zijn dan een website-aanpassing als het direct omzet oplevert. Sorteer op echte prioriteit.

STAP 3 — Verdeel taken over de weekdagen rekening houdend met:
- beschikbare tijd (plan niet meer uren dan er zijn)
- energie (deep work 's ochtends, admin/shallow in laag-energie momenten)
- deadlines (vroege deadlines eerst)
- context (groeperen per project)
- locatie (locatiegebonden taken samen)
- vaste afspraken (werk daaromheen)
- benodigde focus (een 15-min taak hoort NIET in een 3-uur blok; een 3-uur focus-taak hoort NIET tussen 5 afspraken)
- taakgrootte (kleine taken batchen)

STAP 4 — Output per dag: { day, focus, items[] }. items zijn concrete blokken zoals "09:00–11:00 Deep Work — Bogèst proposal" of "14:00–14:30 Admin — 3 emails".

STAP 5 — Bepaal de focus van de week: top 3 thema's die deze week ertoe doen, elk met reden (bv "1. Bogèst proposal — deadline donderdag, directe omzet"). Plaats dit in summary.

Sla op via save_weekly_plan (plan = array van 7 dagen Ma-Zo, summary = focus-tekst). Rapporteer aan Salvo wat je hebt ingepland en waarom (report_to_salvo).`;

    await runGiuliaAgent(base44, "weeklyPlanning", task, tools, 8);
    return Response.json({ ok: true, week_start: ws });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}