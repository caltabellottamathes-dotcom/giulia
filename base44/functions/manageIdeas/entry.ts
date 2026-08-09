import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { agentDecide, reportToSalvo, notifySalvo } from "../../shared/agent.ts";

/**
 * manageIdeas — stores loose ideas, categorizes, links to projects, resurfaces
 * old ideas on relevance, converts ideas into actions on cue, distinguishes
 * ideas from commitments.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [ideas, projects] = await Promise.all([
      sr.entities.Idea.list().catch(() => []),
      sr.entities.Project.list().catch(() => []),
    ]);

    const context = `Ideeën (${ideas.length}):\n` +
      ideas.slice(0, 40).map((i) => `- [${i.status}] ${i.title} | ${i.category || ""} | project: ${i.project_id || "?"} | resurfaced: ${i.resurfaced_date || "?"}`).join("\n") +
      `\n\nProjecten: ${projects.map((p) => p.title).join(", ")}`;

    const schema = {
      type: "object",
      properties: {
        message: { type: "string" },
        resurface: { type: "array", items: { type: "object", properties: { id: { type: "string" }, reason: { type: "string" } } } },
        convert_to_task: { type: "array", items: { type: "object", properties: { id: { type: "string" }, title: { type: "string" } } } },
        update_status: { type: "array", items: { type: "object", properties: { id: { type: "string" }, status: { type: "string" } } } },
        attention: { type: "boolean" },
      },
      required: ["message"],
    };

    const decision = await agentDecide(
      base44, "manageIdeas",
      "Categoriseer ideeën, koppel aan projecten, breng oude ideeën onder aandacht bij relevantie, zet ideeën om naar acties bij aanleiding. Onderscheid ideeën van commitments.",
      context, schema
    );

    const now = new Date().toISOString();
    if (decision?.resurface) {
      for (const r of decision.resurface) {
        await sr.entities.Idea.update(r.id, { resurfaced_date: now, status: "exploring" }).catch(() => {});
      }
    }
    if (decision?.convert_to_task) {
      for (const c of decision.convert_to_task) {
        const idea = ideas.find((i) => i.id === c.id);
        await sr.entities.Task.create({ title: c.title || idea?.title || "Idee actie", status: "upcoming", agent_source: "manageIdeas", project_id: idea?.project_id || "" }).catch(() => {});
        if (idea) await sr.entities.Idea.update(idea.id, { status: "actionable" }).catch(() => {});
      }
    }
    if (decision?.update_status) {
      for (const u of decision.update_status) {
        await sr.entities.Idea.update(u.id, { status: u.status }).catch(() => {});
      }
    }

    if (decision?.attention) {
      await reportToSalvo(base44, "manageIdeas", decision.message);
      await notifySalvo(base44, "Ideeën", decision.message);
    }

    return Response.json({ ok: true, ideas: ideas.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}