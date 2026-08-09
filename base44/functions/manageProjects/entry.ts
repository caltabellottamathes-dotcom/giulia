import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { agentDecide, reportToSalvo, notifySalvo } from "../../shared/agent.ts";

/**
 * manageProjects — recognizes projects, gathers info, links tasks/docs/people/
 * conversations, tracks status, detects stalled projects, proposes next
 * actions, signals when a project needs attention.
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

    const context = `Projecten (${projects.length}):\n` +
      projects.map((p) => `- [${p.status}] ${p.title} | progress ${p.progress}% | deadline ${p.deadline || "?"} | health ${p.health || "?"} | next: ${p.next_milestone || "?"}`).join("\n") +
      `\n\nGekoppelde taken: ${tasks.length}, events: ${events.length}`;

    const schema = {
      type: "object",
      properties: {
        message: { type: "string" },
        updates: { type: "array", items: { type: "object", properties: { id: { type: "string" }, status: { type: "string" }, health: { type: "string", enum: ["good", "attention", "critical"] }, next_milestone: { type: "string" }, last_activity_date: { type: "string" } } } },
        attention: { type: "array", items: { type: "string" } },
      },
      required: ["message"],
    };

    const decision = await agentDecide(
      base44, "manageProjects",
      "Herkend stilgevallen projecten (lang geen activiteit). Stel volgende acties voor. Update status en health. Signaleer wanneer een project aandacht nodig heeft.",
      context, schema
    );

    if (decision?.updates) {
      for (const u of decision.updates) {
        const patch = {};
        if (u.status) patch.status = u.status;
        if (u.health) patch.health = u.health;
        if (u.next_milestone) patch.next_milestone = u.next_milestone;
        if (u.last_activity_date) patch.last_activity_date = u.last_activity_date;
        if (Object.keys(patch).length) await sr.entities.Project.update(u.id, patch).catch(() => {});
      }
    }

    if (decision?.attention?.length) {
      await reportToSalvo(base44, "manageProjects", decision.message);
      await notifySalvo(base44, "Projecten", decision.message);
    }

    return Response.json({ ok: true, projects: projects.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}