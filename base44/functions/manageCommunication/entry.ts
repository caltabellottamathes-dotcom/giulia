import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent, createTaskWithApproval } from "../../shared/codeAgent.ts";

/**
 * manageCommunication (Agent 4 — Communication Agent). Real code agent.
 * Trigger: every 15 min. NEVER auto-sends — drafts as Approvals.
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
    const seenG = new Set(existing.map(m => m.gmail_message_id).filter(Boolean));
    const seenW = new Set(existing.map(m => m.whatsapp_message_id).filter(Boolean));

    const tools = {
      mirror_email: tool({ description: "Spiegel een email als inkomend Message (direction: incoming, channel: email) zodat interpretInput hem oppikt. Alleen voor NIEUWE emails.", inputSchema: { type: "object", properties: { email_id: { type: "string" }, subject: { type: "string" }, body: { type: "string" }, gmail_message_id: { type: "string" }, gmail_thread_id: { type: "string" } }, required: ["email_id", "subject", "body"] }, execute: ({ email_id, subject, body, gmail_message_id, gmail_thread_id }) => sr.entities.Message.create({ role: "incoming", direction: "incoming", channel: "email", content: (subject + " — " + body).slice(0, 1000), gmail_message_id: gmail_message_id || email_id, gmail_thread_id: gmail_thread_id || "", agent_source: "manageCommunication" }).catch(() => null) }),
      mirror_whatsapp: tool({ description: "Spiegel een WhatsApp bericht als inkomend Message (direction: incoming, channel: whatsapp).", inputSchema: { type: "object", properties: { wa_id: { type: "string" }, message: { type: "string" } }, required: ["wa_id", "message"] }, execute: ({ wa_id, message }) => sr.entities.Message.create({ role: "incoming", direction: "incoming", channel: "whatsapp", content: message, whatsapp_message_id: wa_id, agent_source: "manageCommunication" }).catch(() => null) }),
      list_messages: tool({ description: "Recente inkomende Messages.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Message.filter({ direction: "incoming" }).catch(() => []).then(l => l.slice(-15).map(m => ({ id: m.id, channel: m.channel, content: String(m.content).slice(0, 200) }))) }),
      create_task: tool({ description: "Voer een actie/afspraak/commitment uit een email of whatsapp direct uit: maak een taak aan. Giulia legt deze meteen ter goedkeuring bij Salvo.", inputSchema: { type: "object", properties: { title: { type: "string" }, priority: { type: "string" }, deadline: { type: "string" }, project_id: { type: "string" }, description: { type: "string" } }, required: ["title"] }, execute: async ({ title, priority, deadline, project_id, description }) => { const t = await createTaskWithApproval(base44, { title, priority, deadline, project_id, description, source: "manageCommunication" }); return t ? { id: t.id, title: t.title } : { error: "create failed" }; } }),
    };

    const context = `Reeds gespiegeld: ${seenG.size} gmail, ${seenW.size} whatsapp.\nEmails (${emails.length}):\n` + emails.slice(0, 15).map(e => `- id:${e.id} | ${e.subject || "(geen)"} | van ${e.sender || "?"}`).join("\n") + `\n\nWhatsApp (${wamsgs.length}):\n` + wamsgs.slice(0, 15).map(w => `- id:${w.id} | ${String(w.message || "").slice(0, 80)}`).join("\n");
    const task = `Spiegel NIEUWE emails/whatsapp naar inkomende Messages (mirror_email/mirror_whatsapp) — sla over wat al bestaat. Herken belangrijke/urgente berichten, signaleer onbeantwoorde. Haal afspraken/acties/deadlines/commitments uit emails EN whatsapp en VOER ze direct uit via create_task (Giulia maakt de taak aan én legt deze ter goedkeuring voor bij Salvo). Bereid GEEN concept-email-antwoorden voor — dat doet Salvo alleen zelf via de "Door Giulia"-knop bij een email. Voor whatsapp mag je wel een kort antwoord-concept voorbereiden via create_approval (type: whatsapp) als er echt een reactie nodig is. Rapporteer bij urgentie.\n\n${context}`;

    await runGiuliaAgent(base44, "manageCommunication", task, tools, 6);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}