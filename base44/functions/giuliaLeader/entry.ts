import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { runGiuliaAgent, tool, createTaskWithApproval } from "../../shared/codeAgent.ts";

/**
 * giuliaLeader — DE ENIGE agent in GIULIA OS die Gemini aanroept.
 *
 * Alle binnenkomende input — een chat-bericht, een proactivity-signaal, een
 * sync-event of de opstart-procedure — stroomt door hier. Giulia interpreteert
 * EEN keer met Gemini, beslist wat er moet gebeuren, en voert het vervolgens
 * INTERN uit via deterministische tools (entity CRUD, os_query, approvals,
 * navigate, report). Sub-agents worden via call_agent aangestuurdd — de leider
 * zelf start geen tweede Gemini-loop voor routine-werk.
 *
 * Andere entries (chatWithGiulia, startGiulia) doen alleen persistatie +
 * doorgeef. Dit is het absolute brein.
 */
const TOOL_LABELS = {
  create_task: "taak aangemaakt",
  update_task: "taak bijgewerkt",
  complete_task: "taak voltooid",
  create_project: "project aangemaakt",
  update_project: "project bijgewerkt",
  create_contact: "contact toegevoegd",
  create_note: "notitie opgeslagen",
  create_idea: "idee vastgelegd",
  create_memory: "geheugen bijgewerkt",
  create_approval: "concept ter goedkeuring voorgelegd",
  call_agent: "agent ingeschakeld",
  os_query: "OS-data opgehaald",
  navigate: "app geopend",
  report_to_salvo: "gerapporteerd",
  notify_salvo: "push verzonden",
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const body = await req.json();
    const signal = body.signal || body.message || "";
    const source = body.source || "chat";
    const persist = body.persist !== false;

    if (!signal) return Response.json({ error: "No signal provided" }, { status: 400 });

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
        description: "Maak een nieuwe taak aan (voor Salvo of Giulia). assignee='giulia' delegateert aan Giulia zelf.",
        inputSchema: { type: "object", properties: { title: { type: "string" }, priority: { type: "string" }, deadline: { type: "string", description: "ISO yyyy-mm-dd" }, project_id: { type: "string" }, description: { type: "string" }, assignee: { type: "string", enum: ["salvo", "giulia"] } }, required: ["title"] },
        execute: async ({ title, priority, deadline, project_id, description, assignee }) => {
          const forGiulia = assignee === "giulia";
          const r = await createTaskWithApproval(base44, { title, priority, deadline, project_id, description, source: "giuliaLeader", delegated_to_giulia: forGiulia });
          return r ? { id: r.id, title: r.title, kind: forGiulia ? "approval" : "task" } : { error: "create failed" };
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
          const p = await sr.entities.Project.create({ title, description, category, deadline, status: "planning", agent_source: "giuliaLeader" }).catch(() => null);
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
          const c = await sr.entities.Contact.create({ name, company, email, phone, notes, agent_source: "giuliaLeader" }).catch(() => null);
          return c ? { id: c.id, name: c.name } : { error: "create failed" };
        },
      }),
      create_note: tool({
        description: "Sla een notitie op voor Salvo.",
        inputSchema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, kind: { type: "string" } }, required: ["title"] },
        execute: async ({ title, content, kind }) => {
          const n = await sr.entities.Note.create({ title, content: content || "", kind: kind || "note", agent_source: "giuliaLeader" }).catch(() => null);
          return n ? { id: n.id } : { error: "create failed" };
        },
      }),
      create_idea: tool({
        description: "Leg een idee vast.",
        inputSchema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, category: { type: "string" } }, required: ["title"] },
        execute: async ({ title, content, category }) => {
          const i = await sr.entities.Idea.create({ title, content: content || "", category, status: "new", agent_source: "giuliaLeader" }).catch(() => null);
          return i ? { id: i.id } : { error: "create failed" };
        },
      }),
      create_memory: tool({
        description: "Sla een blijvende herinnering/feit op in het geheugen.",
        inputSchema: { type: "object", properties: { content: { type: "string" }, category: { type: "string" } }, required: ["content"] },
        execute: async ({ content, category }) => {
          const m = await sr.entities.Memory.create({ content, category: category || "preference", agent_source: "giuliaLeader" }).catch(() => null);
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
      os_query: tool({
        description: "Lees data uit ELK onderdeel van GIULIA OS in real time. entity is één van: tasks, projects, contacts, emails, whatsapp, notes, ideas, memory, insights, approvals, documents, events, milestones, decisions, time_entries, weekly_plan, daily_plan, threads, meetings, activity, knowledge. Geeft de laatste 20 records met de belangrijkste velden. Gebruik dit om bij opstart elk domein te initialiseren.",
        inputSchema: { type: "object", properties: { entity: { type: "string" } }, required: ["entity"] },
        execute: async ({ entity }) => {
          const MAP = { tasks:"Task", projects:"Project", contacts:"Contact", emails:"Email", whatsapp:"WhatsAppMessage", notes:"Note", ideas:"Idea", memory:"Memory", insights:"Insight", approvals:"Approval", documents:"Upload", events:"CalendarEvent", milestones:"Milestone", decisions:"Decision", time_entries:"TimeEntry", weekly_plan:"WeeklyPlan", daily_plan:"DailyPlan", threads:"Thread", meetings:"Meeting", activity:"Activity", knowledge:"Knowledge" };
          const name = MAP[entity];
          if (!name || !sr.entities[name]) return { error: "unknown entity", valid: Object.keys(MAP) };
          const l = await sr.entities[name].list("-created_date", 20).catch(() => []);
          const FIELDS = ["id","title","name","subject","sender","status","deadline","start","priority","category","content","description","created_date"];
          return l.map(r => { const o = {}; FIELDS.forEach(k => { if (r[k] != null) o[k] = typeof r[k] === "string" ? r[k].slice(0, 160) : r[k]; }); return o; });
        },
      }),
    };

    const today = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const persona =
      source === "startup"
        ? "Opstartprocedure: je initialiseert GIULIA OS. Roep os_query aan voor tasks, projects, events, emails, approvals, contacts, activity, notes, ideas, memory om een volledig beeld te krijgen. Bepaal daarna wat NU aandacht verdient. MAAK CONCRETE TAKEN aan via create_task met de juiste assignee ('salvo' voor dingen die Salvo moet doen, 'giulia' voor dingen die Giulia zelf oppakt en uitvoert) — verdeel en wijs toe, maximaal 5 nieuwe taken als er echte gaten zijn. Voltooi Giulia's eigen administratieve/quick taken die afgehandeld kunnen worden (complete_task) zodat het archief opbouwt — voltooi NOOIT Salvo's taken automatisch. Leg externe acties vast via create_approval. Geef per domein één korte status (report_to_salvo). Start geen externe acties zelf."
        : source === "task_agent"
        ? "Task-agent cyclus. Je herziet ALLE open taken — zowel Salvo's als aan Giulia gedelegeerde. Herprioriteer op belangrijkheid, urgentie, afhankelijkheden en opbrengst (niet alleen deadline). Werk statussen en deadlines bij via update_task. Deel grote taken op. MAAK nieuwe taken aan (create_task) met de juiste assignee als er gaten zijn — maximaal 3. Voltooi Giulia's eigen administratieve/quick taken die afgehandeld kunnen worden (complete_task) zodat het archief opbouwt — voltooi NOOIT Salvo's taken automatisch. Leg externe acties vast via create_approval. Rapporteer EEN korte samenvatting via report_to_salvo (Activity-feed). Stuur geen chat-bericht en geen push."
        : `Je praat met Salvo via de in-app chat en kunt door de HELE GIULIA OS-app navigeren. Je MAG zelfstandig taken, projecten, contacten, notities, ideeën en herinneringen aanmaken en bijwerken via je tools — doe dat direct als het past. Lees met os_query data uit elk onderdeel. Gebruik navigate om Salvo in real time naar de juiste plek te brengen. Externe acties (email/whatsapp/calendar) gaan via create_approval, nooit zelf versturen.`;
    const contextLine = `Context: vandaag is ${today}.${user?.full_name ? ` Je spreekt met ${user.full_name}.` : ""}\n${persona}`;
    const task =
      `${contextLine}\n\nSignaal (bron: ${source}): "${signal}"\n\n` +
      `Begrijp het signaal. Voer direct de juiste interne acties uit via je tools. Geef daarna één kort, concreet antwoord in Salvo's stijl (Nederlands, geen opsiering).`;

    // Chat (en straks voice/call) draait op de tweede Gemini-sleutel, los van
    // de achtergrondcycli (GEMINI_API_KEY) — zo botst een live gesprek nooit
    // met de 15-20 RPM-limiet van de proactiviteitscycli.
    const keyName = source === "chat" ? "Gemini_Flash_API_Key" : undefined;
    const reply = await runGiuliaAgent(base44, "giuliaLeader", task, tools, 8, onToolCall, keyName);
    const finalReply = reply || "Ik kon dat even niet verwerken — probeer het opnieuw.";

    // Chat is alleen voor echte gesprekken — geen actie-rapportage, geen logs.
    if (source === "chat") try {
      await base44.entities.Message.create({
        role: "giulia", content: finalReply, channel: "in-app", status: "sent", agent_source: "giuliaLeader",
      });
    } catch { /* ignore */ }

    return Response.json({
      response: finalReply,
      tool_calls: toolCalls,
      source,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}