import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent, todayStr, createTaskWithApproval } from "../../shared/codeAgent.ts";

/**
 * runProactivity (Agent 9 — Proactivity Agent). Real code agent.
 * Trigger: every 30 min + on signals from other agents.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const t = todayStr();

    const tools = {
      list_tasks: tool({ description: "Taken.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Task.list().catch(() => []).then(l => l.map(x => ({ id: x.id, title: x.title, status: x.status, deadline: x.deadline }))) }),
      list_events: tool({ description: "Agenda vandaag.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Event.list().catch(() => []).then(l => l.filter(e => (e.start || "").slice(0, 10) === t).map(e => ({ id: e.id, title: e.title, start: e.start }))) }),
      list_approvals: tool({ description: "Pending approvals.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Approval.filter({ status: "pending" }).catch(() => []).then(l => l.map(a => ({ id: a.id, title: a.title, type: a.type }))) }),
      list_threads: tool({ description: "Open threads.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Thread.filter({ status: "open" }).catch(() => []).then(l => l.map(th => ({ id: th.id, needs_info: th.needs_info }))) }),
      list_projects: tool({ description: "Projecten (stilstand).", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Project.list().catch(() => []).then(l => l.map(p => ({ id: p.id, title: p.title, health: p.health, status: p.status }))) }),
      list_emails: tool({ description: "Ongelezen email.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Email.filter({ status: "unread" }).catch(() => []).then(l => l.map(e => ({ id: e.id, subject: e.subject }))) }),
      propose_task: tool({ description: "Stel proactief een taak voor. assignee='salvo' = een taak die Salvo moet doen; assignee='giulia' = een taak die Giulia zelf oppakt en uitvoert. Giulia legt BEIDE ter goedkeuring voor bij Salvo via het Goedkeuringspaneel/widget/pagina.", inputSchema: { type: "object", properties: { title: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high"] }, deadline: { type: "string" }, project_id: { type: "string" }, description: { type: "string" }, assignee: { type: "string", enum: ["salvo", "giulia"] } }, required: ["title", "assignee"] }, execute: async ({ title, priority, deadline, project_id, description, assignee }) => { const t = await createTaskWithApproval(base44, { title, priority, deadline, project_id, description, source: "runProactivity", delegated_to_giulia: assignee === "giulia" }); return t ? { id: t.id, title: t.title, assignee } : { error: "create failed" }; } }),
    };

    const task = `Verzamel de status van alle agents (gebruik list_* tools). Bepaal wat NU aandacht verdient. Signaleer vergeten dingen en vastlopende processen.

Daarna: stel proactief CONCRETE taken voor met propose_task. Maak het onderscheid strikt:
- assignee='salvo': dingen die Salvo zélf moet doen (bv. iemand terugbellen, document goedkeuren, afspraak bevestigen). Maximaal 3.
- assignee='giulia': dingen die Giulia zélf kan oppakken en uitvoeren (bv. email-concept voorbereiden, kennisbank bijwerken, samenvatting maken, bestand ordenen, herinnering instellen). Maximaal 3.
Giulia voert haar eigen taken proactief uit, maar legt ELKE taak ter goedkeuring voor — Salvo manageert alles via het Goedkeuringspaneel, -widget en -pagina.

Stuur één kort, concreet proactief bericht aan Salvo (report_to_salvo) en een push (notify_salvo) als het aandacht verdient. Pas planning aan bij veranderingen (call_agent dailyPlanning) indien nodig.`;

    await runGiuliaAgent(base44, "runProactivity", task, tools, 6);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}