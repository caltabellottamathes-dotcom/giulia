import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { agentDecide, reportToSalvo, notifySalvo } from "../../shared/agent.ts";

/**
 * managePeople — recognizes persons from communication, keeps contact details,
 * links to projects, remembers important info, tracks last contact moment,
 * signals when someone needs attention.
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

    const context = `Contacten (${contacts.length}):\n` +
      contacts.map((c) => `- ${c.name} | ${c.company || ""} | ${c.email || ""} | laatste contact: ${c.last_contact_date || "?"}`).join("\n") +
      `\n\nRecente berichten:\n` + messages.slice(-15).map((m) => `[${m.channel}] ${String(m.content).slice(0, 120)}`).join("\n") +
      `\n\nProjecten: ${projects.map((p) => p.title).join(", ")}`;

    const schema = {
      type: "object",
      properties: {
        message: { type: "string" },
        updates: { type: "array", items: { type: "object", properties: { id: { type: "string" }, last_contact_date: { type: "string" }, notes: { type: "string" }, project_ids: { type: "array", items: { type: "string" } }, relationship_type: { type: "string" } } } },
        new_contacts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, company: { type: "string" }, role: { type: "string" } } } },
        attention: { type: "array", items: { type: "string" } },
      },
      required: ["message"],
    };

    const decision = await agentDecide(
      base44, "managePeople",
      "Herkend personen uit communicatie. Werk laatste contactmoment bij, koppel aan projecten, onthoud belangrijke info. Signaleer wanneer iemand aandacht nodig heeft (lang geen contact, belangrijk).",
      context, schema
    );

    if (decision?.updates) {
      for (const u of decision.updates) {
        const patch = {};
        if (u.last_contact_date) patch.last_contact_date = u.last_contact_date;
        if (u.notes) patch.notes = u.notes;
        if (u.project_ids) patch.project_ids = u.project_ids;
        if (u.relationship_type) patch.relationship_type = u.relationship_type;
        if (Object.keys(patch).length) await sr.entities.Contact.update(u.id, patch).catch(() => {});
      }
    }
    if (decision?.new_contacts) {
      for (const c of decision.new_contacts) {
        if (!c.name) continue;
        await sr.entities.Contact.create({ name: c.name, email: c.email || "", company: c.company || "", role: c.role || "", agent_source: "managePeople" }).catch(() => {});
      }
    }

    if (decision?.attention?.length) {
      await reportToSalvo(base44, "managePeople", decision.message);
      await notifySalvo(base44, "Contacten", decision.message);
    }

    return Response.json({ ok: true, contacts: contacts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}