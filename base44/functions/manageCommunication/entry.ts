import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { agentDecide, reportToSalvo, notifySalvo, createApproval } from "../../shared/agent.ts";

/**
 * manageCommunication — gathers email + WhatsApp + in-app communication.
 * Mirrors new external messages into the Message entity (direction: incoming),
 * classifies importance/urgency, signals unanswered messages, and prepares
 * reply drafts as Approvals (status: pending). NEVER auto-sends.
 * Creating incoming Messages triggers interpretInput via the entity workflow.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [emails, wamsgs, existing] = await Promise.all([
      sr.entities.Email.list().catch(() => []),
      sr.entities.WhatsAppMessage.list().catch(() => []),
      sr.entities.Message.list().catch(() => []),
    ]);

    const seenGmail = new Set(existing.map((m) => m.gmail_message_id).filter(Boolean));
    const seenWa = new Set(existing.map((m) => m.whatsapp_message_id).filter(Boolean));

    let created = 0;
    for (const e of emails) {
      const gid = e.gmail_message_id || e.id;
      if (!gid || seenGmail.has(gid)) continue;
      await sr.entities.Message.create({
        role: "incoming", direction: "incoming", channel: "email",
        content: `${e.subject || "(geen onderwerp)"} — ${e.body || ""}`.slice(0, 1000),
        gmail_message_id: gid, gmail_thread_id: e.gmail_thread_id || "", agent_source: "manageCommunication",
      }).catch(() => {});
      created++;
    }
    for (const w of wamsgs) {
      const wid = w.id;
      if (!wid || seenWa.has(wid)) continue;
      await sr.entities.Message.create({
        role: "incoming", direction: "incoming", channel: "whatsapp",
        content: w.message || "", whatsapp_message_id: wid, agent_source: "manageCommunication",
      }).catch(() => {});
      created++;
    }

    const incoming = await sr.entities.Message.filter({ direction: "incoming" }).catch(() => []);
    const recent = incoming.slice(-15).reverse();
    const context = `Nieuwe inkomende berichten (${recent.length}):\n` +
      recent.map((m) => `[${m.channel}] ${String(m.content).slice(0, 200)}`).join("\n");

    const schema = {
      type: "object",
      properties: {
        message: { type: "string" },
        drafts: { type: "array", items: { type: "object", properties: { channel: { type: "string", enum: ["email", "whatsapp"] }, to: { type: "string" }, subject: { type: "string" }, body: { type: "string" } } } },
        urgent: { type: "boolean" },
      },
      required: ["message"],
    };

    const decision = await agentDecide(
      base44, "manageCommunication",
      "Herkend belangrijke berichten, bepaal urgentie, signaleer onbeantwoorde berichten. Bereid antwoord-concepten voor in Salvo's stijl (kort, warm, concreet). NOOIT auto-sturen — alles als Approval. Haal afspraken/acties/deadlines/commitments eruit.",
      context, schema
    );

    let approvals = 0;
    if (decision?.drafts) {
      for (const d of decision.drafts) {
        const content = d.subject ? `Aan: ${d.to || "?"}\nOnderwerp: ${d.subject}\n\n${d.body || ""}` : `Aan: ${d.to || "?"}\n\n${d.body || ""}`;
        await createApproval(base44, d.channel, d.subject || "Antwoord", content, "", `Concept antwoord (${d.channel})`);
        approvals++;
      }
    }

    if (decision?.urgent) {
      await reportToSalvo(base44, "manageCommunication", decision.message);
      await notifySalvo(base44, "Communicatie", decision.message);
    }

    return Response.json({ ok: true, created, approvals });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}