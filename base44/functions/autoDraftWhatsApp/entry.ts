import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent } from "../../shared/codeAgent.ts";

/**
 * autoDraftWhatsApp — intelligent WhatsApp agent.
 * When a new incoming WhatsApp message arrives, Giulia:
 *   1. reads & understands the conversation (important vs. chit-chat,
 *      question needing reply, commitment, appointment, deadline, action);
 *   2. links persons/projects to existing context;
 *   3. creates Tasks for any action/deadline and Approvals for commitments
 *      that need scheduling/confirmation;
 *   4. drafts a reply in Salvo's own voice (Approval, pending);
 *   5. reports what she understood + actions taken.
 * Giulia NEVER sends WhatsApp herself — only the draft for approval.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const messageId = body.message_id || body.id;
    if (!messageId) return Response.json({ error: "message_id required" }, { status: 400 });

    const incoming = await sr.entities.WhatsAppMessage.get(messageId);
    if (!incoming) return Response.json({ error: "message not found" }, { status: 404 });
    if (incoming.direction !== "received") return Response.json({ skipped: "not incoming" });

    const contactId = incoming.contact_id || "";

    // Don't stack duplicate drafts for the same incoming message
    const existing = await base44.entities.Approval.filter({
      type: "whatsapp", context: messageId, status: "pending",
    }).catch(() => []);
    if (existing && existing.length) return Response.json({ skipped: "draft exists", draft_id: existing[0].id });

    // Gather conversation + contact + projects for context
    const [allMsgs, contact, projects] = await Promise.all([
      contactId ? sr.entities.WhatsAppMessage.filter({ contact_id: contactId }).catch(() => []) : Promise.resolve([]),
      contactId ? sr.entities.Contact.get(contactId).catch(() => null) : Promise.resolve(null),
      sr.entities.Project.list().catch(() => []),
    ]);
    const convo = allMsgs
      .sort((a, b) => new Date(a.timestamp || a.created_date || 0) - new Date(b.timestamp || b.created_date || 0))
      .slice(-8)
      .map((m) => `${m.direction === "received" ? "Binnen" : "Uit"}: ${m.message}`)
      .join("\n");
    const contactName = contact?.name || "(onbekend)";
    const projectList = projects.map((p) => ({ id: p.id, title: p.title })).slice(0, 20);

    const tools = {
      find_project: tool({
        description: "Zoek een bestaand project op titel-keyword. Geeft {id,title} of null.",
        inputSchema: { type: "object", properties: { keyword: { type: "string" } }, required: ["keyword"] },
        execute: ({ keyword }) => {
          const k = String(keyword || "").toLowerCase();
          return projectList.find((p) => p.title.toLowerCase().includes(k)) || null;
        },
      }),
      create_task: tool({
        description: "Maak een actie/taak aan die uit het bericht voortkomt (commitment, actie, deadline).",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            deadline: { type: "string", description: "ISO date yyyy-mm-dd of leeg" },
            project_id: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high"] },
          },
          required: ["title"],
        },
        execute: ({ title, deadline, project_id, priority }) =>
          sr.entities.Task.create({
            title, deadline: deadline || undefined, project_id: project_id || undefined,
            priority: priority || "medium", status: "upcoming", agent_source: "autoDraftWhatsApp",
          }).catch(() => null),
      }),
      create_approval: tool({
        description: "Maak een Approval voor een afspraak/commitment die planning of bevestiging nodig heeft.",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            action_type: { type: "string" },
            category: { type: "string", enum: ["whatsapp", "calendar", "email", "tasks", "projects", "documents", "other"] },
            project_id: { type: "string" },
          },
          required: ["title", "description", "action_type"],
        },
        execute: ({ title, description, action_type, category, project_id }) =>
          sr.entities.Approval.create({
            title, description, action_type, category: category || "whatsapp",
            project_id: project_id || undefined, status: "pending",
            agent_source: "autoDraftWhatsApp", thread_id: contactId || undefined,
          }).catch(() => null),
      }),
      save_draft: tool({
        description: "Sla het conceptantwoord op als pending Approval. Eén concept per inkomend bericht.",
        inputSchema: { type: "object", properties: { content: { type: "string" } }, required: ["content"] },
        execute: ({ content }) =>
          base44.entities.Approval.create({
            action_type: "whatsapp_send",
            type: "whatsapp",
            title: `Concept WhatsApp-antwoord aan ${contactName}`,
            description: "Concept door Giulia — wacht op goedkeuring.",
            content,
            context: messageId,
            status: "pending",
            assignee: "salvo",
            thread_id: contactId || undefined,
            target: contactName,
            agent_source: "autoDraftWhatsApp",
          }).catch(() => null),
      }),
    };

    const task = `Analyseer het nieuwste inkomende WhatsApp-bericht van ${contactName} in dit gesprek:

${convo}

Voer uit:
1. BEGRUIP het bericht inhoudelijk. Is het belangrijk of gewoon klets? Is er een vraag waarop Salvo moet antwoorden? Een belofte/commitment, een afspraak, een deadline, of een actie?
2. KOPPEL personen/projecten: herken namen en koppel via find_project aan bestaande projecten.
3. ACTIES: bij elke actie, deadline of commitment → create_task (concrete titel, deadline als genoemd, project_id als gekoppeld, priority naar urgentie).
4. AFSPRAKEN/COMMITMENTS die planning of bevestiging nodig hebben → create_approval (action_type beschrijvend, category whatsapp of calendar).
5. ANTWOORD: bereid een kort, warm, concreet conceptantwoord voor in Salvo's eigen stijl (Nederlands, geen aanhalingstekens, alleen het bericht). Sla op via save_draft.
6. Rapporteer kort aan Salvo (report_to_salvo) wat je begrepen hebt en welke acties je hebt aangemaakt. Bij urgentie ook notify_salvo.

Giulia verstuurt NOOIT zelf WhatsApp — alleen het concept ter goedkeuring.`;

    await runGiuliaAgent(base44, "autoDraftWhatsApp", task, tools, 10);

    try { await sr.entities.WhatsAppMessage.update(messageId, { giulia_suggested: true }); } catch {}

    const created = await base44.entities.Approval.filter({ type: "whatsapp", context: messageId, status: "pending" }).catch(() => []);
    const draft = created[0];
    return Response.json({ ok: true, draft_id: draft?.id || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}