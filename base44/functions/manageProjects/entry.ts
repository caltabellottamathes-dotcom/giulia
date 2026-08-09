import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent } from "../../shared/codeAgent.ts";

/**
 * manageProjects (Agent 8 — Project Agent). Real code agent.
 * Trigger: daily + on interpretation.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [projects, tasks, events] = await Promise.all([
      sr.entities.Project.list().catch(() => []),
      sr.entities.Task.list().catch(() => []),
      sr.entities.Event.list().catch(() => []),
    ]);

    const tools = {
      list_projects: tool({ description: "Alle projecten.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Project.list().catch(() => []).then(l => l.map(p => ({ id: p.id, title: p.title, status: p.status, progress: p.progress, health: p.health, deadline: p.deadline, next_milestone: p.next_milestone, last_activity_date: p.last_activity_date }))) }),
      list_tasks: tool({ description: "Gekoppelde taken.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Task.list().catch(() => []).then(l => l.map(t => ({ id: t.id, title: t.title, status: t.status, project_id: t.project_id }))) }),
      update_project: tool({ description: "Update een project (status/health/next_milestone/last_activity_date/progress).", inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string" }, health: { type: "string", enum: ["good", "attention", "critical"] }, next_milestone: { type: "string" }, last_activity_date: { type: "string" }, progress: { type: "number" } }, required: ["id"] }, execute: ({ id, ...patch }) => sr.entities.Project.update(id, patch).catch(() => null) }),
    };

    const context = `Projecten (${projects.length}):\n` + projects.map(p => `- id:${p.id} | [${p.status}] ${p.title} | ${p.progress}% | health ${p.health || "?"} | deadline ${p.deadline || "?"} | next: ${p.next_milestone || "?"}`).join("\n") + `\n\nTaken: ${tasks.length}, Afspraken: ${events.length}`;
    const task = `Herkend stilgevallen projecten (lang geen last_activity_date). Stel volgende acties voor (next_milestone). Update status/health/progress. Signaleer wanneer een project aandacht nodig heeft (report_to_salvo + notify_salvo).\n\n${context}`;

    await runGiuliaAgent(base44, "manageProjects", task, tools, 6);
    return Response.json({ ok: true, projects: projects.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}