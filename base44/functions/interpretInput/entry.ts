import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { agentDecide, reportToSalvo } from "../../shared/agent.ts";

/**
 * interpretInput — interprets a new incoming message. Classifies as
 * task/event/idea/reminder/project/contact/note/commitment/thinking, links to
 * existing projects/persons/tasks, detects duplicates, signals missing info,
 * and creates the right entity. Triggered on Message create (direction: incoming)
 * and callable directly. Internal actions only — never sends externally.
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

    const [tasks, projects, contacts] = await Promise.all([
      sr.entities.Task.list().catch(() => []),
      sr.entities.Project.list().catch(() => []),
      sr.entities.Contact.list().catch(() => []),
    ]);

    const context = [
      `Bericht: "${msg.content}"`,
      `Kanaal: ${msg.channel}`,
      `Bekende projecten: ${projects.map((p) => p.title).join(", ") || "geen"}`,
      `Bekende personen: ${contacts.map((c) => c.name).join(", ") || "geen"}`,
      `Bestaande taken: ${tasks.slice(0, 20).map((t) => t.title).join(", ") || "geen"}`,
    ].join("\n");

    const schema = {
      type: "object",
      properties: {
        classification: { type: "string", enum: ["task", "event", "idea", "reminder", "project", "contact", "note", "commitment", "thinking"] },
        summary: { type: "string" },
        project_id: { type: "string" },
        person_name: { type: "string" },
        action: { type: "string", enum: ["create_task", "create_event", "create_idea", "create_note", "none"] },
        title: { type: "string" },
        deadline: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        duplicate_of: { type: "string" },
        missing_info: { type: "string" },
      },
      required: ["classification", "summary", "action"],
    };

    const decision = await agentDecide(
      base44, "interpretInput",
      "Interpreteer dit bericht. Classificeer, koppel aan bestaand project/persoon, herkend duplicaten, signaleer ontbrekende info, en beslis welke entity aangemaakt wordt.",
      context, schema
    );
    if (!decision) return Response.json({ ok: false, reason: "no decision" });

    const title = decision.title || decision.summary || String(msg.content).slice(0, 80);
    let created = null;

    if (decision.action === "create_task") {
      created = await sr.entities.Task.create({
        title, status: "today", priority: decision.priority || "medium",
        deadline: decision.deadline || "", project_id: decision.project_id || "", agent_source: "interpretInput",
      }).catch(() => null);
    } else if (decision.action === "create_event") {
      created = await sr.entities.Event.create({
        title, start: decision.deadline ? new Date(decision.deadline).toISOString() : new Date().toISOString(),
        agent_source: "interpretInput",
      }).catch(() => null);
    } else if (decision.action === "create_idea") {
      created = await sr.entities.Idea.create({
        title, content: msg.content, status: "new",
        project_id: decision.project_id || "", agent_source: "interpretInput",
      }).catch(() => null);
    } else if (decision.action === "create_note") {
      created = await sr.entities.Note.create({
        title, content: msg.content, kind: "note", agent_source: "interpretInput",
      }).catch(() => null);
    }

    let report = decision.summary;
    if (decision.missing_info) report += ` Ontbrekt: ${decision.missing_info}.`;
    if (decision.missing_info && msg.thread_id) {
      await sr.entities.Thread.update(msg.thread_id, { needs_info: true }).catch(() => {});
    }
    await reportToSalvo(base44, "interpretInput", report, msg.thread_id);

    return Response.json({ ok: true, classification: decision.classification, action: decision.action, created_id: created?.id || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}