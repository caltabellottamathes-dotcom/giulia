/**
 * codeAgent.ts — shared framework for the real GIULIA OS agents.
 *
 * A "real agent" = a manual Gemini function-calling loop (BYOK — no Base44
 * integration credits). The agent reasons, calls tools (entity CRUD,
 * signaling other agents, reporting, push, approvals), and stops when it has
 * no more tool calls or hits the step cap. No third-party agent SDK — fully
 * owned, no recursion risk. Each agent function defines task-specific tools
 * and calls runGiuliaAgent().
 */
import { geminiGenerate } from "./gemini.ts";

export function todayStr() {
  return new Date().toLocaleDateString("sv-SE");
}

export function mondayStr() {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toLocaleDateString("sv-SE");
}

export async function reportToSalvo(base44, agentName, message, threadId) {
  if (!message) return null;
  try {
    return await base44.asServiceRole.entities.Activity.create({
      description: message,
      action: "report",
      source: agentName,
      timestamp: new Date().toISOString(),
    });
  } catch { return null; }
}

const APPROVAL_CATEGORY = { email: "email", whatsapp: "whatsapp", calendar: "calendar", task: "tasks", tasks: "tasks", file: "documents" };

export async function createApproval(base44, type, title, content, context, assignee, meta) {
  try {
    const m = meta || {};
    const sr = base44.asServiceRole;

    // Dedup — voorkom tientallen approvals over exact hetzelfde onderwerp
    // (bv. dezelfde mail die elke cyclus opnieuw wordt aangeboden). Match op
    // thread_id of target (meest betrouwbaar per gesprek/mail), anders op titel.
    const dupQuery = m.thread_id
      ? { status: "pending", type, thread_id: m.thread_id }
      : m.target
      ? { status: "pending", type, target: String(m.target) }
      : { status: "pending", type, title: title || type };
    const existing = await sr.entities.Approval.filter(dupQuery).catch(() => []);
    if (existing && existing.length) return existing[0];

    return await sr.entities.Approval.create({
      title: title || type,
      description: title || type,
      action_type: type,
      type,
      category: APPROVAL_CATEGORY[type] || "other",
      content: content || "",
      status: "pending",
      agent_source: "giulia",
      assignee: assignee || "salvo",
      ...(context ? { context } : {}),
      ...(m.target ? { target: String(m.target) } : {}),
      ...(m.proposed_action ? { proposed_action: typeof m.proposed_action === "string" ? m.proposed_action : JSON.stringify(m.proposed_action) } : {}),
      ...(m.thread_id ? { thread_id: m.thread_id } : {}),
      ...(m.project_id ? { project_id: m.project_id } : {}),
    });
  } catch { return null; }
}

/**
 * createTaskWithApproval — interne taken (zowel Salvo's als aan Giulia
 * gedelegeerd) gaan volledig autonoom op de achtergrond: direct in Taken,
 * géén goedkeuring. Salvo ziet er niets van. Alleen externe verzending
 * (email / WhatsApp / agenda naar andere mensen) vraagt goedkeuring
 * (zie create_approval / createApproval).
 */
export async function createTaskWithApproval(base44, { title, priority, deadline, project_id, description, source, delegated_to_giulia, assignee }) {
  const sr = base44.asServiceRole;
  const forGiulia = !!(delegated_to_giulia || assignee === "giulia");
  return await sr.entities.Task.create({
    title, priority: priority || "medium", deadline, project_id, description,
    status: "today",
    delegated_to_giulia: forGiulia,
    agent_source: source || "giulia",
  }).catch(() => null);
}

/**
 * navigateApp — schrijf een AgentNavigation-record. De frontend abonneert zich
 * (useAgentNavigation) en navigeert in real time naar de route. Hiermee kan
 * Giulia (of elke agent) Salvo door de hele OS-app sturen.
 */
export async function navigateApp(base44, route, params, label, source) {
  try {
    return await base44.asServiceRole.entities.AgentNavigation.create({
      route: String(route || "/"),
      params: params || {},
      label: label || "",
      source: source || "giulia",
    });
  } catch { return null; }
}

/** tool() — passthrough; a tool is { description, inputSchema (JSON schema), execute }. */
export function tool(def) { return def; }

/**
 * sanitizeResult — forceert een tool-resultaat naar een vlak, JSON-veilig
 * object vóór het de Gemini tool-calling loop in gaat. Voorkomt
 * "Converting circular structure to JSON" wanneer een tool een base44-entity
 * of request-object retourneert.
 */
function sanitizeResult(r) {
  if (r == null) return { ok: true };
  if (typeof r !== "object") return { value: String(r).slice(0, 500) };
  if (Array.isArray(r)) return { count: r.length, items: r.slice(0, 10).map((x) => sanitizeResult(x)) };
  const out = {};
  try {
    for (const k of Object.keys(r)) {
      const v = r[k];
      if (v == null || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        if (typeof v === "string") out[k] = v.slice(0, 300);
        else out[k] = v;
      } else if (Array.isArray(v)) out[k] = `array[${v.length}]`;
      else if (typeof v === "object") out[k] = "[object]";
      if (Object.keys(out).length >= 12) break;
    }
  } catch { /* ignore */ }
  return out;
}

/**
 * buildDossier — compiles everything GIULIA knows about Salvo & the current
 * state, injected into every agent run so each agent starts with full knowledge.
 */
async function buildDossier(sr) {
  const [memories, knowledge, projects, contacts, msgs, agentMsgs] = await Promise.all([
    sr.entities.Memory.list("-created_date", 20).catch(() => []),
    sr.entities.Knowledge.list("-created_date", 8).catch(() => []),
    sr.entities.Project.list().catch(() => []),
    sr.entities.Contact.list().catch(() => []),
    sr.entities.Message.filter({ direction: "incoming" }, "-created_date", 8).catch(() => []),
    sr.entities.Activity.list("-created_date", 8).catch(() => []),
  ]);
  const lines = [];
  if (memories.length) { lines.push("Wat je over Salvo weet:"); memories.forEach(m => lines.push(`- [${m.category || "info"}] ${String(m.content).slice(0, 160)}`)); }
  if (knowledge.length) { lines.push("Kennisbank:"); knowledge.forEach(k => lines.push(`- ${k.title}: ${String(k.content || "").slice(0, 120)}`)); }
  if (projects.length) { lines.push("Projecten:"); projects.forEach(p => lines.push(`- ${p.title} [${p.status || "?"}]${p.next_milestone ? ` — next: ${p.next_milestone}` : ""}`)); }
  if (contacts.length) { lines.push("Personen:"); contacts.forEach(c => lines.push(`- ${c.name}${c.company ? ` (${c.company})` : ""}`)); }
  if (msgs.length) { lines.push("Recente inkomende berichten:"); msgs.slice(-8).forEach(m => lines.push(`- [${m.channel}] ${String(m.content).slice(0, 100)}`)); }
  if (agentMsgs.length) { lines.push("Recente acties door andere agents (samenwerk):"); agentMsgs.forEach(m => lines.push(`- [${m.source || "giulia"}] ${String(m.description).slice(0, 120)}`)); }
  return lines.join("\n");
}

export async function runGiuliaAgent(base44, agentName, task, tools, stopAfter = 6, onToolCall, keyName) {
  const sr = base44.asServiceRole;

  const builtIn = {
    report_to_salvo: {
      description: "Log een activiteit/melding in de Activity-feed (zichtbaar in widgets & panelen, NIET in de chat). Gebruik voor elke routine-actie of status.",
      inputSchema: { type: "object", properties: { message: { type: "string" } }, required: ["message"] },
      execute: ({ message }) => reportToSalvo(base44, agentName, message),
    },
    notify_salvo: {
      description: "Stuur een web push notificatie aan Salvo (alleen bij echte aandacht).",
      inputSchema: { type: "object", properties: { title: { type: "string" }, message: { type: "string" } }, required: ["message"] },
      execute: ({ title, message }) => base44.functions.invoke("sendPushNotifications", { title: title || "Giulia", message }).catch(() => null),
    },
    create_approval: {
      description: "Maak een Approval voor een externe actie (email/whatsapp/calendar) die Salvo moet goedkeuren. NOOIT zelf verzenden.",
      inputSchema: { type: "object", properties: { type: { type: "string" }, title: { type: "string" }, content: { type: "string" } }, required: ["type", "title", "content"] },
      execute: ({ type, title, content }) => createApproval(base44, type, title, content),
    },
    call_agent: {
      description: "Signaleer een andere Giulia-agent om aan te vallen: 'manageTasks','managePeople','syncCalendar','manageIdeas','manageProjects','dailyPlanning','weeklyPlanning','runProactivity'.",
      inputSchema: { type: "object", properties: { name: { type: "string" }, payload: { type: "object" } }, required: ["name"] },
      execute: ({ name, payload }) => base44.functions.invoke(name, payload || {}).catch(() => null),
    },
    navigate: {
      description: "Navigeer Salvo's app in real time naar een route, bv. /tasks, /email, /agenda, /projects, /projects/<id>, /people, /approvals, /whatsapp, /knowledge, /insights, /memory, /documents. Gebruik dit om Salvo ergens heen te brengen dat relevant is voor het gesprek.",
      inputSchema: { type: "object", properties: { route: { type: "string" }, label: { type: "string" }, params: { type: "object" } }, required: ["route"] },
      execute: ({ route, label, params }) => navigateApp(base44, route, params, label, agentName),
    },
  };

  const all = { ...builtIn, ...tools };
  const functionDeclarations = Object.entries(all).map(([name, t]) => ({
    name,
    description: t.description || "",
    parameters: t.inputSchema || { type: "object", properties: {} },
  }));

  const dossier = await buildDossier(sr).catch(() => "");
  const systemText =
    `Je werkt nu als de "${agentName}" agent binnen GIULIA OS.\n` +
    "Externe acties (email, whatsapp, calendar) gaan ALTIJD via create_approval — je stuurt nooit zelf. " +
    "Gebruik report_to_salvo om acties te loggen in de Activity-feed (widgets & panelen) — niet in de chat. " +
    "Gebruik notify_salvo (push) alleen als Salvo's aandacht echt nodig is." +
    (dossier ? `\n\n=== WAT JE WEET OVER SALVO & GIULIA ===\n${dossier}` : "");

  const contents = [{ role: "user", parts: [{ text: task }] }];
  const genTools = [{ functionDeclarations }];

  for (let step = 0; step < stopAfter; step++) {
    const parts = await geminiGenerate({ contents, tools: genTools, systemText, keyName: keyName || "BACKDESK_GEMINI_API_KEY" });
    if (!parts || !parts.length) return null;
    contents.push({ role: "model", parts });
    const fnCalls = parts.filter((p) => p.functionCall);
    if (!fnCalls.length) {
      const textPart = parts.find((p) => p.text);
      return textPart?.text || null;
    }
    const respParts = [];
    for (const p of fnCalls) {
      const name = p.functionCall.name;
      const args = p.functionCall.args || {};
      const t = all[name];
      let result;
      try { result = t ? await t.execute(args) : { error: "unknown tool" }; } catch (e) { result = { error: String(e) }; }
      try { onToolCall?.({ name, args, result }); } catch { /* ignore */ }
      const response = sanitizeResult(result);
      respParts.push({ functionResponse: { name, response } });
    }
    contents.push({ role: "user", parts: respParts });
  }
  return null;
}