import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { runGiuliaAgent, tool } from "../../shared/codeAgent.ts";

/**
 * chatWithGiulia — de in-app Giulia-chat, nu een ECHTE tool-calling agent op
 * BYOK Gemini (geen Base44 AI-credits). Giulia begrijpt het bericht, voert
 * direct interne acties uit via tools (taken, projecten, contacten, notities,
 * ideeën, geheugen aanmaken/bijwerken), en antwoordt dan kort in Salvo's stijl.
 * Externe acties (email/whatsapp/calendar) gaan via create_approval — nooit zelf.
 *
 * De uitgevoerde acties worden als een "Uitgevoerd:"-regie onder het antwoord
 * geplaatst en als Message (role: giulia) opgeslagen, zodat ze in de chat én in
 * de bijbehorende pagina's (Taken, Projecten, ...) zichtbaar worden.
 */
const TOOL_LABELS = {
  create_task: "taak aangemaakt",
  update_task: "taak bijgewerkt",
  complete_task: "taak voltooid",
  delete_task: "taak verwijderd",
  create_project: "project aangemaakt",
  update_project: "project bijgewerkt",
  create_contact: "contact toegevoegd",
  update_contact: "contact bijgewerkt",
  create_note: "notitie opgeslagen",
  create_idea: "idee vastgelegd",
  create_memory: "geheugen bijgewerkt",
  create_approval: "concept ter goedkeuring voorgelegd",
  call_agent: "agent ingeschakeld",
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const body = await req.json();
    const message = body.message || body.content || "";
    const persist = body.persist !== false;

    if (!message) return Response.json({ error: "No message provided" }, { status: 400 });

    // Persist Salvo's bericht
    if (persist) try {
      await base44.entities.Message.create({
        role: "user", content: message, channel: "in-app", status: "sent",
      });
    } catch { /* ignore */ }

    const sr = base44.asServiceRole;
    const toolCalls = [];
    const onToolCall = (c) => toolCalls.push(c);

    const tools = {
      list_tasks: tool({
        description: "Lijst Salvo's taken (optioneel filter op status).",
        inputSchema: { type: "object", properties: { status: { type: "string" } } },
        execute: async ({ status }) => {
          const l = await sr.entities.Task.filter(status ? { status } : {}, "-created_date", 30).catch(() => []);
          return l.map(t => ({ id: t.id, title: t.title, status: t.status, deadline: t.deadline, priority: t.priority }));
        },
      }),
      create_task: tool({
        description: "Maak een nieuwe taak voor Salvo aan.",
        inputSchema: { type: "object", properties: { title: { type: "string" }, priority: { type: "string" }, deadline: { type: "string", description: "ISO yyyy-mm-dd" }, project_id: { type: "string" }, description: { type: "string" } }, required: ["title"] },
        execute: async ({ title, priority, deadline, project_id, description }) => {
          const t = await sr.entities.Task.create({ title, priority: priority || "medium", deadline, project_id, description, status: "today", agent_source: "chatWithGiulia" }).catch(() => null);
          return t ? { id: t.id, title: t.title } : { error: "create failed" };
        },
      }),
      update_task: tool({
        description: "Werk een taak bij (status, titel, deadline).",
        inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string" }, title: { type: "string" }, deadline: { type: "string" } }, required: ["id"] },
        execute: async ({ id, status, title, deadline }) => {
          const t = await sr.entities.Task.update(id, { ...(status ? { status } : {}), ...(title ? { title } : {}), ...(deadline ? { deadline } : {}) }).catch(() => null);
          return t ? { ok: true } : { error: "not found" };
        },
      }),
      complete_task: tool({
        description: "Markeer een taak als voltooid (status 'completed').",
        inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
        execute: async ({ id }) => {
          const t = await sr.entities.Task.update(id, { status: "completed" }).catch(() => null);
          return t ? { ok: true } : { error: "not found" };
        },
      }),
      list_projects: tool({
        description: "Lijst Salvo's projecten.",
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          const l = await sr.entities.Project.list().catch(() => []);
          return l.map(p => ({ id: p.id, title: p.title, status: p.status, deadline: p.deadline }));
        },
      }),
      create_project: tool({
        description: "Maak een nieuw project aan.",
        inputSchema: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, category: { type: "string" }, deadline: { type: "string" } }, required: ["title"] },
        execute: async ({ title, description, category, deadline }) => {
          const p = await sr.entities.Project.create({ title, description, category, deadline, status: "planning", agent_source: "chatWithGiulia" }).catch(() => null);
          return p ? { id: p.id, title: p.title } : { error: "create failed" };
        },
      }),
      update_project: tool({
        description: "Werk een project bij (status, titel).",
        inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string" }, title: { type: "string" } }, required: ["id"] },
        execute: async ({ id, status, title }) => {
          const p = await sr.entities.Project.update(id, { ...(status ? { status } : {}), ...(title ? { title } : {}) }).catch(() => null);
          return p ? { ok: true } : { error: "not found" };
        },
      }),
      list_contacts: tool({
        description: "Lijst Salvo's contacten.",
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          const l = await sr.entities.Contact.list().catch(() => []);
          return l.map(c => ({ id: c.id, name: c.name, company: c.company, email: c.email }));
        },
      }),
      create_contact: tool({
        description: "Voeg een nieuw contact toe.",
        inputSchema: { type: "object", properties: { name: { type: "string" }, company: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, notes: { type: "string" } }, required: ["name"] },
        execute: async ({ name, company, email, phone, notes }) => {
          const c = await sr.entities.Contact.create({ name, company, email, phone, notes, agent_source: "chatWithGiulia" }).catch(() => null);
          return c ? { id: c.id, name: c.name } : { error: "create failed" };
        },
      }),
      create_note: tool({
        description: "Sla een notitie op voor Salvo.",
        inputSchema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, kind: { type: "string" } }, required: ["title"] },
        execute: async ({ title, content, kind }) => {
          const n = await sr.entities.Note.create({ title, content: content || "", kind: kind || "note", agent_source: "chatWithGiulia" }).catch(() => null);
          return n ? { id: n.id } : { error: "create failed" };
        },
      }),
      create_idea: tool({
        description: "Leg een idee vast.",
        inputSchema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, category: { type: "string" } }, required: ["title"] },
        execute: async ({ title, content, category }) => {
          const i = await sr.entities.Idea.create({ title, content: content || "", category, status: "new", agent_source: "chatWithGiulia" }).catch(() => null);
          return i ? { id: i.id } : { error: "create failed" };
        },
      }),
      create_memory: tool({
        description: "Sla een blijvende herinnering/feit op in het geheugen.",
        inputSchema: { type: "object", properties: { content: { type: "string" }, category: { type: "string" } }, required: ["content"] },
        execute: async ({ content, category }) => {
          const m = await sr.entities.Memory.create({ content, category: category || "preference", agent_source: "chatWithGiulia" }).catch(() => null);
          return m ? { id: m.id } : { error: "create failed" };
        },
      }),
      list_calendar: tool({
        description: "Komende agenda-items.",
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          const l = await sr.entities.CalendarEvent.filter({}, "start", 15).catch(() => []);
          return l.map(e => ({ id: e.id, title: e.title, start: e.start, end: e.end, location: e.location }));
        },
      }),
      list_emails: tool({
        description: "Recente inbox emails.",
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          const l = await sr.entities.Email.filter({ folder: "inbox" }, "-timestamp", 10).catch(() => []);
          return l.map(e => ({ id: e.id, sender: e.sender, subject: e.subject, status: e.status, timestamp: e.timestamp }));
        },
      }),
      list_knowledge: tool({
        description: "Kennisbank-items.",
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          const l = await sr.entities.Knowledge.list("-created_date", 10).catch(() => []);
          return l.map(k => ({ id: k.id, title: k.title }));
        },
      }),
    };

    const today = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const contextLine =
      `Context: vandaag is ${today}.${user?.full_name ? ` Je spreekt met ${user.full_name}.` : ""}\n` +
      `Je praat met Salvo via de in-app chat. Je MAG zelfstandig taken, projecten, contacten, notities, ideeën en herinneringen aanmaken en bijwerken via je tools — doe dat direct als het past. Externe acties (email/whatsapp/calendar versturen) gaan via create_approval, nooit zelf versturen.`;
    const task =
      `${contextLine}\n\nBericht van Salvo: "${message}"\n\n` +
      `Begrijp het bericht. Voer direct de juiste interne acties uit via je tools. Geef daarna één kort, concreet antwoord in Salvo's stijl (Nederlands, geen opsiering).`;

    const reply = await runGiuliaAgent(base44, "chatWithGiulia", task, tools, 8, onToolCall);
    const finalReply = reply || "Ik kon dat even niet verwerken — probeer het opnieuw.";

    // Samenvatting van uitgevoerde acties
    const executed = toolCalls.map(c => TOOL_LABELS[c.name]).filter(Boolean);
    const unique = [...new Set(executed)];
    const fullContent = unique.length
      ? `${finalReply}\n\n**Uitgevoerd:** ${unique.join(" · ")}`
      : finalReply;

    // Persist Giulia's antwoord
    if (persist) try {
      await base44.entities.Message.create({
        role: "giulia", content: fullContent, channel: "in-app", status: "sent",
      });
    } catch { /* ignore */ }

    return Response.json({
      response: fullContent,
      tool_calls: toolCalls,
      conversation_id: body.conversation_id || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}