import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent, todayStr } from "../../shared/codeAgent.ts";

/**
 * manageTasks (Agent 3 — Task Agent). Real code agent.
 * Trigger: every 30 min + on signal from interpretInput.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const t = todayStr();
    const tasks = await sr.entities.Task.list().catch(() => []);
    await Promise.all(
      tasks.filter(x => x.status !== "completed" && x.status !== "done" && x.status !== "overdue" && x.deadline && x.deadline < t)
        .map(x => sr.entities.Task.update(x.id, { status: "overdue" }).catch(() => {}))
    );
    const open = tasks.filter(x => x.status !== "completed" && x.status !== "done");

    const tools = {
      list_tasks: tool({ description: "Alle taken.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Task.list().catch(() => []).then(l => l.map(x => ({ id: x.id, title: x.title, status: x.status, priority: x.priority, deadline: x.deadline }))) }),
      update_task: tool({ description: "Update een taak (prioriteit/status/deadline).", inputSchema: { type: "object", properties: { id: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high"] }, status: { type: "string" }, deadline: { type: "string" } }, required: ["id"] }, execute: ({ id, ...patch }) => sr.entities.Task.update(id, patch).catch(() => null) }),
      split_task: tool({ description: "Sla subtasks op voor een grote taak.", inputSchema: { type: "object", properties: { id: { type: "string" }, subtasks: { type: "array", items: { type: "string" } } }, required: ["id", "subtasks"] }, execute: ({ id, subtasks }) => sr.entities.Task.update(id, { subtasks }).catch(() => null) }),
    };

    const context = `Open taken (${open.length}):\n` + open.slice(0, 30).map(x => `- id:${x.id} | ${x.title} | prio ${x.priority} | deadline ${x.deadline || "geen"} | ${x.status}`).join("\n");
    const task = `Bepaal prioriteiten op belangrijkheid, urgentie, afhankelijkheden en opbrengst (niet alleen deadline). Herken achterstallige taken, stel deadlines voor, deel grote taken op (split_task). Gebruik update_task waar nodig. Sluit NIET automatisch taken af. Rapporteer aan Salvo bij aandacht (report_to_salvo + notify_salvo).\n\n${context}`;

    await runGiuliaAgent(base44, "manageTasks", task, tools, 6);
    return Response.json({ ok: true, open: open.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}