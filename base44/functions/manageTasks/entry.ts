import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { agentDecide, reportToSalvo, notifySalvo, todayStr } from "../../shared/agent.ts";

/**
 * manageTasks — manages the Task entity. Prioritizes by importance, urgency,
 * dependencies and payoff (not only deadline). Marks overdue, suggests
 * deadlines, splits big tasks, replants and reminds. Auto-closes none.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const t = todayStr();

    const tasks = await sr.entities.Task.list().catch(() => []);

    // mark overdue: open tasks with a past deadline
    await Promise.all(
      tasks
        .filter((x) => x.status !== "completed" && x.status !== "done" && x.status !== "overdue" && x.deadline && x.deadline < t)
        .map((x) => sr.entities.Task.update(x.id, { status: "overdue" }).catch(() => {}))
    );

    const open = tasks.filter((x) => x.status !== "completed" && x.status !== "done");
    const context = `Open taken (${open.length}):\n` +
      open.slice(0, 30).map((x) => `- ${x.title} | prio ${x.priority} | deadline ${x.deadline || "geen"} | status ${x.status}`).join("\n");

    const schema = {
      type: "object",
      properties: {
        message: { type: "string" },
        reprioritize: { type: "array", items: { type: "object", properties: { id: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high"] }, status: { type: "string" } } } },
        split_task: { type: "object", properties: { id: { type: "string" }, subtasks: { type: "array", items: { type: "string" } } } },
        attention: { type: "boolean" },
      },
      required: ["message"],
    };

    const decision = await agentDecide(
      base44, "manageTasks",
      "Bepaal prioriteiten op basis van belangrijkheid, urgentie, afhankelijkheden en opbrengst (niet alleen deadline). Stel deadlines voor, herken achterstallige taken, deel grote taken op. Geef per taak nieuwe prioriteit/status waar nodig.",
      context, schema
    );

    if (decision?.reprioritize) {
      for (const r of decision.reprioritize) {
        const patch = {};
        if (r.priority) patch.priority = r.priority;
        if (r.status) patch.status = r.status;
        if (Object.keys(patch).length) await sr.entities.Task.update(r.id, patch).catch(() => {});
      }
    }
    if (decision?.split_task?.id && decision.split_task.subtasks) {
      await sr.entities.Task.update(decision.split_task.id, { subtasks: decision.split_task.subtasks }).catch(() => {});
    }

    if (decision?.attention) {
      await reportToSalvo(base44, "manageTasks", decision.message);
      await notifySalvo(base44, "Taken", decision.message);
    }

    return Response.json({ ok: true, open: open.length, overdue: tasks.filter((x) => x.status === "overdue").length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}