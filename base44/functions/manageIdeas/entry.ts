import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent } from "../../shared/codeAgent.ts";

/**
 * manageIdeas (Agent 7 — Idea Agent). Real code agent.
 * Trigger: on interpretation of an idea + weekly.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [ideas, projects] = await Promise.all([
      sr.entities.Idea.list().catch(() => []),
      sr.entities.Project.list().catch(() => []),
    ]);

    const tools = {
      list_ideas: tool({ description: "Alle ideeën.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Idea.list().catch(() => []).then(l => l.map(i => ({ id: i.id, title: i.title, status: i.status, category: i.category, project_id: i.project_id, resurfaced_date: i.resurfaced_date }))) }),
      update_idea: tool({ description: "Update een idee (status/resurfaced).", inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string", enum: ["new", "exploring", "actionable", "archived"] }, resurfaced: { type: "boolean" } }, required: ["id"] }, execute: ({ id, status, resurfaced }) => { const patch = {}; if (status) patch.status = status; if (resurfaced) patch.resurfaced_date = new Date().toISOString(); return sr.entities.Idea.update(id, patch).catch(() => null); } }),
      convert_idea_to_task: tool({ description: "Zet een idee om naar een actie (taak).", inputSchema: { type: "object", properties: { idea_id: { type: "string" }, title: { type: "string" }, project_id: { type: "string" } }, required: ["idea_id", "title"] }, execute: async ({ idea_id, title, project_id }) => { const idea = await sr.entities.Idea.get(idea_id).catch(() => null); await sr.entities.Task.create({ title, status: "upcoming", project_id: project_id || idea?.project_id || "", agent_source: "manageIdeas" }).catch(() => null); if (idea) await sr.entities.Idea.update(idea_id, { status: "actionable" }).catch(() => null); return null; } }),
    };

    const context = `Ideeën (${ideas.length}):\n` + ideas.slice(0, 40).map(i => `- id:${i.id} | [${i.status}] ${i.title} | ${i.category || ""} | project: ${i.project_id || "?"}`).join("\n") + `\n\nProjecten: ${projects.map(p => p.id + ":" + p.title).join(", ")}`;
    const task = `Categoriseer ideeën, koppel aan projecten, breng oude ideeën onder aandacht bij relevantie (update_idea resurfaced), zet ideeën om naar acties bij aanleiding (convert_idea_to_task). Onderscheid ideeën van commitments. Rapporteer bij aandacht.\n\n${context}`;

    await runGiuliaAgent(base44, "manageIdeas", task, tools, 6);
    return Response.json({ ok: true, ideas: ideas.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}