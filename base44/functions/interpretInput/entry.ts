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
      list_projects: tool({ description: "Bekende projecten (voor koppeling).", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Project.list().catch(() => []).then(l => l.map(p => ({ id: p.id, title: p.title, status: p.status, next_milestone: p.next_milestone }))) }),
      list_contacts: tool({ description: "Bekende personen.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Contact.list().catch(() => []).then(l => l.map(c => ({ id: c.id, name: c.name, company: c.company, project_ids: c.project_ids || [] }))) }),
      list_tasks: tool({ description: "Bestaande taken — gebruik om DUPLICATEN te herkennen voordat je een taak aanmaakt.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Task.list().catch(() => []).then(l => l.map(t => ({ id: t.id, title: t.title, status: t.status, deadline: t.deadline }))) }),
      create_task: tool({ description: "Maak een taak/actie/herinnering aan. status: 'today' vandaag, 'upcoming' later, 'waiting' wachtend op ander, 'delegated' gedelegeerd. Gebruik deadline voor herinneringen.", inputSchema: { type: "object", properties: { title: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high"] }, deadline: { type: "string" }, project_id: { type: "string" }, contact_id: { type: "string" }, status: { type: "string", enum: ["today", "upcoming", "waiting", "delegated"] } }, required: ["title"] }, execute: ({ title, priority, deadline, project_id, contact_id, status }) => sr.entities.Task.create({ title, priority: priority || "medium", deadline: deadline || undefined, project_id: project_id || undefined, contact_id: contact_id || undefined, status: status || "upcoming", agent_source: "interpretInput" }).catch(() => null) }),
      create_event: tool({ description: "Maak een afspraak/agendapunt aan.", inputSchema: { type: "object", properties: { title: { type: "string" }, start: { type: "string" }, end: { type: "string" }, location: { type: "string" }, project_id: { type: "string" } }, required: ["title", "start"] }, execute: ({ title, start, end, location, project_id }) => sr.entities.Event.create({ title, start, end: end || undefined, location: location || undefined, project_id: project_id || undefined, agent_source: "interpretInput" }).catch(() => null) }),
      create_idea: tool({ description: "Sla een los idee op (nog geen commitment).", inputSchema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, project_id: { type: "string" } }, required: ["title"] }, execute: ({ title, content, project_id }) => sr.entities.Idea.create({ title, content: content || "", status: "new", project_id: project_id || "", agent_source: "interpretInput" }).catch(() => null) }),
      create_note: tool({ description: "Sla een notitie/gedachte op.", inputSchema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, project_id: { type: "string" }, person_id: { type: "string" } }, required: ["title"] }, execute: ({ title, content, project_id, person_id }) => sr.entities.Note.create({ title, content: content || "", kind: "note", project_id: project_id || undefined, person_id: person_id || undefined, agent_source: "interpretInput" }).catch(() => null) }),
      create_memory: tool({ description: "Onthoud een BELANGRIJK blijvend feit over Salvo, een persoon, project of routine dat Giulia moet blijven weten.", inputSchema: { type: "object", properties: { category: { type: "string", enum: ["User preferences", "People", "Projects", "Routines", "Important information", "Conversation-derived"] }, content: { type: "string" } }, required: ["content"] }, execute: ({ category, content }) => sr.entities.Memory.create({ category: category || "Conversation-derived", content, confidence: 0.85, source: "interpretInput" }).catch(() => null) }),
      link_contact_project: tool({ description: "Koppel een bestaand contact aan een project (voegt project_id toe aan het contact).", inputSchema: { type: "object", properties: { contact_id: { type: "string" }, project_id: { type: "string" } }, required: ["contact_id", "project_id"] }, execute: async ({ contact_id, project_id }) => { const c = await sr.entities.Contact.get(contact_id).catch(() => null); if (!c) return null; const ids = Array.from(new Set([...(c.project_ids || []), project_id])); return sr.entities.Contact.update(contact_id, { project_ids: ids }).catch(() => null); } }),
      mark_needs_info: tool({ description: "Markeer een thread 'needs_info' (ontbrekende info).", inputSchema: { type: "object", properties: { thread_id: { type: "string" } }, required: ["thread_id"] }, execute: ({ thread_id }) => sr.entities.Thread.update(thread_id, { needs_info: true }).catch(() => null) }),
    };

    const task = `Interpreteer dit bericht volledig en verwerk het in Salvo's systeem.

Bericht: "${msg.content}"
Kanaal: ${msg.channel}${msg.thread_id ? `\nThread: ${msg.thread_id}` : ""}

STAP 1 — BEGRUIP: Wat zegt dit bericht? Koppel aan bestaande projecten en personen (list_projects, list_contacts). Herken namen, bedrijven, projecten.

STAP 2 — CLASSIFICEER: Bepaal ZELF wat dit is — taak, afspraak, idee, herinnering, project, contact, notitie, commitment, of informatie. Eén bericht kan meerdere dingen bevatten.

STAP 3 — DUPLICAAT-CHECK: Vergelijk met list_tasks. Maak GEEN dubbele taak aan als er al een vergelijkbare open staat.

STAP 4 — ONTHOUD BELANGRIJK: Bevat het bericht een blijvend belangrijk feit (voorkeur, afspraak met iemand, routine, project-detail)? → create_memory.

STAP 5 — KOPPEL & MAAK AAN:
- Actie/taak/herinnering met deadline → create_task (status op timing, priority op urgentie, project_id/contact_id als gekoppeld).
- Afspraak/agendapunt → create_event.
- Losse gedachte, nog geen commitment → create_idea.
- Belangrijke notitie → create_note.
- Hoort een persoon bij een project → link_contact_project.
- Externe actie (email/whatsapp/calendar versturen) → create_approval (NOOIT zelf verzenden).

STAP 6 — SIGNALEER: Ontbrekende info → mark_needs_info. Urgentie of werk voor andere agents → call_agent (manageTasks/syncCalendar/managePeople/manageProjects/manageIdeas/dailyPlanning).

Rapporteer kort aan Salvo wat je begrepen hebt en wat je hebt aangemaakt (report_to_salvo).`;

    await runGiuliaAgent(base44, "interpretInput", task, tools, 6);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}