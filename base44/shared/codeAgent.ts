/**
 * codeAgent.ts — shared framework for the real GIULIA OS agents.
 *
 * A "real agent" = a manual OpenAI-compatible tool-calling loop over Base44's
 * AI gateway (integration credits). The agent reasons, calls tools (entity CRUD,
 * signaling other agents, reporting, push, approvals), and stops when it has no
 * more tool calls or hits the step cap. No third-party agent SDK — fully owned,
 * no recursion risk. Each agent function defines task-specific tools and calls
 * runGiuliaAgent().
 */
const PERSONA =
  "Je bent Giulia, de persoonlijke AI-assistent van Salvo (Salvatore Caltabellotta). " +
  "Toon: kalm, concreet, proactief, Nederlands. Houd advies kort en actiegericht. " +
  "Denk in beslissingen en concrete volgende stappen. " +
  "Externe acties (email, whatsapp, calendar) gaan ALTIJD via create_approval — je stuurt nooit zelf. " +
  "Gebruik report_to_salvo / notify_salvo alleen als Salvo's aandacht echt nodig is.";

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
    return await base44.asServiceRole.entities.Message.create({
      role: "giulia", content: message, channel: "in-app", status: "sent",
      direction: "outgoing", agent_source: agentName,
      ...(threadId ? { thread_id: threadId } : {}),
    });
  } catch { return null; }
}

export async function createApproval(base44, type, title, content, context) {
  try {
    return await base44.asServiceRole.entities.Approval.create({
      title: title || type, action_type: type, type, content: content || "",
      status: "pending", agent_source: "giulia", ...(context ? { context } : {}),
    });
  } catch { return null; }
}

/** tool() — passthrough; a tool is { description, inputSchema (JSON schema), execute }. */
export function tool(def) { return def; }

export async function runGiuliaAgent(base44, agentName, task, tools, stopAfter = 6) {
  const { baseURL, token } = base44.asServiceRole.aiGateway.connection();
  const url = baseURL.replace(/\/$/, "") + "/chat/completions";
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const builtIn = {
    report_to_salvo: {
      description: "Stuur een proactief bericht aan Salvo in de app (in-app Message, agent_source = deze agent). Alleen als aandacht echt nodig is.",
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
  };

  const all = { ...builtIn, ...tools };
  const functions = Object.entries(all).map(([name, t]) => ({
    type: "function",
    function: { name, description: t.description || "", parameters: t.inputSchema || { type: "object", properties: {} } },
  }));

  const messages = [
    { role: "system", content: `${PERSONA}\n\nJe werkt nu als de "${agentName}" agent binnen GIULIA OS.` },
    { role: "user", content: task },
  ];

  const safeStr = (v) => { try { return JSON.stringify(v); } catch { try { return JSON.stringify(String(v)); } catch { return "null"; } } };

  for (let step = 0; step < stopAfter; step++) {
    const bodyStr = safeStr({ model: "automatic", messages, tools: functions, tool_choice: "auto" });
    const res = await fetch(url, { method: "POST", headers, body: bodyStr });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const msg = data?.choices?.[0]?.message;
    if (!msg) return null;
    const toolCalls = Array.isArray(msg.tool_calls)
      ? msg.tool_calls.map(tc => ({ id: tc.id, type: "function", function: { name: tc.function?.name, arguments: tc.function?.arguments || "{}" } }))
      : [];
    messages.push({ role: "assistant", content: msg.content || "", ...(toolCalls.length ? { tool_calls: toolCalls } : {}) });
    if (!toolCalls.length) return msg.content || null;
    for (const tc of toolCalls) {
      const name = tc.function.name;
      let args = {};
      try { args = JSON.parse(tc.function.arguments); } catch {}
      const t = all[name];
      let result;
      try { result = t ? await t.execute(args) : { error: "unknown tool" }; } catch (e) { result = { error: String(e) }; }
      messages.push({ role: "tool", tool_call_id: tc.id, content: safeStr(result).slice(0, 4000) });
    }
  }
  return null;
}