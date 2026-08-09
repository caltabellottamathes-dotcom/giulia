import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent } from "../../shared/codeAgent.ts";

/**
 * managePeople (Agent 5 — Person Agent). Real code agent.
 * Trigger: on new message (via interpretInput) + daily.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [contacts, messages, projects] = await Promise.all([
      sr.entities.Contact.list().catch(() => []),
      sr.entities.Message.list().catch(() => []),
      sr.entities.Project.list().catch(() => []),
    ]);

    const tools = {
      list_contacts: tool({ description: "Alle contacten.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Contact.list().catch(() => []).then(l => l.map(c => ({ id: c.id, name: c.name, company: c.company, last_contact_date: c.last_contact_date, project_ids: c.project_ids }))) }),
      update_contact: tool({ description: "Update een contact (laatste contact, notities, project_ids, relatie).", inputSchema: { type: "object", properties: { id: { type: "string" }, last_contact_date: { type: "string" }, notes: { type: "string" }, project_ids: { type: "array", items: { type: "string" } }, relationship_type: { type: "string" } }, required: ["id"] }, execute: ({ id, ...patch }) => sr.entities.Contact.update(id, patch).catch(() => null) }),
      create_contact: tool({ description: "Maak een nieuw contact aan.", inputSchema: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, company: { type: "string" }, role: { type: "string" } }, required: ["name"] }, execute: ({ name, ...rest }) => sr.entities.Contact.create({ name, agent_source: "managePeople", ...rest }).catch(() => null) }),
    };

    const context = `Contacten (${contacts.length}):\n` + contacts.map(c => `- id:${c.id} | ${c.name} | ${c.company || ""} | laatste: ${c.last_contact_date || "?"}`).join("\n") + `\n\nRecente berichten:\n` + messages.slice(-15).map(m => `[${m.channel}] ${String(m.content).slice(0, 120)}`).join("\n") + `\n\nProjecten: ${projects.map(p => p.id + ":" + p.title).join(", ")}`;
    const task = `Herkend personen uit communicatie. Werk laatste contactmoment bij, koppel aan projecten (project_ids = id's), onthoud belangrijke info in notes. Maak nieuwe personen aan (create_contact). Signaleer wie aandacht nodig heeft (lang geen contact, belangrijk) via report_to_salvo + notify_salvo.\n\n${context}`;

    await runGiuliaAgent(base44, "managePeople", task, tools, 6);
    return Response.json({ ok: true, contacts: contacts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}