/**
 * agent.ts — shared protocol for GIULIA OS agents (single-shot decision path).
 *
 * agentDecide now uses BYOK Gemini with structured output (response_schema).
 * reportToSalvo / notifySalvo / createApproval persist via Base44 entities &
 * functions. Anything with an external consequence is an Approval (pending).
 */
import { geminiDecide } from "./gemini.ts";

/**
 * agentDecide — ask Giulia (as a specific agent) for a structured decision.
 * Returns a parsed object (per schema) or null. BYOK Gemini, no credits.
 */
export async function agentDecide(base44, agentName, task, context, schema) {
  const prompt =
    `Je werkt nu als de "${agentName}" agent binnen GIULIA OS.\n\n` +
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
  return await geminiDecide({
    prompt,
    schema: schema || fallbackSchema,
    systemText: `Je bent agent "${agentName}" binnen GIULIA OS. Denk in beslissingen en concrete volgende stappen.`,
  });
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