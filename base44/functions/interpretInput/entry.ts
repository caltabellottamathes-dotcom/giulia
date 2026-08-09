import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent } from "../../shared/codeAgent.ts";

/**
 * interpretInput (Agent 1 — Centrale Intelligentie). Real code agent.
 * Interprets every incoming message, classifies, links to projects/persons/
 * tasks, recognizes duplicates, signals missing info, creates the right entity,
 * and signals downstream agents. Trigger: Message create (direction: incoming).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));

    let msg = null;
    if (body.message_id) msg = await sr.entities.Message.get(body.message_id).catch(() => null);
    if (!msg && body.content) msg = { content: body.content, channel: body.channel || "in-app", thread_id: body.thread_id || "" };
    if (!msg) {
      const recent = await sr.entities.Message.filter({ direction: "incoming" }).catch(() => []);
      msg = recent[0];
    }
    if (!msg) return Response.json({ ok: true, reason: "no message" });

    const tools = {
      list_projects: tool({ description: "Bekende projecten (voor koppeling).", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Project.list().catch(() => []).then(l => l.map(p => ({ id: p.id, title: p.title }))) }),
      list_contacts: tool({ description: "Bekende personen.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Contact.list().catch(() => []).then(l => l.map(c => ({ id: c.id, name: c.name, company: c.company }))) }),
      list_tasks: tool({ description: "Bestaande taken (duplicaat-herkenning).", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Task.list().catch(() => []).then(l => l.map(t => ({ id: t.id, title: t.title, status: t.status }))) }),
      create_task: tool({ description: "Maak een taak aan.", inputSchema: { type: "object", properties: { title: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high"] }, deadline: { type: "string" }, project_id: { type: "string" } }, required: ["title"] }, execute: ({ title, ...rest }) => sr.entities.Task.create({ title, status: "today", agent_source: "interpretInput", ...rest }).catch(() => null) }),
      create_event: tool({ description: "Maak een afspraak aan.", inputSchema: { type: "object", properties: { title: { type: "string" }, start: { type: "string" } }, required: ["title", "start"] }, execute: ({ title, start }) => sr.entities.Event.create({ title, start, agent_source: "interpretInput" }).catch(() => null) }),
      create_idea: tool({ description: "Sla een idee op.", inputSchema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, project_id: { type: "string" } }, required: ["title"] }, execute: ({ title, content, project_id }) => sr.entities.Idea.create({ title, content: content || "", status: "new", project_id: project_id || "", agent_source: "interpretInput" }).catch(() => null) }),
      create_note: tool({ description: "Sla een notitie op.", inputSchema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } }, required: ["title"] }, execute: ({ title, content }) => sr.entities.Note.create({ title, content: content || "", kind: "note", agent_source: "interpretInput" }).catch(() => null) }),
      mark_needs_info: tool({ description: "Markeer een thread 'needs_info' (ontbrekende info).", inputSchema: { type: "object", properties: { thread_id: { type: "string" } }, required: ["thread_id"] }, execute: ({ thread_id }) => sr.entities.Thread.update(thread_id, { needs_info: true }).catch(() => null) }),
    };

    const task = `Interpreteer dit bericht en voer de juiste actie uit met je tools.\n` +
      `Bericht: "${msg.content}"\nKanaal: ${msg.channel}\n` +
      `Classificeer als taak/afspraak/idee/herinnering/project/contact/notitie/commitment/thinking. ` +
      `Koppel aan bestaand project/persoon (list_*), herken duplicaten, signaleer ontbrekende info. ` +
      `Maak de juiste entity aan (create_*). Bij relevant signaal roep je call_agent (manageTasks/syncCalendar/manageIdeas/manageProjects/managePeople). ` +
      `Rapporteer kort aan Salvo (report_to_salvo).${msg.thread_id ? `\nThread: ${msg.thread_id}` : ""}`;

    await runGiuliaAgent(base44, "interpretInput", task, tools, 6);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}