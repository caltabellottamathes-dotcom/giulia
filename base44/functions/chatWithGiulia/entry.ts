import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide } from '../../shared/gemini.ts';
import { GIULIA_TONE, AGENT_CONTEXT } from '../../shared/agentContext.ts';

/**
 * chatWithGiulia — GIULIA-CONNECT. Het brug-protocol van GIULIA OS.
 *
 * Naamgevingsconventie GIULIA OS:
 *   GIULIA-SYSTEM   = workspace Superagent (platform-beheer)
 *   GIULIA-GIULIA   = het brein — hier de Gemini-call die intentie begrijpt,
 *                      context weegt en beslist (géén tools, géén CRUD).
 *   GIULIA-CONNECT  = dit bestand — laadt context deterministisch, roept
 *                      GIULIA-GIULIA aan, stuurt de beslissing door naar CORE.
 *   GIULIA-CORE     = giuliaLeader — voert de beslissing blind uit.
 *
 * Alle binnenkomende signalen (chat, startup, proactivity, achtergrond-agents)
 * lopen door hier. ÉÉN Gemini-call per signaal, gevolgd door deterministische
 * uitvoering via GIULIA-CORE.
 */

const EXECUTION_SCHEMA = {
  type: "object",
  properties: {
    response_text: { type: "string" },
    actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "create_task", "update_task", "complete_task", "create_project", "update_project",
              "create_note", "create_idea", "create_contact", "create_memory", "create_approval",
              "navigate", "push_notify", "delete_tasks",
            ],
          },
          id: { type: "string" },
          title: { type: "string" },
          name: { type: "string" },
          content: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          priority: { type: "string" },
          deadline: { type: "string" },
          project_id: { type: "string" },
          status: { type: "string" },
          route: { type: "string" },
          label: { type: "string" },
          assignee: { type: "string" },
          company: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
        },
        required: ["type"],
      },
    },
    memory_updates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          content: { type: "string" },
          category: {
            type: "string",
            enum: ["User preferences", "People", "Projects", "Routines", "Important information", "Conversation-derived", "Insights"],
          },
        },
        required: ["content"],
      },
    },
    should_notify: { type: "boolean" },
    notify_title: { type: "string" },
  },
  required: ["response_text"],
};

function todayISO() { return new Date().toISOString().slice(0, 10); }

async function loadContext(sr) {
  const [memories, recentMessages, projects, tasks, events, approvals] = await Promise.all([
    sr.entities.Memory.list("-created_date", 20).catch(() => []),
    sr.entities.Message.filter({ channel: "in-app" }, "-created_date", 10).catch(() => []),
    sr.entities.Project.list("-created_date", 100).catch(() => []),
    sr.entities.Task.list("-created_date", 200).catch(() => []),
    sr.entities.CalendarEvent.filter({}, "start", 30).catch(() => []),
    sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
  ]);

  const activeProjects = projects
    .filter((p) => ["planning", "in_progress", "review", "waiting"].includes(p.status))
    .slice(0, 15);
  const openTasks = tasks
    .filter((t) => t.status !== "completed" && t.status !== "archived")
    .sort((a, b) => (a.priority === "high" ? -1 : 0) - (b.priority === "high" ? -1 : 0))
    .slice(0, 15);
  const today = todayISO();
  const upcomingEvents = events.filter((e) => (e.start || "") >= today).slice(0, 5);

  const lines = [];
  if (memories.length) lines.push("Geheugen:\n" + memories.map((m) => `- [${m.category}] ${String(m.content).slice(0, 140)}`).join("\n"));
  if (recentMessages.length) lines.push("Recent gesprek:\n" + recentMessages.slice().reverse().map((m) => `${m.role === "user" ? "Salvo" : "Giulia"}: ${String(m.content).slice(0, 200)}`).join("\n"));
  if (activeProjects.length) lines.push("Actieve projecten:\n" + activeProjects.map((p) => `- id:${p.id} | ${p.title} [${p.status}]${p.next_milestone ? ` — ${p.next_milestone}` : ""}`).join("\n"));
  if (openTasks.length) lines.push("Open taken:\n" + openTasks.map((t) => `- id:${t.id} | ${t.title} [${t.priority}]${t.deadline ? ` — ${t.deadline}` : ""}`).join("\n"));
  if (upcomingEvents.length) lines.push("Agenda:\n" + upcomingEvents.map((e) => `- ${e.title} — ${e.start}`).join("\n"));
  lines.push(`Openstaande goedkeuringen: ${approvals.length}`);

  return lines.join("\n\n");
}

// Vervangt de titel van een succesvol uitgevoerde actie (task/approval) door
// een klikbare markdown-link, zodat Salvo direct naar het item kan doorklikken.
function enrichResponse(text, actions, results) {
  let out = text;
  results.forEach((r, i) => {
    if (!r || !r.ok || !r.id) return;
    const action = actions[i];
    const label = action && (action.title || action.name);
    if (!label) return;
    const route = r.type === "create_task" ? `/tasks?open=${r.id}` : r.type === "create_approval" ? `/approvals?open=${r.id}` : null;
    if (!route) return;
    const idx = out.toLowerCase().indexOf(String(label).toLowerCase());
    if (idx === -1) return;
    const match = out.slice(idx, idx + label.length);
    out = out.slice(0, idx) + `[${match}](${route})` + out.slice(idx + label.length);
  });
  return out;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const body = await req.json();
    const message = String(body.message || body.content || "").trim();
    const source = body.source || "chat";
    const persist = body.persist !== false;

    if (!message) return Response.json({ error: "No message provided" }, { status: 400 });

    // Persist Salvo's bericht direct (alleen echte chat-gesprekken).
    if (persist && source === "chat") {
      await sr.entities.Message.create({ role: "user", content: message, channel: "in-app", status: "sent" }).catch(() => null);
    }

    // STAP 1 — deterministisch context laden (geen Gemini).
    const contextBlock = await loadContext(sr);
    const profile =
      `Naam: ${AGENT_CONTEXT.owner.name} (${AGENT_CONTEXT.owner.short}) · ${AGENT_CONTEXT.owner.location}\n` +
      `Werk: ${AGENT_CONTEXT.background.studio}`;
    const systemText = `${GIULIA_TONE}\n\n=== OVER SALVO ===\n${profile}\n\n=== CONTEXT ===\n${contextBlock}`;

    // STAP 2 — GIULIA-GIULIA aanroepen. Chat gebruikt haar eigen pool,
    // achtergrond-signalen (startup/proactivity/agent_*) de BACKDESK-pool —
    // gescheiden quota, nooit gemengd.
    const keyName = source === "chat" ? "GIULIA_GIULIA_GEMINI_API_KEY" : "BACKDESK_GEMINI_API_KEY";

    const decision = await geminiDecide({
      prompt:
        `Bron: ${source}\n\nSignaal/bericht van Salvo:\n"""${message.slice(0, 3000)}"""\n\n` +
        `Begrijp de intentie, weeg de context, en beslis welke acties nodig zijn. Geef geldige JSON volgens het schema.`,
      schema: EXECUTION_SCHEMA,
      systemText,
      temperature: 0.6,
      keyName,
    });

    if (!decision) {
      const fallback = "Giulia is even bezet — Gemini-quota bereikt. Probeer het zo weer.";
      if (persist && source === "chat") {
        await sr.entities.Message.create({ role: "giulia", content: fallback, channel: "in-app", status: "sent", agent_source: "chatWithGiulia" }).catch(() => null);
      }
      return Response.json({ response: fallback, actions_executed: [], degraded: true });
    }

    const actions = Array.isArray(decision.actions) ? decision.actions : [];
    const memoryUpdates = Array.isArray(decision.memory_updates) ? decision.memory_updates : [];
    const responseText = decision.response_text || "Begrepen.";

    // STAP 3/4 — de beslissing doorsturen naar GIULIA-CORE voor blinde uitvoering.
    let results = [];
    if (actions.length || memoryUpdates.length || decision.should_notify) {
      const execRes = await base44.functions.invoke("giuliaLeader", {
        actions,
        memory_updates: memoryUpdates,
        should_notify: !!decision.should_notify,
        notify_title: decision.notify_title || "Giulia",
        agent_source: source,
      }).catch((e) => ({ error: String((e && e.message) || e) }));
      results = (execRes && execRes.results) || [];
    }

    // STAP 5 — antwoord verrijken met links naar zojuist aangemaakte items.
    const enriched = enrichResponse(responseText, actions, results);

    if (persist && source === "chat") {
      await sr.entities.Message.create({ role: "giulia", content: enriched, channel: "in-app", status: "sent", agent_source: "chatWithGiulia" }).catch(() => null);
    }

    return Response.json({ response: enriched, actions_executed: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}