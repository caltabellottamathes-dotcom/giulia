/**
 * agent.ts — shared protocol for all GIULIA OS agents.
 *
 * Every agent follows the same loop:
 *   1. Read relevant entities (current state)
 *   2. Decide via chatWithGiulia (integration credits, NOT agent/message credits)
 *   3. Execute: read/write entities
 *   4. Report: write a proactive in-app Message (channel: in-app, agent_source set)
 *   5. Notify: push via sendPushNotifications when Salvo's attention is needed
 *
 * Anything with an external consequence is an Approval (status: pending) —
 * never sent automatically.
 */
const PERSONA =
  "Je bent Giulia, de persoonlijke AI-assistent van Salvo (Salvatore Caltabellotta). " +
  "Toon: kalm, concreet, proactief, Nederlands. Houd advies kort en actiegericht. " +
  "Denk in beslissingen en concrete volgende stappen.";

/**
 * agentDecide — ask Giulia (as a specific agent) for a structured decision.
 * Returns a parsed object (per schema) or null on failure. Uses integration credits.
 */
export async function agentDecide(base44, agentName, task, context, schema) {
  const prompt =
    `${PERSONA}\n\nJe werkt nu als de "${agentName}" agent binnen GIULIA OS.\n\n` +
    `Taak: ${task}\n\nHuidige state:\n${context}\n\n` +
    `Geef je beslissing als geldige JSON volgens het schema. Geen markdown, geen uitleg eromheen.`;
  const fallbackSchema = {
    type: "object",
    properties: {
      message: { type: "string" },
      actions: {
        type: "array",
        items: {
          type: "object",
          properties: { type: { type: "string" }, detail: { type: "string" } },
        },
      },
    },
    required: ["message"],
  };
  try {
    const res = await base44.functions.invoke("chatWithGiulia", { message: prompt, persist: false });
    const text = (res && (res.response || res.content)) || "";
    if (!text) return null;
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch {}
    }
    try { return JSON.parse(text); } catch {}
    return { message: text };
  } catch (e) {
    return null;
  }
}

/** reportToSalvo — persist a proactive in-app Message from this agent. */
export async function reportToSalvo(base44, agentName, message, threadId) {
  if (!message) return;
  try {
    await base44.asServiceRole.entities.Message.create({
      role: "giulia",
      content: message,
      channel: "in-app",
      status: "sent",
      direction: "outgoing",
      agent_source: agentName,
      ...(threadId ? { thread_id: threadId } : {}),
    });
  } catch (e) { /* ignore */ }
}

/** notifySalvo — send a web push notification. */
export async function notifySalvo(base44, title, message) {
  if (!message) return;
  try {
    await base44.functions.invoke("sendPushNotifications", { title: title || "Giulia", message });
  } catch (e) { /* ignore */ }
}

/** createApproval — queue an external-consequence action for Salvo's approval. */
export async function createApproval(base44, type, title, content, threadId, context) {
  try {
    return await base44.asServiceRole.entities.Approval.create({
      title: title || type,
      action_type: type,
      type,
      content: content || "",
      status: "pending",
      thread_id: threadId || "",
      agent_source: "giulia",
      ...(context ? { context } : {}),
    });
  } catch (e) { return null; }
}

/** todayStr — local-date string (sv-SE = YYYY-MM-DD). */
export function todayStr() {
  return new Date().toLocaleDateString("sv-SE");
}